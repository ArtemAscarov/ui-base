# ui-base

Six hand-built UI components, delivered as source you own.

`ui-base` is not a runtime dependency. It is a small CLI that **copies component
source files into your project**, the way `shadcn/ui` does. Once the files land
in your repo, they are yours: edit them, rename them, delete the CLI.

- **No runtime dependency.** The only package a component ever needs is `react`,
  and only if you picked a React or Next variant.
- **Three stacks:** Vanilla, React, Next.
- **Four flavors per stack:** JavaScript or TypeScript, plain CSS or Tailwind.
- **Keyboard and screen-reader support** is built in, not bolted on.

## Quick start

```bash
npx @artem_ascarov/ui-base list
npx @artem_ascarov/ui-base add slider --next --ts
npx @artem_ascarov/ui-base add carousel checkbox --react --ts --tw
npx @artem_ascarov/ui-base add radio --vanilla
```

Files are written to `components/ui/<Component>/` in the directory you run the
command from. Nothing else in your project is touched.

## Components

| Component | What it is |
| --------- | ---------- |
| `carousel` | Sliding carousel with dot navigation and optional autoplay |
| `checkbox` | Checkbox with indeterminate state over a native input |
| `marquee` | Looping ticker with adjustable speed and pause on hover |
| `radio` | Radio button over a native input, grouped by name |
| `select` | Custom dropdown to replace the native select element |
| `slider` | Single-value or range slider with configurable step |

## Commands

### `list`

Prints every available component with its description.

### `add <component...>`

Copies one or more components into your project.

| Flag | Meaning |
| ---- | ------- |
| `--vanilla` | Plain HTML, CSS and JavaScript (default) |
| `--react` | React component |
| `--next` | Same React component with `"use client"` prepended |
| `--ts` | TypeScript instead of JavaScript |
| `--tw` | Tailwind classes instead of a CSS file |
| `--overwrite` | Replace files that already exist |
| `--dry-run` | Print what would be written, write nothing |

`--ts` and `--tw` combine freely, which is where the four flavors come from:
nothing → JS + CSS, `--ts` → TS + CSS, `--tw` → JS + Tailwind,
`--ts --tw` → TS + Tailwind.

Existing files are **never overwritten silently** — `add` skips them and says so.
Pass `--overwrite` when you actually mean it.

## What you get

A React or Next component arrives as two files in one folder:

```
components/ui/Slider/
  Slider.tsx
  Slider.css
```

The component imports its own stylesheet (`import "./Slider.css"`), so the pair
works as soon as it lands. Tailwind flavors ship the component file only — the
styles live in the class names.

Vanilla is different. A vanilla component is a `.css` file, usually a `.js` file,
and a **markup fragment** — a piece of HTML meant to be pasted into your own
page. The fragment has no `<head>`, no `<link>`, no `<script>`, so there is
nowhere sensible to put it as a file: the CLI prints it in your terminal
instead of writing it to disk. Wiring up the stylesheet and script is yours.

`Radio` is the one component with no script at all, in every stack — grouping,
arrow keys and focus are what the browser already does with a shared `name`.

## Theming

Every component is themed with CSS custom properties, and every component
carries its own defaults. There is no global theme file to import.

That has one consequence worth knowing up front: **`:root` does not work.**

```css
:root { --checkbox-bg: red; }   /* has no effect */
.ui-checkbox { --checkbox-bg: red; }   /* works */
```

The reason is inheritance, not specificity. An inherited value only applies when
the element has no declaration of its own, and `.ui-checkbox` declares its
defaults. Override per component and it always works — the component CSS lives
in `@layer ui-base`, so any unlayered rule of yours wins regardless of selector
weight or load order.

Tailwind flavors are the exception: their tokens are applied as inline styles
(`style={{ ...tokens, ...style }}`), and inline styles beat every stylesheet.
Override those through the `style` prop instead.

## Requirements

Node.js 20.11 or newer.

## License

MIT © Artem Ascarov
