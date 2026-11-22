import { useState } from "react";
import Logo from "./Logo";
import { MenuIcon, PlusIcon, SearchIcon, XIcon } from "./Icons";
import type { Route } from "../hooks/useHashRoute";
import { cn } from "../utils/cn";

interface Props {
  route: Route;
  search: string;
  onSearch: (v: string) => void;
  onUpload: () => void;
}

const links = [
  { label: "Home", href: "#/", name: "home" },
  { label: "About Us", href: "#/about", name: "about" },
  { label: "Contact Us", href: "#/contact", name: "contact" },
] as const;

export default function Navbar({ route, search, onSearch, onUpload }: Props) {
  const [open, setOpen] = useState(false);

  const handleSearch = (v: string) => {
    onSearch(v);
    if (route.name !== "home" && v) window.location.hash = "#/";
  };

  const SearchBox = (
    <label className="relative block w-full">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width={18} height={18} />
      <input
        type="search"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search movies by title…"
        className="h-11 w-full rounded-full border border-slate-200/80 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );

  const activeName = route.name === "movie" ? "home" : route.name;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6">
        <Logo />

        <div className="mx-auto hidden w-full max-w-md flex-1 md:block">{SearchBox}</div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                activeName === l.name
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onUpload}
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] transition hover:brightness-105 active:scale-[0.97] md:ml-0"
        >
          <PlusIcon width={16} height={16} strokeWidth={2.6} />
          <span className="hidden sm:inline">Upload Movie</span>
          <span className="sm:hidden">Upload</span>
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile: search + links */}
      <div className="px-4 pb-3 md:hidden">{SearchBox}</div>
      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-xl px-3 py-3 text-sm font-medium",
                activeName === l.name ? "bg-indigo-50 text-indigo-600" : "text-slate-700"
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
