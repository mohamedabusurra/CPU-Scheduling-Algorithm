# Page-Replacement Algorithms

Standalone Python and TypeScript simulations of FIFO, LRU, MRU, LFU, MFU,
Optimal, and Clock page replacement. Matching filenames live side by side in
the repository root. `DynamicRam` is an unfinished RAM allocation prototype
in both languages; it does not allocate memory or print output.

## Run TypeScript

Use Node.js 22 or newer and npm:

```bash
npm ci
npm run build
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

The Python originals remain runnable with commands such as `python3 FIFO.py`.
LFU retains frequencies after eviction; MFU resets the evicted page's
frequency. Frequency ties select the oldest resident page.

## Clock Correction

`Clock.ts` continues scanning reference bits across wraparound until it finds
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

`node_modules/`, `dist/`, and Python bytecode are ignored by Git. The npm
package is private and intended for running these examples locally.
