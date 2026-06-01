'use client';

import { useState } from 'react';
import type { Order } from '@/lib/types';
import { euro, orderTotal } from '@/lib/money';

type AdminOrderListProps = {
  orders: Order[];
  selectedWeek: string;
  load: (weekKey: string) => Promise<void>;
  deleteOrder: (order: Order) => Promise<void>;
};

function sortedOptionNames(item: Order['items'][number]) {
  return [...(item.options || [])]
    .map(option => option.name)
    .sort((a, b) => a.localeCompare(b, 'nl-NL'));
}

export default function AdminOrderList({
  orders,
  selectedWeek,
  load,
  deleteOrder
}: AdminOrderListProps) {
  const [openOrderIds, setOpenOrderIds] = useState<string[]>([]);

  const openOrders = [...orders]
    .filter(order => !order.paid)
    .sort((a, b) => a.personName.localeCompare(b.personName, 'nl-NL'));

  const paidOrders = [...orders]
    .filter(order => order.paid)
    .sort((a, b) => a.personName.localeCompare(b.personName, 'nl-NL'));

  function toggleOrder(orderId: string) {
    setOpenOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }

  async function setPaidStatus(order: Order, paid: boolean) {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, paid })
    });

    if (!res.ok) {
      return alert((await res.json()).error || 'Betaalstatus aanpassen mislukt');
    }

    await load(selectedWeek);
  }

  function renderOrder(order: Order) {
    const isOpen = openOrderIds.includes(order.id);
    const total = orderTotal(order);
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div
        key={order.id}
        className="card"
        style={{
          padding: 10,
          border: order.lateOrder
            ? '2px solid #f97316'
            : order.paid
              ? '1px solid #86efac'
              : '1px solid #fecaca',
          background: order.lateOrder ? '#fff7ed' : undefined
        }}
      >
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => toggleOrder(order.id)}
            style={{
              flex: 1,
              border: 0,
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>
              {isOpen ? '▼' : '▶'} {order.personName}
            </strong>

            <div className="small">
              {itemCount} product(en)
              {order.lateOrder ? ' · ⏰ Te laat besteld' : ''}
            </div>
          </button>

          <div style={{ textAlign: 'right', minWidth: 105 }}>
            <strong>{euro(total)}</strong>

            <div
              className="small"
              style={{
                color: order.paid ? '#16a34a' : '#dc2626',
                fontWeight: 700
              }}
            >
              {order.paid ? '🟢 Betaald' : '🔴 Open'}
            </div>
          </div>

          {order.paid ? (
            <button
              className="btn secondary"
              onClick={() => setPaidStatus(order, false)}
            >
              Zet open
            </button>
          ) : (
            <button className="btn" onClick={() => setPaidStatus(order, true)}>
              Zet betaald
            </button>
          )}
        </div>

        {isOpen && (
          <div style={{ marginTop: 10 }}>
            {order.lateOrder && (
              <div
                style={{
                  background: '#ffedd5',
                  border: '1px solid #fb923c',
                  color: '#9a3412',
                  padding: 10,
                  borderRadius: 12,
                  marginBottom: 10,
                  fontWeight: 700
                }}
              >
                ⏰ Deze bestelling is na 11:00 geplaatst.
              </div>
            )}

            <div style={{ display: 'grid', gap: 7 }}>
              {order.items.map((item, index) => {
                const optionPrice = item.options.reduce(
                  (sum, option) => sum + option.price,
                  0
                );

                const lineTotal = (item.basePrice + optionPrice) * item.quantity;
                const optionNames = sortedOptionNames(item);

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: 7
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 10
                      }}
                    >
                      <strong>
                        {item.quantity}x {item.productName}
                      </strong>

                      <strong>{euro(lineTotal)}</strong>
                    </div>

                    {optionNames.length > 0 && (
                      <div className="small" style={{ marginTop: 2 }}>
                        + {optionNames.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="btn danger" onClick={() => deleteOrder(order)}>
                Verwijder
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <h3>Per persoon</h3>

      {orders.length === 0 ? (
        <div className="card">Geen bestellingen voor deze week.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <h4 style={{ marginBottom: 8 }}>
              Nog niet betaald ({openOrders.length})
            </h4>

            <div style={{ display: 'grid', gap: 8 }}>
              {openOrders.length === 0 ? (
                <div className="small">Geen openstaande betalingen.</div>
              ) : (
                openOrders.map(renderOrder)
              )}
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: 8 }}>Betaald ({paidOrders.length})</h4>

            <div style={{ display: 'grid', gap: 8 }}>
              {paidOrders.length === 0 ? (
                <div className="small">Nog niemand betaald.</div>
              ) : (
                paidOrders.map(renderOrder)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}