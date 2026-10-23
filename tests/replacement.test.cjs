const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");
const { simulateReplacement } = require("../dist/shared/replacement.js");
const { simulateClock, MAX_FRAMES, MAX_REFERENCES } = require("../dist/shared/clock.js");

const algorithms = ["FIFO", "LRU", "MRU", "LFU", "MFU", "Optimal", "Clock"];
const inputs = ["", "a", "aaaaaa", "abtrkacbtlwbclt", "abcdefghi", "abcabcdeabc", "abacbd", "abacabd", "😀ab😀ç🦊a🦊ç"];
let seed = 47;
for (let length = 1; length <= 40; length += 1) {
    let input = "";
    for (let index = 0; index < length; index += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        input += Array.from("abcde😀")[seed % 6];
    }
    inputs.push(input);
}

for (const algorithm of algorithms.filter((name) => name !== "Clock")) {
    test(`${algorithm} UI engine matches original Python frame traces`, () => {
        const expected = JSON.parse(execFileSync("python3", [path.join(__dirname, "python_reference.py"), algorithm], {
            input: JSON.stringify(inputs), encoding: "utf8",
        }));
        inputs.forEach((input, index) => {
            const result = simulateReplacement(algorithm, Array.from(input), 3);
            const histories = [0, 1, 2].map((frame) => [" ", ...result.steps.map((step) => step.frames[frame] ?? " ")]);
            assert.deepEqual({ histories, page_faults: result.page_faults, page_hits: result.page_hits }, expected[index], input);
        });
    });
}

test("Two-frame hand-worked traces distinguish all replacement policies", () => {
    const expected = {
        FIFO: ["a-", "ab", "ab", "cb", "ca", "ba", "bd"],
        LRU: ["a-", "ab", "ab", "ac", "ac", "ab", "db"],
        MRU: ["a-", "ab", "ab", "cb", "ab", "ab", "ad"],
        LFU: ["a-", "ab", "ab", "ac", "ac", "ab", "ad"],
        MFU: ["a-", "ab", "ab", "cb", "ca", "ba", "bd"],
        Optimal: ["a-", "ab", "ab", "ac", "ac", "bc", "dc"],
    };
    for (const [algorithm, snapshots] of Object.entries(expected)) {
        const result = simulateReplacement(algorithm, Array.from("abacabd"), 2);
        assert.deepEqual(result.steps.map((step) => step.frames.map((page) => page ?? "-").join("")), snapshots, algorithm);
    }
});

test("Frequency counts and oldest-resident tie breaks remain explicit", () => {
    const lfu = simulateReplacement("LFU", Array.from("abacbd"), 2).steps.at(-1);
    assert.deepEqual(lfu.frames, ["d", "b"]);
    assert.equal(lfu.evicted_page, "a");
    assert.match(lfu.explanation, /accesses \(2\).*oldest resident/);
    const mfu = simulateReplacement("MFU", Array.from("abacabd"), 2).steps.at(-1);
    assert.deepEqual(mfu.frames, ["b", "d"]);
    assert.match(mfu.explanation, /accesses \(1\).*oldest resident/);
});

test("All engines support configurable capacity, Unicode, and independent snapshots", () => {
    for (const algorithm of algorithms) {
        for (const capacity of [1, 2, 3, 4, MAX_FRAMES]) {
            const pages = ["10", "😀", "10", "20", "__proto__", "😀", "30"];
            const original = [...pages];
            const result = simulateReplacement(algorithm, pages, capacity);
            assert.deepEqual(pages, original);
            assert.notStrictEqual(result.pages, pages);
            assert.equal(result.page_faults + result.page_hits, pages.length);
            assert.equal(result.steps.length, pages.length);
            let previous = Array(capacity).fill(null);
            result.steps.forEach((step, index) => {
                assert.equal(step.hit, previous.includes(pages[index]));
                assert.equal(step.frames.length, capacity);
                assert.equal(step.frames[step.frame_index], pages[index]);
                assert.equal(new Set(step.frames.filter((page) => page !== null)).size, Math.min(index + 1, new Set(pages.slice(0, index + 1)).size, capacity));
                assert.equal(step.evicted_page, step.hit ? null : previous[step.frame_index]);
                assert.ok(step.explanation.length > 0);
                assert.notStrictEqual(step.frames, previous);
                if (step.hit) assert.deepEqual(step.frames, previous);
                previous = step.frames;
            });
            if (capacity === 1) assert.equal(result.page_hits, 0);
            if (capacity === MAX_FRAMES) assert.equal(result.page_hits, 2);
        }
        assert.deepEqual(simulateReplacement(algorithm, [], 3).steps, []);
        assert.equal(simulateReplacement(algorithm, ["a", "a", "a"], 1).page_hits, 2);
    }
});

test("All engines reject invalid frame counts and references", () => {
    for (const algorithm of algorithms) {
        for (const count of [0, -1, 1.5, NaN, Infinity, MAX_FRAMES + 1]) {
            assert.throws(() => simulateReplacement(algorithm, ["a"], count), /whole number/);
        }
        assert.throws(() => simulateReplacement(algorithm, [""]), /nonempty/);
        assert.throws(() => simulateReplacement(algorithm, Array(MAX_REFERENCES + 1).fill("a")), /up to 200/);
    }
});

test("Clock adapter preserves every clock-specific result", () => {
    for (const input of inputs) {
        const result = simulateReplacement("Clock", Array.from(input));
        const without_explanations = { ...result, steps: result.steps.map(({ explanation, ...step }) => step) };
        assert.deepEqual(without_explanations, simulateClock(Array.from(input)));
    }
});

test("Optimal achieves the minimum faults against exhaustive replacement choices", () => {
    function minimum_faults(pages, capacity, index = 0, frames = []) {
        if (index === pages.length) return 0;
        const page = pages[index];
        if (frames.includes(page)) return minimum_faults(pages, capacity, index + 1, frames);
        if (frames.length < capacity) return 1 + minimum_faults(pages, capacity, index + 1, [...frames, page]);
        return 1 + Math.min(...frames.map((_, slot) => minimum_faults(
            pages, capacity, index + 1, frames.map((value, position) => position === slot ? page : value),
        )));
    }
    for (const input of ["abcabde", "abacbd", "abcdabc", "aaaaab", "abcdeaf"]) {
        for (const capacity of [1, 2, 3]) {
            const pages = Array.from(input);
            assert.equal(simulateReplacement("Optimal", pages, capacity).page_faults, minimum_faults(pages, capacity));
        }
    }
});
