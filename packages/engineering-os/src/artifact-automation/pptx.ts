import PptxGenJS from "pptxgenjs";
import type { ArtifactProvenanceManifest, EngineeringArtifactTemplate, WorkPlanLike } from "./types";

export async function buildPptx(input: {
  template: EngineeringArtifactTemplate;
  plan: WorkPlanLike;
  provenance: ArtifactProvenanceManifest;
  projectCode: string;
}): Promise<{ buffer: Buffer; slideCount: number }> {
  const pptx = new PptxGenJS();
  pptx.author = "RTB Engineering OS";
  pptx.title = input.template.name;
  const add = (title: string, lines: string[]) => {
    const slide = pptx.addSlide();
    slide.addText("DRAFT — ENGINEER REVIEW REQUIRED", { x: 0.5, y: 0.2, w: 9, h: 0.35, fontSize: 12, bold: true });
    slide.addText(title, { x: 0.5, y: 0.6, w: 9, h: 0.5, fontSize: 22, bold: true });
    slide.addText(lines.join("\n"), { x: 0.5, y: 1.2, w: 9, h: 4.5, fontSize: 14 });
  };
  add("Title", [
    input.template.name,
    `Project: ${input.projectCode}`,
    `Work plan: ${input.plan.templateCode}@${input.plan.templateVersion}`,
    "Not issued. Not engineering approval.",
  ]);
  add("Problem / Objective", ["Assemble option-study context for engineer comparison.", "EOS does not select a recommended option."]);
  add("Project Context", [
    `Lifecycle: ${input.provenance.lifecycleStage}`,
    `Discipline: ${input.provenance.discipline ?? "unspecified"}`,
    `System: ${input.provenance.systemId ?? "not specified"}`,
  ]);
  add("Options", ["Option A — Rail haulage (synthetic)", "Option B — Conveyor (synthetic)", "Options remain separate."]);
  add("Key Inputs", input.provenance.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`).concat(input.provenance.information.length ? [] : ["No inputs referenced."]));
  add("Comparison", ["Capacity, constructability, and information completeness are visible.", "No hidden weighted score.", "No automatic winner."]);
  add("Trade-offs", ["Trade-offs remain for engineer judgement. This slide does not recommend an option."]);
  add("Risks / Constraints", input.plan.context.gaps.map((row) => `${row.kind}: ${row.title}`).concat(input.plan.context.gaps.length ? [] : ["No recorded constraints."]));
  add("Information Gaps", input.plan.context.gaps.map((row) => row.explanation).concat(input.plan.context.gaps.length ? [] : ["No recorded gaps."]));
  const recordedDecision = input.provenance.decisions[0];
  add("Decision Required", [
    recordedDecision
      ? `Referenced recorded Decision: ${recordedDecision}. Presentation reports the recorded Decision; it does not select a remaining winner.`
      : "No authorized human Decision selecting an option is recorded. No recommended option is stated.",
  ]);
  add("References", input.provenance.information.map((row) => `${row.title}${row.revision ? ` Rev ${row.revision}` : ""}`).concat([`Fingerprint ${input.provenance.inputFingerprint}`]));
  const output = await pptx.write({ outputType: "nodebuffer" });
  const buffer = Buffer.isBuffer(output) ? output : Buffer.from(output as Uint8Array);
  return { buffer, slideCount: 11 };
}
