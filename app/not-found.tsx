import Link from "@/components/Link";

// Rendered inside the surrounding layout (the public pages and the admin both have their own shell)
export default function NotFound() {
  return (
    <div className="geo relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-gold/50 bg-deep px-8 py-16 text-center text-ivory shadow-2xl shadow-deep/30">
      <p className="rise bg-gradient-to-b from-champagne to-gold bg-clip-text text-[7rem] font-extrabold leading-none text-transparent sm:text-[10rem]">404</p>
      <h1 className="rise mt-2 text-3xl font-extrabold [--i:1] sm:text-4xl">Page not found</h1>
      <p className="rise mx-auto mt-3 max-w-md font-medium text-ivory/70 [--i:2]">The page you are looking for does not exist or has moved.</p>
      <div className="rise mt-9 flex flex-wrap justify-center gap-3 text-sm font-extrabold uppercase tracking-[0.15em] [--i:3]">
        <Link href="/" className="sheen rounded-full bg-gold px-8 py-3.5 text-ink transition-transform hover:-translate-y-1">Home</Link>
        <Link href="/search" className="rounded-full border border-gold/60 px-8 py-3.5 text-champagne transition-all hover:-translate-y-1 hover:bg-gold hover:text-ink">Search</Link>
      </div>
    </div>
  );
}
