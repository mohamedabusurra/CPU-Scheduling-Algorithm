export {};

const reference_string = "abtrkacbtlwbclt";
const frames = [" ", " ", " "];
const frame_histories = frames.map((page) => [page]);
const frequency = new Map<string, number>();
const arrival_time = [-1, -1, -1];
let page_faults = 0;
let page_hits = 0;
let time = 0;

for (const page of reference_string) {
    frequency.set(page, (frequency.get(page) ?? 0) + 1);
    if (frames.includes(page)) {
        page_hits += 1;
    } else {
        page_faults += 1;
        let frame_index = frames.indexOf(" ");
        if (frame_index === -1) {
            const frequencies = frames.map((value) => frequency.get(value) ?? 0);
            const maximum_frequency = Math.max(...frequencies);
            frame_index = frequencies.indexOf(maximum_frequency);
            for (let index = 0; index < frames.length; index += 1) {
                if (frequencies[index] === maximum_frequency
                    && arrival_time[index] < arrival_time[frame_index]) {
                    frame_index = index;
                }
            }
            // Unlike LFU, the original MFU resets an evicted page's frequency.
            frequency.set(frames[frame_index], 0);
        }
        frames[frame_index] = page;
        arrival_time[frame_index] = time;
    }
    frames.forEach((value, index) => frame_histories[index].push(value));
    time += 1;
}

const frame_names = ["frame_one :      ", "frame_two :      ", "frame_three:     "];
frame_histories.forEach((history, index) => console.log(frame_names[index], history));
console.log("page faults:", page_faults);
console.log("page hits:", page_hits);
