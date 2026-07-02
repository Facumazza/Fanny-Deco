import { useId } from 'react';

export function StarRating({ value, count }: { value: number; count?: number }) {
  const clamped = Math.max(0, Math.min(5, value));
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, clamped - i));
    return fill;
  });

  return (
    <div className="inline-flex items-center gap-1 text-terracotta text-sm">
      <div className="inline-flex" role="img" aria-label={`Rating ${clamped} de 5`}>
        {stars.map((fill, i) => (
          <Star key={i} fill={fill} />
        ))}
      </div>
      {count !== undefined && <span className="text-muted">({count})</span>}
    </div>
  );
}

function Star({ fill }: { fill: number }) {
  const id = useId();
  return (
    <svg
      data-star
      data-star-fill={fill}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
    >
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="#E5E5E5" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1L12 2z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
