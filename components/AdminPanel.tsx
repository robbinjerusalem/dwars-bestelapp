import type { Menu, Order } from '@/lib/types';
import { euro, orderTotal } from '@/lib/money';

const OWNER_NAME = 'Robbin Jerusalem';

function parseEuroInput(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  return Number(normalized || 0);
}

type AdminPanelProps = {
  menu: Menu;
  orders: Order[];
  selectedWeek: string;
  availableWeeks: string[];
  tikkieReceivedInput: string;
  setTikkieReceivedInput: (value: string) => void;
  load: (weekKey: string) => Promise<void>;
  clearOrders: () => Promise<void>;
  deleteOrder: (order: Order) => Promise<void>;
};

export default function AdminPanel({
  menu,
  orders,
  selectedWeek,
  availableWeeks,
  tikkieReceivedInput,
  setTikkieReceivedInput,
  load,
  clearOrders,
  deleteOrder
}: AdminPanelProps) {
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

  const productTotals = (() => {
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
          menu.products.findIndex(
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
  })();

  return (
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
  );
}