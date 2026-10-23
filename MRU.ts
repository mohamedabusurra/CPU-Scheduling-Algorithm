export {};

const reference_string = "abtrkacbtlwbclt";
const frames = [" ", " ", " "];
const frame_histories = frames.map((page) => [page]);
const last_used_frame = [-1, -1, -1];
let page_faults = 0;
let page_hits = 0;
let current_time = 0;

for (const page of reference_string) {
    let frame_index = frames.indexOf(page);
    if (frame_index !== -1) {
        page_hits += 1;
    } else {
        page_faults += 1;
        frame_index = frames.indexOf(" ");
        if (frame_index === -1) {
            frame_index = last_used_frame.indexOf(Math.max(...last_used_frame));
        }
        frames[frame_index] = page;
    }
    last_used_frame[frame_index] = current_time;
    frames.forEach((value, index) => frame_histories[index].push(value));
    current_time += 1;
}

frame_histories.forEach((history) => console.log(history));
console.log("page faults:", page_faults);
console.log("page hits:", page_hits);
