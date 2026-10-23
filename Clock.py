reference_string = "abtrkacbtlwbclt"

frame_one = [" "]
f1_bit = 0
frame_two = [" "]
f2_bit = 0
frame_three = [" "]
f3_bit = 0
frame_four = [" "]
f4_bit = 0

page_faults = 0
page_hits = 0
frame_to_replace_next = 1

for page in reference_string:
    f1 = frame_one[-1]
    f2 = frame_two[-1]
    f3 = frame_three[-1]
    f4 = frame_four[-1]

    if page == f1:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        frame_four.append(f4)
        f1_bit = 1
        page_hits += 1
    elif page == f2:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        frame_four.append(f4)
        f2_bit = 1
        page_hits += 1
    elif page == f3:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        frame_four.append(f4)
        f3_bit = 1
        page_hits += 1
    elif page == f4:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        frame_four.append(f4)
        f4_bit = 1
        page_hits += 1
    else:

        if frame_to_replace_next == 1 and f1_bit == 1:
            frame_to_replace_next = 2
            f1_bit = 0
        
        if frame_to_replace_next == 2 and f2_bit == 1:
            frame_to_replace_next = 3
            f2_bit = 0
        
        if frame_to_replace_next == 3 and f3_bit == 1:
            frame_to_replace_next = 4
            f3_bit = 0
        
        if frame_to_replace_next == 4 and f4_bit == 1:
            frame_to_replace_next = 1
            f4_bit = 0

        if frame_to_replace_next == 1 and f1_bit == 0:
            frame_one.append(page)
            frame_two.append(f2)
            frame_three.append(f3)
            frame_four.append(f4)
            frame_to_replace_next = 2
            f1_bit = 1
            page_faults += 1
            continue

        elif frame_to_replace_next == 2  and f2_bit == 0:
            frame_one.append(f1)
            frame_two.append(page)
            frame_three.append(f3)
            frame_four.append(f4)
            frame_to_replace_next = 3
            f2_bit = 1
            page_faults += 1
            continue

        elif frame_to_replace_next == 3  and f3_bit == 0:
            frame_one.append(f1)
            frame_two.append(f2)
            frame_three.append(page)
            frame_four.append(f4)
            frame_to_replace_next = 4
            f3_bit = 1
            page_faults += 1
            continue
        
        elif frame_to_replace_next == 4  and f4_bit == 0:
            frame_one.append(f1)
            frame_two.append(f2)
            frame_three.append(f3)
            frame_four.append(page)
            frame_to_replace_next = 1
            f4_bit = 1
            page_faults += 1
            continue
        
print(frame_one)
print(frame_two)
print(frame_three)
print(frame_four)
print("page faults:", page_faults)
print("page hits:", page_hits)
