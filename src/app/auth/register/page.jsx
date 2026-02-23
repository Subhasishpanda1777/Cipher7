"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/authClient";

const roles = [
  { value: "parent", label: "Parent / Guardian" },
  { value: "doctor", label: "Doctor" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "parent",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Creating your account…" });
    try {
      await registerUser(form);
      setStatus({ state: "success", message: "Account created! Redirecting…" });
      window.location.href = "/dashboard";
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="w-full rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-8 shadow-xl backdrop-blur">
        <h1 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
          Create your VisionAI account
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Join VisionAI to run AI-powered screenings, track therapy exercises, and share insights with your care team.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
              First name
              <input
                required
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="rounded-xl border border-[color:var(--color-primary)]/30 bg-white px-4 py-3 text-[color:var(--color-emphasis)] focus:border-[color:var(--color-primary)] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
              Last name
              <input
                required
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="rounded-xl border border-[color:var(--color-primary)]/30 bg-white px-4 py-3 text-[color:var(--color-emphasis)] focus:border-[color:var(--color-primary)] focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
            Email address
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="rounded-xl border border-[color:var(--color-primary)]/30 bg-white px-4 py-3 text-[color:var(--color-emphasis)] focus:border-[color:var(--color-primary)] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
            Password
            <input
              required
              minLength={8}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="rounded-xl border border-[color:var(--color-primary)]/30 bg-white px-4 py-3 text-[color:var(--color-emphasis)] focus:border-[color:var(--color-primary)] focus:outline-none"
            />
            <span className="text-xs text-[color:var(--color-muted)]">
              Use 8+ characters with at least one number and capital letter.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
            Account type
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-xl border border-[color:var(--color-primary)]/30 bg-white px-4 py-3 text-[color:var(--color-emphasis)] focus:border-[color:var(--color-primary)] focus:outline-none"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={status.state === "loading"}
            className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/50"
          >
            {status.state === "loading" ? "Creating account…" : "Create account"}
          </button>

          {status.state === "error" && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {status.message}
            </p>
          )}
          {status.state === "success" && (
            <p className="rounded-2xl bg-[color:var(--color-secondary)]/15 px-4 py-3 text-sm text-[color:var(--color-secondary)]">
              {status.message}
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-[color:var(--color-muted)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[color:var(--color-secondary)]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
