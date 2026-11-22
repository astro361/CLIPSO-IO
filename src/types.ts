export interface Clip {
  id: string;
  movieId: string;
  /** 1-based part number – never renumbered after a delete, so "Part 3" stays "Part 3". */
  part: number;
  /** Seconds */
  duration: number;
  /** Start offset inside the source movie (seconds) */
  startSec: number;
  /** Bytes */
  sizeBytes: number;
  /** Playable / downloadable URL (Cloudflare R2 signed URL in production) */
  videoUrl: string;
  /** Tailwind-free gradient used as thumbnail backdrop */
  gradient: [string, string];
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  clipDuration: 60 | 90;
  createdAt: string;
  clips: Clip[];
}

export interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
}

export interface UploadInput {
  title: string;
  posterFile: File | null;
  clipDuration: 60 | 90;
  videoFile: File;
}

export type UploadStage = "uploading" | "splitting" | "done";
export interface UploadProgress {
  stage: UploadStage;
  /** 0 – 100 overall */
  percent: number;
}
