import Link from "next/link";

export default function Signup() {
  return (
    <div className="custom-auth-card">
      <div className="custom-auth-header">
        <img src="/assets/img/logo5.png" alt="logo" />
        <h2>Dreams POS System</h2>
      </div>
      <div className="custom-auth-body">
        <div className="custom-auth-title">Accounts are created and approved by an administrator.</div>
        <div className="custom-auth-footer" style={{ justifyContent: 'center' }}>
          <Link href="/login" className="link-primary">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
