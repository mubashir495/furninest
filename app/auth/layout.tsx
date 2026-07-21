// Auth pages render their own full-page chrome via <AuthShell />,
// so this nested layout just passes children through.
// html/body/providers live in the root app/layout.tsx.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
