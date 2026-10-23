# Page-Replacement Algorithms

Standalone Python and TypeScript simulations of FIFO, LRU, MRU, LFU, MFU,
Optimal, and Clock page replacement, plus a React homepage and interactive simulators.
TypeScript scripts live in the root; the Python originals are in `python/`.
`DynamicRam` is an unfinished RAM allocation prototype
in both languages; it does not allocate memory or print output.

## Memory Lab React UI

Live homepage: https://mohamedabusurra.github.io/CPU-Scheduling-Algorithm/

The homepage displays all seven algorithms. Select any card to open its
interactive simulator, with configurable inputs, hit/fault totals, frame traces,
and a policy-specific explanation for each step.

Use Node.js 22.12 or newer and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`) and select
an algorithm. Enter
page references and choose 1–12 memory frames, then select **Run simulation**.
The UI shows hit/fault totals, a grid of frame contents (with reference bits for Clock),
and explanations for each step. Select a grid column or use the previous/next
buttons to explore the trace. Results stay tied to the last submitted input.

Continuous strings such as `abcab` use one Unicode code point per page.
Spaces or commas separate page identifiers, so `10, 20, 10` uses whole numbers
as page names. Add a trailing comma for a single multi-character identifier,
such as `10,`. Empty input and sequences above 200 references are rejected.

The React app is in `frontend/`. `shared/replacement.ts` provides the UI engines
and step explanations; `shared/clock.ts` supplies the same pure Clock engine
to both the app and the Clock CLI. Simulators default to three frames, except
Clock, which defaults to four. Set equal frame counts when comparing algorithms.
LFU retains counts after eviction; MFU resets them. Frequency ties select the
oldest resident page, and Optimal ties select the lowest frame number.
Everything runs locally
in the browser; no backend or API keys are needed.

```bash
npm run build                         # Build CLI scripts and frontend/dist/
npm run preview --workspace frontend # Preview the production UI
```

The production build uses relative asset URLs for GitHub Pages subdirectory
hosting. GitHub Pages serves the built contents of `frontend/dist/` from the
root of the `gh-pages` branch, with a `.nojekyll` file. To publish future changes,
rebuild the app and update that branch with the new build output.

## Run TypeScript

From the repository root:

```bash
npm ci
npm run build:algorithms
node dist/FIFO.js
node dist/Clock.js
```

Substitute `LRU`, `MRU`, `LFU`, `MFU`, `Optimal`, or `DynamicRam` to run another
script. Edit `reference_string` in the corresponding `.ts` file and rebuild
to try another input. Each Unicode code point represents one page. The
scripts use three frames, except Clock, which uses four. Output includes
each frame's history (starting with a blank) and page-fault/page-hit totals.
The blank space remains the original empty-frame marker; use non-space
page identifiers for meaningful simulations.

The Python originals remain runnable with commands such as `python3 python/FIFO.py`.
LFU retains frequencies after eviction; MFU resets the evicted page's
frequency. Frequency ties select the oldest resident page.

## Clock Correction

The shared Clock engine continues scanning reference bits across wraparound until it finds
a replacement frame. The Python version can skip a reference when scanning
past the last frame. The corrected sample produces **12 faults and 3 hits**;
the unchanged Python sample reports only 11 faults and 3 hits for 15 references.

## Validation

```bash
npm run typecheck
npm test
```

Tests require `python3` as well as Node. They build the TypeScript, compare
complete traces against the six unchanged Python algorithms using 50 inputs
each, and check Clock against hand-worked traces. Cases cover empty input,
repeated pages, overflow, frequency ties, Unicode, and wraparound. Test inputs
are injected in memory; source files are not rewritten. Direct execution of
all eight compiled scripts is also checked.
Additional Clock tests cover input parsing, configurable frame counts,
independent snapshots, reference-bit clearing, and hand position. The Python
test harness reads scripts from `python/` without modifying them.
UI-engine tests also compare all six added algorithms with the Python traces,
verify hand-worked examples and configurable capacities, and check Optimal
against an exhaustive search for the minimum possible faults on short inputs.

`node_modules/`, `dist/`, and Python bytecode are ignored by Git. The npm
package is private and intended for running these examples locally.
