/**
 * RTB Engineering OS — typography scale (EOS-SHELL-JARVIS-1)
 * Semantic colors so dark/light tokens drive contrast.
 */
export const TYPOGRAPHY = {
  pageTitle: "text-[2.125rem] font-bold leading-tight tracking-tight text-foreground", // 34px
  pageSubtitle: "text-[1rem] leading-relaxed text-muted-foreground", // 16px
  sectionHeading: "text-[1.25rem] font-semibold leading-snug text-foreground", // 20px
  sectionLabel: "text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground", // 13px
  cardTitle: "text-[1.125rem] font-semibold leading-snug text-foreground", // 18px
  kpiValue: "text-[2.5rem] font-bold leading-none tracking-tight text-foreground", // 40px
  kpiLabel: "text-[0.9375rem] font-medium leading-snug text-muted-foreground", // 15px
  body: "text-[1rem] leading-relaxed text-foreground/90", // 16px
  bodySecondary: "text-[0.9375rem] leading-relaxed text-muted-foreground", // 15px
  sidebarItem: "text-[1rem] font-medium leading-5", // 16px
  sidebarGroup: "text-[0.8125rem] font-semibold uppercase tracking-[0.08em]", // 13px
  meta: "text-[0.875rem] leading-normal text-muted-foreground", // 14px
  chip: "text-[0.8125rem] font-semibold leading-none", // 13px chips
  brandMark: "text-[1.0625rem] font-bold leading-tight tracking-wide text-white",
  brandProduct: "text-[1.1875rem] font-semibold leading-tight text-white",
  brandEdition: "text-[0.8125rem] font-medium leading-tight text-sky-200/70",
} as const;

export const SPACING = {
  pageMain: "px-6 pb-8 pt-6 sm:px-8",
  cardPadding: "p-6",
  sectionGap: "gap-8",
  gridGap: "gap-4 lg:gap-5",
  rowGap: "gap-3.5",
  sidebarWidth: "w-[16.25rem]",
  sidebarWidthCollapsed: "w-[4.75rem]",
  sidebarIconGap: "gap-3",
  sidebarNavIconWidth: "w-6",
  sidebarGroupSpacing: "mt-5 mb-2.5",
  globalSearchMax: "max-w-[450px] lg:max-w-[520px]",
  searchInputPaddingLeft: "pl-4",
  searchInputPaddingRight: "pr-2",
  searchInputIconRail: "w-11",
} as const;

export const GLOBAL_SEARCH_PLACEHOLDER =
  "Search projects, assets, documents, risks...";

export const BRANDING = {
  org: "RTB",
  product: "Engineering OS",
  edition: "Enterprise Edition",
  logoSizePx: 44,
  intelligence: "RTB Engineering AI",
  intelligenceCore: "Engineering Intelligence Core",
} as const;
