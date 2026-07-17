'use client';

import { euro } from '@/lib/money';

type PaymentReminderProps = {
  amount: number;
  tikkieUrl: string;
  onDone: () => void;
};

export default function PaymentReminder({
  amount,
  tikkieUrl,
  onDone
}: PaymentReminderProps) {
  const hasTikkieUrl = Boolean(tikkieUrl);

  return (
    <section
      className="card"
      style={{
        maxWidth: 560,
        margin: '40px auto',
        textAlign: 'center',
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 54,
          marginBottom: 10
        }}
      >
        ✅
      </div>

      <h1 style={{ marginBottom: 8 }}>Je bestelling is opgeslagen</h1>

      <p
        style={{
          marginTop: 0,
          color: '#475569'
        }}
      >
        Je bestelling staat veilig in het overzicht.
      </p>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 20,
          marginTop: 22,
          marginBottom: 20
        }}
      >
        <div
          className="small"
          style={{
            marginBottom: 6
          }}
        >
          Te betalen
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 800
          }}
        >
          {euro(amount)}
        </div>
      </div>

      <div
        style={{
          background: '#fff7ed',
          border: '1px solid #fdba74',
          color: '#9a3412',
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
          textAlign: 'left'
        }}
      >
        <strong>Betaal bij voorkeur direct via Tikkie.</strong>

        <div style={{ marginTop: 6 }}>
          Vul in Tikkie het bovenstaande bedrag in.
        </div>
      </div>

      {hasTikkieUrl ? (
        <a
          className="btn"
          href={tikkieUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            fontSize: 18,
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          💳 Betaal nu via Tikkie
        </a>
      ) : (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: 12,
            padding: 14,
            marginBottom: 12
          }}
        >
          De Tikkie-link is nog niet beschikbaar. Je bestelling is wel
          opgeslagen.
        </div>
      )}

      <button
        className="btn secondary"
        onClick={onDone}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '14px',
          borderRadius: 16
        }}
      >
        Terug naar de bestelapp
      </button>

      <div
        className="small"
        style={{
          marginTop: 16
        }}
      >
        Problemen met betalen? Laat het even weten.
      </div>
    </section>
  );
}