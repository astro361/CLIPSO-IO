import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import UploadModal from "./components/UploadModal";
import ConfirmDialog from "./components/ConfirmDialog";
import Logo from "./components/Logo";
import HomePage from "./pages/HomePage";
import MovieClipsPage from "./pages/MovieClipsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import * as api from "./services/api";
import type { Clip, Movie, StorageInfo } from "./types";

type Pending =
  | { kind: "movie"; movie: Movie }
  | { kind: "clip"; movie: Movie; clip: Clip }
  | null;

export default function App() {
  const route = useHashRoute();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [storage, setStorage] = useState<StorageInfo>({ usedBytes: 0, totalBytes: api.STORAGE_LIMIT_BYTES });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [toast, setToast] = useState("");

  const refresh = useCallback(async () => {
    const [m, s] = await Promise.all([api.listMovies(), api.getStorageInfo()]);
    setMovies(m);
    setStorage(s);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreated = async (movie: Movie) => {
    await refresh();
    setUploadOpen(false);
    setSearch("");
    navigate(`/movie/${movie.id}`);
    setToast(`“${movie.title}” split into ${movie.clips.length} parts`);
  };

  const confirmDelete = async () => {
    if (!pending) return;
    if (pending.kind === "movie") {
      await api.deleteMovie(pending.movie.id);
      if (route.name === "movie") navigate("/");
      setToast(`Deleted “${pending.movie.title}”`);
    } else {
      await api.deleteClip(pending.movie.id, pending.clip.id);
      setToast(`Deleted Part ${pending.clip.part}`);
    }
    await refresh();
    setPending(null);
  };

  const currentMovie = route.name === "movie" ? movies.find((m) => m.id === route.id) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-800 antialiased">
      <Navbar route={route} search={search} onSearch={setSearch} onUpload={() => setUploadOpen(true)} />

      <main className="flex-1">
        {route.name === "home" && (
          <HomePage
            movies={movies}
            loading={loading}
            search={search}
            storage={storage}
            onUpload={() => setUploadOpen(true)}
            onDeleteMovie={(m) => setPending({ kind: "movie", movie: m })}
            onClearSearch={() => setSearch("")}
          />
        )}
        {route.name === "movie" && (
          <MovieClipsPage
            key={route.id}
            movie={currentMovie}
            loading={loading}
            onDeleteMovie={(m) => setPending({ kind: "movie", movie: m })}
            onDeleteClip={(m, c) => setPending({ kind: "clip", movie: m, clip: c })}
          />
        )}
        {route.name === "about" && <AboutPage />}
        {route.name === "contact" && <ContactPage />}
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} Clipso · Movies, made bite-sized.</p>
        </div>
      </footer>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onCreated={handleCreated} />}

      {pending && (
        <ConfirmDialog
          title={pending.kind === "movie" ? "Delete this movie?" : `Delete Part ${pending.clip.part}?`}
          message={
            pending.kind === "movie"
              ? `“${pending.movie.title}” and all ${pending.movie.clips.length} of its parts will be permanently removed, freeing up storage.`
              : `Part ${pending.clip.part} of “${pending.movie.title}” will be permanently removed to save space.`
          }
          confirmLabel={pending.kind === "movie" ? "Delete Movie" : "Delete Part"}
          onConfirm={confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
