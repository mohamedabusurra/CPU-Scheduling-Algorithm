"""Run original scripts with in-memory inputs; never rewrite the Python files."""

import ast
import contextlib
import io
import json
from pathlib import Path
import sys


algorithm = sys.argv[1]
source = (Path(__file__).resolve().parent.parent / "python" / f"{algorithm}.py").read_text()
results = []

for reference_string in json.load(sys.stdin):
    tree = ast.parse(source)
    for statement in tree.body:
        if isinstance(statement, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == "reference_string"
            for target in statement.targets
        ):
            statement.value = ast.Constant(value=reference_string)
            break
    else:
        raise AssertionError("Missing reference_string assignment")
    ast.fix_missing_locations(tree)
    namespace = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(tree, f"{algorithm}.py", "exec"), namespace)
    results.append({
        "histories": [namespace[name] for name in (
            "frame_one", "frame_two", "frame_three"
        )],
        "page_faults": namespace["page_faults"],
        "page_hits": namespace["page_hits"],
    })

print(json.dumps(results))
