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
  return (
    <article className="card product">
      <div className="row">
        <h3>{product.name}</h3>

        <span className="price">{euro(product.price)}</span>
      </div>

      {product.optionGroups?.length ? (
        <p className="small">Met opties/sauzen</p>
      ) : (
        <p className="small">Geen opties</p>
      )}

      <button
        className="btn"
        onClick={() => {
          if (product.optionGroups?.length) {
            openProduct(product);
            return;
          }

          addDirectProduct(product);
        }}
      >
        {product.optionGroups?.length ? 'Kies opties' : 'Direct toevoegen'}
      </button>
    </article>
  );
}