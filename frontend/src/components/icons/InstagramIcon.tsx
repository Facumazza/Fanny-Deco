interface Props {
  size?: number;
  className?: string;
}

/**
 * Instagram glyph — outline style so it inherits the parent's text color.
 * Path is the Feather / Lucide 'instagram' icon. We inline it instead of
 * pulling a whole icon library for a single mark.
 */
export function InstagramIcon({ size = 20, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Canonical URL for the shop's Instagram profile. Used from Header, Footer, Contacto. */
export const INSTAGRAM_URL = 'https://www.instagram.com/fanny.deco/';
export const INSTAGRAM_HANDLE = '@fanny.deco';
