import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ASK_SCOPE_ALL,
  ASK_SCOPE_DOCUMENT,
  ASK_SCOPE_PROJECT,
  askRequestBody,
  projectFilterScopeDecision,
} from "../lib/engineering/ask-scope";
import { EngineeringReasoningService } from "../../../../packages/engineering-os/src/phase-e5/reasoning-service";
import {
  generalEngineeringMethodology,
  prepareEngineeringAskScope,
  projectEvidenceAbstention,
} from "../../../../packages/engineering-os/src/phase-e5/general-methodology";

const QUESTION =
  "For a synthetic steel pipe rack with simulated corrosion at a column base, what information should an engineer collect before assessing remaining structural capacity?";

describe("Engineering AI scope browser contract", () => {
  it("keeps All Engineering selected when a project filter is stored", () => {
    const shell = readFileSync(
      resolve(__dirname, "../components/engineering/ask-engineering-shell.tsx"),
      "utf8",
    );
    expect(shell).not.toContain('setScope("project")');
    expect(shell).not.toContain('if (scope === "workspace") setScope("project")');
    expect(shell).toContain("scopeChosenByUser");
    expect(shell).toContain("aria-pressed");
    expect(shell).toContain("ASK_SCOPE_ALL");
    expect(shell).toContain("ask-scope-${opt.id}");

    const beforeClick = projectFilterScopeDecision({
      scope: ASK_SCOPE_ALL,
      userChoseScope: false,
      projectFromFilter: "project-1",
      contextProjectId: null,
    });
    expect(beforeClick.forceProjectScope).toBe(true);

    const afterClick = projectFilterScopeDecision({
      scope: ASK_SCOPE_ALL,
      userChoseScope: true,
      projectFromFilter: "project-1",
      contextProjectId: null,
    });
    expect(afterClick.forceProjectScope).toBe(false);
    expect(afterClick.restoreProjectId).toBeNull();
  });

  it("sends all_engineering and restores project evidence on the way back", () => {
    let scope: "all_engineering" | "project" | "document" = "project";
    let projectId: string | null = "project-1";
    const filter = "project-1";

    scope = ASK_SCOPE_ALL;
    projectId = null;
    const allRequest = askRequestBody({ scope, message: QUESTION, projectId });
    expect(allRequest.scope).toBe("all_engineering");
    expect(allRequest.projectId).toBeUndefined();

    scope = ASK_SCOPE_PROJECT;
    projectId = projectId || filter;
    const projectRequest = askRequestBody({ scope, message: QUESTION, projectId });
    expect(projectRequest.scope).toBe("project");
    expect(projectRequest.projectId).toBe("project-1");

    const documentRequest = askRequestBody({
      scope: ASK_SCOPE_DOCUMENT,
      message: QUESTION,
      documentId: null,
    });
    expect(documentRequest.scope).toBe("document");
    expect(documentRequest.documentId).toBeUndefined();
  });

  it("serves general methodology for all_engineering and abstains for an empty project", async () => {
    const prepared = prepareEngineeringAskScope({
      scope: "all_engineering",
      projectId: "project-1",
      message: QUESTION,
    } as never);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.publicScope).toBe("all_engineering");
    expect(prepared.retrievalScope).toBe("workspace");
    expect(prepared.projectId).toBeUndefined();

    const guidance = await new EngineeringReasoningService().reason({
      query: QUESTION,
      evidence: [],
      searchQuery: {
        tenantId: "tenant",
        userId: "user",
        query: QUESTION,
        scope: "workspace",
      },
    });
    expect(guidance.abstained).toBe(false);
    expect(guidance.authorityStatus).toBe("ADVISORY");
    expect(guidance.answer).toMatch(/General engineering methodology only/i);
    expect(guidance.answer).toMatch(/remaining wall or section thickness/i);
    expect(guidance.answer).toMatch(/pitting versus general section loss/i);
    expect(guidance.answer).toMatch(/does not establish that a structure is safe, adequate, compliant, or approved/i);
    expect(guidance.answer).not.toMatch(/client-specific engineering claim/i);
    expect(guidance.limitations.some((item) => item.includes("Searched scope: all_engineering"))).toBe(true);

    const project = await new EngineeringReasoningService().reason({
      query: QUESTION,
      evidence: [],
      searchQuery: {
        tenantId: "tenant",
        userId: "user",
        query: QUESTION,
        scope: "project",
        projectId: "project-1",
      },
    });
    expect(project.abstained).toBe(true);
    expect(project.answer).toBe(projectEvidenceAbstention());
    expect(project.answer).not.toMatch(/client-specific engineering claim/i);

    const missingDocument = prepareEngineeringAskScope({ scope: "document" });
    expect(missingDocument.ok).toBe(false);
    if (!missingDocument.ok) {
      expect(missingDocument.scope).toBe("document");
      expect(missingDocument.message).toMatch(/No document is selected/);
    }
    const missingAsset = prepareEngineeringAskScope({ scope: "asset" });
    expect(missingAsset.ok).toBe(false);
  });

  it("clearing context does not keep a project on the next All Engineering decision", () => {
    const cleared = projectFilterScopeDecision({
      scope: ASK_SCOPE_ALL,
      userChoseScope: true,
      projectFromFilter: null,
      contextProjectId: null,
    });
    expect(cleared.restoreProjectId).toBeNull();
    expect(generalEngineeringMethodology("What changed recently?").answer).toMatch(/General engineering methodology only/);
  });
});
