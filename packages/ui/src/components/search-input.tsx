import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/utils";
import { GLOBAL_SEARCH_PLACEHOLDER } from "../lib/typography";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

/**
 * Search field with magnifying-glass on the RIGHTMOST side.
 * Uses flex (not absolute) so icon placement does not depend on Tailwind
 * scanning this package for `absolute`/`right-*` utilities.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      placeholder = GLOBAL_SEARCH_PLACEHOLDER,
      "aria-label": ariaLabel = "Global search",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "flex h-11 w-full items-center overflow-hidden rounded-md border border-border bg-white",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          containerClassName
        )}
        data-testid="search-input"
      >
        <input
          ref={ref}
          type="search"
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(
            "h-full min-w-0 flex-1 border-0 bg-transparent pl-4 text-[0.9375rem] text-slate-800 outline-none placeholder:text-slate-400",
            // Leave clear space before the icon; text cannot run under it
            "pr-2",
            "[&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-results-button]:appearance-none",
            className
          )}
          {...props}
        />
        <span
          className="flex h-full w-11 shrink-0 items-center justify-center text-slate-400"
          data-testid="search-input-icon"
          aria-hidden
        >
          <Search className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
