import { simulateClock } from "./shared/clock";

const reference_string = "abtrkacbtlwbclt";
const result = simulateClock(Array.from(reference_string));
const frame_histories = Array.from({ length: result.frame_count }, (_, index) =>
    [" ", ...result.steps.map((step) => step.frames[index] ?? " ")]);

frame_histories.forEach((history) => console.log(history));
console.log("page faults:", result.page_faults);
console.log("page hits:", result.page_hits);
