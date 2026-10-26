export default function Thumb({ src, className = "" }: { src: string | null; className?: string }) {
  return src ? (
    <img src={src} alt="" loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`bg-neutral-200 ${className}`} />
  );
}
