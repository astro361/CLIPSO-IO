import { FilmIcon, ScissorsIcon, DownloadIcon, UploadCloudIcon } from "../components/Icons";

const steps = [
  { icon: UploadCloudIcon, color: "bg-sky-50 text-sky-500", title: "1. Upload", text: "Drop in your full-length 1080p movie and pick a clip length — 60 or 90 seconds." },
  { icon: ScissorsIcon, color: "bg-indigo-50 text-indigo-500", title: "2. We split it", text: "Our cloud pipeline cuts the film into clean, perfectly ordered parts: Part 1, Part 2, Part 3 and so on." },
  { icon: DownloadIcon, color: "bg-emerald-50 text-emerald-500", title: "3. Download", text: "Preview any part and download just the ones you need. Delete the rest to save space." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-[0_10px_24px_-8px_rgba(99,102,241,0.6)]">
          <FilmIcon width={26} height={26} />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">About Clipso</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
          Clipso turns full movies into short, bite-sized clips. Upload a film once and get an
          organized library of 60 or 90 second parts — numbered in exact order, easy to preview,
          download individually, and delete whenever you want to reclaim storage.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>
              <s.icon />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-7 text-center ring-1 ring-slate-100 sm:p-10">
        <h2 className="text-xl font-extrabold text-slate-900">Built for creators & movie lovers</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          Whether you're preparing a series of shorts or just want a handy way to share your
          favourite scenes, Clipso keeps everything tidy, fast and light.
        </p>
        <a href="#/" className="mt-5 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(99,102,241,0.65)]">
          Go to your library
        </a>
      </div>
    </div>
  );
}
