import { Link } from 'react-router-dom';
import type { ProductSummary } from '../../types/api';
import { formatArs } from '../../lib/price';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="bg-white rounded-card overflow-hidden flex flex-col group">
      <Link to={`/producto/${product.slug}`} className="relative aspect-[4/5] bg-cream-card block">
        {/* Portrait 4:5 tile with object-cover: most of Laura's product photos
            are portrait, so they fit this ratio naturally with no letterboxing.
            Landscape photos lose some of their sides — a small cost for
            uniformity across the grid. Reshooting all photos at a common ratio
            is the real long-term fix. */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <Link
          to={`/producto/${product.slug}`}
          className="font-display text-lg leading-snug text-ink hover:text-terracotta transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-terracotta font-semibold">
            {formatArs(product.priceArs)}
          </span>
        </div>
      </div>
    </article>
  );
}
