type KitchenTotalRow = {
  label: string;
  count: number;
};

type AdminKitchenTotalsProps = {
  productTotals: KitchenTotalRow[];
};

export default function AdminKitchenTotals({
  productTotals
}: AdminKitchenTotalsProps) {
  return (
    <>
      <h3>Bestellijst</h3>

      {productTotals.length === 0 ? (
        <p>Geen bestellingen voor deze week.</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {productTotals.map(row => (
            <div key={row.label}>
              <strong>
                {row.count}x {row.label}
              </strong>
            </div>
          ))}
        </div>
      )}
    </>
  );
}