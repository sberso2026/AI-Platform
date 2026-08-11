"use client";

import Link from "next/link";
import { buildAskHref } from "@/hooks/use-engineering-context";

export function AskThisObjectLink(props: {
  label: string;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  q?: string | null;
  testId?: string;
}) {
  const href = buildAskHref({
    projectId: props.projectId,
    objectType: props.objectType,
    objectId: props.objectId,
    q: props.q,
  });
  const withScope = (() => {
    const url = new URL(href, "http://local.invalid");
    if (props.objectType === "document") url.searchParams.set("scope", "document");
    else if (props.objectType === "asset") url.searchParams.set("scope", "asset");
    else if (props.projectId) url.searchParams.set("scope", "project");
    if (props.objectType) url.searchParams.set("objectType", props.objectType);
    if (props.objectId) url.searchParams.set("objectId", props.objectId);
    if (props.objectType === "document" && props.objectId) {
      url.searchParams.set("documentId", props.objectId);
    }
    if (props.objectType === "asset" && props.objectId) {
      url.searchParams.set("assetId", props.objectId);
    }
    return `${url.pathname}${url.search}`;
  })();

  return (
    <Link
      href={withScope}
      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400"
      data-testid={props.testId ?? "ask-this-object"}
    >
      {props.label}
    </Link>
  );
}
