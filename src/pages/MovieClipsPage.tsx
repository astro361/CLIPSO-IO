import { useState } from "react";
import type { Clip, Movie } from "../types";
import ClipCard from "../components/ClipCard";
import { ArrowLeftIcon, FilmIcon, TrashIcon } from "../components/Icons";
import { formatBytes } from "../services/api";

interface Props {
  movie: Movie | undefined;
  loading: boolean;
  onDeleteMovie: (m: Movie) => void;
  onDeleteClip: (m: Movie, c: Clip) => void;
}

const PAGE = 24;

export default function MovieClipsPage({ movie, loading, onDeleteMovie, onDeleteClip }: Props) {
  const [visible, setVisible] = useState(PAGE);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400">Loading…</div>;
  }
  if (!movie) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-500">
          <FilmIcon width={26} height={26} />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Movie not found</h2>
        <p className="mt-1 text-sm text-slate-500">It may have been deleted.</p>
        <a href="#/" className="mt-5 inline-flex h-10 items-center rounded-full bg-indigo-50 px-5 text-sm font-semibold text-indigo-600">
          Back to Home
        </a>
      </div>
    );
  }

  const total = movie.clips.reduce((s, c) => s + c.sizeBytes, 0);
  const shown = movie.clips.slice(0, visible);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:p-4">
        <a
          href="#/"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <ArrowLeftIcon width={16} height={16} /> Back to Home
        </a>

        <div className="order-3 flex w-full min-w-0 items-center gap-3 sm:order-none sm:w-auto sm:flex-1 sm:px-2">
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt="" className="h-12 w-9 shrink-0 rounded-lg object-cover shadow-sm" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{movie.title}</h1>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                {movie.clips.length} {movie.clips.length === 1 ? "Part" : "Parts"}
              </span>{" "}
              · {movie.clipDuration}s each · {formatBytes(total)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDeleteMovie(movie)}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-rose-50 px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-100 sm:ml-0"
        >
          <TrashIcon width={16} height={16} /> Delete Full Movie
        </button>
      </div>

      {/* Clips */}
      {movie.clips.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-slate-900">No parts left</h3>
          <p className="mt-1 text-sm text-slate-500">All parts of this movie have been deleted.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((c) => (
              <ClipCard key={c.id} movie={movie} clip={c} onDelete={() => onDeleteClip(movie, c)} />
            ))}
          </div>
          {visible < movie.clips.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="h-11 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
              >
                Show more parts ({movie.clips.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
