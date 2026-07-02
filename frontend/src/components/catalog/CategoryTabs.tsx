import type { Category } from '../../types/api';

export type TabValue = string | null; // null = "TODOS"

interface Props {
  categories: Category[];
  value: TabValue;
  onChange: (next: TabValue) => void;
}

export function CategoryTabs({ categories, value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por categoría"
      className="inline-flex flex-wrap items-center gap-1 bg-white border border-cream-card p-1 rounded-sm mb-8"
    >
      <Tab
        label="TODOS"
        active={value === null}
        onClick={() => onChange(null)}
      />
      {categories.map(c => (
        <Tab
          key={c.slug}
          label={shortLabel(c.name)}
          active={value === c.slug}
          onClick={() => onChange(c.slug)}
        />
      ))}
    </div>
  );
}

function Tab({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'px-5 py-2 text-xs tracking-[0.18em] font-semibold transition-colors ' +
        (active
          ? 'bg-brown-dark text-white'
          : 'text-ink hover:text-terracotta')
      }
    >
      {label}
    </button>
  );
}

// Shortened labels matching the Figma design.
function shortLabel(name: string): string {
  return name
    .toUpperCase()
    .replace('CARTERAS DE CUERO', 'CARTERAS CUERO')
    .replace('CARTERAS OTROS MATERIALES', 'CARTERAS OTROS');
}
