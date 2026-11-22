import { useEffect, useRef, useState } from "react";
import type { Movie, UploadProgress } from "../types";
import { formatBytes, uploadAndSplitMovie } from "../services/api";
import { CheckIcon, ImageIcon, UploadCloudIcon, XIcon } from "./Icons";
import { cn } from "../utils/cn";

interface Props {
  onClose: () => void;
  onCreated: (movie: Movie) => void;
}

export default function UploadModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<60 | 90>(60);
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const busy = progress !== null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [busy, onClose]);

  useEffect(() => {
    if (!poster) return setPosterPreview(null);
    const url = URL.createObjectURL(poster);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [poster]);

  const pickVideo = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return setError("Please choose a video file (MP4, MOV, MKV…).");
    setError("");
    setVideo(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Please give your movie a title.");
    if (!video) return setError("Please add a video file to split.");
    setError("");
    setProgress({ stage: "uploading", percent: 0 });
    try {
      const movie = await uploadAndSplitMovie(
        { title, posterFile: poster, clipDuration: duration, videoFile: video },
        setProgress
      );
      onCreated(movie); // navigates to the new Movie Clips page
    } catch {
      setProgress(null);
      setError("Something went wrong while uploading. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => !busy && onClose()}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Upload Movie</h2>
            <p className="mt-0.5 text-sm text-slate-500">We'll split it into short, shareable parts.</p>
          </div>
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <XIcon />
            </button>
          )}
        </div>

        {busy ? (
          <ProgressView progress={progress!} fileName={video?.name ?? ""} />
        ) : (
          <div className="space-y-5">
            <div className="flex gap-4">
              {/* Poster */}
              <div className="shrink-0">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Poster <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <button
                  type="button"
                  onClick={() => posterInput.current?.click()}
                  className="group relative grid h-32 w-24 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-sky-300 hover:text-sky-500"
                >
                  {posterPreview ? (
                    <img src={posterPreview} alt="Poster preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-xs font-medium">
                      <ImageIcon />
                      Add
                    </span>
                  )}
                </button>
                <input
                  ref={posterInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setPoster(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Movie Title</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midnight Horizon"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </label>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Clip Duration</span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                    {([60, 90] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={cn(
                          "h-9 rounded-lg text-sm font-semibold transition",
                          duration === d
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {d} seconds
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Video drop zone */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Movie File (1080p)</span>
              <div
                onClick={() => videoInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickVideo(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
                  dragging
                    ? "border-indigo-400 bg-indigo-50"
                    : video
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
                )}
              >
                {video ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckIcon />
                    </span>
                    <p className="max-w-full truncate text-sm font-semibold text-slate-800">{video.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(video.size)} · click to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-sky-600">
                      <UploadCloudIcon />
                    </span>
                    <p className="text-sm font-semibold text-slate-800">Drag & drop your video here</p>
                    <p className="text-xs text-slate-500">or click to browse · MP4, MOV, MKV</p>
                  </div>
                )}
              </div>
              <input
                ref={videoInput}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => pickVideo(e.target.files?.[0])}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(99,102,241,0.65)] transition hover:brightness-105 active:scale-[0.99]"
            >
              Submit & Split Movie
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function ProgressView({ progress, fileName }: { progress: UploadProgress; fileName: string }) {
  const uploading = progress.stage === "uploading";
  return (
    <div className="py-6">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
        <UploadCloudIcon width={28} height={28} className="animate-pulse" />
      </div>
      <h3 className="text-center text-base font-bold text-slate-900">
        {progress.stage === "done"
          ? "All done! Opening your clips…"
          : uploading
          ? "Uploading your movie…"
          : "Splitting into parts in the cloud…"}
      </h3>
      <p className="mx-auto mt-1 max-w-xs truncate text-center text-xs text-slate-500">{fileName}</p>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-300 transition-[width] duration-150"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
        <span className={uploading ? "text-indigo-600" : "text-emerald-600"}>
          {uploading ? "① Uploading" : "✓ Uploaded"}
        </span>
        <span className="tabular-nums text-slate-700">{progress.percent}%</span>
        <span className={!uploading ? "text-indigo-600" : ""}>② Splitting</span>
      </div>
    </div>
  );
}
