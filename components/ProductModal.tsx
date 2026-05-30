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
  return (
    <div className="modalBg">
      <div className="modal">
        <div className="row">
          <h2>{activeProduct.name}</h2>
          <strong>{euro(activeProduct.price)}</strong>
        </div>

        {(activeProduct.optionGroups || []).map(group => (
          <div key={group.name}>
            <h3>
              {group.name} <span className="small">max. {group.max || 1}</span>
            </h3>

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

                        return [...withoutGroup, ...currentFromGroup, option].slice(
                          -(group.max || 1)
                        );
                      });
                    }}
                  />
                </label>
              );
            })}
          </div>
        ))}

        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn secondary" onClick={() => setActiveProduct(null)}>
            Annuleren
          </button>

          <button className="btn" onClick={addActiveProduct}>
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}