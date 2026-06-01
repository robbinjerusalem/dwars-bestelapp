import { euro } from '@/lib/money';

type AdminTikkiePanelProps = {
  totalRevenue: number;
  unpaidRevenue: number;
  ownOrderTotal: number;
  tikkieExpected: number;
  tikkieReceivedInput: string;
  setTikkieReceivedInput: (value: string) => void;
  tikkieDifference: number;
};

export default function AdminTikkiePanel({
  totalRevenue,
  unpaidRevenue,
  ownOrderTotal,
  tikkieExpected,
  tikkieReceivedInput,
  setTikkieReceivedInput,
  tikkieDifference
}: AdminTikkiePanelProps) {
  const differenceIsZero = Math.abs(tikkieDifference) < 0.01;

  const differenceText = differenceIsZero
    ? '✅ Alles klopt exact'
    : tikkieDifference < 0
      ? `⚠️ Nog ${euro(Math.abs(tikkieDifference))} te ontvangen`
      : `ℹ️ ${euro(tikkieDifference)} meer ontvangen dan verwacht`;

  const differenceColor = differenceIsZero
    ? '#166534'
    : tikkieDifference < 0
      ? '#991b1b'
      : '#92400e';

  const differenceBackground = differenceIsZero
    ? '#dcfce7'
    : tikkieDifference < 0
      ? '#fee2e2'
      : '#fef3c7';

  return (
    <>
      <h3>Tikkie controle</h3>

      <div
        className="card"
        style={{
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 10
        }}
      >
        <div>
          <div className="small">Totaal besteld</div>
          <h2>{euro(totalRevenue)}</h2>
        </div>

        <div>
          <div className="small">Openstaand</div>
          <h2>{euro(unpaidRevenue)}</h2>
        </div>

        <div>
          <div className="small">Eigen bestelling</div>
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

        <div
          style={{
            background: differenceBackground,
            color: differenceColor,
            borderRadius: 12,
            padding: 10,
            fontWeight: 700
          }}
        >
          <div className="small" style={{ color: differenceColor }}>
            Controle
          </div>
          <div>{differenceText}</div>
        </div>
      </div>
    </>
  );
}