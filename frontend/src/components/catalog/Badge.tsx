import type { ProductBadge } from '../../types/api';

const LABELS: Record<ProductBadge, string> = {
  MAS_VENDIDO: 'MÁS VENDIDO',
  NUEVO: 'NUEVO',
  ARTESANAL: 'ARTESANAL',
  EDICION_LIMITADA: 'EDICIÓN LIMITADA',
  SET_X3: 'SET X3',
  VERANO: 'VERANO',
};

export function Badge({ kind }: { kind: ProductBadge }) {
  return (
    <span className="inline-block bg-terracotta text-white text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm">
      {LABELS[kind]}
    </span>
  );
}
