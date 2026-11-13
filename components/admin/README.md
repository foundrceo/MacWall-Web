# Admin console UI

The admin (`/admin`) is a dark, dense, quiet operations console. It should
read like Linear or the Vercel dashboard: near-black canvas, hairline borders,
one type scale, colour only where it carries status.

## Structure

```
app/admin/layout.tsx                 theme scope (.admin-portal) + providers
app/admin/admin.css                  tokens, shadcn bridge, the admin Tailwind build
app/admin/(protected)/layout.tsx     auth check + <AdminFrame> (sidebar, ⌘K)
app/admin/(protected)/<route>/page.tsx   thin: renders the feature's view
components/admin/frame.tsx           sidebar, mobile bar, main scroll area
components/admin/page.tsx            <AdminPage>: title, description, actions
components/admin/ui.tsx              building blocks (below)
components/admin/<feature>/          one folder per screen
```

A route's `page.tsx` only renders `<XView />` from `components/admin/<feature>/`.
Views are client components that fetch from `/api/admin/*`
(`credentials: "same-origin"`). `lib/admin/*` and `app/api/admin/*` are the
data layer; UI work does not change them.

## Page shell

Every screen returns `<AdminPage title description actions>`.

- Default: a scrolling page in a centred column (`width="wide"` for big
  tables and media grids). Stack sections with `space-y-6` (or `space-y-8`
  between `SectionHeading` groups).
- `fill`: the page fills the viewport under a compact header and scrolls its
  own panes. Use for inboxes, split list/detail views and editors. Children
  sit in a `flex min-h-0 flex-1 flex-col` box; panes are separated by
  `border-border` hairlines, not by cards.

Page-level controls (range switch, primary button, refresh) go in `actions`.
`<main>` is the scroll container, not the window.

## Building blocks (`@/components/admin/ui`)

| Need | Use |
| --- | --- |
| Surface for content | `Panel`, `PanelHeader`, `PanelBody` |
| Title above a group of panels | `SectionHeading` |
| KPIs | `StatGroup` + `Stat` (value, `delta`, `hint`, `spark`) |
| Status | `Badge` (`tone`, `dot`), `StatusDot`, `Meter` |
| 2-5 way switch (range, filter, view) | `Segmented` |
| Search box | `SearchInput` |
| Icon-only button | `IconButton` (label is tooltip + accessible name) |
| Copy to clipboard | `CopyButton` |
| Form field | `Field` wrapping `Input` / `Textarea` / `Select` |
| Key/value facts | `DataList` (`rows` for side panels, `grid` for wide ones) |
| People | `Avatar` |
| Loading | `Skeleton` (shaped like the content), `Spinner`, `LoadingState` |
| Nothing to show | `EmptyState` |
| Inline error / warning / info | `Notice` |
| Key hint | `Kbd` |

Buttons, inputs, selects, dialogs, sheets, dropdowns, tables, tabs, switches
and tooltips come from `@/components/ui/*`; admin.css re-themes them. Toasts:
`toast` from `sonner`. Icons: `lucide-react` only, 16px (`size-4`), 14px in
dense spots, default stroke.

If a block is missing, build it in your feature folder. Promote it to
`ui.tsx` once a second screen needs it.

## Tokens

Use Tailwind classes, never hex values.

| Role | Class |
| --- | --- |
| Page | `bg-background` |
| Panel | `bg-card` |
| Popover, dialog | `bg-popover` / `bg-raised` |
| Subtle fill (hover, chips, inset) | `bg-fill`, `bg-fill-hover` |
| Hairline | `border-border`; emphasis `border-line-strong` |
| Text | `text-foreground`, `text-soft`, `text-muted-foreground` |
| Decoration only (3.5:1) | `text-faint` |
| Status | `text-green` `text-amber` `text-red` `text-blue` `text-violet`, tints `bg-green/12` |
| Charts | `var(--chart-1)` … `var(--chart-5)` |

`Tone` = `neutral | blue | green | amber | red | violet`. Meaning is fixed:
green = good/live/paid, amber = waiting/needs attention, red =
failed/destructive, blue = informational/in progress/selected, violet =
trial/special, neutral = everything else.

## Type and spacing

- Base 13px. Page title 22px/600 (fill pages 15px/600). Section heading
  15px/600. Panel title 13px/500. Secondary text 12-13px
  `text-muted-foreground`. Smallest size 11px.
- Numbers that change or line up: `tabular-nums`. Big figures: 24px/600,
  `tracking-[-0.03em]`.
- Sentence case everywhere. No uppercase tracking labels.
- Radii: panels 14px (`rounded-[14px]`), controls 8-10px, chips 6px
  (`rounded-md`), media thumbnails 8px. Panel padding 16px (`p-4`); table and
  list rows 36-44px tall.
- Spacing on a 4px grid: 4, 8, 12, 16, 24, 32.

## Rules

1. One primary button per view (`Button` default variant, the white one).
   Everything else is `outline` or `ghost`. Destructive actions use
   `variant="destructive"` and confirm in a `Dialog` when they can't be undone.
2. No cards inside cards. A `Panel` holds rows, a table, a chart or a form;
   split it with hairlines (`divide-y divide-border`), not nested boxes.
3. Colour is for status and data, never decoration. No gradients, glows,
   glass, drop shadows on panels, or emoji. Shadows only on things that float
   (menus, dialogs, toasts).
4. Tables: `Table` from `components/ui/table` inside a
   `Panel className="overflow-hidden"`. Header cells 12px
   `text-muted-foreground font-medium`, rows `hover:bg-fill/60`, numbers
   right-aligned with `tabular-nums`, one line per row with `truncate`.
   Row actions are ghost icon buttons or a `DropdownMenu`.
5. Every async view has four states: skeleton that matches the final layout
   (no spinners for first load), content, `EmptyState`, and a `Notice` with a
   retry for errors. Keep stale content on screen while refreshing.
6. Motion is short and functional: 150-200ms colour/opacity/transform
   transitions, `motion-reduce:` fallbacks, nothing that loops except a
   live-status dot.
7. Accessibility: real `button`/`a`/`label` elements, visible focus
   (`focus-visible:ring-2 focus-visible:ring-ring`), `aria-label` on icon-only
   controls, status never by colour alone (pair with text or an icon), 4.5:1
   text contrast (`text-faint` is not for reading).
8. Responsive from 360px: panes stack below `lg`, tables scroll sideways
   inside their panel, actions wrap. No horizontal page scroll.
9. Copy: short and specific. Say what a number is ("Paid orders, last 30
   days"), what a button does ("Approve and publish"), and what went wrong
   plus what to do next in errors.

`components/admin/emails/emails-view.tsx` is the reference for a `fill` page.
