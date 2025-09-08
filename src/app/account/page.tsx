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
      .then(res => res.json())
      .then(data => {
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

  return <AccountDetails user={user} onUserUpdate={setUser} />;
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
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={password}
        onChange={e => setPassword(e.target.value)}
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
        onChange={e => setFullName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Avatar URL"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={avatarUrl}
        onChange={e => setAvatarUrl(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="bg-transparent border border-cosmic-fog rounded-md p-3 text-cosmic-text placeholder-cosmic-fog focus:outline-none"
        value={password}
        onChange={e => setPassword(e.target.value)}
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

function AccountDetails({
  user,
  onUserUpdate,
}: {
  user: User;
  onUserUpdate: (u: User) => void;
}) {
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.cosmococktails.com";
  const isAdmin = user.role === "admin" || (user as any).is_admin;

  const [editing, setEditing] = useState<
    null | "personal" | "contact" | "payment"
  >(null);
  const [form, setForm] = useState<Partial<User>>({});

  useEffect(() => {
    setForm(user);
  }, [user]);

  function handleChange(field: keyof User, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function save(section: "personal" | "contact" | "payment") {
    const payload: Partial<User> = {};
    if (section === "personal") {
      payload.full_name = form.full_name;
      payload.avatar_url = form.avatar_url;
      payload.email = form.email;
      payload.phone = form.phone;
    } else if (section === "contact") {
      payload.address_line1 = form.address_line1;
      payload.address_line2 = form.address_line2;
      payload.city = form.city;
      payload.state = form.state;
      payload.zip = form.zip;
      payload.country = form.country;
      payload.phone = form.phone;
    } else if (section === "payment") {
      payload.payment_method = form.payment_method;
    }
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      onUserUpdate(data.user);
    }
    setEditing(null);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="py-20 px-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-center text-3xl font-[--font-unica] text-cosmic-gold">
        My Account
      </h1>
      {/* Personal Info */}

      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Personal Information
        </h2>
        {editing === "personal" ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              save("personal");
            }}
            className="space-y-3"
          >
            <input
              type="text"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.full_name || ""}
              onChange={e => handleChange("full_name", e.target.value)}
              placeholder="Full name"
              required
            />
            <input
              type="email"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.email || ""}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="tel"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.phone || ""}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="Phone"
            />
            <input
              type="text"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.avatar_url || ""}
              onChange={e => handleChange("avatar_url", e.target.value)}
              placeholder="Avatar URL"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(user);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-md border border-cosmic-fog text-cosmic-fog hover:bg-cosmic-fog hover:text-black"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <p>Name: {user.full_name}</p>
            <p>Email: {user.email}</p>
            {user.phone && <p>Phone: {user.phone}</p>}
            <button
              onClick={() => setEditing("personal")}
              className="underline text-cosmic-gold"
            >
              Edit
            </button>
          </div>
        )}
      </section>
      {/* Contact & Address */}
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Contact & Address
        </h2>
        {editing === "contact" ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              save("contact");
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Address line 1"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.address_line1 || ""}
              onChange={e => handleChange("address_line1", e.target.value)}
            />
            <input
              type="text"
              placeholder="Address line 2"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.address_line2 || ""}
              onChange={e => handleChange("address_line2", e.target.value)}
            />
            <input
              type="text"
              placeholder="City"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.city || ""}
              onChange={e => handleChange("city", e.target.value)}
            />
            <input
              type="text"
              placeholder="State"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.state || ""}
              onChange={e => handleChange("state", e.target.value)}
            />
            <input
              type="text"
              placeholder="ZIP"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.zip || ""}
              onChange={e => handleChange("zip", e.target.value)}
            />
            <input
              type="text"
              placeholder="Country"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.country || ""}
              onChange={e => handleChange("country", e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.phone || ""}
              onChange={e => handleChange("phone", e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(user);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-md border border-cosmic-fog text-cosmic-fog hover:bg-cosmic-fog hover:text-black"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            {user.address_line1 && <p>{user.address_line1}</p>}
            {user.address_line2 && <p>{user.address_line2}</p>}
            {user.city && (
              <p>
                {user.city}
                {user.state ? `, ${user.state}` : ""}
              </p>
            )}
            {user.zip && <p>{user.zip}</p>}
            {user.country && <p>{user.country}</p>}
            {user.phone && <p>Phone: {user.phone}</p>}
            <button
              onClick={() => setEditing("contact")}
              className="underline text-cosmic-gold"
            >
              Edit
            </button>
          </div>
        )}
      </section>

      {/* Payment Methods */}
      <section className="space-y-2">
        <h2 className="text-xl font-[--font-josefin] text-cosmic-text">
          Payment Methods
        </h2>
        {editing === "payment" ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              save("payment");
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Payment method"
              className="w-full bg-transparent border border-cosmic-fog rounded-md p-2"
              value={form.payment_method || ""}
              onChange={e => handleChange("payment_method", e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-black"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(user);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-md border border-cosmic-fog text-cosmic-fog hover:bg-cosmic-fog hover:text-black"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            {user.payment_method ? (
              <p>{user.payment_method}</p>
            ) : (
              <p className="text-cosmic-fog">No payment method</p>
            )}
            <button
              onClick={() => setEditing("payment")}
              className="underline text-cosmic-gold"
            >
              Edit
            </button>
          </div>
        )}{" "}
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
