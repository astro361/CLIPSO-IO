/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Clipso API service layer
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every data / upload / delete operation in the UI goes through this file.
 *  Right now it runs against an in-memory demo store so the preview is fully
 *  interactive. To go to production, replace the body of each function using
 *  the "PLUG IN" notes:
 *
 *   • Supabase (Postgres)  → movie + clip metadata (tables: movies, clips)
 *   • Cloudflare R2        → video, poster & clip file storage (S3-compatible)
 *   • FastAPI + FFmpeg     → splits the uploaded movie into 60s / 90s parts
 *
 *  The React components never need to change – just keep the same signatures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import posterHorizon from "../assets/poster-horizon.jpg";
import posterLighthouse from "../assets/poster-lighthouse.jpg";
import type {
  Clip,
  Movie,
  StorageInfo,
  UploadInput,
  UploadProgress,
} from "../types";

// ── PLUG IN: Supabase client ────────────────────────────────────────────────
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
//
// ── PLUG IN: FastAPI base URL ───────────────────────────────────────────────
// const API_URL = import.meta.env.VITE_API_URL; // e.g. https://api.clipso.app
//
// ── PLUG IN: Cloudflare R2 ──────────────────────────────────────────────────
// Browser never talks to R2 with secret keys. Ask FastAPI for a pre-signed
// PUT URL (POST `${API_URL}/uploads/presign`) and upload straight to R2.

const GB = 1024 ** 3;
const MB = 1024 ** 2;
export const STORAGE_LIMIT_BYTES = 10 * GB;

/** Public sample videos used only for the demo data. */
const SAMPLE_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

const GRADIENTS: [string, string][] = [
  ["#38bdf8", "#818cf8"],
  ["#818cf8", "#c4b5fd"],
  ["#6ee7b7", "#38bdf8"],
  ["#fda4af", "#fdba74"],
  ["#a5b4fc", "#67e8f9"],
  ["#5eead4", "#a5b4fc"],
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

function buildClips(
  movieId: string,
  parts: number,
  duration: number,
  sizeBytes: number,
  videoUrl?: string,
  seed = 0
): Clip[] {
  return Array.from({ length: parts }, (_, i) => ({
    id: `${movieId}-p${i + 1}`,
    movieId,
    part: i + 1,
    duration,
    startSec: i * duration,
    sizeBytes,
    videoUrl: videoUrl ?? SAMPLE_VIDEOS[(i + seed) % SAMPLE_VIDEOS.length],
    gradient: GRADIENTS[(i + seed) % GRADIENTS.length],
  }));
}

// ── Demo database (in-memory) ───────────────────────────────────────────────
// PLUG IN: remove this array once Supabase is connected.
let db: Movie[] = [
  {
    id: "m-horizon",
    title: "Midnight Horizon",
    posterUrl: posterHorizon,
    clipDuration: 60,
    createdAt: "2025-05-02T10:00:00Z",
    clips: buildClips("m-horizon", 95, 60, 16 * MB, undefined, 0),
  },
  {
    id: "m-lighthouse",
    title: "The Last Lighthouse",
    posterUrl: posterLighthouse,
    clipDuration: 90,
    createdAt: "2025-06-11T14:30:00Z",
    clips: buildClips("m-lighthouse", 48, 90, 22 * MB, undefined, 2),
  },
];

const clone = <T,>(v: T): T => v; // data is treated as immutable by the UI

// ── READ ────────────────────────────────────────────────────────────────────

/** List all movies (with their clips). */
export async function listMovies(): Promise<Movie[]> {
  await wait(250);
  // PLUG IN (Supabase):
  // const { data, error } = await supabase
  //   .from("movies")
  //   .select("*, clips(*)")
  //   .order("created_at", { ascending: false });
  // if (error) throw error;
  // return data.map(mapMovieRow);
  return clone([...db].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** Storage used across all movies + posters. */
export async function getStorageInfo(): Promise<StorageInfo> {
  // PLUG IN (Supabase): sum(clips.size_bytes) via an RPC / SQL view,
  // or ask FastAPI to list R2 bucket usage.
  const used = db.reduce(
    (sum, m) => sum + m.clips.reduce((s, c) => s + c.sizeBytes, 0),
    0
  );
  return { usedBytes: used, totalBytes: STORAGE_LIMIT_BYTES };
}

// ── CREATE: upload + split ──────────────────────────────────────────────────

/** Reads a video's length in seconds in the browser (falls back to ~92 min). */
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    const url = URL.createObjectURL(file);
    const done = (d: number) => {
      URL.revokeObjectURL(url);
      resolve(d);
    };
    v.onloadedmetadata = () =>
      done(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 5520);
    v.onerror = () => done(5520);
    v.src = url;
  });
}

/**
 * Upload a movie and split it into parts.
 * `onProgress` receives 0-100 overall progress, split into two stages.
 */
