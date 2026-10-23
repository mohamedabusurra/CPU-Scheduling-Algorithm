import { simulateClock, validateSimulationInput } from "./clock";

export type Algorithm = "FIFO" | "LRU" | "MRU" | "LFU" | "MFU" | "Optimal" | "Clock";

export interface SimulationStep {
    page: string;
    frames: (string | null)[];
    hit: boolean;
    frame_index: number;
    evicted_page: string | null;
    explanation: string;
    reference_bits?: number[];
}

export interface SimulationResult {
    pages: string[];
    frame_count: number;
    steps: SimulationStep[];
    page_faults: number;
    page_hits: number;
}

export function simulateReplacement(
    algorithm: Algorithm, pages: readonly string[], frame_count = algorithm === "Clock" ? 4 : 3,
): SimulationResult {
    if (algorithm === "Clock") {
        const result = simulateClock(pages, frame_count);
        return {
            ...result,
            steps: result.steps.map((step) => ({
                ...step,
                explanation: step.hit
                    ? `Page ${step.page} is already in frame ${step.frame_index + 1}. Its reference bit is set to 1, and the clock hand stays in place.`
                    : `${step.cleared_frames.length ? `The hand clears ${step.cleared_frames.length} reference ${step.cleared_frames.length === 1 ? "bit" : "bits"}, giving those pages a second chance. ` : ""}${step.evicted_page === null ? `Page ${step.page} fills empty frame ${step.frame_index + 1}.` : `Page ${step.page} replaces ${step.evicted_page} in frame ${step.frame_index + 1}.`} The hand moves to frame ${step.next_hand + 1}.`,
            })),
        };
    }

    validateSimulationInput(pages, frame_count);
    const frames: (string | null)[] = Array(frame_count).fill(null);
    const arrival_time = Array<number>(frame_count).fill(-1);
    const last_used = Array<number>(frame_count).fill(-1);
    const frequency = new Map<string, number>();
    const steps: SimulationStep[] = [];
    let page_hits = 0;

    pages.forEach((page, time) => {
        frequency.set(page, (frequency.get(page) ?? 0) + 1);
        let frame_index = frames.indexOf(page);
        const hit = frame_index !== -1;
        let evicted_page: string | null = null;
        let explanation: string;

        if (hit) {
            page_hits += 1;
            const detail = algorithm === "FIFO" ? "Its place in the arrival order stays the same."
                : algorithm === "LRU" || algorithm === "MRU" ? "It is now the most recently used page."
                : algorithm === "LFU" || algorithm === "MFU" ? `Its access count increases to ${frequency.get(page)}.`
                : "No replacement is needed.";
            explanation = `Page ${page} is already in frame ${frame_index + 1}. ${detail}`;
        } else {
            frame_index = frames.indexOf(null);
            let reason = "";
            if (frame_index === -1) {
                let scores: number[];
                let choose_maximum = false;
                switch (algorithm) {
                    case "FIFO":
                        scores = arrival_time;
                        break;
                    case "LRU":
                    case "MRU":
                        scores = last_used;
                        choose_maximum = algorithm === "MRU";
                        break;
                    case "LFU":
                    case "MFU":
                        scores = frames.map((value) => frequency.get(value!) ?? 0);
                        choose_maximum = algorithm === "MFU";
                        break;
                    case "Optimal":
                        scores = frames.map((value) => {
                            const next = pages.indexOf(value!, time + 1);
                            return next === -1 ? Infinity : next;
                        });
                        choose_maximum = true;
                        break;
                }
                const target = choose_maximum ? Math.max(...scores) : Math.min(...scores);
                const candidates = scores.map((score, index) => score === target ? index : -1)
                    .filter((index) => index !== -1);
                frame_index = candidates[0];
                if (algorithm === "LFU" || algorithm === "MFU") {
                    // Frequency ties choose the oldest resident, matching the CLI scripts.
                    frame_index = candidates.reduce((oldest, index) =>
                        arrival_time[index] < arrival_time[oldest] ? index : oldest);
                    reason = `It has the ${algorithm === "LFU" ? "fewest" : "most"} recorded accesses (${target}).${candidates.length > 1 ? " Equal counts are resolved by replacing the oldest resident page." : ""}`;
                } else if (algorithm === "Optimal") {
                    reason = target === Infinity ? "It is never requested again in this reference string."
                        : `Its next request is at step ${target + 1}, farther in the future than the other resident pages.`;
                    if (candidates.length > 1) reason += " Ties use the lowest frame number.";
                } else if (algorithm === "FIFO") {
                    reason = `It entered memory at step ${target + 1}, before the other resident pages.`;
                } else {
                    reason = `It was last used at step ${target + 1}, making it the ${algorithm === "LRU" ? "least" : "most"} recently used page.`;
                }
                evicted_page = frames[frame_index];
                // LFU retains historical counts; MFU starts over after eviction.
                if (algorithm === "MFU") frequency.delete(evicted_page!);
            }
            explanation = evicted_page === null
                ? `Page ${page} fills empty frame ${frame_index + 1}. No page needs to be replaced.`
                : `Page ${page} replaces ${evicted_page} in frame ${frame_index + 1}. ${reason}`;
            frames[frame_index] = page;
            arrival_time[frame_index] = time;
        }
        last_used[frame_index] = time;
        steps.push({ page, frames: [...frames], hit, frame_index, evicted_page, explanation });
    });

    return { pages: [...pages], frame_count, steps, page_hits, page_faults: pages.length - page_hits };
}
