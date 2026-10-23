reference_string = "abtrkacbtlwbclt"


frame_one = [" "]
frame_two = [" "]
frame_three = [" "]

page_faults = 0
page_hits = 0
frame_to_replace_next = 1

for page in reference_string:
    f1 = frame_one[-1]
    f2 = frame_two[-1]
    f3 = frame_three[-1]

    if page == f1 or page == f2 or page == f3:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        page_hits += 1
    else:
        if frame_to_replace_next == 1:
            frame_one.append(page)
            frame_two.append(f2)
            frame_three.append(f3)
            frame_to_replace_next = 2

        elif frame_to_replace_next == 2:
            frame_one.append(f1)
            frame_two.append(page)
            frame_three.append(f3)
            frame_to_replace_next = 3

        elif frame_to_replace_next == 3:
            frame_one.append(f1)
            frame_two.append(f2)
            frame_three.append(page)
            frame_to_replace_next = 1

        page_faults += 1

print(frame_one)
print(frame_two)
print(frame_three)
print("page faults:", page_faults)
print("page hits:", page_hits)