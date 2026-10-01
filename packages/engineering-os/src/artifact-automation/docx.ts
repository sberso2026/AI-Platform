import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { ArtifactProvenanceManifest, EngineeringArtifactTemplate, WorkPlanLike } from "./types";

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level });
}

function para(text: string, opts?: { bold?: boolean }) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold })],
    spacing: { after: 160 },
  });
}

function bullets(items: string[], empty: string) {
  if (items.length === 0) return [para(empty)];
  return items.map((item) => new Paragraph({ text: item, bullet: { level: 0 } }));
}

export async function buildDocx(input: {
  template: EngineeringArtifactTemplate;
  plan: WorkPlanLike;
  provenance: ArtifactProvenanceManifest;
  projectCode: string;
}): Promise<{ buffer: Buffer; sectionCount: number }> {
  const draftBanner = [
    para("DRAFT FOR ENGINEER REVIEW", { bold: true }),
    para("ENGINEER REVIEW REQUIRED. Not issued. Not engineering approval. Not IFC. Not Deliverable complete."),
  ];
  const type = input.template.artifactType;
  const query = input.plan.relatedObjectId ?? input.plan.relatedObjectType ?? "Query not supplied — placeholder remains unresolved.";
  const children: Paragraph[] = [
    heading(input.template.name),
    ...draftBanner,
    heading("Document Control"),
    para(`Project: ${input.projectCode}`),
    para(`Work plan: ${input.plan.templateCode}@${input.plan.templateVersion}`),
    para(`Artifact template: ${input.template.code}@${input.template.version}`),
    para(`Lifecycle: ${input.provenance.lifecycleStage}`),
    para(`Discipline: ${input.provenance.discipline ?? "unspecified"}`),
    para(`Fingerprint: ${input.provenance.inputFingerprint}`),
    para(`Generated: ${input.provenance.generatedAt}`),
    heading("Purpose / Scope"),
    para(
      type === "SPECIFICATION"
        ? "This specification draft populates only supported project-specific information from the Engineering Work Plan. Unsupported technical clauses remain placeholders."
        : type === "RFI_RESPONSE" || type === "TQ_RESPONSE"
          ? "This correspondence draft assembles query context for engineer-authored response. It is not issued."
          : "This document assembles governed Work Plan context. It does not invent technical conclusions.",
    ),
    heading("Project Context"),
    para(`System: ${input.provenance.systemId ?? "not specified"}`),
    para(`Asset: ${input.provenance.assetId ?? "not specified"}`),
    heading("Design Basis / Governing Information"),
    ...bullets(
      input.provenance.information.map((row) => `${row.title}${row.revision ? ` (Rev ${row.revision})` : ""}${row.purpose ? ` — ${row.purpose}` : ""}`),
      "No governing information referenced.",
    ),
    heading("Requirements"),
    ...bullets(input.provenance.requirements, "No requirements referenced."),
    heading("Inputs"),
    ...bullets(
      input.plan.context.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`),
      "No inputs referenced.",
    ),
    heading("Assumptions"),
    ...bullets(input.provenance.assumptions, "No assumptions referenced."),
    heading("Interfaces"),
    ...bullets(input.provenance.interfaces, "No interfaces referenced."),
    heading("Analysis / Engineering Work summary"),
    ...bullets(input.provenance.analyses, "No analysis references. Solver not executed."),
    heading("Decisions"),
    ...bullets(input.provenance.decisions, "No decisions referenced."),
  ];

  if (type === "SPECIFICATION") {
    children.push(
      heading("Materials / technical clauses"),
      para("PLACEHOLDER / UNRESOLVED: material grades, inspection frequencies, code editions, and acceptance criteria are not invented. Engineer to author from governed sources."),
      heading("Project-specific decisions / deviations"),
      ...bullets(input.provenance.decisions, "No recorded deviations."),
    );
  }

  if (type === "RFI_RESPONSE" || type === "TQ_RESPONSE" || type === "TECHNICAL_MEMORANDUM") {
    children.push(
      heading(type === "TECHNICAL_MEMORANDUM" ? "Concept / query context" : "Query / question"),
      para(String(query)),
      heading("Affected engineering objects"),
      para(`Related object: ${input.plan.relatedObjectType ?? "unspecified"} ${input.plan.relatedObjectId ?? ""}`.trim()),
      heading("Current drawing / document"),
      ...bullets(
        input.plan.context.information.filter((row) => /DRAWING|DOCUMENT|CALCULATION/i.test(row.informationType)).map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`),
        "No current drawing/document referenced.",
      ),
      heading("Potential impacts"),
      para("PLACEHOLDER: potential impacts remain for engineer assessment. EOS does not mark correspondence issued."),
      heading("Draft response"),
      para("DRAFT FOR ENGINEER REVIEW. Response narrative is not issued."),
    );
  }

  if (type === "TECHNICAL_MEMORANDUM" || input.template.readinessPolicy === "ALLOW_INCOMPLETE_DRAFT") {
    children.push(
      heading("Missing information / conditions"),
      ...bullets(
        input.plan.context.gaps.map((row) => `${row.kind}: ${row.title} — ${row.explanation}`),
        "No recorded gaps.",
      ),
      para("CONDITIONAL INPUTS PRESENT where gaps exist. Missing/unaccepted values remain explicit. No silent defaults."),
    );
  }

  children.push(
    heading("Limitations"),
    para("Findings and conclusions are not fabricated. Human engineering review is required before use."),
    heading("References / Source Register"),
    ...bullets(
      input.provenance.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`),
      "No sources referenced.",
    ),
    heading("Revision History"),
    para(`Generation run ${input.provenance.generationRunId} — GENERATED_DRAFT. No issued revision.`),
  );

  const doc = new Document({
    creator: "RTB Engineering OS",
    title: input.template.name,
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: "RTB Engineering OS generated draft", italics: true })],
          }),
          ...children,
        ],
      },
    ],
  });
  const buffer = Buffer.from(await Packer.toBuffer(doc));
  return { buffer, sectionCount: input.template.sheetsOrSections.length };
}
