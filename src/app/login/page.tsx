import { AuthForm } from "@/app/auth/auth-form";
import { AuthPage } from "@/app/auth/auth-page";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const message = params.message === "password-updated" ? "Your password was updated. Sign in with the new password." : undefined;
  const error = params.error === "verification" ? "That verification link is invalid or has expired." : undefined;

  return (
    <AuthPage>
      {message && <p className="form-message form-success auth-notice" role="status">{message}</p>}
      {error && <p className="form-message form-error auth-notice" role="alert">{error}</p>}
      <AuthForm mode="login" nextPath={params.next?.startsWith("/") ? params.next : "/app"} />
    </AuthPage>
  );
}
