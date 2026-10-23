reference_string = "abtrkacbtlwbclt"

frame_one = [" "]
frame_two = [" "]
frame_three = [" "]

page_faults = 0
page_hits = 0

frequency = {}

arrival_time = {"f1": -1, "f2": -1, "f3": -1}
time = 0  

for page in reference_string:
    frequency[page] = frequency.get(page, 0) + 1

    f1 = frame_one[-1]
    f2 = frame_two[-1]
    f3 = frame_three[-1]

    if page == f1 or page == f2 or page == f3:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        page_hits += 1

    else:
        if f1 == " ":
            frame_one.append(page)
            frame_two.append(f2)
            frame_three.append(f3)
            arrival_time["f1"] = time
            time += 1

        elif f2 == " ":
            frame_one.append(f1)
            frame_two.append(page)
            frame_three.append(f3)
            arrival_time["f2"] = time
            time += 1

        elif f3 == " ":
            frame_one.append(f1)
            frame_two.append(f2)
            frame_three.append(page)
            arrival_time["f3"] = time
            time += 1

        else:
            f1_frequency = frequency.get(f1, 0)
            f2_frequency = frequency.get(f2, 0)
            f3_frequency = frequency.get(f3, 0)

            minimum_frequency = min(f1_frequency, f2_frequency, f3_frequency)

            next_possible_replacement_frame = []
            if f1_frequency == minimum_frequency:
                next_possible_replacement_frame.append(("f1", arrival_time["f1"]))
            if f2_frequency == minimum_frequency:
                next_possible_replacement_frame.append(("f2", arrival_time["f2"]))
            if f3_frequency == minimum_frequency:
                next_possible_replacement_frame.append(("f3", arrival_time["f3"]))

            lowest_arrival_time = len(reference_string)
            frame_to_replace = " "
            for frame_name, atime in next_possible_replacement_frame:
                if atime < lowest_arrival_time:
                    lowest_arrival_time = atime
                    frame_to_replace = frame_name

            if frame_to_replace == "f1":
                frame_one.append(page)
                frame_two.append(f2)
                frame_three.append(f3)
                arrival_time["f1"] = time

            elif frame_to_replace == "f2":
                frame_one.append(f1)
                frame_two.append(page)
                frame_three.append(f3)
                arrival_time["f2"] = time

            elif frame_to_replace == "f3":
                frame_one.append(f1)
                frame_two.append(f2)
                frame_three.append(page)
                arrival_time["f3"] = time

            time += 1

        page_faults += 1

print("frame_one :       ", frame_one)
print("frame_two :       ", frame_two)
print("frame_three:      ", frame_three)
print("page faults:", page_faults)
print("page hits:", page_hits) 