import { redirect } from "next/navigation";

/**
 * Legacy Command Centre is no longer the primary EOS experience.
 * Keep route for backward compatibility by redirecting to approved Home.
 */
export default function CommandCentrePage() {
  redirect("/engineering");
}
