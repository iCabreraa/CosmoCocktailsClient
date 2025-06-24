"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { User } from "./types";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="py-20 px-6 flex justify-center">
        <p className="text-cosmic-fog">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="py-20 px-6 max-w-md mx-auto space-y-6">
        <h1 className="text-center text-3xl font-[--font-unica] text-cosmic-gold">
          {isLogin ? "Log In" : "Create Account"}
        </h1>
        {isLogin ? <LoginForm /> : <SignupForm />}
        <p className="text-center text-sm text-cosmic-fog">
          {isLogin ? "No account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-cosmic-gold underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </main>
    );
  }

  return <AccountDetails user={user} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      setError(null);
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-block px-8 py-3 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Log In"}
      </button>
    </form>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
    } else {
      setError(null);
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="text"
        placeholder="Full Name"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Avatar URL"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-block px-8 py-3 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Sign Up"}
      </button>
    </form>
  );
}

function AccountDetails({ user }: { user: User }) {
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.cosmococktails.com";
  const isAdmin = user.role === "admin" || (user as any).is_admin;

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="py-20 px-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-center text-3xl font-[--font-unica] text-cosmic-gold">
        My Account
      </h1>
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Personal Information
        </h2>
        <p>Email: {user.email}</p>
        {/* Otros datos personales podrían ir aquí */}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Contact & Address
        </h2>
        <p className="text-cosmic-fog">Coming soon...</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Payment Methods
        </h2>
        <p className="text-cosmic-fog">Coming soon...</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Latest Orders
        </h2>
        <p className="text-cosmic-fog">Coming soon...</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Reviews
        </h2>
        <p className="text-cosmic-fog">Coming soon...</p>
      </section>
      {isAdmin && (
        <div className="pt-4 text-center">
          <Link
            href={adminUrl}
            className="underline text-cosmic-gold hover:text-cosmic-pink"
            target="_blank"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}
      <div className="text-center pt-4">
        <button
          onClick={handleLogout}
          className="px-6 py-2 rounded-full border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black transition"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
