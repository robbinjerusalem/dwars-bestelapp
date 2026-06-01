'use client';

import { useEffect, useMemo, useState } from 'react';
import CustomerOrder from '@/components/CustomerOrder';
import type { Menu, Product, MenuOption, Order, OrderItem } from '@/lib/types';
import { euro, orderTotal } from '../lib/money';
import { getCurrentWeekKey, getRecentWeeks } from '@/lib/week';
import { useCart } from '@/hooks/useCart';
import ProductCard from '@/components/ProductCard';
import AdminPanel from '@/components/AdminPanel';
import CartModal from '@/components/CartModal';
import ProductModal from '@/components/ProductModal';

type CartLine = OrderItem;

const ADMIN_PIN = '7161';

export default function Page() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Alle');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [admin, setAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [myOrder, setMyOrder] = useState<Order | null>(null);
  const [tikkieReceivedInput, setTikkieReceivedInput] = useState('');

  const {
    cart,
    setCart,
    cartTotal,
    cartItemCount,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem
  } = useCart();

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
    const normalizedSearch = search.toLowerCase().trim();

    return (menu?.products || []).filter(product => {
      const categoryMatch = category === 'Alle' || product.category === category;

      const searchMatch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

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
    const newLine: CartLine = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      basePrice: product.price,
      options: []
    };

    addItem(newLine);

    showMessage(`${product.name} toegevoegd`);
  }

  function addActiveProduct() {
    if (!activeProduct) return;

    const newLine: CartLine = {
      productId: activeProduct.id,
      productName: activeProduct.name,
      quantity: 1,
      basePrice: activeProduct.price,
      options: selectedOptions
    };

    addItem(newLine);

    setActiveProduct(null);
    showMessage(`${activeProduct.name} toegevoegd`);
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
        </div>

        <button className="btn secondary" onClick={toggleAdmin}>
          {admin ? 'Bestellen' : 'Admin overzicht'}
        </button>
      </div>

      {admin ? (
        <AdminPanel
          menu={menu}
          orders={orders}
          selectedWeek={selectedWeek}
          availableWeeks={availableWeeks}
          tikkieReceivedInput={tikkieReceivedInput}
          setTikkieReceivedInput={setTikkieReceivedInput}
          load={load}
          clearOrders={clearOrders}
          deleteOrder={deleteOrder}
        />
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
            {products.map((product, index) => (
              <ProductCard
                key={`${product.category}-${product.id}-${index}`}
                product={product}
                openProduct={openProduct}
                addDirectProduct={addDirectProduct}
              />
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
                Bekijk bestelling ({cartItemCount}{' '}
                {cartItemCount === 1 ? 'item' : 'items'} · {euro(cartTotal)})
              </button>
            </div>
          )}

          {cartOpen && (
            <CartModal
              cart={cart}
              cartTotal={cartTotal}
              setCart={setCart}
              setCartOpen={setCartOpen}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              removeItem={removeItem}
              submitOrder={submitOrder}
            />
          )}
        </>
      )}

      {activeProduct && (
        <ProductModal
          activeProduct={activeProduct}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          setActiveProduct={setActiveProduct}
          addActiveProduct={addActiveProduct}
        />
      )}
    </main>
  );
}