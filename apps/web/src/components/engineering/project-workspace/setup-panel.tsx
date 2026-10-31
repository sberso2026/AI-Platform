"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Input } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type { WorkspaceSnapshot } from "@/lib/engineering/eos3-project-workspace-service";
import {
  isEditableFormDirty,
  useUnsavedChangesGuard,
} from "./unsaved-changes-guard";

type SetupFormState = {
  projectCode: string;
  projectName: string;
  client: string;
  site: string;
  location: string;
  industry: string;
  projectType: string;
  description: string;
  country: string;
  stateRegion: string;
  profileName: string;
  engineeringStandards: string;
  companyStandards: string;
  codeProfiles: string;
  confidentiality: string;
  roles: string;
  disciplines: string;
  lifecycleTemplate: string;
  governanceProfile: string;
  qualificationContext: string;
  assetRelationship: string;
};

function formFromSnapshot(s: WorkspaceSnapshot["setup"]): SetupFormState {
  return {
    projectCode: s.projectCode,
    projectName: s.projectName,
    client: s.client,
    site: s.site,
    location: s.location,
    industry: s.industry,
    projectType: s.projectType,
    description: s.description,
    country: s.jurisdiction.country,
    stateRegion: s.jurisdiction.stateRegion,
    profileName: s.jurisdiction.profileName,
    engineeringStandards: s.standards.engineeringStandards.join(", "),
    companyStandards: s.standards.companyStandards.join(", "),
    codeProfiles: s.standards.codeProfiles.join(", "),
    confidentiality: s.confidentiality,
    roles: s.roles.join(", "),
    disciplines: s.disciplines.join(", "),
    lifecycleTemplate: s.lifecycleTemplate,
    governanceProfile: s.governanceProfile,
    qualificationContext: s.qualificationContext,
    assetRelationship: s.assetRelationship,
  };
}

function setupPayloadFromForm(form: SetupFormState) {
  return {
    projectCode: form.projectCode,
    projectName: form.projectName,
    client: form.client,
    site: form.site,
    location: form.location,
    industry: form.industry,
    projectType: form.projectType,
    description: form.description,
    confidentiality: form.confidentiality,
    lifecycleTemplate: form.lifecycleTemplate,
    governanceProfile: form.governanceProfile,
    qualificationContext: form.qualificationContext,
    assetRelationship: form.assetRelationship,
    roles: form.roles.split(",").map((x) => x.trim()).filter(Boolean),
    disciplines: form.disciplines.split(",").map((x) => x.trim()).filter(Boolean),
    jurisdiction: {
      country: form.country,
      stateRegion: form.stateRegion,
      profileName: form.profileName,
    },
    standards: {
      engineeringStandards: form.engineeringStandards
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      companyStandards: form.companyStandards
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      codeProfiles: form.codeProfiles
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    },
  };
}

const FIELD_LABELS = [
  ["projectCode", "Project Code"],
  ["projectName", "Project Name"],
  ["client", "Client"],
  ["site", "Site"],
  ["location", "Location (free-text)"],
  ["industry", "Industry"],
  ["projectType", "Project Type"],
  ["confidentiality", "Confidentiality / Data Classification"],
  ["country", "Jurisdiction — Country"],
  ["stateRegion", "Jurisdiction — State / region"],
  ["profileName", "Jurisdiction profile"],
  ["engineeringStandards", "Engineering standards (comma-separated)"],
  ["companyStandards", "Company standards"],
  ["codeProfiles", "Applicable code profiles"],
  ["roles", "Project roles"],
  ["disciplines", "Engineering disciplines"],
  ["lifecycleTemplate", "Lifecycle template"],
  ["governanceProfile", "Project governance profile"],
  ["qualificationContext", "Qualification context"],
  ["assetRelationship", "Asset / project relationship"],
] as const;

