import Image from "next/image";

const SIZES = "(min-width: 768px) 50vw, 100vw";

export default function Thumb({ src, className = "", priority }: { src: string | null; className?: string; priority?: boolean }) {
  // callers that pass `absolute` position the box themselves; otherwise it needs `relative` for fill
  const box = `${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`;
  return (
    <div className={`${box} ${src ? "" : "grid place-items-center bg-gradient-to-br from-brand-soft to-emerald-100"}`}>
      {src ? (
        <Image src={src} alt="" fill sizes={SIZES} priority={priority} className="object-cover" />
      ) : (
        // no featured image: a quiet document glyph instead of a broken-looking box
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-1/3 min-w-5 max-w-12 text-brand/35"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>
      )}
    </div>
  );
}
