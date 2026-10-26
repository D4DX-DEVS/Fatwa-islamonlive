import Image from "next/image";

const SIZES = "(min-width: 768px) 50vw, 100vw";

export default function Thumb({ src, className = "", priority }: { src: string | null; className?: string; priority?: boolean }) {
  // callers that pass `absolute` position the box themselves; otherwise it needs `relative` for fill
  const box = `${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`;
  return (
    <div className={`${box} ${src ? "" : "bg-neutral-200"}`}>
      {src && <Image src={src} alt="" fill sizes={SIZES} priority={priority} className="object-cover" />}
    </div>
  );
}
