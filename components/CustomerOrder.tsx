import type { OrderItem } from '@/lib/types';
import { euro, itemTotal } from '@/lib/money';

type CustomerOrderProps = {
  isEditingOrder: boolean;
  displayedCustomerItems: OrderItem[];
  displayedCustomerTotal: number;
  createdAt?: string;
  editMyOrder: () => void;
  cancelMyOrder: () => void;
};

export default function CustomerOrder({
  isEditingOrder,
  displayedCustomerItems,
  displayedCustomerTotal,
  createdAt,
  editMyOrder,
  cancelMyOrder
}: CustomerOrderProps) {
  return (
    <section
      className="card"
      style={{
        marginBottom: 16,
        border: isEditingOrder ? '2px solid #f6c51f' : '2px solid #16a34a'
      }}
    >
      <div className="row">
        <div>
          <h3 style={{ margin: 0 }}>
            {isEditingOrder
              ? '📝 Concept bestelling'
              : '✅ Jouw huidige bestelling'}
          </h3>

          <div className="small">
            {isEditingOrder
              ? 'Nog niet opgeslagen — klik onderaan op Bestelling doorgeven'
              : (
                <>
                  Laatst opgeslagen:{' '}
                  {createdAt
                    ? new Date(createdAt).toLocaleString('nl-NL')
                    : '-'}
                </>
              )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}
        >
          <button className="btn secondary" onClick={editMyOrder}>
            Wijzigen
          </button>

          <button className="btn danger" onClick={cancelMyOrder}>
            Annuleren
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {displayedCustomerItems.map((item, idx) => (
          <div
            key={idx}
            className="row"
            style={{ marginBottom: 10 }}
          >
            <div>
              <strong>
                {item.quantity}x {item.productName}
              </strong>

              {item.options?.length ? (
                <div className="small">
                  {item.options.map(o => o.name).join(', ')}
                </div>
              ) : null}
            </div>

            <strong>{euro(itemTotal(item))}</strong>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <strong>Totaal</strong>
        <strong>{euro(displayedCustomerTotal)}</strong>
      </div>
    </section>
  );
}