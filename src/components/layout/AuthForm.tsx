"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { getSupabaseClient } from "@/lib/auth/supabase-client";

type Mode = "login" | "register";

const L = {
  fr: {
    login: "Connexion", register: "Créer un compte",
    email: "Adresse e-mail", password: "Mot de passe",
    name: "Nom complet", phone: "Téléphone (optionnel)",
    submit_login: "Se connecter", submit_register: "Créer mon compte",
    no_account: "Pas encore de compte ?", already: "Déjà un compte ?",
    signup_here: "Créer un compte", login_here: "Se connecter",
    success_login: "Connecté avec succès !",
    success_register: "Compte créé ! Vérifiez votre e-mail.",
    error_generic: "Une erreur est survenue.",
  },
  en: {
    login: "Login", register: "Create Account",
    email: "Email address", password: "Password",
    name: "Full name", phone: "Phone (optional)",
    submit_login: "Log in", submit_register: "Create account",
    no_account: "Don't have an account?", already: "Already have an account?",
    signup_here: "Sign up", login_here: "Log in",
    success_login: "Logged in successfully!",
    success_register: "Account created! Check your email.",
    error_generic: "An error occurred.",
  },
  zh: {
    login: "登录", register: "注册账号",
    email: "邮箱地址", password: "密码",
    name: "姓名", phone: "手机号（选填）",
    submit_login: "登录", submit_register: "注册",
    no_account: "还没有账号？", already: "已有账号？",
    signup_here: "注册", login_here: "登录",
    success_login: "登录成功！",
    success_register: "账号已创建！请查收邮件。",
    error_generic: "出现错误，请重试。",
  },
} as const;

type Locale = keyof typeof L;

interface Props {
  mode: Mode;
  locale: Locale;
}

export function AuthForm({ mode, locale }: Props) {
  const t = L[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success(t.success_login);
        router.push(`/${locale}/account`);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name, phone: form.phone },
          },
        });
        if (error) throw error;
        toast.success(t.success_register);
        router.push(`/${locale}/account/login`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.error_generic;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "register" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.name}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe" className={inp + " pl-10"} />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.email} <span className="text-red-500">*</span></label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="vous@exemple.com" className={inp + " pl-10"} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.password} <span className="text-red-500">*</span></label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••" className={inp + " pl-10"} />
        </div>
      </div>

      {mode === "register" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.phone}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="+261 XX XXX XXXX" className={inp + " pl-10"} />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="mt-1 h-12 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? t.submit_login : t.submit_register}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? t.no_account : t.already}{" "}
        <Link href={`/${locale}/account/${mode === "login" ? "register" : "login"}`}
          className="text-amber-600 font-medium hover:text-amber-700">
          {mode === "login" ? t.signup_here : t.login_here}
        </Link>
      </p>
    </form>
  );
}
