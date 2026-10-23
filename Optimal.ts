export {};

const reference_string = "abtrkacbtlwbclt";
// Python iterates Unicode code points; Array.from preserves that behavior.
const pages = Array.from(reference_string);
const frames = [" ", " ", " "];
const frame_histories = frames.map((page) => [page]);
let page_faults = 0;
let page_hits = 0;

for (let current_time = 0; current_time < pages.length; current_time += 1) {
    const page = pages[current_time];
    if (frames.includes(page)) {
        page_hits += 1;
    } else {
        let frame_index = frames.indexOf(" ");
        if (frame_index === -1) {
            const future_pages = pages.slice(current_time + 1);
            const next_time_used = frames.map((value) => {
                const next_use = future_pages.indexOf(value);
                return next_use === -1 ? pages.length : next_use;
            });
            frame_index = next_time_used.indexOf(Math.max(...next_time_used));
        }
        frames[frame_index] = page;
        page_faults += 1;
    }
    frames.forEach((value, index) => frame_histories[index].push(value));
}

frame_histories.forEach((history) => console.log(history));
console.log("page faults:", page_faults);
console.log("page hits:", page_hits);
