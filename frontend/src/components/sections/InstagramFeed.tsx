import { InstagramIcon, INSTAGRAM_URL } from '../icons/InstagramIcon';

const FEED_IMAGES = [
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/c9de1727-5989-44b0-9615-5c00bf1ca045.jpg',
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/625b9e67-fd31-4074-b658-299d1815d302.jpg',
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/91ce8e1d-b638-4138-966c-92c858e8d80e.jpg',
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/33ab4bfe-b685-4ba2-99d1-4cde64bfdc1e.jpg',
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/1ab3b256-6598-4b36-af73-616f5bb2ed37.jpg',
  'https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/012af45f-88d7-4b9a-988e-2d9822826f79.jpg',
];

export function InstagramFeed() {
  return (
    <section className="bg-brown-dark text-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-cream-bg/70 text-xs tracking-[0.3em] mb-3">SEGUINOS EN INSTAGRAM</p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-display text-4xl md:text-5xl hover:text-terracotta transition-colors"
          >
            <InstagramIcon size={32} />
            @fanny.deco
          </a>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {FEED_IMAGES.map((src, i) => (
            <a
              key={src}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver post ${i + 1} de FannyDeco en Instagram`}
              className="relative block aspect-square overflow-hidden group"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brown-dark/0 group-hover:bg-brown-dark/50 transition-colors flex items-center justify-center">
                <InstagramIcon
                  size={36}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-white/40 hover:bg-white hover:text-brown-dark px-8 py-3 text-sm tracking-wider font-semibold transition-colors"
          >
            VER MÁS EN INSTAGRAM
          </a>
        </div>
      </div>
    </section>
  );
}
