export {};

const reference_string = "abtrkacbtlwbclt";
const frames = [" ", " ", " ", " "];
const frame_histories = frames.map((page) => [page]);
const reference_bits = [0, 0, 0, 0];
let page_faults = 0;
let page_hits = 0;
let frame_to_replace_next = 0;

for (const page of reference_string) {
    const frame_index = frames.indexOf(page);
    if (frame_index !== -1) {
        reference_bits[frame_index] = 1;
        page_hits += 1;
    } else {
        // Keep scanning across wraparound until a frame has no second chance.
        while (reference_bits[frame_to_replace_next] === 1) {
            reference_bits[frame_to_replace_next] = 0;
            frame_to_replace_next = (frame_to_replace_next + 1) % frames.length;
        }
        frames[frame_to_replace_next] = page;
        reference_bits[frame_to_replace_next] = 1;
        frame_to_replace_next = (frame_to_replace_next + 1) % frames.length;
        page_faults += 1;
    }
    frames.forEach((value, index) => frame_histories[index].push(value));
}

frame_histories.forEach((history) => console.log(history));
console.log("page faults:", page_faults);
console.log("page hits:", page_hits);
