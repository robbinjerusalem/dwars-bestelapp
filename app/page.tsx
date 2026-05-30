'use client';

import { useEffect, useMemo, useState } from 'react';
import CustomerOrder from '@/components/CustomerOrder';
import type { Menu, Product, MenuOption, Order, OrderItem } from '@/lib/types';
import { euro, itemTotal, orderTotal } from '../lib/money';

type CartLine = OrderItem;

const ADMIN_PIN = '7161';
const OWNER_NAME = 'Robbin Jerusalem';

function parseEuroInput(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  return Number(normalized || 0);
}

function getCurrentWeekKey() {
  const now = new Date();

  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getRecentWeeks(amount = 12) {
  const weeks: string[] = [];
  const now = new Date();

  for (let i = 0; i < amount; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);

    const date = new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    );

    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

    const weekNo = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );

    weeks.push(`${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`);
  }

  return Array.from(new Set(weeks));
}

export default function Page() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Alle');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [admin, setAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [myOrder, setMyOrder] = useState<Order | null>(null);
  const [tikkieReceivedInput, setTikkieReceivedInput] = useState('');

  async function load(weekKey = getCurrentWeekKey()) {
    const [m, o] = await Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch(`/api/orders?weekKey=${weekKey}`).then(r => r.json())
    ]);

    setMenu(m);
    setOrders(o);
    setSelectedWeek(weekKey);
  }

  useEffect(() => {
    load();

    const savedName = localStorage.getItem('dwars-name');
    if (savedName) setName(savedName);
  }, []);

  useEffect(() => {
    localStorage.setItem('dwars-name', name);
  }, [name]);

  useEffect(() => {
    const saved = localStorage.getItem(`dwars-tikkie-received-${selectedWeek}`);
    setTikkieReceivedInput(saved || '');
  }, [selectedWeek]);

  useEffect(() => {
    localStorage.setItem(
      `dwars-tikkie-received-${selectedWeek}`,
      tikkieReceivedInput
    );
  }, [selectedWeek, tikkieReceivedInput]);

  useEffect(() => {
    if (!name.trim()) {
      setMyOrder(null);
      return;
    }

    const found = orders.find(
      order =>
        order.personName.toLowerCase().trim() ===
        name.toLowerCase().trim()
    );

    setMyOrder(found || null);
  }, [name, orders]);

  const categories = useMemo(
    () => ['Alle', ...Array.from(new Set(menu?.products.map(p => p.category) || []))],
    [menu]
  );

  const products = useMemo(() => {
    return (menu?.products || []).filter(product => {
      const categoryMatch = category === 'Alle' || product.category === category;
      const searchMatch = product.name.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [menu, category, search]);

  const availableWeeks = useMemo(() => {
    const weeks = new Set<string>();

    getRecentWeeks(16).forEach(week => weeks.add(week));

    orders.forEach(order => {
      if (order.weekKey) weeks.add(order.weekKey);
    });

    return [...weeks].sort().reverse();
  }, [orders]);

  const cartTotal = cart.reduce((s, item) => s + itemTotal(item), 0);
  const cartItemCount = cart.reduce((s, item) => s + item.quantity, 0);
  const totalOrders = orders.length;
  const totalPeople = new Set(orders.map(o => o.personName)).size;

  const totalProducts = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + orderTotal(order),
    0
  );

  const ownOrder = orders.find(
    order =>
      order.personName.toLowerCase().trim() ===
      OWNER_NAME.toLowerCase().trim()
  );

  const ownOrderTotal = ownOrder ? orderTotal(ownOrder) : 0;
  const tikkieExpected = Math.max(totalRevenue - ownOrderTotal, 0);
  const tikkieReceived = parseEuroInput(tikkieReceivedInput);
  const tikkieDifference = tikkieReceived - tikkieExpected;

  const isEditingOrder = Boolean(myOrder && cart.length > 0);
  const displayedCustomerItems = isEditingOrder ? cart : myOrder?.items || [];
  const displayedCustomerTotal = isEditingOrder
    ? cartTotal
    : myOrder
      ? orderTotal(myOrder)
      : 0;

  function showMessage(message: string, duration = 1800) {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage('');
    }, duration);
  }

  function toggleAdmin() {
    if (admin) {
      setAdmin(false);
      load(getCurrentWeekKey());
      return;
    }

    const entered = prompt('Voer admin pincode in');

    if (entered === ADMIN_PIN) {
      setAdmin(true);
    } else {
      alert('Onjuiste pincode');
    }
  }

  function openProduct(product: Product) {
    setActiveProduct(product);
    setSelectedOptions([]);
  }

  function addDirectProduct(product: Product) {
    setCart(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        basePrice: product.price,
        options: []
      }
    ]);

    showMessage(`${product.name} toegevoegd`);
  }

  function addActiveProduct() {
    if (!activeProduct) return;

    setCart(prev => [
      ...prev,
      {
        productId: activeProduct.id,
        productName: activeProduct.name,
        quantity: 1,
        basePrice: activeProduct.price,
        options: selectedOptions
      }
    ]);

    setActiveProduct(null);
    showMessage(`${activeProduct.name} toegevoegd`);
  }

  function increaseQuantity(index: number) {
    setCart(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(index: number) {
    setCart(prev =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  function editMyOrder() {
    if (!myOrder) return;

    setCart(myOrder.items);
    setCartOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    showMessage(
      'Je bestelling wordt gewijzigd — voeg extra producten toe en klik daarna opnieuw op bestellen',
      3500
    );
  }

  async function cancelMyOrder() {
    if (!name.trim()) return;

    if (!confirm('Weet je zeker dat je jouw bestelling wilt annuleren?')) {
      return;
    }

    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({
        personName: name
      })
    });

    if (!res.ok) {
      return alert((await res.json()).error || 'Annuleren mislukt');
    }

    setCart([]);
    setCartOpen(false);

    await load(getCurrentWeekKey());

    showMessage('Bestelling geannuleerd');
  }

  async function submitOrder() {
    if (!name.trim()) {
      return alert('Vul je voor- en achternaam in');
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        personName: name,
        items: cart
      })
    });

    if (!res.ok) {
      return alert((await res.json()).error || 'Opslaan mislukt');
    }

    setCart([]);
    setCartOpen(false);

    await load(getCurrentWeekKey());

    showMessage('✅ Bestelling opgeslagen!', 2500);
  }

  async function clearOrders() {
    if (!confirm(`Alle bestellingen wissen voor ${selectedWeek}?`)) {
      return;
    }

    await fetch(`/api/orders?weekKey=${selectedWeek}`, {
      method: 'DELETE'
    });

    await load(selectedWeek);
    showMessage('Week gewist');
  }

  async function deleteOrder(order: Order) {
    if (!confirm(`Bestelling van ${order.personName} verwijderen?`)) {
      return;
    }

    const res = await fetch(`/api/orders?orderId=${order.id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      return alert((await res.json()).error || 'Verwijderen mislukt');
    }

    await load(selectedWeek);
    showMessage(`Bestelling van ${order.personName} verwijderd`);
  }

  const productTotals = useMemo(() => {
    const map = new Map<
      string,
      {
        label: string;
        count: number;
        orderIndex: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const optionText = item.options?.length
          ? ' + ' + item.options.map(o => o.name).join(', ')
          : '';

        const key = item.productName + optionText;

        const menuIndex =
          menu?.products.findIndex(
            p => p.name === item.productName
          ) ?? 9999;

        map.set(key, {
          label: key,
          count: (map.get(key)?.count || 0) + item.quantity,
          orderIndex: menuIndex
        });
      }
    }

    return [...map.values()].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
  }, [orders, menu]);

  if (!menu) {
    return <main className="page">Laden...</main>;
  }

  return (
    <main className="page">
      {successMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#16a34a',
            color: 'white',
            padding: '14px 20px',
            borderRadius: 14,
            zIndex: 999,
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,.2)'
          }}
        >
          {successMessage}
        </div>
      )}

      <div className="header">
        <div>
          <h1>Dwars Bestelapp</h1>

          <p className="small">
            Prijzen bijgewerkt: {new Date(menu.updatedAt).toLocaleString('nl-NL')} · bron:{' '}
            {menu.source}
          </p>
        </div>

        <button className="btn secondary" onClick={toggleAdmin}>
          {admin ? 'Bestellen' : 'Admin overzicht'}
        </button>
      </div>

      {admin ? (
        <section className="card">
          <div className="row">
            <div>
              <h2>Overzicht</h2>

              <div style={{ marginTop: 12 }}>
                <label className="small">Week bekijken</label>

                <select
                  className="input"
                  value={selectedWeek}
                  onChange={e => load(e.target.value)}
                  style={{ maxWidth: 240, marginTop: 6 }}
                >
                  {availableWeeks.map(week => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={() => load(selectedWeek)}>
                Vernieuwen
              </button>

              <button className="btn danger" onClick={clearOrders}>
                Deze week wissen
              </button>
            </div>
          </div>

          <p className="small" style={{ marginTop: 12 }}>
            Je bekijkt nu: <strong>{selectedWeek}</strong>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
              gap: 12,
              marginBottom: 24
            }}
          >
            <div className="card">
              <div className="small">Bestellingen</div>
              <h2>{totalOrders}</h2>
            </div>

            <div className="card">
              <div className="small">Personen</div>
              <h2>{totalPeople}</h2>
            </div>

            <div className="card">
              <div className="small">Producten</div>
              <h2>{totalProducts}</h2>
            </div>

            <div className="card">
              <div className="small">Omzet</div>
              <h2>{euro(totalRevenue)}</h2>
            </div>
          </div>

          <h3>Tikkie controle</h3>

          <div
            className="card"
            style={{
              marginBottom: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
              gap: 12
            }}
          >
            <div>
              <div className="small">Totaal bestelling</div>
              <h2>{euro(totalRevenue)}</h2>
            </div>

            <div>
              <div className="small">Eigen bestelling ({OWNER_NAME})</div>
              <h2>{euro(ownOrderTotal)}</h2>
            </div>

            <div>
              <div className="small">Te ontvangen via Tikkie</div>
              <h2>{euro(tikkieExpected)}</h2>
            </div>

            <div>
              <label className="small">Ontvangen via Tikkie</label>
              <input
                className="input"
                value={tikkieReceivedInput}
                onChange={e => setTikkieReceivedInput(e.target.value)}
                placeholder="Bijv. 114,90"
              />
            </div>

            <div>
              <div className="small">Verschil</div>
              <h2>
                {Math.abs(tikkieDifference) < 0.01
                  ? '✅ Klopt'
                  : tikkieDifference < 0
                    ? `⚠️ Mist ${euro(Math.abs(tikkieDifference))}`
                    : `+ ${euro(tikkieDifference)} teveel`}
              </h2>
            </div>
          </div>

          <h3>Per persoon</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Bestelling</th>
                <th>Bedrag</th>
                <th>Tikkie tekst</th>
                <th>Actie</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.personName}</td>

                  <td>
                    {order.items
                      .map(
                        i =>
                          `${i.quantity}x ${i.productName}${
                            i.options?.length
                              ? ' + ' + i.options.map(o => o.name).join(', ')
                              : ''
                          }`
                      )
                      .join('; ')}
                  </td>

                  <td>{euro(orderTotal(order))}</td>

                  <td>
                    Hoi {order.personName}, jouw Dwars-bestelling was{' '}
                    {euro(orderTotal(order))}.
                  </td>

                  <td>
                    <button
                      className="btn danger"
                      onClick={() => deleteOrder(order)}
                    >
                      Verwijder
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={5}>Geen bestellingen voor deze week.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>Totalen keuken</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Aantal</th>
              </tr>
            </thead>

            <tbody>
              {productTotals.map(row => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.count}</td>
                </tr>
              ))}

              {productTotals.length === 0 && (
                <tr>
                  <td colSpan={2}>Geen keukenregels voor deze week.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>Eindtotaal: {euro(totalRevenue)}</h3>
        </section>
      ) : (
        <>
          <section className="card" style={{ marginBottom: 16 }}>
            <label>Voor- en achternaam</label>

            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Bijv. Jan Jansen"
            />
          </section>

          {myOrder && (
            <CustomerOrder
              isEditingOrder={isEditingOrder}
              displayedCustomerItems={displayedCustomerItems}
              displayedCustomerTotal={displayedCustomerTotal}
              createdAt={myOrder.createdAt}
              editMyOrder={editMyOrder}
              cancelMyOrder={cancelMyOrder}
            />
          )}

          <section className="card" style={{ marginBottom: 16 }}>
            <label>Zoeken</label>

            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Zoek product..."
            />
          </section>

          <div className="tabs">
            {categories.map(c => (
              <button
                key={c}
                className={'tab ' + (category === c ? 'active' : '')}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <section className="grid">
            {products.map(product => (
              <article className="card product" key={product.id}>
                <div className="row">
                  <h3>{product.name}</h3>

                  <span className="price">{euro(product.price)}</span>
                </div>

                {product.optionGroups?.length ? (
                  <p className="small">Met opties/sauzen</p>
                ) : (
                  <p className="small">Geen opties</p>
                )}

                <button
                  className="btn"
                  onClick={() => {
                    if (product.optionGroups?.length) {
                      openProduct(product);
                      return;
                    }

                    addDirectProduct(product);
                  }}
                >
                  {product.optionGroups?.length ? 'Kies opties' : 'Direct toevoegen'}
                </button>
              </article>
            ))}
          </section>

          {cart.length > 0 && (
            <div
              style={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 40
              }}
            >
              <button
                className="btn"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 18,
                  fontSize: 18,
                  boxShadow: '0 10px 30px rgba(0,0,0,.2)'
                }}
                onClick={() => setCartOpen(true)}
              >
                Bekijk bestelling ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} ·{' '}
                {euro(cartTotal)})
              </button>
            </div>
          )}

          {cartOpen && (
            <div className="modalBg">
              <div className="modal">
                <div className="row">
                  <h2>Jouw bestelling</h2>

                  <button className="btn secondary" onClick={() => setCartOpen(false)}>
                    Sluiten
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="small">Nog niets gekozen.</p>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      className="row"
                      key={idx}
                      style={{
                        borderBottom: '1px solid #eee',
                        padding: '10px 0',
                        gap: 12
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span>
                          {item.quantity}x {item.productName}
                          {item.options.length
                            ? ' + ' + item.options.map(o => o.name).join(', ')
                            : ''}
                        </span>

                        <div className="small">{euro(itemTotal(item))}</div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <button className="btn danger" onClick={() => removeItem(idx)}>
                          🗑
                        </button>

                        <button className="btn secondary" onClick={() => decreaseQuantity(idx)}>
                          -
                        </button>

                        <strong>{item.quantity}</strong>

                        <button className="btn" onClick={() => increaseQuantity(idx)}>
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="totalBox">
                  <div style={{ marginBottom: 12 }}>
                    <button
                      className="btn danger"
                      style={{ width: '100%' }}
                      onClick={() => setCart([])}
                    >
                      Winkelwagen leegmaken
                    </button>
                  </div>

                  <div className="row">
                    <strong>Totaal</strong>
                    <strong>{euro(cartTotal)}</strong>
                  </div>

                  <button
                    className="btn"
                    style={{
                      width: '100%',
                      marginTop: 12
                    }}
                    onClick={submitOrder}
                  >
                    Bestelling doorgeven
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeProduct && (
        <div className="modalBg">
          <div className="modal">
            <div className="row">
              <h2>{activeProduct.name}</h2>
              <strong>{euro(activeProduct.price)}</strong>
            </div>

            {(activeProduct.optionGroups || []).map(group => (
              <div key={group.name}>
                <h3>
                  {group.name} <span className="small">max. {group.max || 1}</span>
                </h3>

                {group.options.map(option => {
                  const checked = selectedOptions.some(o => o.name === option.name);

                  return (
                    <label className="option" key={option.name}>
                      <span>
                        {option.name}{' '}
                        <span className="price">
                          {option.price ? euro(option.price) : ''}
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedOptions(prev => {
                            if (checked) {
                              return prev.filter(o => o.name !== option.name);
                            }

                            const currentFromGroup = prev.filter(o =>
                              group.options.some(go => go.name === o.name)
                            );

                            const withoutGroup = prev.filter(
                              o => !group.options.some(go => go.name === o.name)
                            );

                            return [...withoutGroup, ...currentFromGroup, option].slice(
                              -(group.max || 1)
                            );
                          });
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            ))}

            <div className="row" style={{ marginTop: 18 }}>
              <button className="btn secondary" onClick={() => setActiveProduct(null)}>
                Annuleren
              </button>

              <button className="btn" onClick={addActiveProduct}>
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}