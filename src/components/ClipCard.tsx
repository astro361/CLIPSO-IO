import { useState } from "react";
import type { Clip, Movie } from "../types";
import { downloadClip, formatBytes, formatDuration } from "../services/api";
import { DownloadIcon, PlayIcon, TrashIcon } from "./Icons";

interface Props {
  movie: Movie;
  clip: Clip;
  onDelete: () => void;
}

export default function ClipCard({ movie, clip, onDelete }: Props) {
  const [playing, setPlaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Uploaded (local blob) files hold the full movie, so use a media fragment
  // to preview only this part. Real R2 clips are already trimmed files.
  const isLocalFull = clip.videoUrl.startsWith("blob:");
  const src = isLocalFull
    ? `${clip.videoUrl}#t=${clip.startSec},${clip.startSec + clip.duration}`
    : clip.videoUrl;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadClip(movie, clip);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition hover:shadow-[0_14px_36px_-12px_rgba(56,189,248,0.3)]">
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${clip.gradient[0]}, ${clip.gradient[1]})` }}
      >
        {playing ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play Part ${clip.part}`}
            className="group absolute inset-0 grid place-items-center"
          >
            {isLocalFull && (
              <video
                src={`${clip.videoUrl}#t=${clip.startSec + 0.5}`}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="pointer-events-none absolute -bottom-6 -right-2 select-none text-[110px] font-black leading-none text-white/25">
              {clip.part}
            </span>
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white/95 text-indigo-500 shadow-lg transition group-hover:scale-110">
              <PlayIcon width={20} height={20} className="translate-x-px" />
            </span>
          </button>
        )}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">
          Part {clip.part}
        </span>
        {!playing && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-slate-900/70 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
            {formatDuration(clip.duration)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 p-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">Part {clip.part}</p>
          <p className="text-xs text-slate-400">
            {formatDuration(clip.duration)} · {formatBytes(clip.sizeBytes)}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-sky-500 px-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(14,165,233,0.7)] transition hover:bg-sky-600 disabled:opacity-70"
        >
          <DownloadIcon width={16} height={16} />
          {downloading ? "Saving…" : "Download"}
        </button>
        <button
          onClick={onDelete}
          title={`Delete Part ${clip.part}`}
          aria-label={`Delete Part ${clip.part}`}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>
    </article>
  );
}
