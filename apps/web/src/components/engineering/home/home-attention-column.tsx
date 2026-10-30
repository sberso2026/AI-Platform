"use client";

import Link from "next/link";

export type AttentionCard = {
  id: string;
  label: string;
  count: number;
  href: string;
  tone?: "urgent" | "warning" | "neutral" | "complete";
};

const toneClass: Record<NonNullable<AttentionCard["tone"]>, string> = {
  urgent: "border-red-300 bg-red-50 text-red-900",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  neutral: "border-slate-200 bg-white text-slate-900",
  complete: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

type Props = {
  cards: AttentionCard[];
};

/**
 * Left Home attention column — compact clickable status cards with real routes.
 */
export function HomeAttentionColumn({ cards }: Props) {
  return (
    <aside
      className="space-y-2"
      data-testid="home-left-attention-column"
      aria-label="Attention"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Attention
      </h2>
      <ul className="space-y-2" role="list">
        {cards.map((card) => (
          <li key={card.id}>
            <Link
              href={card.href}
              className={`flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 shadow-sm transition hover:border-[color:var(--eos-gold,#c4a35a)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--eos-navy,#0b1f3a)] ${toneClass[card.tone ?? "neutral"]}`}
              data-testid={`home-attention-${card.id}`}
              aria-label={`${card.label}: ${card.count}`}
            >
              <span className="text-xs font-semibold leading-snug">{card.label}</span>
              <span className="tabular-nums text-lg font-semibold" data-testid={`home-attention-count-${card.id}`}>
                {card.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
