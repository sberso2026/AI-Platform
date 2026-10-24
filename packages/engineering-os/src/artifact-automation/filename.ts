const UNSAFE = /[<>:"/\\|?*\u0000-\u001f]/g;

export function sanitizeArtifactFileName(name: string) {
  const cleaned = name.replace(UNSAFE, "_").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^\.+/, "");
  return cleaned.slice(0, 180) || "ENGINEERING_ARTIFACT_DRAFT";
}

export function defaultArtifactFileName(input: {
  projectCode?: string | null;
  discipline?: string | null;
  title: string;
  format: "XLSX" | "DOCX" | "PPTX";
}) {
  const project = sanitizeArtifactFileName(input.projectCode || "PROJECT");
  const discipline = sanitizeArtifactFileName(input.discipline || "ENG");
  const title = sanitizeArtifactFileName(input.title);
  const ext = input.format.toLowerCase();
  return `${project}_${discipline}_${title}_DRAFT.${ext}`;
}
