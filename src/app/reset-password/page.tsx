import { AuthForm } from "@/app/auth/auth-form";
import { AuthPage } from "@/app/auth/auth-page";

export default function ResetPasswordPage() {
  return <AuthPage><AuthForm mode="reset-password" /></AuthPage>;
}
