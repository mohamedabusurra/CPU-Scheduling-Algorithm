reference_string = "abtrkacbtlwbclt"

#reference_string = input("enter refrence string: ")

frame_one = [" "]
frame_two = [" "]
frame_three = [" "]

page_faults = 0
page_hits = 0
current_time = 0

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
        if f1 == " ":
            frame_one.append(page)
            frame_two.append(f2)
            frame_three.append(f3)

        elif f2 == " ":
            frame_one.append(f1)
            frame_two.append(page)
            frame_three.append(f3)

        elif f3 == " ":
            frame_one.append(f1)
            frame_two.append(f2)
            frame_three.append(page)

        else:

            current_pages = [f1, f2, f3]
            future_pages = reference_string[current_time+1:] 
            next_time_used = []

            for p in current_pages:
                if p in future_pages:
                    time_of_next_use = future_pages.index(p) 
                else:
                    time_of_next_use = len(reference_string)  
                next_time_used.append(time_of_next_use)

            indexOfOneToRemove = next_time_used.index(max(next_time_used))

            if indexOfOneToRemove == 0:   
                frame_one.append(page)
                frame_two.append(f2)
                frame_three.append(f3)
            elif indexOfOneToRemove == 1: 
                frame_one.append(f1)
                frame_two.append(page)
                frame_three.append(f3)
            else:                   
                frame_one.append(f1)
                frame_two.append(f2)
                frame_three.append(page)

        page_faults += 1

    current_time += 1

print(frame_one)
print(frame_two)
print(frame_three)
print(f"page faults: {page_faults}")
print(f"page hits: {page_hits}")