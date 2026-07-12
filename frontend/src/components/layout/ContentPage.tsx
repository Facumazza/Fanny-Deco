import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface Props {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/**
 * Shared shell for content/legal pages (política, faq, nosotros, etc.).
 * Renders the storefront header, a two-column-ish long-form article, and the footer.
 * Content is written in JSX by each page — this component only owns the layout.
 */
export function ContentPage({ eyebrow, title, children }: Props) {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-terracotta text-xs tracking-[0.3em] mb-3">{eyebrow}</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink mb-8">
          {title}
        </h1>
        <div className="content-body">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
