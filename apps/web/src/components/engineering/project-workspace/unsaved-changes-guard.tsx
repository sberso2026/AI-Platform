"use client";

/**
 * Reusable EOS project-workspace unsaved-changes guard.
 * Forms register dirty state + save handler; navigation/sign-out/project switch consult this.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@rtb/ui";

export type UnsavedSaveHandler = () => Promise<boolean>;

type PendingAction =
  | { kind: "href"; href: string }
  | { kind: "callback"; run: () => void | Promise<void> };

type GuardContextValue = {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  registerSaveHandler: (handler: UnsavedSaveHandler | null) => void;
  requestNavigation: (href: string) => void;
  requestLeave: (run: () => void | Promise<void>) => Promise<boolean>;
  confirmIfDirty: () => Promise<boolean>;
};

const UnsavedChangesContext = createContext<GuardContextValue | null>(null);

/** Module registry so layout chrome (header/sidebar) can consult the active guard. */
let activeGuard: GuardContextValue | null = null;

export function getActiveUnsavedChangesGuard(): GuardContextValue | null {
  return activeGuard;
}

/** Returns true if leave is allowed (not dirty, or user confirmed). */
export async function confirmLeaveIfUnsaved(): Promise<boolean> {
  const guard = activeGuard;
  if (!guard || !guard.isDirty) return true;
  return guard.confirmIfDirty();
}

export function useUnsavedChangesGuard(): GuardContextValue {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    return {
      isDirty: false,
      setDirty: () => undefined,
      registerSaveHandler: () => undefined,
      requestNavigation: (href: string) => {
        if (typeof window !== "undefined") window.location.assign(href);
      },
      requestLeave: async (run) => {
        await run();
        return true;
      },
      confirmIfDirty: async () => true,
    };
  }
  return ctx;
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isDirty, setDirtyState] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveHandlerRef = useRef<UnsavedSaveHandler | null>(null);
  const dirtyRef = useRef(false);
  const resolveConfirmRef = useRef<((allowed: boolean) => void) | null>(null);
  const historyArmedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
    setDirtyState(dirty);
  }, []);

  const registerSaveHandler = useCallback((handler: UnsavedSaveHandler | null) => {
    saveHandlerRef.current = handler;
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setPending(null);
    setSaveError(null);
    setSaving(false);
    if (resolveConfirmRef.current) {
      resolveConfirmRef.current(false);
      resolveConfirmRef.current = null;
    }
  }, []);

  const proceed = useCallback(
    async (action: PendingAction | null) => {
      setDirty(false);
      setOpen(false);
      setPending(null);
      setSaveError(null);
      setSaving(false);
      if (resolveConfirmRef.current) {
        resolveConfirmRef.current(true);
        resolveConfirmRef.current = null;
      }
      if (!action) return;
      if (action.kind === "href") {
        router.push(action.href);
        return;
      }
      await action.run();
    },
    [router, setDirty],
  );

  const openFor = useCallback((action: PendingAction) => {
    setPending(action);
    setSaveError(null);
    setOpen(true);
  }, []);

  const confirmIfDirty = useCallback((): Promise<boolean> => {
    if (!dirtyRef.current) return Promise.resolve(true);
    return new Promise((resolve) => {
      resolveConfirmRef.current = resolve;
      openFor({
        kind: "callback",
        run: async () => {
          /* proceed() already resolves confirm */
        },
      });
    });
  }, [openFor]);

  const requestNavigation = useCallback(
    (href: string) => {
      if (!dirtyRef.current) {
        router.push(href);
        return;
      }
      openFor({ kind: "href", href });
    },
    [openFor, router],
  );

  const requestLeave = useCallback(
    async (run: () => void | Promise<void>): Promise<boolean> => {
      if (!dirtyRef.current) {
        await run();
        return true;
      }
      return new Promise((resolve) => {
        resolveConfirmRef.current = resolve;
        openFor({ kind: "callback", run });
      });
    },
    [openFor],
  );

  const value: GuardContextValue = {
    isDirty,
    setDirty,
    registerSaveHandler,
    requestNavigation,
    requestLeave,
    confirmIfDirty,
  };

  useEffect(() => {
    activeGuard = value;
    return () => {
      if (activeGuard === value) activeGuard = null;
    };
  });

  // Browser unload / refresh / tab close
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Browser back/forward — keep user in editing context while dirty
  useEffect(() => {
    if (!isDirty) {
      historyArmedRef.current = false;
      return;
    }
    if (!historyArmedRef.current) {
      window.history.pushState({ eosUnsavedGuard: true }, "", window.location.href);
      historyArmedRef.current = true;
    }
    const onPopState = () => {
      if (!dirtyRef.current) return;
      window.history.pushState({ eosUnsavedGuard: true }, "", window.location.href);
      openFor({
        kind: "callback",
        run: async () => {
          historyArmedRef.current = false;
          window.history.back();
        },
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, openFor]);

  // Capture in-app link clicks (breadcrumbs, content links, etc.)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!dirtyRef.current) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.startsWith("mailto:")) return;
      if (anchor.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const next = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;
      event.preventDefault();
      event.stopPropagation();
      openFor({ kind: "href", href: next });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openFor]);

  // Focus trap when dialog opens
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const node = dialogRef.current;
    const focusable = node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    first?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeModal]);

  async function onSaveAndContinue() {
    setSaving(true);
    setSaveError(null);
    const handler = saveHandlerRef.current;
    if (!handler) {
      setSaving(false);
      setSaveError("No save handler registered for this form.");
      return;
    }
    try {
      const ok = await handler();
      if (!ok) {
        setSaving(false);
        setSaveError(
          "Project setup could not be saved. Your changes have been preserved.",
        );
        // Mandatory: save failure cancels pending navigation
        return;
      }
      await proceed(pending);
    } catch (e: unknown) {
      setSaving(false);
      const technical = e instanceof Error ? e.message : "save_failed";
      console.error("[eos-unsaved-guard] save failed", technical);
      setSaveError(
        "Project setup could not be saved. Your changes have been preserved.",
      );
    }
  }

  async function onDiscard() {
    await proceed(pending);
  }

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4"
          data-testid="unsaved-changes-modal-backdrop"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            data-testid="unsaved-changes-modal"
            className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-900 p-5 shadow-xl"
          >
            <h2 id={titleId} className="text-base font-semibold text-slate-100">
              Unsaved changes
            </h2>
            <p id={descId} className="mt-2 text-sm text-slate-300">
              You have unsaved changes. Save them before leaving this page?
            </p>
            {saveError ? (
              <p className="mt-3 text-sm text-rose-300" data-testid="unsaved-save-error" role="alert">
                {saveError}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => void onSaveAndContinue()}
                data-testid="unsaved-save-and-continue"
              >
                {saving ? "Saving…" : "Save and continue"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => void onDiscard()}
                data-testid="unsaved-discard"
              >
                Discard changes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={saving}
                onClick={closeModal}
                data-testid="unsaved-keep-editing"
              >
                Keep editing
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </UnsavedChangesContext.Provider>
  );
}

/** Compare editable form snapshots for meaningful dirty-state detection. */
export function isEditableFormDirty(
  baseline: Record<string, unknown>,
  current: Record<string, unknown>,
): boolean {
  const keys = new Set([...Object.keys(baseline), ...Object.keys(current)]);
  for (const key of keys) {
    if (normalizeFormValue(baseline[key]) !== normalizeFormValue(current[key])) {
      return true;
    }
  }
  return false;
}

function normalizeFormValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean).join("|");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value).trim();
}
