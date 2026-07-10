"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FULL_NAVIGATION,
  SIDEBAR_COLLAPSED_KEY,
  SIDEBAR_GROUP_STATE_KEY,
  SIDEBAR_SCROLL_KEY,
  SIDEBAR_SECTIONS,
  filterSidebarNavigation,
  groupNavigation,
  itemsForSidebarSection,
  parseSidebarGroupState,
  resolveNavTier,
  type SidebarNavContext,
} from "@rtb/platform-core";
import { cn, SidebarNavItem, sidebarNavItemClassName, SPACING, TYPOGRAPHY } from "@rtb/ui";
import { getIcon } from "@/lib/icons";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import { createClient } from "@/lib/supabase/client";

type NavContextResponse = {
  data?: {
    roleSlug: string;
    tier: SidebarNavContext["tier"];
    showAdvancedPlatformTools: boolean;
    permissions: SidebarNavContext["permissions"];
  };
};

function hasPermissionFromList(
  permissions: SidebarNavContext["permissions"],
  resource: string,
  action: string
): boolean {
  if (permissions.some((p) => p.resource === "tenant" && p.action === "admin")) {
    return true;
  }
  return permissions.some(
    (p) =>
      p.resource === resource &&
      (p.action === action || p.action === "admin" || (action === "read" && p.action === "read"))
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [groupState, setGroupState] = useState<Record<string, boolean>>(() =>
    parseSidebarGroupState(null)
  );
  const [hydrated, setHydrated] = useState(false);
  const [navContext, setNavContext] = useState<SidebarNavContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform/nav-context")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: NavContextResponse | null) => {
        if (cancelled || !json?.data) return;
        const { roleSlug, showAdvancedPlatformTools, permissions, tier } = json.data;
        setNavContext({
          roleSlug,
          tier: tier ?? resolveNavTier(roleSlug),
          permissions: permissions ?? [],
          showAdvancedInSidebar: showAdvancedPlatformTools,
          hasPermission: (resource, action) =>
            hasPermissionFromList(permissions ?? [], resource, action),
        });
      })
      .catch(() => {
        // Fall back to engineering-only navigation
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNavigation = useMemo(() => {
    if (!navContext) {
      return FULL_NAVIGATION.filter(
        (item) =>
          !item.sidebarHidden &&
          (item.group === "engineering" ||
            item.group === "engineering_registers" ||
            item.group === "engineering_admin")
      );
    }
    return filterSidebarNavigation(FULL_NAVIGATION, navContext);
  }, [navContext]);

  const grouped = useMemo(() => groupNavigation(visibleNavigation), [visibleNavigation]);

  const sections = useMemo(
    () =>
      SIDEBAR_SECTIONS.map((section) => ({
        ...section,
        items: itemsForSidebarSection(section, grouped),
      })).filter((section) => {
        if (section.adminOnly && navContext?.tier !== "admin") return false;
        return section.items.length > 0;
      }),
    [grouped, navContext]
  );

  useEffect(() => {
    try {
      const storedCollapsed = sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (storedCollapsed === "1") setCollapsed(true);
      setGroupState(parseSidebarGroupState(sessionStorage.getItem(SIDEBAR_GROUP_STATE_KEY)));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || collapsed) return;
    const activeSection = sections.find((section) =>
      section.items.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      )
    );
    if (!activeSection) return;
    setGroupState((prev) => {
      if (prev[activeSection.id]) return prev;
      const next = { ...prev, [activeSection.id]: true };
      try {
        sessionStorage.setItem(SIDEBAR_GROUP_STATE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [pathname, hydrated, collapsed, sections]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    try {
      const raw = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
      if (raw != null) {
        const top = Number(raw);
        if (!Number.isNaN(top)) {
          requestAnimationFrame(() => {
            if (navRef.current) navRef.current.scrollTop = top;
          });
        }
      }
    } catch {
      // ignore
    }
  }, [pathname, hydrated, groupState, collapsed]);

  const onNavScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    try {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  function toggleGroup(sectionId: string) {
    setGroupState((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      try {
        sessionStorage.setItem(SIDEBAR_GROUP_STATE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? SPACING.sidebarWidthCollapsed : SPACING.sidebarWidth
      )}
      data-testid="app-sidebar"
      aria-label="Primary navigation"
    >
      <ProductSwitcher compact={collapsed} />

      <nav
        ref={navRef}
        onScroll={onNavScroll}
        className="flex-1 overflow-y-auto p-3"
        data-testid="sidebar-nav-scroll"
        aria-label="Sidebar sections"
      >
        {sections.map((section, index) => {
          const expanded = collapsed ? true : Boolean(groupState[section.id]);
          const panelId = `nav-section-${section.id}`;

          return (
            <div
              key={section.id}
              className={cn(index > 0 && "mt-5")}
              data-nav-group={section.id}
            >
              {!collapsed && (
                <button
                  type="button"
                  className={cn(
                    "mb-2.5 flex w-full items-center justify-between rounded-md px-4 py-2 text-left",
                    TYPOGRAPHY.sidebarGroup,
                    "text-sidebar-foreground/55",
                    "hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  )}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  data-testid={`nav-group-toggle-${section.id}`}
                  onClick={() => toggleGroup(section.id)}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform",
                      expanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              )}

              <ul
                id={panelId}
                className={cn("space-y-1", !expanded && "hidden")}
                hidden={!expanded}
                data-testid={`nav-group-panel-${section.id}`}
              >
                {section.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={sidebarNavItemClassName({ active: isActive })}
                        title={collapsed ? item.label : undefined}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <SidebarNavItem
                          label={item.label}
                          active={isActive}
                          compact={collapsed}
                          icon={<Icon />}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className={sidebarNavItemClassName({ className: "w-full" })}
          title={collapsed ? "Sign out" : undefined}
          aria-label="Sign out"
          data-testid="sidebar-sign-out"
        >
          <SidebarNavItem
            label="Sign out"
            compact={collapsed}
            icon={<LogOut />}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        data-testid="sidebar-compact-toggle"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
