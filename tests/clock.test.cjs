const assert = require("node:assert/strict");
const { test } = require("node:test");
const { simulateClock, parseReferenceString, MAX_FRAMES, MAX_REFERENCES } = require("../dist/shared/clock.js");

test("Reference input supports continuous Unicode and separated page identifiers", () => {
    assert.deepEqual(parseReferenceString("ab😀a"), ["a", "b", "😀", "a"]);
    assert.deepEqual(parseReferenceString("10, 20  10\n30"), ["10", "20", "10", "30"]);
    assert.deepEqual(parseReferenceString(" 7,0,1, "), ["7", "0", "1"]);
    assert.deepEqual(parseReferenceString("10,"), ["10"]);
    assert.deepEqual(parseReferenceString("101"), ["1", "0", "1"]);
});

test("Blank, separator-only, and oversized inputs have useful errors", () => {
    assert.throws(() => parseReferenceString("  \n "), /Enter a reference string/);
    assert.throws(() => parseReferenceString(", ,"), /at least one page/);
    assert.throws(() => parseReferenceString("a".repeat(MAX_REFERENCES + 1)), /up to 200/);
    assert.equal(parseReferenceString("a".repeat(MAX_REFERENCES)).length, MAX_REFERENCES);
});

test("Clock validates frame counts and references", () => {
    for (const count of [0, -1, 1.5, NaN, Infinity, MAX_FRAMES + 1]) {
        assert.throws(() => simulateClock(["a"], count), /whole number/);
    }
    assert.throws(() => simulateClock([""]), /nonempty/);
    assert.throws(() => simulateClock(Array(MAX_REFERENCES + 1).fill("a")), /up to 200/);
    assert.deepEqual(simulateClock([], 1).steps, []);
});

test("Single-frame Clock evicts correctly and snapshots remain independent", () => {
    const input = ["10", "10", "20", "10"];
    const result = simulateClock(input, 1);
    assert.equal(result.page_faults, 3);
    assert.equal(result.page_hits, 1);
    assert.deepEqual(result.steps.map((step) => step.frames), [["10"], ["10"], ["20"], ["10"]]);
    assert.deepEqual(result.steps.map((step) => step.evicted_page), [null, null, "10", "20"]);
    assert.deepEqual(result.steps.map((step) => step.cleared_frames), [[], [], [0], [0]]);
    assert.notStrictEqual(result.steps[0].frames, result.steps[1].frames);
    assert.notStrictEqual(result.steps[0].reference_bits, result.steps[1].reference_bits);
    assert.deepEqual(input, ["10", "10", "20", "10"]);
    assert.notStrictEqual(input, result.pages);
});

test("Clock records full wraparound, cleared bits, and next-hand position", () => {
    const result = simulateClock(Array.from("abcdebcdf"));
    const final = result.steps.at(-1);
    assert.deepEqual(final.frames, ["e", "f", "c", "d"]);
    assert.deepEqual(final.reference_bits, [0, 1, 0, 0]);
    assert.deepEqual(final.cleared_frames, [1, 2, 3, 0]);
    assert.equal(final.next_hand, 2);
    assert.equal(final.frame_index, 1);
    assert.equal(final.evicted_page, "b");
    assert.equal(result.steps[5].next_hand, result.steps[4].next_hand);
    assert.equal(result.steps[5].reference_bits[1], 1);
});

test("Changing the number of frames starts a fresh simulation", () => {
    const pages = ["a", "b", "c", "a"];
    assert.equal(simulateClock(pages, 1).page_hits, 0);
    const result = simulateClock(pages, MAX_FRAMES);
    assert.equal(result.page_hits, 1);
    assert.equal(result.steps[0].frames.length, MAX_FRAMES);
    assert.deepEqual(result.steps[0].frames, ["a", ...Array(MAX_FRAMES - 1).fill(null)]);
});
