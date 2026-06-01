import type { Product } from '@/lib/types';
import { euro } from '@/lib/money';

type ProductCardProps = {
  product: Product;
  openProduct: (product: Product) => void;
  addDirectProduct: (product: Product) => void;
};

export default function ProductCard({
  product,
  openProduct,
  addDirectProduct
}: ProductCardProps) {
  const hasOptions = Boolean(product.optionGroups?.length);

  return (
    <article className="card product">
      <div className="row">
        <h3>{product.name}</h3>

        <span className="price">{euro(product.price)}</span>
      </div>

      {hasOptions ? (
        <p className="small">Met opties/sauzen</p>
      ) : (
        <p className="small">Geen opties</p>
      )}

      <button
        className="btn"
        onClick={() => {
          if (hasOptions) {
            openProduct(product);
            return;
          }

          addDirectProduct(product);
        }}
      >
        {hasOptions ? 'Kies opties' : 'Direct toevoegen'}
      </button>
    </article>
  );
}