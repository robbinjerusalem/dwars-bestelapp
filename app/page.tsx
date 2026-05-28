'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Menu, Product, MenuOption, Order, OrderItem } from '@/lib/types';
import { euro, itemTotal, orderTotal } from '../lib/money';

type CartLine = OrderItem;

const ADMIN_PIN = '7161';

export default function Page() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Alle');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [admin, setAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function load() {
    const [m, o] = await Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch('/api/orders').then(r => r.json())
    ]);

    setMenu(m);
    setOrders(o);
  }

  useEffect(() => {
    load();

    const savedName = localStorage.getItem('dwars-name');
    if (savedName) setName(savedName);
  }, []);

  useEffect(() => {
    localStorage.setItem('dwars-name', name);
  }, [name]);

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

  function showMessage(message: string, duration = 1800) {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage('');
    }, duration);
  }

  function toggleAdmin() {
    if (admin) {
      setAdmin(false);
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

    await load();

    showMessage('✅ Bestelling opgeslagen!', 2500);
  }

  async function clearOrders() {
    if (!confirm('Alle bestellingen wissen voor een nieuwe ronde?')) {
      return;
    }

    await fetch('/api/orders', {
      method: 'DELETE'
    });

    await load();
  }

  const productTotals = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const optionText = item.options?.length
          ? ' + ' + item.options.map(o => o.name).join(', ')
          : '';

        const key = item.productName + optionText;

        map.set(key, {
          label: key,
          count: (map.get(key)?.count || 0) + item.quantity
        });
      }
    }

    return [...map.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
  }, [orders]);

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
            <h2>Overzicht</h2>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={load}>
                Vernieuwen
              </button>

              <button className="btn danger" onClick={clearOrders}>
                Nieuwe ronde / wissen
              </button>
            </div>
          </div>

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

          <h3>Per persoon</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Bestelling</th>
                <th>Bedrag</th>
                <th>Tikkie tekst</th>
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
                </tr>
              ))}
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