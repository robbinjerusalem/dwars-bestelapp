'use client';

import { useEffect, useState } from 'react';
import { euro } from '@/lib/money';

const ADMIN_PIN = '7161';

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
  const [tikkieUrl, setTikkieUrl] = useState('');
  const [savedTikkieUrl, setSavedTikkieUrl] = useState('');
  const [loadingLink, setLoadingLink] = useState(true);
  const [savingLink, setSavingLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');

  useEffect(() => {
    async function loadTikkieLink() {
      try {
        setLoadingLink(true);

        const response = await fetch('/api/settings', {
          cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Tikkie-link laden mislukt');
        }

        const loadedUrl = String(data.tikkieUrl || '');

        setTikkieUrl(loadedUrl);
        setSavedTikkieUrl(loadedUrl);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Tikkie-link laden mislukt';

        setLinkMessage(`❌ ${message}`);
      } finally {
        setLoadingLink(false);
      }
    }

    loadTikkieLink();
  }, []);

  async function saveTikkieLink() {
    try {
      setSavingLink(true);
      setLinkMessage('');

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminPin: ADMIN_PIN,
          tikkieUrl: tikkieUrl.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tikkie-link opslaan mislukt');
      }

      const savedUrl = String(data.tikkieUrl || '');

      setTikkieUrl(savedUrl);
      setSavedTikkieUrl(savedUrl);

      setLinkMessage(
        savedUrl
          ? '✅ Tikkie-link is opgeslagen'
          : '✅ Tikkie-link is verwijderd'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Tikkie-link opslaan mislukt';

      setLinkMessage(`❌ ${message}`);
    } finally {
      setSavingLink(false);
    }
  }

  const linkHasChanges = tikkieUrl.trim() !== savedTikkieUrl;

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
      <h3>Wekelijkse Tikkie-link</h3>

      <div
        className="card"
        style={{
          marginBottom: 18
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong>Open Tikkie voor deze week</strong>
        </div>

        <div
          className="small"
          style={{
            marginBottom: 10
          }}
        >
          Maak iedere week een nieuwe open Tikkie en plak de link hieronder.
          Na het bestellen krijgen collega&apos;s deze link te zien.
        </div>

        <input
          className="input"
          value={tikkieUrl}
          onChange={event => {
            setTikkieUrl(event.target.value);
            setLinkMessage('');
          }}
          placeholder="https://tikkie.me/pay/..."
          disabled={loadingLink || savingLink}
        />

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 10
          }}
        >
          <button
            className="btn"
            onClick={saveTikkieLink}
            disabled={loadingLink || savingLink || !linkHasChanges}
          >
            {savingLink ? 'Opslaan...' : 'Tikkie-link opslaan'}
          </button>

          {savedTikkieUrl && (
            <a
              className="btn secondary"
              href={savedTikkieUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Open Tikkie
            </a>
          )}
        </div>

        {loadingLink && (
          <div
            className="small"
            style={{
              marginTop: 10
            }}
          >
            Tikkie-link laden...
          </div>
        )}

        {!loadingLink && !savedTikkieUrl && !linkMessage && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              background: '#fff7ed',
              color: '#9a3412',
              fontWeight: 700
            }}
          >
            ⚠️ Er is nog geen Tikkie-link ingesteld.
          </div>
        )}

        {linkMessage && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              background: linkMessage.startsWith('✅')
                ? '#dcfce7'
                : '#fee2e2',
              color: linkMessage.startsWith('✅')
                ? '#166534'
                : '#991b1b',
              fontWeight: 700
            }}
          >
            {linkMessage}
          </div>
        )}
      </div>

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
            onChange={event =>
              setTikkieReceivedInput(event.target.value)
            }
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
          <div
            className="small"
            style={{
              color: differenceColor
            }}
          >
            Controle
          </div>

          <div>{differenceText}</div>
        </div>
      </div>
    </>
  );
}