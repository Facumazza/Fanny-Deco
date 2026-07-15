import { Link } from 'react-router-dom';
import type { Category } from '../../types/api';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/?categoria=${category.slug}#coleccion`}
      className="relative overflow-hidden rounded-card aspect-[3/4] group block focus:outline-none focus:ring-2 focus:ring-brown-dark focus:ring-offset-2"
      aria-label={`Ver ${category.name}`}
    >
      <img
        src={category.imageUrl}
        alt={category.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="font-display text-2xl leading-tight">{category.name}</h3>
        {category.subtitle && (
          <p className="text-sm opacity-90 mt-1">{category.subtitle}</p>
        )}
      </div>
    </Link>
  );
}
