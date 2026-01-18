# Design Token Theming Checklist (Author)

Goal: make the author app fully themeable by routing UI through semantic design tokens and avoiding raw values.

## 1) Inventory + baseline
- [ ] Run a quick audit of hard-coded values (colors, sizes, shadows, z-index, durations).
- [ ] List the top 10 components/pages with the most custom CSS.
- [ ] Identify which tokens already exist in `packages/phantom-tokens` and `apps/author/app/global.css`.

## 2) Add a semantic token layer
Create semantic tokens in `apps/author/app/global.css` that map to palette tokens:
- [ ] **Color roles**: `--color-bg`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-link`, `--color-link-hover`, `--color-accent`, `--color-accent-contrast`, `--color-success`, `--color-warning`, `--color-danger`.
- [ ] **Overlay roles**: `--overlay-bg`, `--modal-bg`, `--scrim-bg`.
- [ ] **Elevation roles**: `--elevation-1`, `--elevation-2`, `--elevation-3`.
- [ ] **Radius roles**: `--radius-card`, `--radius-input`, `--radius-pill`.
- [ ] **Typography roles**: `--text-title`, `--text-subtitle`, `--text-body`, `--text-kicker`, `--text-caption`.
- [ ] **Interaction roles**: `--focus-ring`, `--hover-bg`, `--active-bg`, `--disabled-opacity`.
- [ ] **Motion roles**: `--duration-fast`, `--duration-med`, `--ease-standard`.
- [ ] **Z-index roles**: `--z-header`, `--z-modal`, `--z-overlay`, `--z-tooltip`.

## 3) Replace direct palette usage
- [ ] Replace direct `--palette-*` usage in app CSS with the semantic roles from step 2.
- [ ] Start with shared components: buttons, inputs, links, cards, modals.
- [ ] Only keep palette variables in the semantic mapping layer.

## 4) Standardize component tokens
Add component-level tokens (aliases) to reduce duplication:
- [ ] Buttons: `--button-bg`, `--button-text`, `--button-border`, `--button-hover-bg`, `--button-radius`.
- [ ] Inputs: `--input-bg`, `--input-text`, `--input-border`, `--input-focus-ring`.
- [ ] Cards: `--card-bg`, `--card-border`, `--card-radius`, `--card-shadow`.
- [ ] Pills/Badges: `--pill-bg`, `--pill-text`, `--pill-border`.
- [ ] Nav/Headers: `--nav-bg`, `--nav-text`, `--nav-border`.

## 5) Normalize layout + spacing
- [ ] Replace hard-coded spacing values with `--space-*` tokens.
- [ ] Introduce layout aliases: `--space-section`, `--space-card`, `--space-field`.
- [ ] Standardize max widths using `--layout-*` tokens.

## 6) Theme switch readiness
- [ ] Create a theme class (e.g., `.theme-alt`) in `global.css`.
- [ ] Override only the semantic token layer inside the theme class.
- [ ] Verify that switching theme class changes the entire app.

## 7) Prioritize pages to refactor
- [ ] Start Here page (featured card + grid cards)
- [ ] Reader pages (wrap-up card + nav)
- [ ] Beta readers page (cards + form)
- [ ] Admin metrics pages (cards + table + filters)

## 8) Regression checks
- [ ] Quick visual pass on light/dark
- [ ] Check focus ring visibility
- [ ] Confirm contrast on text, buttons, and links
- [ ] Validate modals and overlays against `--overlay-bg`

## 9) Ongoing guardrails
- [ ] No new raw colors or spacing in component CSS
- [ ] New styles must use semantic tokens
- [ ] Periodic audit for non-token values

## Notes / TODO
- [ ] Add theme documentation once the semantic layer is in place
- [ ] Add a simple theme toggle in admin or dev
