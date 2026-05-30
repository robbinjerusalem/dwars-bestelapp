import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

type ProductGridProps = {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
  products: Product[];
  openProduct: (product: Product) => void;
  addDirectProduct: (product: Product) => void;
};

export default function ProductGrid({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  products,
  openProduct,
  addDirectProduct
}: ProductGridProps) {
  return (
    <>
      <section className="card" style={{ marginBottom: 16 }}>
        <label>Zoeken</label>

        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoek product..."
        />
      </section>

      <div className="tabs">
        {categories.map(c => (
          <button
            key={c}
            className={'tab ' + (category === c ? 'active' : '')}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            openProduct={openProduct}
            addDirectProduct={addDirectProduct}
          />
        ))}
      </section>
    </>
  );
}