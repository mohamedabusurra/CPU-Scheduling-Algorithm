reference_string = "abtrkacbtlwbclt"

frame_one = [" "]
frame_two = [" "]
frame_three = [" "]

page_faults = 0
page_hits = 0
current_time = 0

last_used_frame = {"f1": -1, "f2": -1, "f3": -1}

for page in reference_string:
    f1 = frame_one[-1]
    f2 = frame_two[-1]
    f3 = frame_three[-1]

    if page == f1 or page == f2 or page == f3:
        frame_one.append(f1)
        frame_two.append(f2)
        frame_three.append(f3)
        page_hits += 1

        if page == f1:
            last_used_frame["f1"] = current_time
        elif page == f2:
            last_used_frame["f2"] = current_time
        else:
            last_used_frame["f3"] = current_time

    else:
        page_faults += 1


        if f1 == " ":
            frame_one.append(page); 
            frame_two.append(f2); 
            frame_three.append(f3)
            last_used_frame["f1"] = current_time

        elif f2 == " ":
            frame_one.append(f1);
            frame_two.append(page);
            frame_three.append(f3)
            last_used_frame["f2"] = current_time

        elif f3 == " ":
            frame_one.append(f1); 
            frame_two.append(f2); 
            frame_three.append(page)
            last_used_frame["f3"] = current_time

        else:
            last_time_used = [last_used_frame["f1"], last_used_frame["f2"], last_used_frame["f3"]]
            index_to_replace = last_time_used.index(max(last_time_used)) 

            if index_to_replace == 0:
                frame_one.append(page); 
                frame_two.append(f2);
                frame_three.append(f3)
                last_used_frame["f1"] = current_time
            elif index_to_replace == 1:
                frame_one.append(f1);
                frame_two.append(page); 
                frame_three.append(f3)
                last_used_frame["f2"] = current_time
            elif index_to_replace == 2:
                frame_one.append(f1); 
                frame_two.append(f2);
                frame_three.append(page)
                last_used_frame["f3"] = current_time

    current_time += 1

print(frame_one)
print(frame_two)
print(frame_three)
print("page faults:", page_faults)
print("page hits:", page_hits)