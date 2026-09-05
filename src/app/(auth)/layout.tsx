import '../../../public/assets/css/custom-auth.css';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="custom-auth-page">
      {children}
    </div>
  );
}
