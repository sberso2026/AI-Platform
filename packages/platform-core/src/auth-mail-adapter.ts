import type { SupabaseClient } from "@rtb/database";
import { IdentityProvisioningError } from "./identity-onboarding";

export type AuthMailTemplate = "activation" | "recovery";

export type AuthMailInput = {
  email: string;
  redirectTo: string;
  template: AuthMailTemplate;
};

export type AuthMailResult = {
  delivered: boolean;
  actionLink?: string;
  error?: string;
};

/**
 * Platform Auth mail adapter. Not a second identity stack.
 * Transport is Supabase Auth (built-in mailer or operator-configured custom SMTP).
 * generateLink is the supported API that produces the activation/recovery URL.
 */
export interface AuthMailAdapter {
  send(input: AuthMailInput): Promise<AuthMailResult>;
}

export function createSupabaseAuthMailAdapter(admin: SupabaseClient): AuthMailAdapter {
  return {
    async send(input) {
      if (!input.redirectTo) {
        return { delivered: false, error: "Canonical activation redirect is required" };
      }
      const generated = await admin.auth.admin.generateLink({
        type: "recovery",
        email: input.email,
        options: { redirectTo: input.redirectTo },
      });
      if (generated.error) {
        return { delivered: false, error: generated.error.message };
      }
      const properties = generated.data && "properties" in generated.data
        ? (generated.data as { properties?: { action_link?: string } }).properties
        : undefined;
      const actionLink = properties?.action_link;
      return { delivered: Boolean(actionLink), actionLink, error: actionLink ? undefined : "Activation link missing" };
    },
  };
}

export async function deliverActivationMail(
  adapter: AuthMailAdapter,
  input: AuthMailInput,
): Promise<AuthMailResult> {
  const result = await adapter.send(input);
  if (result.delivered) return result;
  throw new IdentityProvisioningError(
    "activation_delivery_failed",
    result.error ||
      "Pending Auth identity was kept, but the activation email could not be delivered. Use Resend activation after SMTP is ready.",
    502,
    { actionLinkPresent: Boolean(result.actionLink) },
  );
}
