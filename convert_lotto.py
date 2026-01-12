import re

with open('lotto_data.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('lotto_full.csv', 'w', encoding='utf-8') as out:
    for line in lines:
        # Format: "1. 27.01.1957 8,12,31,39,43,45"
        match = re.match(r'^(\d+)\.\s+(\d{2})\.(\d{2})\.(\d{4})\s+(.+)$', line.strip())
        if match:
            day, month, year, numbers = match.group(2), match.group(3), match.group(4), match.group(5)
            date = f"{year}-{month}-{day}"
            out.write(f"{date},{numbers}\n")

print("Created lotto_full.csv with dates")
