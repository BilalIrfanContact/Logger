import { AuthForm } from "@/app/auth/auth-form";
import { AuthPage } from "@/app/auth/auth-page";

export default function RegisterPage() {
  return <AuthPage><AuthForm mode="register" /></AuthPage>;
}
