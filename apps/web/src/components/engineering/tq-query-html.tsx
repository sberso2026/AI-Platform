"use client";

import { sanitizeTqQueryHtml, tqQueryLooksLikeHtml, tqQueryPlainText } from "@rtb/engineering-os/browser";
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
        <p className="text-[0.9375rem] leading-relaxed text-[color:var(--eos-text-secondary)]">—</p>
      </div>
    );
  }
  if (!tqQueryLooksLikeHtml(value)) {
    return (
      <div className={className} data-testid={testId}>
        <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-[color:var(--eos-text-primary)]">
          {value}
        </p>
      </div>
    );
  }
  const sanitized = sanitizeTqQueryHtml(value, tqId);
  if (!sanitized) {
    const recoverable = tqQueryPlainText(value);
    return (
      <div className={className} data-testid={testId}>
        {recoverable ? (
          <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{recoverable}</p>
        ) : (
          <p className="text-[0.8125rem] text-[color:var(--eos-warning)]">Query markup could not be rendered safely.</p>
        )}
      </div>
    );
  }
  return (
    <div
      className={`tq-query-content ${className ?? ""}`}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
