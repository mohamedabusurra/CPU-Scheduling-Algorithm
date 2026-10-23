export {};

// This mirrors the unfinished Python prototype; allocation is not implemented.
const processes = ["p1", "p2", "p3", "p4", "p5"];
const arrival_time = [1, 2, 3, 4, 5];
const execution_time = [1, 2, 3, 4, 5];
const process_size = [10, 10, 10, 10, 10];
const size = 200;

const occupied_ram_space: Record<string, number> = {};
let current_time = 0;

for (let process = 0; process < processes.length; process += 1) {
    const current_process = processes[process];
    const current_arrival_time = arrival_time[process];
    const current_execution_time = execution_time[process];
    const current_process_size = process_size[process];
}
