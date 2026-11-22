import { ScissorsIcon } from "./Icons";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="#/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Clipso home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-[0_6px_16px_-4px_rgba(99,102,241,0.55)] transition-transform group-hover:-rotate-6">
        <ScissorsIcon width={18} height={18} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-300" />
      </span>
      <span className="text-[22px] font-extrabold tracking-tight text-slate-900">
        Clip<span className="text-indigo-500">so</span>
      </span>
    </a>
  );
}
