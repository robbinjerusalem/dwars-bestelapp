import type { OrderItem } from '@/lib/types';
import { euro, itemTotal } from '@/lib/money';

type CartModalProps = {
  cart: OrderItem[];
  cartTotal: number;
  setCart: (cart: OrderItem[]) => void;
  setCartOpen: (open: boolean) => void;
  increaseQuantity: (index: number) => void;
  decreaseQuantity: (index: number) => void;
  removeItem: (index: number) => void;
  submitOrder: () => Promise<void>;
};

export default function CartModal({
  cart,
  cartTotal,
  setCart,
  setCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  submitOrder
}: CartModalProps) {
  return (
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
  );
}