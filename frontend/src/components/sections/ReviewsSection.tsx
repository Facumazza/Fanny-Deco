import { useEffect, useState } from 'react';
import type { Review } from '../../types/api';
import { getReviews } from '../../api/catalog';
import { StarRating } from '../catalog/StarRating';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews(3).then(setReviews).catch(console.error);
  }, []);

  return (
    <section className="py-20 bg-cream-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-terracotta text-xs tracking-[0.3em] mb-4">RESEÑAS</p>
          <h2 className="font-display text-4xl text-ink">Lo que dicen nuestros clientes</h2>
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="bg-white p-6 rounded-card flex flex-col gap-4">
      <StarRating value={review.rating} />
      <p className="text-ink leading-relaxed">"{review.body}"</p>
      <hr className="border-cream-card" />
      <div className="flex items-end justify-between mt-2">
        <div>
          <p className="font-semibold text-ink">{review.authorName}</p>
          {review.location && (
            <p className="text-sm text-muted">{review.location}</p>
          )}
        </div>
        {review.productName && (
          <p className="text-xs text-terracotta tracking-wider text-right">
            {review.productName}
          </p>
        )}
      </div>
    </article>
  );
}
