export const MAX_FRAMES = 12;
export const MAX_REFERENCES = 200;
export const SAMPLE_REFERENCE = "a b t r k a c b t l w b c l t";

export interface ClockStep {
    page: string;
    frames: (string | null)[];
    reference_bits: number[];
    hit: boolean;
    frame_index: number;
    next_hand: number;
    cleared_frames: number[];
    evicted_page: string | null;
}

export interface ClockResult {
    pages: string[];
    frame_count: number;
    steps: ClockStep[];
    page_faults: number;
    page_hits: number;
}

export function parseReferenceString(input: string): string[] {
    const trimmed = input.trim();
    if (!trimmed) {
        throw new Error("Enter a reference string to start the simulation.");
    }
    const pages = /[\s,]/u.test(trimmed)
        ? trimmed.split(/[\s,]+/u).filter(Boolean)
        : Array.from(trimmed);
    if (pages.length === 0) {
        throw new Error("Enter at least one page, such as a, b, or 7.");
    }
    if (pages.length > MAX_REFERENCES) {
        throw new Error(`Use up to ${MAX_REFERENCES} page references per simulation.`);
    }
    return pages;
}

export function simulateClock(pages: readonly string[], frame_count = 4): ClockResult {
    if (!Number.isInteger(frame_count) || frame_count < 1 || frame_count > MAX_FRAMES) {
        throw new Error(`Choose a whole number of frames between 1 and ${MAX_FRAMES}.`);
    }
    if (pages.length > MAX_REFERENCES || pages.some((page) => typeof page !== "string" || page.length === 0)) {
        throw new Error(`Provide up to ${MAX_REFERENCES} nonempty page references.`);
    }
    const frames: (string | null)[] = Array(frame_count).fill(null);
    const reference_bits: number[] = Array(frame_count).fill(0);
    const steps: ClockStep[] = [];
    let hand = 0;
    let page_hits = 0;

    for (const page of pages) {
        let frame_index = frames.indexOf(page);
        const hit = frame_index !== -1;
        const cleared_frames: number[] = [];
        let evicted_page: string | null = null;
        if (hit) {
            page_hits += 1;
        } else {
            // Continue across wraparound until a frame has no second chance.
            while (reference_bits[hand] === 1) {
                reference_bits[hand] = 0;
                cleared_frames.push(hand);
                hand = (hand + 1) % frame_count;
            }
            frame_index = hand;
            evicted_page = frames[frame_index];
            frames[frame_index] = page;
            hand = (hand + 1) % frame_count;
        }
        reference_bits[frame_index] = 1;
        steps.push({
            page, frames: [...frames], reference_bits: [...reference_bits],
            hit, frame_index, next_hand: hand, cleared_frames, evicted_page,
        });
    }
    return {
        pages: [...pages], frame_count, steps, page_hits,
        page_faults: pages.length - page_hits,
    };
}
