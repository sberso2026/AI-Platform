import { cn } from "@rtb/ui";

/**
 * Consistent app-shell content padding (Batch 2.08).
 * top 24px · horizontal 24–32px · bottom 32px
 */
export function PageMain({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8",
        className
      )}
      data-testid="page-main"
      {...props}
    >
      {children}
    </main>
  );
}
