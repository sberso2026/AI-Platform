"use client";

import Link from "next/link";
import { WorkWorkspace } from "@/components/engineering/work-workspace";

/**
 * Legacy Unified Engineering Workbench — Advanced/legacy only.
 * Normal pilot flow uses Home → Projects → project workspace.
 */
export default function WorkPage() {
  return (
    <div data-testid="legacy-engineering-workbench">
      <div className="border-b border-amber-300/40 bg-amber-50 px-4 py-2 text-sm text-amber-950 sm:px-6">
        Legacy Workbench (Advanced) — day-to-day engineering uses{" "}
        <Link href="/engineering" className="font-medium underline-offset-2 hover:underline">
          Home
        </Link>{" "}
        and{" "}
        <Link href="/engineering/projects" className="font-medium underline-offset-2 hover:underline">
          Projects
        </Link>
        .
      </div>
      <WorkWorkspace />
    </div>
  );
}
