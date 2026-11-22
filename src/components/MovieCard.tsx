import type { Movie } from "../types";
import { FilmIcon, TrashIcon } from "./Icons";
import { formatBytes } from "../services/api";

interface Props {
  movie: Movie;
  onOpen: () => void;
  onDelete: () => void;
}

export default function MovieCard({ movie, onOpen, onDelete }: Props) {
  const parts = movie.clips.length;
  const size = movie.clips.reduce((s, c) => s + c.sizeBytes, 0);

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(99,102,241,0.25)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100 text-indigo-300">
            <FilmIcon width={56} height={56} strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
          {movie.clipDuration}s clips
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete Movie"
          aria-label={`Delete ${movie.title}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur transition hover:bg-rose-50 hover:text-rose-500"
        >
          <TrashIcon width={17} height={17} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold text-slate-900">{movie.title}</h3>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-600">
            {parts} {parts === 1 ? "Part" : "Parts"}
          </span>
          <span className="text-slate-400">{formatBytes(size)}</span>
        </div>
      </div>
    </article>
  );
}
