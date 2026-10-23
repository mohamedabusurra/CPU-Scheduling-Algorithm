export {};

const reference_string = "abtrkacbtlwbclt";
const frames = [" ", " ", " "];
const frame_histories = frames.map((page) => [page]);
let page_faults = 0;
let page_hits = 0;
let frame_to_replace_next = 0;

for (const page of reference_string) {
    if (frames.includes(page)) {
        page_hits += 1;
    } else {
        frames[frame_to_replace_next] = page;
        frame_to_replace_next = (frame_to_replace_next + 1) % frames.length;
        page_faults += 1;
    }
    frames.forEach((value, index) => frame_histories[index].push(value));
}

frame_histories.forEach((history) => console.log(history));
console.log("page faults:", page_faults);
console.log("page hits:", page_hits);
