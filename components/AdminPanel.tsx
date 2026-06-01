import type { Menu, Order } from '@/lib/types';
import { euro, orderTotal } from '@/lib/money';
import AdminTikkiePanel from '@/components/AdminTikkiePanel';
import AdminOrderList from '@/components/AdminOrderList';
import AdminKitchenTotals from '@/components/AdminKitchenTotals';
import AdminGroupShare from '@/components/AdminGroupShare';

const OWNER_NAME = 'Robbin Jerusalem';

function fridayFromWeekKey(weekKey: string) {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);

  if (!match) return weekKey;

  const year = Number(match[1]);
  const week = Number(match[2]);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;

  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const friday = new Date(mondayWeek1);
  friday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7 + 4);

  return friday.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function dateOnlyFromWeekKey(weekKey: string) {
  return fridayFromWeekKey(weekKey).replace(/^vrijdag\s+/i, '');
}

function parseEuroInput(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  return Number(normalized || 0);
}

function sortedOptionNames(item: Order['items'][number]) {
  return [...(item.options || [])]
    .map(option => option.name)
    .sort((a, b) => a.localeCompare(b, 'nl-NL'));
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
  const fridayText = fridayFromWeekKey(selectedWeek);

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

  const unpaidOrders = orders.filter(order => !order.paid);

  const lateOrders = orders.filter(order => order.lateOrder);

  const latePeople = [
    ...new Set(lateOrders.map(order => order.personName))
  ].sort((a, b) => a.localeCompare(b, 'nl-NL'));

  const unpaidRevenue = unpaidOrders.reduce(
    (sum, order) => sum + orderTotal(order),
    0
  );

  const unpaidPeople = orders.filter(order => !order.paid).length;
  const everyonePaid = orders.length > 0 && unpaidPeople === 0;

  const ownOrder = orders.find(
    order =>
      order.personName.toLowerCase().trim() ===
      OWNER_NAME.toLowerCase().trim()
  );

  const ownOrderTotal = ownOrder ? orderTotal(ownOrder) : 0;

  const unpaidOwnOrder = unpaidOrders.find(
    order =>
      order.personName.toLowerCase().trim() ===
      OWNER_NAME.toLowerCase().trim()
  );

  const unpaidOwnOrderTotal = unpaidOwnOrder ? orderTotal(unpaidOwnOrder) : 0;

  const tikkieExpected = Math.max(unpaidRevenue - unpaidOwnOrderTotal, 0);
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
        const optionNames = sortedOptionNames(item);

        const optionText = optionNames.length
          ? ' + ' + optionNames.join(', ')
          : '';

        const label = item.productName + optionText;
        const key = label.toLowerCase().trim();

        const menuIndex = menu.products.findIndex(
          p => p.name === item.productName
        );

        map.set(key, {
          label,
          count: (map.get(key)?.count || 0) + item.quantity,
          orderIndex: menuIndex === -1 ? 9999 : menuIndex
        });
      }
    }

    return [...map.values()].sort((a, b) => a.orderIndex - b.orderIndex);
  })();

  async function setAllPaid() {
    if (!confirm(`Alle openstaande bestellingen voor ${fridayText} op betaald zetten?`)) {
      return;
    }

    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weekKey: selectedWeek,
        paid: true,
        all: true
      })
    });

    if (!res.ok) {
      return alert((await res.json()).error || 'Alles betaald zetten mislukt');
    }

    await load(selectedWeek);
  }

  return (
    <section className="card">
      <div className="row">
        <div>
          <h2>Overzicht</h2>

          <div style={{ marginTop: 8 }}>
            <label className="small">Datum</label>

            <select
              className="input"
              value={selectedWeek}
              onChange={e => load(e.target.value)}
              style={{ maxWidth: 220, marginTop: 6 }}
            >
              {availableWeeks.map(week => (
                <option key={week} value={week}>
                  {dateOnlyFromWeekKey(week)}
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
            Deze vrijdag wissen
          </button>
        </div>
      </div>

      {latePeople.length > 0 && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            color: '#9a3412',
            padding: 12,
            borderRadius: 12,
            marginTop: 12,
            marginBottom: 12
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            ⏰ Te laat besteld ({latePeople.length})
          </div>

          {latePeople.map(name => (
            <div key={name}>{name}</div>
          ))}
        </div>
      )}

      {everyonePaid && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: 10,
            borderRadius: 12,
            marginTop: 12,
            marginBottom: 12,
            fontWeight: 700
          }}
        >
          ✅ Iedereen heeft betaald. Er staat niets meer open.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
          gap: 10,
          marginTop: 16,
          marginBottom: 18
        }}
      >
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

        <div className="card">
          <div className="small">Open</div>
          <h2>{unpaidPeople}</h2>
        </div>

        <div className="card">
          <div className="small">Openstaand</div>
          <h2>{euro(unpaidRevenue)}</h2>
        </div>
      </div>

      <AdminKitchenTotals productTotals={productTotals} />

      <AdminGroupShare orders={orders} selectedWeek={selectedWeek} />

      <div style={{ marginTop: 18 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Betalingen</h3>

          <button className="btn" onClick={setAllPaid}>
            Alle openstaande betaald zetten
          </button>
        </div>

        <AdminTikkiePanel
          totalRevenue={totalRevenue}
          unpaidRevenue={unpaidRevenue}
          ownOrderTotal={ownOrderTotal}
          tikkieExpected={tikkieExpected}
          tikkieReceivedInput={tikkieReceivedInput}
          setTikkieReceivedInput={setTikkieReceivedInput}
          tikkieDifference={tikkieDifference}
        />
      </div>

      <AdminOrderList
        orders={orders}
        selectedWeek={selectedWeek}
        load={load}
        deleteOrder={deleteOrder}
      />

      <h3>Eindtotaal: {euro(totalRevenue)}</h3>
    </section>
  );
}