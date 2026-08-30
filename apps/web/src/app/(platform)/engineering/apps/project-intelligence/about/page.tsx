import { ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";
import {
  PROJECT_INTELLIGENCE_RELEASE_TAG,
  PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG,
  PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION,
  PROJECT_INTELLIGENCE_VERSION,
  getProjectIntelligenceVersionDeclaration,
  listProjectIntelligenceFeatures,
} from "@rtb/project-intelligence";
import { ApplicationEntitlementLayout } from "@/components/commerce/application-entitlement-layout";

export default function ProjectIntelligenceAboutPage() {
  const declaration = getProjectIntelligenceVersionDeclaration();
  const features = listProjectIntelligenceFeatures();

  return (
    <ApplicationEntitlementLayout
      policy={ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence"]}
      returnPath="/system/products"
    >
      <section data-testid="project-intelligence-about">
        <p className="text-sm font-medium text-cyan-700">About</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          {declaration.productName} {PROJECT_INTELLIGENCE_VERSION}
        </h2>
        <dl className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">Module key</dt>
            <dd>{declaration.moduleKey}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Release tag</dt>
            <dd data-testid="project-intelligence-release-tag">{PROJECT_INTELLIGENCE_RELEASE_TAG}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">V1 certification version</dt>
            <dd data-testid="project-intelligence-v1-certification-version">
              {PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">V1 certification tag</dt>
            <dd data-testid="project-intelligence-v1-certification-tag">
              {PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Required Platform phase</dt>
            <dd>{declaration.requiredPlatformPhase}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Required Engineering OS phase</dt>
            <dd>{declaration.requiredEngineeringOsPhase}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">V1 feature contracts frozen</dt>
            <dd>{String(declaration.freeze)}</dd>
          </div>
        </dl>
        <h3 className="mt-8 text-lg font-semibold text-slate-900">Features</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {features.map((f) => (
            <li key={f.id}>
              {f.name} — v{f.version}
            </li>
          ))}
        </ul>
      </section>
    </ApplicationEntitlementLayout>
  );
}
