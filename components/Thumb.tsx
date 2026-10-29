import Image from "next/image";

const SIZES = "(min-width: 768px) 50vw, 100vw";

export default function Thumb({ src, className = "", priority }: { src: string | null; className?: string; priority?: boolean }) {
  // callers that pass `absolute` position the box themselves; otherwise it needs `relative` for fill
  const box = `${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`;
  return (
    <div className={`${box} ${src ? "" : "grid place-items-center bg-gradient-to-br from-brand-soft to-emerald-100"}`}>
      {src ? <Image src={src} alt="" fill sizes={SIZES} priority={priority} className="object-cover" /> : <span aria-hidden className="select-none text-3xl font-bold text-brand/25">?</span>}
    </div>
  );
}
