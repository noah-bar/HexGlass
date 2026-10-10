# HexUI

**Liquid glass React components for professional interfaces** — built on [Base UI](https://base-ui.com) and
Tailwind CSS v4, shipped as precompiled CSS.

[![npm version](https://img.shields.io/npm/v/@hxtc/hexui?color=4f46e5)](https://www.npmjs.com/package/@hxtc/hexui)
[![npm downloads](https://img.shields.io/npm/dm/@hxtc/hexui?color=4f46e5)](https://www.npmjs.com/package/@hxtc/hexui)
[![license](https://img.shields.io/npm/l/@hxtc/hexui?color=4f46e5)](https://github.com/noah-bar/HexUI/blob/main/LICENSE)

[GitHub](https://github.com/noah-bar/HexUI) · [npm](https://www.npmjs.com/package/@hxtc/hexui) ·
[Changelog](https://github.com/noah-bar/HexUI/blob/main/CHANGELOG.md) ·
[Issues](https://github.com/noah-bar/HexUI/issues)

![A billing screen built with HexUI: glass sidebar, sticky header and invoice table](https://raw.githubusercontent.com/noah-bar/HexUI/main/docs/screenshot.jpg)

- **About 40 components**, from buttons and fields to a data table, a command palette and a full sidebar layout.
- **Liquid glass that stays readable**: clear panes with a lit edge, a fine grain and a rim that bends what is
  behind them. Each pane evens out its own backdrop, so text contrast holds over a photo in both themes. Opaque
  fallbacks when the browser or the user turns transparency off.
- **Accessible behavior** from Base UI: keyboard navigation, focus management, ARIA.
- **No Tailwind required**: the stylesheet is precompiled. If you do use Tailwind, nothing collides: every class is
  prefixed with `hx:` and every variable with `--hx-*`, and no global reset is shipped.
- **Light and dark themes**, with a `useTheme` hook and a no-flash script.
- **Typed**: written in TypeScript, ESM only, tree-shakeable, marked `'use client'` for React Server Components.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Styling components](#styling-components)
- [Page background](#page-background)
- [Light / dark theme](#light--dark-theme)
- [Components](#components)
- [Guides](#guides): [DataTable](#data-table-datatable) · [Combobox, Autocomplete](#searching-a-list-combobox-autocomplete) ·
  [Sidebar](#sidebar) · [Command](#command-palette-command) · [Toast](#notifications-toast) · [Sheet](#side-panel-sheet) ·
  [SafeArea](#mobile-safe-areas-safearea)
- [Customization](#customization)
- [Liquid glass](#liquid-glass)
- [Working with glass](#working-with-glass)
- [API reference](#api-reference)
- [Browser support](#browser-support)
- [Contributing](#contributing)

## Installation

```bash
npm install @hxtc/hexui
```

Requires React 19.

Import the styles once. In an application that uses Tailwind CSS v4, put HexUI **before** Tailwind in the main
stylesheet, so that the classes you pass through `className` win over the component defaults:

```css
/* app.css */
@import '@hxtc/hexui';
@import 'tailwindcss';
```

Without Tailwind, import the stylesheet from your entry point instead:

```tsx
import '@hxtc/hexui/styles.css';
```

## Quick start

```tsx
import { Backdrop, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@hxtc/hexui';

export function App() {
  return (
    <Backdrop>
      <Card>
        <CardHeader>
          <CardTitle>Invoice F-2026-1045</CardTitle>
          <CardDescription>Due on 18 October 2026</CardDescription>
        </CardHeader>
        <CardContent>CHF 4,672.05</CardContent>
        <CardFooter>
          <Button variant="ghost">Download</Button>
          <Button>Send</Button>
        </CardFooter>
      </Card>
    </Backdrop>
  );
}
```

`Backdrop` paints the colored background that glass needs behind it. See [Page background](#page-background).

## Styling components

Every component accepts `className`. Your classes are added to the component's own:

```tsx
<Panel className="h-[600px] p-0">…</Panel>
```

- The examples in this README use Tailwind classes from the application. Without Tailwind, pass your own CSS
  classes or `style`.
- HexUI's rules live in the `theme`, `base`, `components` and `utilities` cascade layers. Unlayered CSS always
  wins over them. Tailwind utilities win when Tailwind is imported after HexUI, as shown in
  [Installation](#installation).
- To change the rendered element, or to give a trigger the look of a button, use Base UI's `render` prop:

```tsx
<DialogTrigger render={<Button variant="secondary" />}>Open</DialogTrigger>
<Panel render={<aside />}>…</Panel>
```

## Page background

Glass needs something behind it to show. `Backdrop` adds a decorative background, fixed behind the whole
application, that follows the theme colors:

```tsx
<Backdrop />                                     {/* mesh, subtle: the default */}
<Backdrop variant="aurora" intensity="medium" /> {/* login page, welcome screen */}
<Backdrop variant="plain" texture="grid" />      {/* dense screens: tables, back office */}
```

It can also wrap the application at the root, like a provider:

```tsx
createRoot(document.getElementById('root')!).render(
  <Backdrop>
    <App />
  </Backdrop>,
);
```

Children are rendered next to the decorative layer, without an extra DOM wrapper, so `Backdrop` does not change
the application's layout.

- `variant`: `mesh` · `aurora` · `plain` — `intensity`: `subtle` · `medium` — `texture`: `none` · `grain` · `grid`
- `position="absolute"` confines it to a positioned container (add `isolation: isolate` to that container).
- It sits at a negative `z-index`: if one of your application's wrappers already has a background color, it will hide it.
- It is optional: components stay readable without it. Over a plain page, surfaces are lightly veiled panes.
- Colors can be customized with `--hx-backdrop-base` and `--hx-backdrop-accent-1` to `-3`. The first accent follows `--hx-brand`.

An image can replace the colored glows, optionally a different one per theme. Only the current theme's image
is downloaded:

```tsx
<Backdrop image="/background.jpg" />
<Backdrop
  image={{ light: '/day.jpg', dark: '/night.jpg' }}
  imageBlur={12}                      {/* blur in px, 0 by default */}
  overlay={{ light: 0.1, dark: 0.5 }} {/* black veil, from 0 to 1 */}
/>
```

- `image` and `overlay` accept a single value or `{ light, dark }` (without `dark`, the `light` value is used for both themes).
- Over an image, surfaces turn into clear glass and keep their text readable by themselves (see
  [Liquid glass](#liquid-glass)), so `imageBlur` and `overlay` are a matter of taste. `texture` is still available
  on top.
- Framing is set with `--hx-backdrop-image-position` (`center` by default).

## Light / dark theme

Add `class="dark"` (or `data-theme="dark"`) to `<html>`. It must be on `<html>` (not on a wrapper), because
dialogs, selects and tooltips are rendered in a portal at the root of the document.

The `useTheme` hook can manage this attribute, follow the system theme and remember the preference in
`localStorage` under the `hx-theme` key:

```tsx
import { Button, useTheme } from '@hxtc/hexui';

function ThemeButton() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <>
      <Button variant="ghost" onClick={toggleTheme}>
        Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} theme
      </Button>
      <Button variant="ghost" onClick={() => setTheme('system')} disabled={theme === 'system'}>
        Use system theme
      </Button>
    </>
  );
}
```

`theme` is `light`, `dark` or `system`. `resolvedTheme` always holds the theme actually applied, `light` or
`dark`. Changes are kept in sync with the system theme and across open tabs. If storage is unavailable
(private browsing, blocked storage), the preference is kept in memory for the lifetime of the page.

To avoid a flash of the light theme on load, apply the theme before the first paint with `themeScript`,
placed in `<head>`:

```tsx
import { themeScript } from '@hxtc/hexui';

export function Head() {
  return (
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
  );
}
```

With a static `index.html` (Vite without SSR), paste the contents of `themeScript` into a `<script>` in `<head>`.

## Components

| Category     | Components                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Layout       | `Backdrop`, `Panel`, `Card`, `Separator`, `SafeArea`, `Sidebar`                                                         |
| Actions      | `Button`, `Toggle`, `ToggleGroup`                                                                                       |
| Forms        | `Field`, `FieldRow`, `Label`, `Input`, `InputNumber`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Slider`               |
| Selection    | `Select`, `Combobox`, `Autocomplete`                                                                                    |
| Navigation   | `Tabs`, `Menu` (also exported as `DropdownMenu`), `Menubar`, `Command`, `Pagination`                                    |
| Overlays     | `Dialog`, `Sheet`, `Popover`, `Tooltip`, `Toast`                                                                        |
| Data display | `Table`, `DataTable`, `Avatar`, `Badge`, `Progress`, `Spinner`, `Skeleton`, `Collapsible`                               |
| Hooks, utils | `useTheme`, `themeScript`, `useMediaQuery`, `useDebouncedValue`, `cn` (class merging that understands the `hx:` prefix) |

The exports and options of each component are listed in the [API reference](#api-reference).

## Guides

### Data table (DataTable)

`DataTable` handles lists fed by a paginated API: sorting, pagination, loading, empty state, sticky header.
It fills its parent's height and scrolls inside: give the `Panel` that contains it a height.
It is **controlled** and does not depend on any router.

```tsx
<Panel className="h-[600px] p-0">
  <DataTable ordering={ordering} onOrderingChange={setOrdering} pagination={data} onSkipChange={setSkip}>
    <DataTableHeader>
      <DataTableRow>
        <DataTableSortableHead field="full_name">Name</DataTableSortableHead>
        <DataTableSortableHead field="total" align="right">
          Total
        </DataTableSortableHead>
      </DataTableRow>
    </DataTableHeader>
    <DataTableBody colSpan={2} isPending={isPending} isEmpty={rows.length === 0} emptyText="No clients.">
      {rows.map((row) => (
        <DataTableRow key={row.id} onClick={() => open(row)}>
          …
        </DataTableRow>
      ))}
    </DataTableBody>
  </DataTable>
</Panel>
```

- `ordering` uses the Django format: `"field"` ascending, `"-field"` descending, `""` none. A click cycles
  ascending → descending → none (`nextOrdering`).
- `pagination` takes the API response directly (`{ total, skip, limit }`); `onSkipChange` receives the new `skip`.
- Remember to reset `skip` to 0 when the search or the sort changes.
- `useDebouncedValue(search, 300)` avoids a request on every keystroke.
- Cell text does not wrap: wide tables scroll horizontally. Add `whitespace-normal` to a cell to let it wrap.

**Keeping the state in the URL (react-router)** — shared links and the back button keep the page and the sort:

```tsx
const [params, setParams] = useSearchParams();
const ordering = params.get('ordering') ?? '';
const skip = Number(params.get('skip') ?? 0);

const update = (key: string, value: string | number) =>
  setParams((p) => {
    value ? p.set(key, String(value)) : p.delete(key);
    if (key !== 'skip') p.delete('skip');
    return p;
  }, { replace: true });

<DataTable ordering={ordering} onOrderingChange={(o) => update('ordering', o)}
  pagination={data} onSkipChange={(s) => update('skip', s)}>
```

### Searching a list (Combobox, Autocomplete)

Pick the component that fits the need:

| Need                                                                | Component                                         |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| Few options (fewer than 10), no typing                              | `Select`                                          |
| Pick from a long list by typing to filter (client, employee)        | `Combobox` + `ComboboxInput`                      |
| Several choices, shown as chips                                     | `<Combobox multiple>` + `ComboboxChips`           |
| A field that looks like a Select, with a search inside the dropdown | `Combobox` + `ComboboxTrigger` + `ComboboxSearch` |
| Free text with suggestions (city, description, address)             | `Autocomplete`                                    |

```tsx
<Field>
  <FieldLabel>Client</FieldLabel>
  <Combobox items={clients}>
    <ComboboxInput placeholder="Search for a client" />
    <ComboboxContent>
      <ComboboxEmpty>No client found.</ComboboxEmpty>
      <ComboboxList>
        {(client: Client) => (
          <ComboboxItem key={client.id} value={client}>
            {client.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
</Field>
```

- `items` takes the full list, which `ComboboxList` renders once filtered. Objects are filtered and displayed
  through their `label` property. Otherwise, pass `itemToStringLabel` to the `Combobox`.
- **Several choices**: `<Combobox multiple>` with `<ComboboxChips placeholder="…" />`. Backspace removes the
  last chip. `chipLabel` sets the chips' text.
- **Dropdown with search**: replace `ComboboxInput` with
  `<ComboboxTrigger><ComboboxValue placeholder="Choose…" /></ComboboxTrigger>` and add
  `<ComboboxSearch placeholder="Search…" />` at the top of `ComboboxContent`.
- **Groups**: `items={[{ value: 'Consulting', items: [...] }]}`, then `ComboboxGroup`, `ComboboxGroupLabel` and
  `ComboboxCollection` inside `ComboboxList`.
- **Store IDs** rather than objects: `createComboboxItems(clients, { getValue: (c) => c.id, getLabel: (c) => c.name })`.
- `ComboboxEmpty` and `ComboboxStatus` stay mounted so screen readers announce them. Make their **content**
  conditional, not the component.

**Results from an API**: turn off local filtering and query the API on each keystroke.

<!-- prettier-ignore -->
```tsx
const [query, setQuery] = useState('');
const debounced = useDebouncedValue(query, 300);
const { data = [], isPending } = useClients(debounced); // keep the selected client in the list

<Combobox items={data} filter={null} onInputValueChange={setQuery} value={client} onValueChange={setClient}>
  <ComboboxInput placeholder="Search for a client" />
  <ComboboxContent>
    <ComboboxStatus loading={isPending}>{isPending ? 'Searching…' : null}</ComboboxStatus>
    <ComboboxEmpty>{!isPending && query ? 'No client found.' : null}</ComboboxEmpty>
    <ComboboxList>
      {(c: Client) => (
        <ComboboxItem key={c.id} value={c}>
          {c.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

`Autocomplete` is used the same way (`AutocompleteInput`, `AutocompleteContent`, `AutocompleteList`,
`AutocompleteItem`…). Its value is the **typed text**, a string read with `value` / `onValueChange`:
a suggestion only completes that text. `autoHighlight` lets Enter accept the first suggestion.

The buttons' accessible labels (`clearLabel`, `triggerLabel`, `removeLabel`) are in English by default.

### Sidebar

`Sidebar` follows the API of the shadcn/ui sidebar: `SidebarProvider` lays out the page and holds the
open/collapsed state, `Sidebar` contains the navigation, `SidebarInset` the main content.

```tsx
<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>…</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/invoices" />} isActive tooltip="Invoices">
              <ReceiptText />
              <span>Invoices</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>3</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>…</SidebarFooter>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <SidebarInsetHeader>
      <SidebarTrigger>
        <PanelLeft />
      </SidebarTrigger>
      Invoices
    </SidebarInsetHeader>
    …
  </SidebarInset>
</SidebarProvider>
```

- `variant`: `floating` (glass panel set off the edges, default) or `sidebar` (attached to the page edge).
- `SidebarTrigger` takes its icon as children, from any icon library (`PanelLeft` from Lucide above). `label` sets its accessible name.
- `collapsible`: `offcanvas` (slides off screen, default), `icon` (keeps only the icons, with labels shown as
  tooltips via `tooltip`) or `none`. `side`: `left` or `right`.
- Below 768 px, it opens in a `Sheet`; `useSidebar().setOpenMobile(false)` closes it after navigating.
- Widths: `--hx-sidebar-width` (16rem), `--hx-sidebar-width-icon` (3rem), `--hx-sidebar-width-mobile` (the screen width minus 3rem, up to 24rem),
  to override through `style` on `SidebarProvider`.
- Links: `render={<a href="…" />}` or your router's `Link` on `SidebarMenuButton`; `SidebarMenuSubButton`
  renders a link by default.
- Collapsible submenus: `SidebarMenuCollapsible` + `SidebarMenuCollapsibleTrigger` + `SidebarMenuCollapsibleContent`
  (which contains a `SidebarMenuSub`).
- `SidebarInsetHeader` is the content's glass header (sidebar button, title, actions). It stays visible at the top
  of the page and blurs what scrolls underneath. `variant`: `floating` (panel aligned with a floating sidebar,
  default) or `attached` (bar attached to the top, to pair with `variant="sidebar"`).
- The bar is `sticky`, not fixed: it stays in the page flow, even inside a container.
- The `useMediaQuery('(max-width: 767px)')` hook, used for the switch to mobile, is exported too.

**Remembering the state between visits**: control `open` and save it.

```tsx
const [open, setOpen] = useState(() => localStorage.getItem('sidebar') !== 'closed');

<SidebarProvider
  open={open}
  onOpenChange={(value) => {
    setOpen(value);
    localStorage.setItem('sidebar', value ? 'open' : 'closed');
  }}
>
```

### Command palette (Command)

`Command` is a filterable list of actions: type to filter, the arrow keys move the selection, Enter runs the
highlighted action. It is always open: place it in a `CommandDialog`, a `Popover` or a panel.

<!-- prettier-ignore -->
```tsx
const [open, setOpen] = useState(false); // open it with a button or a ⌘K shortcut

<CommandDialog open={open} onOpenChange={setOpen}>
  <Command items={groups}>
    <CommandInput placeholder="Search for an action…" />
    <CommandEmpty>No action found.</CommandEmpty>
    <CommandList>
      {(group: Group) => (
        <CommandGroup key={group.value} items={group.items}>
          <CommandGroupLabel>{group.value}</CommandGroupLabel>
          <CommandCollection>
            {(action: Action) => (
              <CommandItem key={action.value} value={action} onClick={() => run(action)}>
                {action.label}
              </CommandItem>
            )}
          </CommandCollection>
        </CommandGroup>
      )}
    </CommandList>
  </Command>
</CommandDialog>
```

- `items` takes every entry (or groups `{ value, items }`): this is what enables filtering. Objects are
  filtered on their `label` property.
- Unlike `cmdk` (used by shadcn/ui), entries are not declared as static JSX but rendered from `items`.

### Notifications (Toast)

Place `ToastProvider` once around the application, then use `useToast` anywhere below it:

<!-- prettier-ignore -->
```tsx
<ToastProvider>
  <App />
</ToastProvider>

const toast = useToast();
toast.add({ type: 'success', title: 'Invoice sent', description: 'F-2026-1045 has been sent.' });
toast.add({ title: 'Project archived', actionProps: { children: 'Undo', onClick: undo } });
toast.promise(save(), {
  loading: { type: 'loading', title: 'Saving…' },
  success: { type: 'success', title: 'Saved' },
  error: { type: 'error', title: 'Could not save' },
});
```

`type`: `success`, `error`, `warning`, `info`, `loading` (picks the icon). Toasts disappear after 5 s
(`timeout`, `0` to keep them). To create them outside React (API client, store), use `createToastManager()`
and pass it to `<ToastProvider toastManager={manager}>`.

### Side panel (Sheet)

`Sheet` shows a modal panel from an edge of the screen. `side` accepts `top`, `right`, `bottom` or `left`,
and `size` accepts `sm`, `md`, `lg` or `full`. Put content that may scroll in `SheetBody`: the glass surface
stays fixed and its lit edge is never clipped by an `overflow-auto`.

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="secondary" />}>View client</SheetTrigger>
  <SheetContent side="right" size="md">
    <SheetHeader>
      <SheetTitle>Léman Immobilier SA</SheetTitle>
      <SheetDescription>Contact details and recent activity.</SheetDescription>
      <SheetCloseButton aria-label="Close panel" />
    </SheetHeader>
    <SheetBody>…</SheetBody>
    <SheetFooter>
      <SheetClose render={<Button variant="ghost" />}>Close</SheetClose>
      <Button>Edit</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### Mobile safe areas (SafeArea)

`SafeArea` keeps content clear of the notch, the status bar and the home indicator. Wrap the application root
with it:

```tsx
<SafeArea className="h-dvh" topClassName="bg-black/20">
  <App />
</SafeArea>
```

- The top and bottom insets are separate bands, styled with `topClassName` and `bottomClassName` (a background
  matching the header, for example). Left and right insets are padding.
- Insets stay at 0 unless the page opts in with `viewport-fit=cover`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## Customization

The default palette is indigo on neutral grays: cool hues stay luminous behind glass.
Three color roles:

| Token          | Value                            | Usage                                                               |
| -------------- | -------------------------------- | ------------------------------------------------------------------- |
| `--hx-brand`   | `#6366f1`                        | Decorative: background glows, list hover.                           |
| `--hx-primary` | `#4f46e5`                        | Checked controls and bars (switch, checkbox, slider, progress).     |
| `--hx-accent`  | `#4f46e5` light / `#818cf8` dark | Brand color on top of a surface: icons, focus borders, check marks. |

Override the CSS variables after importing the styles:

```css
:root {
  --hx-liquid-blur: 12px;
}
.dark {
  --hx-accent: #a5b4fc;
}
```

If you change `--hx-primary`, check that the `--hx-primary-fg` text keeps a contrast of at least 4.5:1.

The material details can be tuned, and each one is turned off with `none`:

```css
:root {
  --hx-glass-grain: none; /* fine grain */
  --hx-glass-sheen: none; /* highlight at the top of surfaces */
  --hx-glass-edge: none; /* lit edge */
}
```

Available tokens: `--hx-fg`, `--hx-fg-muted`, `--hx-fg-subtle`, `--hx-brand`, `--hx-primary(-hover|-fg)`, `--hx-accent`,
`--hx-danger(-hover|-fg)`, `--hx-stain-*`, `--hx-primary-stain(-text)`, `--hx-danger-stain(-text)`, `--hx-ring`, `--hx-glass-thin`, `--hx-glass`, `--hx-glass-strong`,
`--hx-glass-dialog`, `--hx-glass-field`, `--hx-glass-border`, `--hx-liquid-*`, `--hx-pane-*`,
`--hx-tint-hover`, `--hx-tint-active`, `--hx-backdrop-*`… The full list, with the light and dark values, is in
[`src/styles/index.css`](https://github.com/noah-bar/HexUI/blob/main/src/styles/index.css).

### Stained glass (primary and danger buttons)

`glass-stained` is a dense colored pane with white text: vertical gradient (lighter at the top, denser at the
bottom), fine grain, no glow, and a lit border in the glass color. It is the same button in both themes and on
every page: the pane darkens what is behind it itself, so the white text holds on a pale page (at least 5.3:1
measured over a bright photo) while the page still shows through.

- Color: `--hx-stain` (glass) and `--hx-stain-text` (text), as the danger button does with `--hx-danger-stain`
  and `--hx-danger-stain-text`.
- Density: `--hx-stain-top` and `--hx-stain-bottom` (top and bottom of the gradient), `--hx-stain-hover` (added on
  hover), to be set per theme. `--hx-stain-tone` is how much the pane darkens its backdrop. If you lower either,
  check the text contrast again.

### Tinted glass (checked controls and bars)

`glass-tint` is the colored glass of a checked switch, checkbox or radio, and of the filled part of a slider or a
progress bar: a pane at 60%, denser at the bottom, with a frame in its own color and a recessed top. Like the
buttons it darkens what is behind it, so the state reads at a glance on any page. It uses `--hx-primary` by
default.

- Color: `--hx-tint-fill` and `--hx-tint-fill-hover` (a complete progress bar sets them to `--hx-success`). The
  frame and the colored shadow follow.
- Density and frame: `--hx-tint-density`, `--hx-tint-frame`, `--hx-tint-glow`. Keep at least 4.5:1 between the
  pane and its white mark.

## Liquid glass

Liquid glass is the library's material: there is nothing to turn on.

- **Panes, not frost.** Surfaces blur what is behind them only lightly (`--hx-liquid-blur`), and their rim bends
  it like the rounded edge of a thick piece of glass. Dialogs, sheets and the command palette keep a stronger
  frost, so what is behind them is never readable.
- **Clear glass over a picture.** In the dark theme, or over a `Backdrop` image, every surface becomes a nearly
  transparent pane and surfaces only differ by how thick their veil is. To keep text readable over anything, each
  pane evens out its own backdrop, toward the side the theme writes on: the dark theme darkens it and writes in
  white, the light theme lightens it and writes in dark. A plain light page has nothing to show through and
  keeps the regular veils.
- **Refraction** is drawn by a small engine that starts with the library. It gives each surface an SVG
  displacement filter at its own size and corner radius, shares filters between surfaces of the same shape, and
  pauses on a surface while it resizes. Only Chromium browsers run such a filter in `backdrop-filter`: elsewhere
  surfaces are the same panes without the bent rim.

### Letting the user adjust it

The `useLiquidGlass` hook holds the user's own glass settings: how much the glass blurs what is behind it, and
whether its rim bends it. They apply to the whole page and are remembered in `localStorage`. Build the control
you want with it, for example a slider and a switch on a settings page:

```tsx
import { Button, Slider, Switch, useLiquidGlass } from '@hxtc/hexui';

function GlassSettings() {
  const { blur, refraction, refractionSupported, customized, setBlur, setRefraction, reset } = useLiquidGlass();

  return (
    <>
      <Slider
        label="Glass blur"
        showValue
        min={0}
        max={24}
        value={blur}
        onValueChange={(value) => setBlur(Number(value))}
      />
      {refractionSupported && (
        <label>
          Refraction <Switch checked={refraction} onCheckedChange={setRefraction} />
        </label>
      )}
      <Button variant="ghost" disabled={!customized} onClick={reset}>
        Reset
      </Button>
    </>
  );
}
```

- `blur` is the blur in effect, in px: the user's choice, or the theme's value.
- `refractionSupported` is `false` in browsers that cannot render the refraction: hide the switch there.
- `customized` tells whether the user changed anything; `reset` goes back to the theme's values.

To avoid a flash of the default glass on load, render `liquidGlassScript` in `<head>`, next to `themeScript`:

```tsx
<script dangerouslySetInnerHTML={{ __html: liquidGlassScript }} />
```

### Tokens

The defaults are set with CSS variables, on the root or on any subtree:

```css
:root {
  --hx-liquid-blur: 8px; /* blur of a pane (6px in the dark theme) */
  --hx-liquid-bezel: 28px; /* width of the refracting rim */
  --hx-liquid-bend: 30px; /* how far the rim shifts what is behind it; 0 keeps a surface flat */
  --hx-liquid-fringe: 0; /* color fringing in the rim, 0 to 1: triples the work of each surface */
}
```

`--hx-pane-tone` is the filter a pane applies to its backdrop over a picture (per theme), and `--hx-liquid-rim` the inner
glow of its edge.

The engine watches the document it was loaded in. For another document (an iframe you render into), call
`startLiquidGlass()` there; it returns a function that stops it.

## Working with glass

A few rules to follow when you build your own elements on top of HexUI surfaces.

### Hover and selection

- **Inside a glass surface** (table rows, list items, ghost button): use a light veil, `--hx-tint-hover` /
  `--hx-tint-active`. Never put an opaque gray there: it erases the glass effect.
- **On an element that is itself glass** (secondary button): swap the glass itself, with `--hx-glass-hover` /
  `--hx-glass-active`.

### Blurred elements inside a glass surface

Surfaces (`glass-thin`, `glass`, `glass-strong`, `glass-dialog`) do not blur by themselves: their blur is carried
by an `::after` pseudo-element placed behind their content, set by `--hx-glass-filter` (`none` turns it off). This way, a blurred element
placed inside (sticky header, floating bar, button) does blur the surface's content. In Chrome, an element that has
a `backdrop-filter` itself prevents its children from blurring what it contains.
So do not use `::after` on a glass surface, nor a negative `z-index` inside it: the blur would cover it.

Popups (menus, selects, popovers, dialogs, tooltips) and toasts are the exception: they fade in, and a fading
element hides the page from its children's blur, so they carry the filter themselves. A blurred element placed
inside one only blurs the popup's own tint.

### Scrolling inside a glass surface

Do not put `overflow: auto` directly on a glass surface (Panel, Card…): its lit edge overflows by 1 px and would
make it scroll horizontally and vertically. Scroll an inner container instead:

```tsx
<Panel className="flex max-h-96 flex-col">
  <div className="min-h-0 overflow-y-auto">…</div>
</Panel>
```

## API reference

Each entry lists the exports of a component and its main options. Props not listed here are those of the matching
[Base UI](https://base-ui.com/react/components) primitive. Prop types are exported next to the components
(`ButtonProps`, `DataTableProps`…).

- **Autocomplete** — `Autocomplete`, `AutocompleteInput` (`clearable`), `AutocompleteContent`, `AutocompleteList`,
  `AutocompleteItem`, `AutocompleteEmpty`, `AutocompleteStatus` (`loading`), `AutocompleteGroup`,
  `AutocompleteGroupLabel`, `AutocompleteCollection`, `AutocompleteSeparator`, `useAutocompleteFilter`. Free text
  with suggestions, see [the guide](#searching-a-list-combobox-autocomplete).
- **Avatar** — `Avatar` (`size`: `xs`, `sm`, `md`, `lg`; `shape`: `circle`, `square`), `AvatarImage`,
  `AvatarFallback` (initials or icon, shown until the image has loaded), `AvatarGroup` (overlapping avatars),
  `avatarVariants`.
- **Backdrop** — `Backdrop`. Variants `mesh`, `aurora`, `plain`; textures `grain`, `grid`; `image`, `imageBlur`,
  `overlay`. See [Page background](#page-background).
- **Badge** — `Badge`, `badgeVariants`. Statuses `neutral`, `info`, `success`, `warning`, `danger`; `dot` for a
  status dot; icons accepted.
- **Button** — `Button`, `buttonVariants`. Variants `primary`, `secondary`, `outline`, `ghost`, `danger`; sizes
  `sm`, `md`, `lg`, `icon`.
- **Card** — `Card` (a `Panel` with a vertical layout and `p-6` by default; accepts `variant` and `render`),
  `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Checkbox** — `Checkbox`. Checked, `indeterminate` and invalid states (`aria-invalid` or inside an invalid
  `Field`).
- **Collapsible** — `Collapsible`, `CollapsibleTrigger` (style it with `render={<Button variant="ghost" />}`),
  `CollapsibleChevron` (rotates when open), `CollapsibleContent` (animated height; `hiddenUntilFound` for the
  browser's find-in-page).
- **Combobox** — `Combobox`, `ComboboxInput` (`clearable`), `ComboboxChips` (multiple selection),
  `ComboboxTrigger` + `ComboboxSearch` (dropdown with search), `ComboboxValue`, `ComboboxContent`, `ComboboxList`,
  `ComboboxItem`, `ComboboxEmpty`, `ComboboxStatus` (`loading`), `ComboboxGroup`, `ComboboxGroupLabel`,
  `ComboboxCollection`, `ComboboxSeparator`, `useComboboxFilter`, `createComboboxItems`. See
  [the guide](#searching-a-list-combobox-autocomplete).
- **Command** — `Command` (`items`), `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`,
  `CommandGroupLabel`, `CommandCollection`, `CommandItem` (`onClick`), `CommandShortcut`, `CommandSeparator`,
  `CommandDialog`. See [the guide](#command-palette-command).
- **DataTable** — `DataTable`, `DataTableHeader`, `DataTableSortableHead`, `DataTableBody`, `nextOrdering`, with
  built-in pagination; `DataTableRow`, `DataTableHead`, `DataTableCell`, `DataTableFooter`, `DataTableCaption`,
  `DataTableEmpty` (same as their `Table*` counterparts). See [the guide](#data-table-datatable).
- **Dialog** — `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
  `DialogFooter`, `DialogClose`.
- **DropdownMenu** — `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`,
  `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuGroup`,
  `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`,
  `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. The shadcn/ui names for `Menu` (same components, same
  rendering).
- **Field** — `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldItem`. Automatically links label,
  help text and error to the control; `<Field invalid>` or native validation (`required`, `validationMode`) turns
  the field red.
- **FieldRow** — `FieldRow`. Several `Field`s on one row, stacked when the row gets too narrow (container query:
  also works in a dialog or a side panel); `columns` (`3` or `"1fr 3fr"`), `stackBelow` (`sm`, `md`, `lg` by
  default, `xl`).
- **Input** — `Input`. Error state with `aria-invalid` (or automatically inside an invalid `Field`); same
  behavior on `SelectTrigger`.
- **InputNumber** — `InputNumber` (`min`, `max`, `step`, `decimalPlaces` — `0` by default, `required`, `format`,
  `locale`, `showSteppers`, `align`). Left-aligned and without −/+ buttons by default; an emptied `required` field
  goes back to `0` on blur; arrow keys, Shift for `largeStep`; CHF amounts and percentages via `format`.
- **Label** — `Label`. Label for a control outside a `Field` (switch, inline checkbox); dims with the disabled
  control it wraps.
- **Menu** — `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem` (`variant="danger"`), `MenuShortcut`,
  `MenuSeparator`, `MenuGroup`, `MenuGroupLabel`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuSub`,
  `MenuSubTrigger`, `MenuSubContent`.
- **Menubar** — `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`
  (`variant="danger"`), `MenubarShortcut`, `MenubarSeparator`, `MenubarGroup`, `MenubarLabel`,
  `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubTrigger`,
  `MenubarSubContent`, `menubarVariants`. Menu bar (File, Edit…) in thin glass, or without background with
  `variant="ghost"` (inside a glass header); its items are those of `Menu`.
- **Pagination** — `Pagination` (`page`, `totalPages`, `onPageChange`, `maxVisible`, labels), `getVisiblePages`.
  Usable on its own, outside a table.
- **Panel** — `Panel`, `panelVariants`. Glass surface with `p-2` by default; variants `thin`, `default`,
  `strong`; `render` prop to change the element (`<aside />`, `<section />`…).
- **Popover** — `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`,
  `PopoverClose`. Free-form floating panel (filters, details, small forms).
- **Progress** — `Progress` (`value`, `null` for an unknown duration; `label`, `showValue`, `format`, `locale`).
  Progress bar that turns green once complete.
- **Radio** — `RadioGroup`, `Radio`.
- **SafeArea** — `SafeArea` (`topClassName`, `bottomClassName`). See [the guide](#mobile-safe-areas-safearea).
- **Select** — `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`,
  `SelectGroupLabel`, `SelectSeparator`.
- **Separator** — `Separator` (`orientation`). Thin line between two groups of content.
- **Sheet** — `Sheet`, `SheetTrigger`, `SheetContent` (`side`, `size`), `SheetHeader`, `SheetTitle`,
  `SheetDescription`, `SheetCloseButton`, `SheetBody`, `SheetFooter`, `SheetClose`, `sheetContentVariants`. See
  [the guide](#side-panel-sheet).
- **Sidebar** — `SidebarProvider`, `Sidebar` (`variant`, `collapsible`, `side`), `SidebarTrigger`, `SidebarRail`,
  `SidebarInset`, `SidebarInsetHeader` (`variant`), `SidebarHeader`, `SidebarContent`, `SidebarFooter`,
  `SidebarSeparator`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`,
  `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (`isActive`, `tooltip`, `size`), `SidebarMenuAction`,
  `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`,
  `SidebarMenuCollapsible`, `SidebarMenuCollapsibleTrigger`, `SidebarMenuCollapsibleContent`, `useSidebar`,
  `sidebarMenuButtonVariants`. See [the guide](#sidebar).
- **Skeleton** — `Skeleton`. Animated loading placeholder.
- **Slider** — `Slider` (`label`, `showValue`, `format`, `locale`, `min`, `max`, `step`, `orientation`). An array
  value gives a two-thumb range, named by `thumbLabels`.
- **Spinner** — `Spinner` (`size`: `xs`, `sm`, `md`, `lg`; `tone`: `current`, `muted`, `accent`; `label` for
  screen readers when it stands alone), `spinnerVariants`. Keeps spinning, more slowly, when the user reduces
  motion.
- **Switch** — `Switch`.
- **Table** — `Table` (`density`), `TableHeader`, `TableBody`, `TableFooter`, `TableRow` (`selected`),
  `TableHead` (`align`, `sortDirection`, `onSort`), `TableCell` (`align`), `TableCaption`, `TableEmpty`. Place it
  in a `Panel`; built-in horizontal scrolling for wide tables.
- **Tabs** — `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`.
- **Textarea** — `Textarea`. Same states as `Input`, vertically resizable.
- **Toast** — `ToastProvider`, `useToast`, `createToastManager`. See [the guide](#notifications-toast).
- **Toggle** — `Toggle` (`variant`: `default`, `outline`; `size`: `sm`, `md`, `lg`), `ToggleGroup` (single
  choice, or `multiple`), `toggleVariants`. Two-state button, pressed with the same glass as the sidebar's active
  item.
- **Tooltip** — `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`.
- **Hooks and utilities** — `useTheme`, `themeScript`, `useLiquidGlass`, `liquidGlassScript`, `useMediaQuery(query)`,
  `useDebouncedValue(value, delay)` (300 ms by default), `cn(...classes)`, `startLiquidGlass()` (see [Liquid glass](#liquid-glass)).

## Browser support

HexUI targets current versions of Chrome, Edge, Firefox and Safari. The refraction of the rim only shows in
Chromium browsers (Chrome, Edge, Brave…); Firefox and Safari render the same panes without it. Glass surfaces
become opaque automatically when the browser does not support `backdrop-filter`, when the user turns on "Reduce
transparency", and in forced-colors (high contrast) mode. Animations are reduced when the user asks for reduced motion.

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/noah-bar/HexUI/issues).

```bash
git clone https://github.com/noah-bar/HexUI.git
cd HexUI
npm install
npm run dev              # Storybook at http://localhost:6006
npm run build            # Library build in dist/ (ESM + .d.ts + hexui.css)
npm run typecheck
npm run lint             # ESLint (typescript-eslint, React hooks, Storybook)
npm run format           # Prettier: format every file (format:check only checks)
npm run build-storybook  # Static Storybook in storybook-static/
```

```
src/
  styles/index.css         # tokens, glass utilities, accessibility fallbacks
  lib/cn.ts                # class merging (tailwind-merge configured for the hx prefix)
  components/<name>/       # component + stories
  index.ts                 # public exports
.storybook/                # Storybook config (its own vite.config, separate from the library build)
```

To add a component:

1. Create `src/components/<name>/<Name>.tsx` by wrapping the matching Base UI primitive.
2. Prefix every Tailwind class with `hx:` and use `mergeClassName` for the `className` prop.
3. Add `<Name>.stories.tsx` next to it, then export it from `src/index.ts`.

## License

[MIT](https://github.com/noah-bar/HexUI/blob/main/LICENSE) © Hex-Tech
