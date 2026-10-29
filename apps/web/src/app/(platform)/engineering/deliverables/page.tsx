"use client";

import { DeliverableWorkspace } from "@/components/engineering/deliverable-workspace";
import { PersistedQualificationNotice } from "@/components/engineering/qualification-runtime-panel";

export default function DeliverablesPage() {
  return (
    <>
      <PersistedQualificationNotice />
      <DeliverableWorkspace />
    </>
  );
}
