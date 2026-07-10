# Search Input

Magnifying-glass on the **rightmost** side of the field; text ends before it.

## Component

`SearchInput` from `@rtb/ui`.

## Layout (flex — not absolute)

Absolute `right-*` utilities from `@rtb/ui` were unreliable under Tailwind content scanning, which dropped the icon under the field. The control is now a horizontal flex row:

```tsx
<div className="flex h-11 items-center ...">          {/* field chrome */}
  <input className="flex-1 pl-4 pr-2 ..." />          {/* text */}
  <span className="w-11 shrink-0 ..."><Search /></span> {/* rightmost icon rail */}
</div>
```

| Part | Role |
|------|------|
| Input | `flex-1` — grows; text never sits under the icon |
| Icon rail | Fixed `w-11` on the **right** — rightmost edge of the search bar |

## Usage

- Header global search
- `/engineering/search`