export function ProjectSetupPanel({
  projectId,
  snapshot,
  onSaved,
}: {
  projectId: string;
  snapshot: WorkspaceSnapshot;
  onSaved: () => void;
}) {
  const baseline = useMemo(() => formFromSnapshot(snapshot.setup), [snapshot.setup]);
  const [form, setForm] = useState<SetupFormState>(baseline);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(form);
  formRef.current = form;

  const { setDirty, registerSaveHandler } = useUnsavedChangesGuard();
  const dirty = isEditableFormDirty(baseline as Record<string, unknown>, form as Record<string, unknown>);

  useEffect(() => {
    setForm(baseline);
    setDirty(false);
  }, [baseline, setDirty]);

  useEffect(() => {
    setDirty(dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => {
      // Prevent orphan dirty locks from freezing Guided Engineering / other routes.
      setDirty(false);
    };
  }, [setDirty]);

  const save = useCallback(async (): Promise<boolean> => {
    if (saving) return false;
    setSaving(true);
    setErr(null);
    setDiagnostic(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_setup",
          setup: setupPayloadFromForm(formRef.current),
        }),
      });
      const parsed = await parseApiJsonResponse(res);
      if (!parsed.ok) {
        const technical =
          parsed.errorMessage ??
          (typeof (parsed.raw as { diagnostic?: string } | null)?.diagnostic === "string"
            ? (parsed.raw as { diagnostic: string }).diagnostic
            : `Request failed (${parsed.status})`);
        console.error("[eos-project-setup] save failed", technical);
        setDiagnostic(technical);
        setErr("Project setup could not be saved. Your changes have been preserved.");
        setSaving(false);
        return false;
      }
      setMsg("Project setup saved");
      setDirty(false);
      setSaving(false);
      onSaved();
      return true;
    } catch (ex: unknown) {
      const technical = ex instanceof Error ? ex.message : "save_failed";
      console.error("[eos-project-setup] save exception", technical);
      setDiagnostic(technical);
      setErr("Project setup could not be saved. Your changes have been preserved.");
      setSaving(false);
      return false;
    }
  }, [onSaved, projectId, saving, setDirty]);

  useEffect(() => {
    registerSaveHandler(save);
    return () => registerSaveHandler(null);
  }, [registerSaveHandler, save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== "s") return;
      e.preventDefault();
      void save();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const steps = [
    { key: "projectProfile", label: "Project Profile" },
    { key: "jurisdiction", label: "Jurisdiction" },
    { key: "standards", label: "Standards" },
    { key: "lifecycle", label: "Lifecycle" },
    { key: "roles", label: "Roles" },
    { key: "engineeringBasis", label: "Engineering Basis" },
    { key: "requirements", label: "Requirements" },
    { key: "systemsInterfaces", label: "Systems / Interfaces" },
    { key: "deliverablePlan", label: "Deliverable Plan" },
  ] as const;

  return (
    <section data-testid="project-setup-panel" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Project Setup</h2>
        <p className="text-sm text-slate-400">
          Configure governance fields after concise project creation. System generation is metadata — not an
          engineering field.
        </p>
        <p className="mt-2 text-xs font-medium text-amber-200" data-testid="setup-status">
          {snapshot.setupStatus}
          {dirty ? " · unsaved changes" : ""}
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Project setup checklist">
        {steps.map((step, idx) => (
          <li
            key={step.key}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
          >
            <span className="text-xs text-slate-500">{idx + 1}.</span> {step.label}{" "}
            <span className="text-xs text-slate-400">
              {snapshot.setup.checklist[step.key] ? "✓" : "○"}
            </span>
          </li>
        ))}
      </ol>

      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {FIELD_LABELS.map(([key, label]) => (
          <label key={key} className="text-xs text-slate-400">
            {label}
            <Input
              className="mt-1"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              disabled={saving}
            />
          </label>
        ))}
        <label className="text-xs text-slate-400 md:col-span-2">
          Project Description / Purpose
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={saving}
          />
        </label>
        <p className="text-xs text-slate-500 md:col-span-2">
          System metadata (read-only): EOS generation {snapshot.trust.generation} · {snapshot.trust.activation}
        </p>
        {err ? (
          <div className="md:col-span-2 rounded border border-rose-500/40 bg-rose-500/10 p-3" role="alert">
            <p className="text-sm text-rose-100">{err}</p>
            {diagnostic ? (
              <p className="mt-1 text-[11px] text-rose-200/80" data-testid="setup-save-diagnostic">
                Diagnostic: {diagnostic}
              </p>
            ) : null}
          </div>
        ) : null}
        {msg ? (
          <p className="text-sm text-emerald-300 md:col-span-2" data-testid="setup-save-success">
            {msg}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving || !dirty} data-testid="project-setup-save">
            {saving ? "Saving…" : "Save project setup"}
          </Button>
        </div>
      </form>
    </section>
  );
}
