# Exercise Teaching Media Library Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragile robot demo approach with a stable whole-library teaching media pipeline so every exercise has a local proper image, a local mistake image, and a local explainer video.

**Architecture:** Keep the existing exercise detail page contract, but swap the underlying asset pipeline from per-exercise ad hoc demos to a reusable render system driven by exercise ids. Use consistent pose cards and explainer-video scenes so the library can be batch-rendered and validated for all exercises, including newly added gym-only movements.

**Tech Stack:** Next.js, TypeScript, Vitest, PowerShell, HyperFrames render scripts, local generated PNG/MP4 assets

---

## File Map

- Modify: `D:\健身\src\lib\exercise-teaching-media.ts`
  - Resolve media with explicit whole-library expectations and clearer fallback order.
- Modify: `D:\健身\src\app\dashboard\exercises\[exerciseId]\page.tsx`
  - Keep the UI contract but present local proper/mistake/demo assets consistently.
- Modify: `D:\健身\videos\exercise-teaching\scripts\render-exercise-demos.mjs`
  - Batch-render proper images, mistake images, and demo videos for the whole library.
- Modify or replace: `D:\健身\videos\exercise-teaching\scripts\exercise-demo-composition.mjs`
  - Build a stable explainer composition based on proper/mistake poses instead of the current fragile full-body robot motion.
- Create if needed: `D:\健身\videos\exercise-teaching\scripts\exercise-pose-library.mjs`
  - Central pose definitions for every exercise id, including proper and mistake states.
- Modify: `D:\健身\videos\exercise-teaching\index.html`
  - Sync with the new composition output.
- Create or update assets: `D:\健身\public\media\exercises\generated\*.png`, `D:\健身\public\media\exercises\generated\*.mp4`
  - Whole-library local teaching media.
- Modify tests: `D:\健身\videos\exercise-teaching\scripts\exercise-demo-composition.test.ts`
  - Verify the new composition structure.
- Create tests: `D:\健身\src\lib\exercise-teaching-media.test.ts`
  - Verify media resolution prefers full local assets and degrades predictably.

## Task 1: Lock Coverage Requirements in Tests

**Files:**
- Create: `D:\健身\src\lib\exercise-teaching-media.test.ts`
- Modify: `D:\健身\videos\exercise-teaching\scripts\exercise-demo-composition.test.ts`

- [ ] **Step 1: Write failing media resolution tests**

Add tests that prove:
- an exercise with local `proper`, `mistake`, and `demo` resolves all local assets
- an exercise missing `mistake` falls back to textual mistakes only
- an exercise missing `demo` falls back to external video

- [ ] **Step 2: Run tests to verify failure**

Run: `npm.cmd test -- src/lib/exercise-teaching-media.test.ts videos/exercise-teaching/scripts/exercise-demo-composition.test.ts`

Expected: fail because the new resolution expectations and composition structure do not exist yet.

- [ ] **Step 3: Expand composition test to cover the new stable explainer structure**

Check for:
- proper pose card region
- mistake pose card region
- explicit correct/incorrect markers
- motion or cue overlays that do not depend on broken articulated robot limbs

- [ ] **Step 4: Re-run the same tests and confirm they still fail for the right reason**

Run: `npm.cmd test -- src/lib/exercise-teaching-media.test.ts videos/exercise-teaching/scripts/exercise-demo-composition.test.ts`

Expected: fail on missing implementation, not syntax errors.

## Task 2: Replace the Fragile Demo Composition

**Files:**
- Modify or replace: `D:\健身\videos\exercise-teaching\scripts\exercise-demo-composition.mjs`
- Create if needed: `D:\健身\videos\exercise-teaching\scripts\exercise-pose-library.mjs`

- [ ] **Step 1: Implement a reusable pose library for all 15 exercise ids**

Define a proper pose and a common mistake pose or mistake emphasis for:
- `warmup-march`
- `bodyweight-squat`
- `glute-bridge`
- `incline-push-up`
- `dumbbell-row`
- `band-row`
- `plank`
- `treadmill-walk`
- `step-cardio`
- `lat-pulldown`
- `machine-chest-press`
- `seated-cable-row`
- `goblet-squat`
- `leg-press`
- `stretch-full-body`

- [ ] **Step 2: Build a stable composition that uses pose cards instead of the current articulated robot**

Render:
- one proper visual
- one incorrect visual
- red/green markers
- action title
- 2-3 short cues
- 1-2 common mistakes

