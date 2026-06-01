import type { Product, MenuOption } from '@/lib/types';
import { euro } from '@/lib/money';

type Props = {
  activeProduct: Product;
  selectedOptions: MenuOption[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<MenuOption[]>>;
  setActiveProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  addActiveProduct: () => void;
};

export default function ProductModal({
  activeProduct,
  selectedOptions,
  setSelectedOptions,
  setActiveProduct,
  addActiveProduct
}: Props) {
  const optionGroups = activeProduct.optionGroups || [];

  const missingRequiredGroups = optionGroups.filter(group => {
    const min = group.min || 0;

    if (min <= 0) {
      return false;
    }

    const selectedFromGroup = selectedOptions.filter(option =>
      group.options.some(groupOption => groupOption.name === option.name)
    );

    return selectedFromGroup.length < min;
  });

  const canAdd = missingRequiredGroups.length === 0;

  return (
    <div className="modalBg">
      <div className="modal">
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{activeProduct.name}</h2>
            {optionGroups.length > 0 && (
              <div className="small">{optionGroups.length} optiegroep(en)</div>
            )}
          </div>

          <strong>{euro(activeProduct.price)}</strong>
        </div>

        <div style={{ marginTop: 12 }}>
          {optionGroups.map(group => (
            <div key={group.name} style={{ marginTop: 12 }}>
              <h3 style={{ marginBottom: 8 }}>
                {group.name}{' '}
                <span className="small">
                  {group.min ? `min. ${group.min} · ` : ''}
                  max. {group.max || 1}
                </span>
              </h3>

              <div style={{ display: 'grid', gap: 6 }}>
                {group.options.map(option => {
                  const checked = selectedOptions.some(o => o.name === option.name);

                  return (
                    <label className="option" key={option.name}>
                      <span>
                        {option.name}{' '}
                        <span className="price">
                          {option.price ? euro(option.price) : ''}
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedOptions(prev => {
                            if (checked) {
                              return prev.filter(o => o.name !== option.name);
                            }

                            const currentFromGroup = prev.filter(o =>
                              group.options.some(go => go.name === o.name)
                            );

                            const withoutGroup = prev.filter(
                              o => !group.options.some(go => go.name === o.name)
                            );

                            return [
                              ...withoutGroup,
                              ...currentFromGroup,
                              option
                            ].slice(-(group.max || 1));
                          });
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!canAdd && (
          <p className="small" style={{ marginTop: 12 }}>
            Maak eerst een verplichte keuze bij:{' '}
            {missingRequiredGroups.map(group => group.name).join(', ')}
          </p>
        )}

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn secondary" onClick={() => setActiveProduct(null)}>
            Annuleren
          </button>

          <button className="btn" disabled={!canAdd} onClick={addActiveProduct}>
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}