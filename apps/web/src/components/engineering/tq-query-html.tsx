"use client";

import { sanitizeTqQueryHtml, tqQueryLooksLikeHtml } from "@rtb/engineering-os/browser";
import "./tq-query.css";

export function TqQueryHtml({
  html,
  tqId,
  className,
  testId,
}: {
  html: string;
  tqId?: string;
  className?: string;
  testId?: string;
}) {
  const value = html?.trim() ?? "";
  if (!value) {
    return (
      <div className={className} data-testid={testId}>
        <p className="text-sm leading-relaxed text-slate-800">—</p>
      </div>
    );
  }
  if (!tqQueryLooksLikeHtml(value)) {
    return (
      <div className={className} data-testid={testId}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{value}</p>
      </div>
    );
  }
  return (
    <div
      className={`tq-query-content ${className ?? ""}`}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: sanitizeTqQueryHtml(value, tqId) }}
    />
  );
}
