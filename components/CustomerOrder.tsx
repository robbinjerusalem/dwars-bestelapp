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

function groupItems(items: OrderItem[]) {
  const map = new Map<string, OrderItem>();

  for (const item of items) {
    const optionKey = item.options
      .map(o => o.name)
      .sort((a, b) => a.localeCompare(b, 'nl-NL'))
      .join('|');

    const key = `${item.productId}-${optionKey}`;
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity
      });
    } else {
      map.set(key, { ...item });
    }
  }

  return Array.from(map.values());
}

function optionText(item: OrderItem) {
  return item.options
    .map(option => option.name)
    .sort((a, b) => a.localeCompare(b, 'nl-NL'))
    .join(', ');
}

export default function CustomerOrder({
  isEditingOrder,
  displayedCustomerItems,
  displayedCustomerTotal,
  createdAt,
  editMyOrder,
  cancelMyOrder
}: CustomerOrderProps) {
  const groupedItems = groupItems(displayedCustomerItems);

  return (
    <section
      className="card"
      style={{
        marginBottom: 16,
        border: isEditingOrder ? '2px solid #f59e0b' : '2px solid #16a34a',
        background: isEditingOrder ? '#fffbeb' : '#f0fdf4'
      }}
    >
      <div className="row" style={{ gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {isEditingOrder
              ? '📝 Je past je bestelling aan'
              : '✅ Je hebt al besteld'}
          </h3>

          <div className="small" style={{ marginTop: 4 }}>
            {isEditingOrder ? (
              <strong>
                Nog niet opgeslagen. Klik onderaan op Bestelling doorgeven om je
                wijziging op te slaan.
              </strong>
            ) : (
              <>
                Je kunt je bestelling hieronder nog wijzigen of annuleren.
                <br />
                🕒 Laatst opgeslagen:{' '}
                {createdAt ? new Date(createdAt).toLocaleString('nl-NL') : '-'}
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
          {!isEditingOrder && (
            <button className="btn" onClick={editMyOrder}>
              Bestelling wijzigen
            </button>
          )}

          <button className="btn danger" onClick={cancelMyOrder}>
            Bestelling annuleren
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {groupedItems.map((item, idx) => (
          <div key={idx} className="row" style={{ marginBottom: 10 }}>
            <div>
              <strong>
                {item.quantity}x {item.productName}
              </strong>

              {item.options?.length ? (
                <div className="small">+ {optionText(item)}</div>
              ) : null}
            </div>

            <strong>{euro(itemTotal(item))}</strong>
          </div>
        ))}
      </div>

      <div
        className="row"
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <strong>Totaal</strong>
        <strong>{euro(displayedCustomerTotal)}</strong>
      </div>
    </section>
  );
}