import type { Movie, StorageInfo } from "../types";
import MovieCard from "../components/MovieCard";
import { FilmIcon, PlusIcon } from "../components/Icons";
import { formatBytes } from "../services/api";
import { navigate } from "../hooks/useHashRoute";

interface Props {
  movies: Movie[];
  loading: boolean;
  search: string;
  storage: StorageInfo;
  onUpload: () => void;
  onDeleteMovie: (m: Movie) => void;
  onClearSearch: () => void;
}

export default function HomePage({
  movies,
  loading,
  search,
  storage,
  onUpload,
  onDeleteMovie,
  onClearSearch,
}: Props) {
  const q = search.trim().toLowerCase();
  const filtered = q ? movies.filter((m) => m.title.toLowerCase().includes(q)) : movies;
  const pct = Math.min(100, (storage.usedBytes / storage.totalBytes) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-16px_rgba(15,23,42,0.1)] sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-60 w-60 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Movie-to-Shorts Splitter
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              Welcome to <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">Clipso</span>
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-500">
              Turn any full-length movie into perfectly ordered 60 or 90 second parts — ready to
              preview, download and share.
            </p>
            <button
              onClick={onUpload}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(99,102,241,0.65)] transition hover:brightness-105 active:scale-[0.97]"
            >
              <PlusIcon width={18} height={18} strokeWidth={2.6} /> Upload Movie
            </button>
          </div>

          {/* Storage */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-700">Storage Used</span>
              <span className="text-sm font-bold text-slate-900">
                {formatBytes(storage.usedBytes)}{" "}
                <span className="font-medium text-slate-400">/ {formatBytes(storage.totalBytes)}</span>
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-400 to-indigo-400 transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-slate-500">
              {pct.toFixed(0)}% used · delete movies or single parts to free up space.
            </p>
          </div>
        </div>
      </section>

      {/* Library */}
      <div className="mb-5 mt-10 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Your Movies</h2>
          <p className="text-sm text-slate-500">
            {q ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for “${search.trim()}”` : `${movies.length} in your library`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-[3/4] bg-slate-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-500">
            <FilmIcon width={26} height={26} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            {q ? "No movies match your search" : "Your library is empty"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {q ? "Try a different title, or clear the search." : "Upload your first movie and Clipso will split it into short parts."}
          </p>
          <button
            onClick={q ? onClearSearch : onUpload}
            className="mt-5 h-10 rounded-full bg-indigo-50 px-5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
          >
            {q ? "Clear search" : "+ Upload Movie"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              onOpen={() => navigate(`/movie/${m.id}`)}
              onDelete={() => onDeleteMovie(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
