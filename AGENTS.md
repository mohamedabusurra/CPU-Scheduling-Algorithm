# Repository Guidelines

## Project Structure & Module Organization

All source files live in the repository root. `FIFO.py`, `LRU.py`, `MRU.py`, `LFU.py`, `MFU.py`, `Optimal.py`, and `Clock.py` implement page-replacement simulations. Most use three frames; `Clock.py` uses four. Each script defines its input, tracks frame histories, and prints page-hit and page-fault totals. `DynamicRam.py` is an unfinished RAM allocation prototype.

There are no separate source packages, tests, or assets directories. Keep algorithm changes in the corresponding script and avoid unrelated restructuring.

## Build, Test, and Development Commands

Use Python 3 from the repository root. The scripts currently require no third-party dependencies or build step.

- `python3 FIFO.py`: run the FIFO simulation with its embedded reference string.
- `python3 Clock.py`: run the four-frame clock simulation; substitute another filename to run that algorithm.
- `python3 -m compileall -q .`: check Python syntax; this creates `__pycache__` files, which should not be committed.

Change `reference_string` in a script to explore another input; there is no shared command-line interface.

## Coding Style & Naming Conventions

Use four-space indentation and descriptive `snake_case` names, such as `page_faults` and `frame_to_replace_next`. Preserve existing algorithm filenames and their capitalization. Prefer one statement per line, omit unnecessary semicolons, and use spaces around operators. Keep replacement-policy decisions and tie-breaking behavior explicit. No formatter or linter is configured.

## Testing Guidelines

No automated testing framework or coverage threshold is configured. Run every changed script and manually verify its frame trace against a short, hand-worked example. Check that hits plus faults equal the reference-string length and each frame history contains the initial blank plus one entry per reference.

Exercise repeated pages, empty input, capacity overflow, and frequency ties. Compare algorithms using equal frame counts. If adding automated tests, prefer standard-library `unittest`, use `tests/test_<algorithm>.py`, and run `python3 -m unittest discover -s tests`.

## Commit & Pull Request Guidelines

This checkout has no Git metadata, so historical commit conventions cannot be verified. Use concise, imperative commit subjects, for example `Fix LFU tie-breaking on equal frequencies`.

Keep pull requests focused. Describe the affected algorithm, explain behavior changes, link relevant issues, and include the reference string, frame count, expected results, and validation commands. Console output is sufficient for these scripts.
