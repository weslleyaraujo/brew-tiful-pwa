# Plan: Post-usage Adjustments

## Context
After using the app, 8 issues were identified across multiple screens—ranging from inverted Aeropress UX, dark mode visual bugs, interaction hierarchy, card redesign, and mobile safe-area padding. This plan addresses all 8 in a single pass.

---

## Approach

### 1. Inverted Aeropress — native step treatment
Add a new `INVERT_AEROPRESS` step to the `StepEnum` in types.ts. Add it as the first step in `aeropress-inverted.json`. This step appears naturally in the BrewScreen flow (no timer, just an instruction) so the user sees they need to invert before starting. Add a matching title in `format.ts`. Use a `RotateCw` icon from lucide-preact displayed next to the step title for a visual "flip" cue.

### 2. Top-right water bubble — subdued dark-mode-friendly style
In BrewScreen, change the water indicator from solid `bg-[var(--color-amber)]` with white text to a subdued background (`bg-[var(--color-amber)]/15`) with strong orange text (`text-[var(--color-amber)]`) and a subtle ring. This works on both light and dark.

### 3. BrewCompleteScreen — reorder actions + remove rating
- Swap button hierarchy: "Back to Home" becomes the primary filled button; "Brew Again" becomes secondary/outlined.
- Remove the rating stars section entirely (user can't rate before tasting). Keep only the celebration + stats + notes (optional) + actions.
- **Rate later**: Add tappable star-rating to each brew card in `BrewHistoryScreen`, so users can rate their brews when they review history later. The `Stars` component already exists — just make each star a button that calls `updateBrew`.

### 4. RecipeScreen — redesign the hero card
Replace the current card-based layout with a minimal, airy layout:
- Beans grams and Water ml as large, prominent standalone numbers (no card wrapper).
- Secondary stats (ratio, temp, time, grind) as a compact row below, separated by a subtle divider.
- Grind indicator simplified to a small linear bar or badge row (keep it but less heavy).

### 5. "Brew Again" cards — whole card pressable + orange action + adjusted badge
In `BrewsForRecipeSection`:
- Wrap the entire card in a `<button>` so the whole row is tappable.
- Replace the small play circle with a more prominent orange `Play` button.
- Make the "adjusted" text a visible `Badge` instead of faded text.

### 6. HomeScreen favorites icon — change from Heart to Bookmark
Replace the `Heart` icon with `Bookmark` (from lucide-preact) so it reads as "saved/go to favorites" rather than "favorite this screen." Keep the filled state when favorites exist.

### 7. BrewScreen recipe steps — shrink vertical padding
Reduce the large step-area padding from `pt-[calc(112px+var(--safe-top))] pb-[calc(100px+var(--safe-bottom))]` to `pt-[calc(80px+var(--safe-top))] pb-[calc(80px+var(--safe-bottom))]` and reduce the gap from `gap-6` to `gap-4` for tighter spacing.

### 8. Bottom bar — add safe-area padding
In `app.tsx`, change the `<nav>` padding from `pb-2` to `pb-[calc(8px+var(--safe-bottom))]` to match film-inventory's approach of accounting for the device home indicator on mobile.

---

## Files to modify

| File | Issues |
|---|---|
| `src/db/types.ts` | #1 — add `INVERT_AEROPRESS` to STEPS enum |
| `src/recipes/aeropress-inverted.json` | #1 — add invert step as position 0 |
| `src/lib/format.ts` | #1 — add step title for INVERT_AEROPRESS |
| `src/screens/BrewScreen.tsx` | #2 (water bubble), #7 (step padding) |
| `src/screens/BrewCompleteScreen.tsx` | #3 — swap buttons, remove rating |
| `src/screens/BrewHistoryScreen.tsx` | #3 — add tappable rating to brew cards |
| `src/screens/RecipeScreen.tsx` | #4 (hero card), #5 (brew again cards) |
| `src/screens/HomeScreen.tsx` | #6 — Heart → Bookmark icon |
| `src/app.tsx` | #8 — nav safe-bottom |

---

## Reuse
- `Badge` component (`src/components/ui/Badge.tsx`) — for #5 adjusted badge
- `STEP_TITLES` pattern in `format.ts` — add new step title
- `Bookmark` from `lucide-preact` — already installed, no new dep needed
- `--safe-bottom` CSS var already defined in `index.css`

---

## Steps

- [ ] 1. **Add `INVERT_AEROPRESS` step type**
  - In `types.ts`: add `'INVERT_AEROPRESS'` to `STEPS` array
  - In `format.ts`: add `INVERT_AEROPRESS: 'Invert Aeropress'` to `STEP_TITLES`
  - In `aeropress-inverted.json`: prepend `{ "step": "INVERT_AEROPRESS", "position": 0, "configs": [] }` and renumber existing positions

- [ ] 2. **Fix water bubble for dark mode**
  - In `BrewScreen.tsx`: change the top-right water indicator div classes from `bg-[var(--color-amber)] ... text-white` to `bg-[var(--color-amber)]/15 ... text-[var(--color-amber)] ring-1 ring-[var(--color-amber)]/30` and remove `shadow-md`

- [ ] 3a. **BrewCompleteScreen reorder + remove rating**
  - Swap the two buttons: "Back to Home" becomes `bg-[var(--color-caramel)] text-white`, "Brew Again" becomes `bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--color-separator)]`
  - Remove the entire rating section (stars + "How was it?")
  - Keep the notes textarea
- [ ] 3b. **Add rating to BrewHistoryScreen**
  - In the `Stars` component: make each star a `<button>` that calls `updateBrew(brew.id, { rating: starNumber })` on click, with `active:scale-110` feedback
  - When no rating is set, always show 5 dim stars as tappable targets (instead of returning null when `!rating`)

- [ ] 4. **RecipeScreen hero card redesign**
  - Remove the `bg-[var(--bg-card)] rounded-2xl p-5` card wrapper
  - Replace with a clean layout: large beans/water values in a row with minimal styling, a thin separator, and the secondary stats/grind row below
  - Keep the grind stepped indicator but lighter weight

- [ ] 5. **Brew again cards — full pressable + orange action + adjusted badge**
  - Wrap each brew-history card in a `<button>` with `onClick`
  - Change the play button to `bg-[var(--color-amber)]/15 text-[var(--color-amber)]` with larger icon
  - Replace `"adjusted"` text span with `<Badge variant="amber">Adjusted</Badge>`

- [ ] 6. **HomeScreen favorites icon**
  - Import `Bookmark` from lucide-preact instead of (or alongside) `Heart`
  - Replace the Heart button with a Bookmark button that navigates to favorites
  - When `favoriteIds.value.size > 0`, fill the Bookmark icon with `[var(--color-amber)]`

- [ ] 7. **Shrink BrewScreen step padding**
  - Change step container padding from `pt-[calc(112px+var(--safe-top))] pb-[calc(100px+var(--safe-bottom))]` to `pt-[calc(80px+var(--safe-top))] pb-[calc(80px+var(--safe-bottom))]`
  - Change `gap-6` to `gap-4`
  - Reduce the ambient step number from `text-[64px]` to `text-[56px]`

- [ ] 8. **Bottom bar safe-area padding**
  - In `app.tsx`: change `<nav>` pb from `pb-2` to `pb-[calc(8px+var(--safe-bottom))]`

---

## Verification
1. Open `aeropress-inverted` recipe → first step should show "Invert Aeropress" with a `RotateCw` icon and no timer
2. In BrewHistory, tap a brew card's stars to rate it → rating persists and displays immediately
3. Start a brew → water bubble should be readable in both light and dark mode
4. Complete a brew → "Back to Home" should be the primary button; no stars visible
5. Open any recipe → hero area shows beans/water prominently without the card feel
6. Scroll to "Your Brews" on a recipe → whole cards are tappable, play button is orange, adjusted badge is visible
7. HomeScreen → favorites button shows a Bookmark icon, not Heart
8. Brew screen steps → less vertical space between elements, tighter feel
9. On mobile device → bottom nav has proper safe-area padding, no clipping
