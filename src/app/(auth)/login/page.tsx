"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="custom-auth-card">
      <div className="custom-auth-header">
        <img src="/assets/img/logo5.png" alt="logo" />
        <h2>Dreams POS System</h2>
      </div>
      <div className="custom-auth-body">
        <div className="custom-auth-title">Please Sign in with your Dreams POS account.</div>
        
        {error && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: '14px', padding: '10px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="custom-auth-form-group">
            <input
              type="email"
              className="custom-auth-input"
              placeholder="mshehar5@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="custom-auth-form-group">
            <input
              type="password"
              className="custom-auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="custom-auth-password-toggle">
              <img src="/assets/img/icons/eye.svg" alt="eye" style={{ width: '16px', opacity: 0.6 }} />
            </span>
          </div>
          
          <div className="custom-auth-checkbox">
            <input type="checkbox" id="keep-logged-in" />
            <label htmlFor="keep-logged-in">keep me logged in ?</label>
          </div>

          <button
            type="submit"
            className="custom-auth-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="custom-auth-footer">
            <Link href="/forgetpassword" className="link-danger">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
