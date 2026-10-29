import Image from "next/image";

const SIZES = "(min-width: 768px) 50vw, 100vw";

export default function Thumb({ src, className = "", priority }: { src: string | null; className?: string; priority?: boolean }) {
  // callers that pass `absolute` position the box themselves; otherwise it needs `relative` for fill
  const box = `${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`;
  return (
    <div className={`${box} ${src ? "" : "geo grid place-items-center bg-gradient-to-br from-sand to-champagne/60"}`}>
      {src ? (
        <Image src={src} alt="" fill sizes={SIZES} priority={priority} className="object-cover" />
      ) : (
        // no featured image: a gold eight-point star instead of a broken-looking box
        <svg aria-hidden viewBox="0 0 64 64" className="size-2/5 min-w-5 max-w-14 text-gold/70" fill="currentColor"><path d="M32 4l7 17 17-7-7 17 17 7-17 7 7 17-17-7-7 17-7-17-17 7 7-17-17-7 17-7-7-17 17 7z" /></svg>
      )}
    </div>
  );
}