The video may use subtle camera motion or transitions, but the body structure must remain anatomically stable.

- [ ] **Step 3: Make `stretch-full-body` the first corrected proof point**

Ensure `stretch-full-body` no longer uses the current broken motion style and instead shows:
- proper upright reach / side bend sequencing
- highlighted target area
- stable body proportions

- [ ] **Step 4: Run composition tests**

Run: `npm.cmd test -- videos/exercise-teaching/scripts/exercise-demo-composition.test.ts`

Expected: pass.

## Task 3: Upgrade the Render Pipeline to Whole-Library Output

**Files:**
- Modify: `D:\健身\videos\exercise-teaching\scripts\render-exercise-demos.mjs`
- Modify: `D:\健身\videos\exercise-teaching\index.html`

- [ ] **Step 1: Refactor the renderer so it can generate three assets per exercise**

For each exercise id, render or copy:
- `<id>-proper.png`
- `<id>-mistake.png`
- `<id>-demo.mp4`

- [ ] **Step 2: Add whole-library batch support**

Running the script without arguments should render the full library, not only the legacy subset.

- [ ] **Step 3: Add focused rerender support**

Keep support for targeting one or several exercise ids so local iteration stays fast.

- [ ] **Step 4: Run a targeted render for `stretch-full-body` first**

Run: `node .\videos\exercise-teaching\scripts\render-exercise-demos.mjs stretch-full-body`

Expected: fresh local proper/mistake/demo assets for `stretch-full-body`.

## Task 4: Fill the Whole Library Asset Gap

**Files:**
- Update assets under: `D:\健身\public\media\exercises\generated\`

- [ ] **Step 1: Render the four missing gym-only exercises**

Generate local assets for:
- `machine-chest-press`
- `seated-cable-row`
- `goblet-squat`
- `leg-press`

- [ ] **Step 2: Backfill mistake images for the already-covered 11 exercises**

Generate local `mistake.png` for every existing action that already has a proper image and demo.

- [ ] **Step 3: Run the full-library render**

Run: `node .\videos\exercise-teaching\scripts\render-exercise-demos.mjs`

Expected: all 15 exercise ids have local proper, mistake, and demo assets.

- [ ] **Step 4: Spot-check output files**

Confirm the generated directory contains:
- 15 `-proper.png`
- 15 `-mistake.png`
- 15 `-demo.mp4`

## Task 5: Wire the Detail Page to the Stronger Local Asset Contract

**Files:**
- Modify: `D:\健身\src\lib\exercise-teaching-media.ts`
- Modify: `D:\健身\src\app\dashboard\exercises\[exerciseId]\page.tsx`
- Test: `D:\健身\src\lib\exercise-teaching-media.test.ts`

- [ ] **Step 1: Implement the media-resolution changes**

Prefer local assets in this order:
- proper image from generated assets
- mistake image from generated assets
- local demo video from generated assets
- external guide only when local demo is truly absent

- [ ] **Step 2: Keep the exercise detail UI honest**

If local mistake art is missing, show the textual mistake list without pretending there is a dedicated local mistake image.

- [ ] **Step 3: Verify tests**

Run: `npm.cmd test -- src/lib/exercise-teaching-media.test.ts`

Expected: pass.

## Task 6: Verify the Full User Experience

**Files:**
- No new files required; verify runtime behavior against the local app

- [ ] **Step 1: Run focused test suite**

Run: `npm.cmd test -- src/lib/exercise-teaching-media.test.ts videos/exercise-teaching/scripts/exercise-demo-composition.test.ts`

Expected: pass.

- [ ] **Step 2: Run full related suite**

Run: `npm.cmd test -- src/lib/exercise-library.test.ts src/lib/exercise-teaching-media.test.ts videos/exercise-teaching/scripts/exercise-demo-composition.test.ts`

Expected: pass.

- [ ] **Step 3: Run typecheck**

Run: `npm.cmd run typecheck`

Expected: pass.

- [ ] **Step 4: Run build**

Run: `npm.cmd run build`

Expected: pass.

- [ ] **Step 5: Verify in the running app**

Check at least:
- `http://127.0.0.1:3000/dashboard/exercises/stretch-full-body?week=1&day=1`
- one gym-only exercise detail page
- one home-only exercise detail page

Expected:
- correct proper image
- local mistake image or explicit textual fallback
- local demo video that renders correctly

