import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ArtifactProvenanceManifest, EngineeringArtifactTemplate, WorkPlanLike } from "./types";
import { documentCreator, type ArtifactBranding } from "./template-policy";
import type { DeliverableComposition } from "../lifecycle-intelligence/deliverable-composition";

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

function cell(text: string, header = false) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: header })] })],
  });
}

function table(rows: string[][]) {
  if (!rows.length) return [];
  return [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: rows.map((row, index) => new TableRow({
        children: row.map((value) => cell(value, index === 0)),
      })),
    }),
  ];
}

function compositionChildren(composition: DeliverableComposition) {
  const children: Array<Paragraph | Table> = [];
  for (const section of composition.sections) {
    if (!section.applicable && section.evidenceClass === "NOT_APPLICABLE") continue;
    children.push(heading(section.title));
    children.push(para(`Evidence class: ${section.evidenceClass}${section.missingState ? ` · ${section.missingState}` : ""}`));
    for (const paragraph of section.paragraphs) children.push(para(paragraph));
    if (section.rows.length) children.push(...table(section.rows));
  }
  return children;
}

export async function buildDocx(input: {
  template: EngineeringArtifactTemplate;
  plan: WorkPlanLike;
  provenance: ArtifactProvenanceManifest;
  projectCode: string;
  branding?: ArtifactBranding | null;
  composition?: DeliverableComposition | null;
}): Promise<{ buffer: Buffer; sectionCount: number }> {
  const draftBanner = [
    para("DRAFT FOR ENGINEER REVIEW", { bold: true }),
    para("ENGINEER REVIEW REQUIRED. Not issued. Not engineering approval. Not IFC. Not Deliverable complete."),
  ];
  const type = input.template.artifactType;
  const query = input.plan.relatedObjectId ?? input.plan.relatedObjectType ?? "Query not supplied — placeholder remains unresolved.";
  const composed = Boolean(input.composition && (type === "DESIGN_REPORT" || type === "TECHNICAL_MEMORANDUM"));
  const children: Array<Paragraph | Table> = composed
    ? [
        heading(input.template.name),
        ...draftBanner,
        para(`Project: ${input.projectCode}`),
        para(`Fingerprint: ${input.composition!.compositionFingerprint}`),
        para(`MTO: ${input.composition!.manifest.mtoRevision ? `Rev ${input.composition!.manifest.mtoRevision} (${input.composition!.manifest.mtoStatus})` : "not bound"}`),
        ...compositionChildren(input.composition!),
      ]
    : [
    heading(input.template.name),
    ...draftBanner,
    heading("Document Control"),
    para(`Project: ${input.projectCode}`),
    para(`Work plan: ${input.plan.templateCode}@${input.plan.templateVersion}`),
    para(`Artifact template: ${input.template.code}@${input.template.version}`),
    para(`Template class: ${input.provenance.templateSourceClass ?? "EOS_DEFAULT"}`),
    para(`Prepared for: ${documentCreator(input.branding)}`),
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

  if (!composed && type === "SPECIFICATION") {
    children.push(
      heading("Materials / technical clauses"),
      para("PLACEHOLDER / UNRESOLVED: material grades, inspection frequencies, code editions, and acceptance criteria are not invented. Engineer to author from governed sources."),
      heading("Project-specific decisions / deviations"),
      ...bullets(input.provenance.decisions, "No recorded deviations."),
    );
  }

  if (!composed && (type === "RFI_RESPONSE" || type === "TQ_RESPONSE" || type === "TECHNICAL_MEMORANDUM")) {
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

  if (!composed && (type === "TECHNICAL_MEMORANDUM" || input.template.readinessPolicy === "ALLOW_INCOMPLETE_DRAFT")) {
    children.push(
      heading("Missing information / conditions"),
      ...bullets(
        input.plan.context.gaps.map((row) => `${row.kind}: ${row.title} — ${row.explanation}`),
        "No recorded gaps.",
      ),
      para("CONDITIONAL INPUTS PRESENT where gaps exist. Missing/unaccepted values remain explicit. No silent defaults."),
    );
  }

  const valueSections = composed ? [] : (input.plan.context.evaluationRequirements ?? []).filter((row) => row.includeArtifactSection);
  for (const section of valueSections) {
    children.push(
      heading(section.kind === "COST" ? "Cost" : section.kind === "CONSTRUCTABILITY" ? "Constructability" : "Carbon / Sustainability"),
      para(`${section.maturity}. Evidence state: ${section.evidenceState}. ${section.expectedEvidence}`),
      para("Not automatically accepted as cost-acceptable, constructable, or carbon-compliant."),
    );
  }

  if (!composed) {
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
  }

  const creator = documentCreator(input.branding);
  const doc = new Document({
    creator,
    title: input.template.name,
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: `${creator} generated draft`, italics: true })],
          }),
          ...children,
        ],
      },
    ],
  });
  const buffer = Buffer.from(await Packer.toBuffer(doc));
  return { buffer, sectionCount: input.template.sheetsOrSections.length };
}
