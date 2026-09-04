import { Sidebar } from "@/components/layout/sidebar";

/**
 * Persistent platform chrome. Hosted in layout so Sidebar does not remount on navigation,
 * preserving scroll position (Batch 2.07).
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-background" data-testid="platform-shell">
      <Sidebar />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
