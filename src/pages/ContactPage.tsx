import { useState } from "react";
import { sendContactMessage } from "../services/api";
import { CheckIcon, MailIcon } from "../components/Icons";

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await sendContactMessage(form);
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
          <MailIcon width={26} height={26} />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-base text-slate-500">Questions, ideas or feedback? We'd love to hear from you.</p>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_-16px_rgba(15,23,42,0.1)] sm:p-8">
        {sent ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckIcon width={26} height={26} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Message sent!</h3>
            <p className="mt-1 text-sm text-slate-500">Thanks for reaching out — we'll reply soon.</p>
            <button onClick={() => setSent(false)} className="mt-5 h-10 rounded-full bg-indigo-50 px-5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Name</span>
              <input required className={`${field} h-11`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
              <input required type="email" className={`${field} h-11`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Message</span>
              <textarea required rows={5} className={`${field} py-3`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(99,102,241,0.65)] transition hover:brightness-105 disabled:opacity-70"
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
