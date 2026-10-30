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
        // no featured image: both site logos as a faint grey watermark on the patterned background
        <div aria-hidden className="flex w-full flex-col items-center gap-[6%] opacity-30 grayscale">
          <Image src="/logo.png" alt="" width={300} height={99} className="h-auto w-[52%] max-w-52" />
          <Image src="/islamonlive-logo.png" alt="" width={298} height={81} className="h-auto w-[52%] max-w-52" />
        </div>
      )}
    </div>
  );
}
