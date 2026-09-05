import { AuthForm } from "@/app/auth/auth-form";
import { AuthPage } from "@/app/auth/auth-page";

export default function ForgotPasswordPage() {
  return <AuthPage><AuthForm mode="forgot-password" /></AuthPage>;
}
