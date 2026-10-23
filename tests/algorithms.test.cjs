const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sample = "abtrkacbtlwbclt";

function run_script(algorithm, reference_string = sample) {
    let source = readFileSync(path.join(root, "dist", `${algorithm}.js`), "utf8");
    if (algorithm !== "DynamicRam") {
        const assignment = `const reference_string = "${sample}";`;
        assert.ok(source.includes(assignment), "Expected the standalone sample input");
        // Inject test input in memory without changing the runnable scripts.
        source = source.replace(assignment, () =>
            `const reference_string = ${JSON.stringify(reference_string)};`);
    }
    const output = [];
    vm.runInNewContext(source, {
        exports: {},
        console: { log: (...args) => output.push(structuredClone(args)) },
    }, { timeout: 1000 });
    return output;
}

function run_algorithm(algorithm, reference_string) {
    const output = run_script(algorithm, reference_string);
    const histories = output.slice(0, -2).map((args) => args.at(-1));
    assert.equal(output.at(-2)[0], "page faults:");
    assert.equal(output.at(-1)[0], "page hits:");
    const page_faults = output.at(-2)[1];
    const page_hits = output.at(-1)[1];
    const reference_count = Array.from(reference_string).length;
    assert.equal(page_hits + page_faults, reference_count);
    assert.equal(histories.length, algorithm === "Clock" ? 4 : 3);
    for (const history of histories) {
        assert.equal(history.length, reference_count + 1);
        assert.equal(history[0], " ");
    }
    return { histories, page_faults, page_hits };
}

const inputs = [
    sample, "", "aaaaaa", "abc", "abcdefghi", "abcabcdeabc",
    "aabbccddeeaabb", "abcadbeacdab", "😀ab😀ç🦊a🦊ç", " a b ",
];

// Reproducible inputs exercise eviction and tie-breaking beyond the examples.
let seed = 42;
for (let length = 1; length <= 40; length += 1) {
    let input = "";
    for (let index = 0; index < length; index += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        input += Array.from("abcde😀")[seed % 6];
    }
    inputs.push(input);
}

const expected_sample_counts = {
    FIFO: [15, 0], LRU: [15, 0], MRU: [12, 3],
    LFU: [14, 1], MFU: [15, 0], Optimal: [11, 4],
};

for (const [algorithm, counts] of Object.entries(expected_sample_counts)) {
    test(`${algorithm}: complete traces match Python across ${inputs.length} inputs`, () => {
        const expected = JSON.parse(execFileSync("python3", [
            path.join(__dirname, "python_reference.py"), algorithm,
        ], { input: JSON.stringify(inputs), encoding: "utf8" }));
        inputs.forEach((input, index) => {
            const actual = run_algorithm(algorithm, input);
            assert.deepEqual(actual, expected[index], `${algorithm}: ${JSON.stringify(input)}`);
            if (index === 0) {
                assert.deepEqual([actual.page_faults, actual.page_hits], counts);
            }
        });
    });
}

function assert_clock_trace(input, snapshots, page_faults, page_hits) {
    const histories = [0, 1, 2, 3].map((index) =>
        snapshots.map((snapshot) => Array.from(snapshot)[index]));
    assert.deepEqual(run_algorithm("Clock", input), { histories, page_faults, page_hits });
}

test("Clock: empty input, repeated hits, and initial fill", () => {
    assert_clock_trace("", ["    "], 0, 0);
    assert_clock_trace("aaa", ["    ", "a   ", "a   ", "a   "], 1, 2);
    assert_clock_trace("abcd", ["    ", "a   ", "ab  ", "abc ", "abcd"], 4, 0);
});

test("Clock: scan wraps from the final frame and consumes every reference", () => {
    assert_clock_trace("abcdebcdf", [
        "    ", "a   ", "ab  ", "abc ", "abcd", "ebcd", "ebcd", "ebcd", "ebcd", "efcd",
    ], 6, 3);
});

test("Clock: corrected sample has 12 faults and 3 hits", () => {
    assert_clock_trace(sample, [
        "    ", "a   ", "ab  ", "abt ", "abtr", "kbtr", "katr", "kacr",
        "kacb", "tacb", "tlcb", "tlwb", "tlwb", "tlwc", "tlwc", "tlwc",
    ], 12, 3);
});

test("Clock: Unicode pages are whole code points", () => {
    assert_clock_trace("😀a😀", ["    ", "😀   ", "😀a  ", "😀a  "], 2, 1);
});

test("Clock: histories and totals account for every generated reference", () => {
    inputs.forEach((input) => run_algorithm("Clock", input));
});

test("DynamicRam: both unfinished prototypes run silently", () => {
    assert.deepEqual(run_script("DynamicRam"), []);
    assert.equal(execFileSync("python3", [path.join(root, "DynamicRam.py")], {
        encoding: "utf8",
    }), "");
    assert.equal(execFileSync(process.execPath, [path.join(root, "dist", "DynamicRam.js")], {
        encoding: "utf8",
    }), "");
});

test("All page-replacement scripts run directly with Node", () => {
    for (const algorithm of [...Object.keys(expected_sample_counts), "Clock"]) {
        const output = execFileSync(process.execPath, [path.join(root, "dist", `${algorithm}.js`)], {
            encoding: "utf8",
        });
        const [faults, hits] = algorithm === "Clock" ? [12, 3] : expected_sample_counts[algorithm];
        assert.ok(output.includes(`page faults: ${faults}\n`));
        assert.ok(output.includes(`page hits: ${hits}\n`));
    }
});