export async function uploadAndSplitMovie(
  input: UploadInput,
  onProgress: (p: UploadProgress) => void
): Promise<Movie> {
  // ── PLUG IN (Cloudflare R2) ───────────────────────────────────────────────
  // 1. const { uploadUrl, objectKey } = await fetch(`${API_URL}/uploads/presign`, {...}).then(r => r.json());
  // 2. XMLHttpRequest PUT the video to `uploadUrl` and map xhr.upload.onprogress → onProgress({stage:"uploading", ...})
  // 3. Upload the optional poster the same way (posters/<movieId>.jpg).
  //
  // ── PLUG IN (FastAPI + FFmpeg) ────────────────────────────────────────────
  // 4. POST `${API_URL}/movies/split` { objectKey, clipDuration, title }
  //    FastAPI runs something like:
  //      ffmpeg -i source.mp4 -c copy -f segment -segment_time 60 \
  //             -reset_timestamps 1 part_%03d.mp4
  //    uploads every part to R2 and returns the part list. Poll
  //    GET `${API_URL}/movies/{id}/status` to drive the "splitting" stage.
  //
  // ── PLUG IN (Supabase) ────────────────────────────────────────────────────
  // 5. insert into movies / clips with the returned R2 keys.
  // ──────────────────────────────────────────────────────────────────────────

  const duration = await readVideoDuration(input.videoFile);

  // Stage 1 – simulated upload (0 → 55 %)
  for (let p = 0; p <= 55; p += 3) {
    onProgress({ stage: "uploading", percent: p });
    await wait(90);
  }
  // Stage 2 – simulated cloud splitting (55 → 100 %)
  for (let p = 56; p <= 100; p += 3) {
    onProgress({ stage: "splitting", percent: Math.min(p, 100) });
    await wait(110);
  }

  const id = `m-${uid()}`;
  const parts = Math.max(1, Math.ceil(duration / input.clipDuration));
  const perClip = Math.round(input.videoFile.size / parts);
  // Demo only: we point every clip to the local file (with a #t=start,end
  // media fragment so the preview plays only that part).
  const localUrl = URL.createObjectURL(input.videoFile);
  const clips: Clip[] = buildClips(id, parts, input.clipDuration, perClip, localUrl, 1).map(
    (c) => ({
      ...c,
      duration:
        c.part === parts
          ? Math.max(1, Math.round(duration - c.startSec))
          : input.clipDuration,
    })
  );

  const movie: Movie = {
    id,
    title: input.title.trim(),
    posterUrl: input.posterFile ? URL.createObjectURL(input.posterFile) : null,
    clipDuration: input.clipDuration,
    createdAt: new Date().toISOString(),
    clips,
  };
  db = [movie, ...db];
  onProgress({ stage: "done", percent: 100 });
  return movie;
}

// ── DELETE ──────────────────────────────────────────────────────────────────

/** Delete a whole movie and every clip (frees storage). */
export async function deleteMovie(movieId: string): Promise<void> {
  await wait(300);
  // PLUG IN (FastAPI/R2): DELETE `${API_URL}/movies/${movieId}`
  //   → backend removes the R2 prefix `movies/<id>/` (source, poster, all parts).
  // PLUG IN (Supabase): await supabase.from("movies").delete().eq("id", movieId);
  //   (clips rows cascade with ON DELETE CASCADE)
  db = db.filter((m) => m.id !== movieId);
}

/** Delete a single clip (part) to save space. */
export async function deleteClip(movieId: string, clipId: string): Promise<void> {
  await wait(200);
  // PLUG IN (R2): delete object `movies/<movieId>/part_XXX.mp4` through FastAPI.
  // PLUG IN (Supabase): await supabase.from("clips").delete().eq("id", clipId);
  db = db.map((m) =>
    m.id === movieId ? { ...m, clips: m.clips.filter((c) => c.id !== clipId) } : m
  );
}

// ── DOWNLOAD ────────────────────────────────────────────────────────────────

/** Downloads ONLY the given clip. */
export async function downloadClip(movie: Movie, clip: Clip): Promise<void> {
  // PLUG IN (R2): GET `${API_URL}/clips/${clip.id}/download-url` → short-lived
  // pre-signed R2 URL with `Content-Disposition: attachment`, then navigate to it.
  const filename = `${movie.title.replace(/[^\w]+/g, "_")}_Part_${clip.part}.mp4`;
  try {
    const res = await fetch(clip.videoUrl);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    triggerDownload(URL.createObjectURL(blob), filename);
  } catch {
    // Cross-origin / offline fallback: open the clip URL directly.
    triggerDownload(clip.videoUrl, filename, true);
  }
}

function triggerDownload(url: string, filename: string, newTab = false) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  if (newTab) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ── CONTACT ─────────────────────────────────────────────────────────────────

export async function sendContactMessage(msg: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await wait(700);
  // PLUG IN (Supabase): await supabase.from("messages").insert(msg);
  // or FastAPI: POST `${API_URL}/contact`
  void msg;
}

// ── Helpers shared by the UI ────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
