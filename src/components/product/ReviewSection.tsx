"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  body?: string | null;
  createdAt: string;
}

interface Props {
  productId: string;
  locale: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = onChange ? (hovered || value) : value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-5 w-5 transition-colors ${display >= s ? "fill-amber-400 text-amber-400" : "text-gray-300"} ${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
        />
      ))}
    </div>
  );
}

type LabelVal = string | ((n: number) => string);

const LABELS: Record<string, Record<string, LabelVal>> = {
  fr: { title: "Avis clients", count: (n: number) => `${n} avis`, write: "Laisser un avis", name: "Votre nom", comment: "Votre commentaire (facultatif)", submit: "Envoyer", success: "Avis publié !", error: "Erreur, réessayez.", empty: "Soyez le premier à laisser un avis !" },
  en: { title: "Customer reviews", count: (n: number) => `${n} review${n !== 1 ? "s" : ""}`, write: "Write a review", name: "Your name", comment: "Your comment (optional)", submit: "Submit", success: "Review posted!", error: "Error, please retry.", empty: "Be the first to leave a review!" },
  zh: { title: "客户评价", count: (n: number) => `${n} 条评价`, write: "写评价", name: "您的姓名", comment: "您的评论（可选）", submit: "提交", success: "评价已发布！", error: "出错了，请重试。", empty: "成为第一个评价的人！" },
};

function l(locale: string, key: string, n?: number): string {
  const dict = LABELS[locale] ?? LABELS.fr;
  const val = dict[key];
  if (typeof val === "function") return val(n ?? 0);
  return val ?? key;
}

export function ReviewSection({ productId, locale }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const fetchReviews = useCallback(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || rating < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, author: author.trim(), rating, body: body.trim() || undefined, locale }),
      });
      if (res.ok) {
        setFeedback("success");
        setAuthor("");
        setBody("");
        setRating(5);
        setShowForm(false);
        fetchReviews();
      } else {
        setFeedback("error");
      }
    } catch {
      setFeedback("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{l(locale, "title")}</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avg)} />
              <span className="text-sm text-gray-500">{avg.toFixed(1)} — {l(locale, "count", reviews.length)}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <Star className="h-4 w-4" />
          {l(locale, "write")}
        </button>
      </div>

      {/* Write form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{l(locale, "name")}</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              maxLength={80}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Note</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{l(locale, "comment")}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !author.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {l(locale, "submit")}
            </button>
            {feedback === "success" && <p className="text-sm text-green-600">{l(locale, "success")}</p>}
            {feedback === "error" && <p className="text-sm text-red-500">{l(locale, "error")}</p>}
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2 animate-pulse">
              <div className="flex gap-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-100" />
              </div>
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-gray-400 py-4">{l(locale, "empty")}</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{r.author}</p>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "en" ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              {r.body && <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
