/**
 * RTB Engineering OS — typography scale (Batch 2.11)
 * Values are Tailwind class strings for consistent enterprise UI.
 */
export const TYPOGRAPHY = {
  pageTitle: "text-[2rem] font-bold leading-tight tracking-tight text-slate-900", // 32px / 700
  pageSubtitle: "text-[1rem] leading-relaxed text-slate-500", // 16px
  sectionHeading: "text-[1.125rem] font-semibold leading-snug text-slate-900", // 18px / 600
  cardTitle: "text-[1.0625rem] font-semibold leading-snug text-slate-900", // ~17px
  kpiValue: "text-[2.25rem] font-bold leading-none tracking-tight text-slate-900", // 36px
  kpiLabel: "text-[0.9375rem] font-medium leading-snug text-slate-600", // 15px
  body: "text-[0.9375rem] leading-relaxed text-slate-700", // 15px
  bodySecondary: "text-[0.9375rem] leading-relaxed text-slate-500",
  sidebarItem: "text-[0.9375rem] font-medium leading-5", // 15px / 20px line-height
  sidebarGroup: "text-[0.8125rem] font-semibold uppercase tracking-[0.05em]", // 13px
  meta: "text-[0.8125rem] leading-normal text-slate-500", // 13px
  chip: "text-[0.8125rem] font-semibold leading-none", // 13px chips
  brandMark: "text-[1.0625rem] font-bold leading-tight tracking-wide text-white", // ~17px RTB
  brandProduct: "text-[1.1875rem] font-semibold leading-tight text-white", // ~19px Engineering OS
  brandEdition: "text-[0.8125rem] font-medium leading-tight text-slate-400", // 13px
} as const;

export const SPACING = {
  pageMain: "px-6 pb-8 pt-6 sm:px-8",
  cardPadding: "p-6", // 24px
  sectionGap: "gap-8",
  gridGap: "gap-4 lg:gap-5",
  rowGap: "gap-3.5",
  sidebarWidth: "w-[16.25rem]", // 260px
  sidebarWidthCollapsed: "w-[4.75rem]",
  /** Fixed icon rail + 12px gap (nav items) */
  sidebarIconGap: "gap-3",
  sidebarNavIconWidth: "w-6", // 24px
  sidebarGroupSpacing: "mt-5 mb-2.5", // ~20px top / 10px bottom
  globalSearchMax: "max-w-[450px] lg:max-w-[520px]",
  searchInputPaddingLeft: "pl-4",
  /** Icon lives in a fixed right rail (w-11); text is flex-1 before it */
  searchInputPaddingRight: "pr-2",
  searchInputIconRail: "w-11",
} as const;

export const GLOBAL_SEARCH_PLACEHOLDER =
  "Search projects, assets, documents, risks...";

/** Branding copy — keep product identity consistent */
export const BRANDING = {
  org: "RTB",
  product: "Engineering OS",
  edition: "Enterprise Edition",
  logoSizePx: 44,
} as const;
