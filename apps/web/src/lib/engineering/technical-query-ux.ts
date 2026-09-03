import type { TechnicalQueryPerson, TechnicalQueryPresentation } from "@rtb/engineering-os/browser";
import { personDisplayLine } from "@rtb/engineering-os/browser";

export function formatTqDate(value: unknown): string {
  if (value == null || value === "") return "—";
  const text = String(value);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) return text;
  const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
  if (!Number.isFinite(date.getTime())) return text;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTqDateTime(value: unknown): string {
  if (value == null || value === "") return "—";
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function personLabel(person: TechnicalQueryPerson | null | undefined, unassigned = "Unassigned"): string {
  return personDisplayLine(person, unassigned);
}

export type TqDetailPayload = {
  query: Record<string, unknown>;
  comments: Array<Record<string, unknown>>;
  links: Array<Record<string, unknown>>;
  references: Array<{
    objectType: string;
    objectId: string;
    relationship: string;
    number?: string | null;
    title?: string | null;
    revision?: string | null;
    status?: string | null;
    source?: string | null;
  }>;
  history: Array<{
    eventType?: string;
    title?: string;
    occurredAt?: string;
    actorName?: string | null;
  }>;
  presentation: TechnicalQueryPresentation;
  capabilities?: {
    canRespond?: boolean;
    canReview?: boolean;
    canEditDraft?: boolean;
    canAssign?: boolean;
    isInitiator?: boolean;
    isActionBy?: boolean;
  };
};

export const TQ_REGISTER_VIEWS = [
  { id: "all", label: "All" },
  { id: "mine", label: "My Actions" },
  { id: "awaiting", label: "Awaiting Response" },
  { id: "overdue", label: "Overdue" },
  { id: "closed", label: "Closed" },
] as const;
