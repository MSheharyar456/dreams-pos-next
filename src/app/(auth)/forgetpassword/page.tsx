"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent! Please check your inbox.");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="custom-auth-card">
      <div className="custom-auth-header">
        <img src="/assets/img/logo5.png" alt="logo" />
        <h2>Dreams POS System</h2>
      </div>
      <div className="custom-auth-body">
        <div className="custom-auth-title">Forgot Password? We'll send you a link.</div>
        
        {error && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: '14px', padding: '10px' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert" style={{ fontSize: '14px', padding: '10px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="custom-auth-form-group">
            <input
              type="email"
              className="custom-auth-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="custom-auth-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="custom-auth-footer" style={{ justifyContent: 'center' }}>
            <Link href="/login" className="link-primary">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
