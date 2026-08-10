import { redirect } from "next/navigation";

/** Login removed — open CRM redirects straight into the app. */
export default function LoginPage() {
  redirect("/pipeline");
}
