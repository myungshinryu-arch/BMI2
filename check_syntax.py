def check_balance(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        # Strip comments
        clean_line = ""
        in_string = False
        string_char = None
        escaped = False
        
        j = 0
        while j < len(line):
            char = line[j]
            if escaped:
                escaped = False
                j += 1
                continue
            if char == '\\':
                escaped = True
                j += 1
                continue
            
            if not in_string:
                if char in ["'", '"', '`']:
                    in_string = True
                    string_char = char
                elif line[j:j+2] == '//':
                    break # ignore rest of line
                else:
                    clean_line += char
            else:
                if char == string_char:
                    in_string = False
                    string_char = None
            j += 1
            
        for char in clean_line:
            if char in mapping.values():
                stack.append((char, i + 1))
            elif char in mapping.keys():
                if not stack:
                    print(f"Unmatched closing '{char}' at line {i + 1}")
                    return False
                top, line_num = stack.pop()
                if top != mapping[char]:
                    print(f"Mismatched '{char}' at line {i + 1} (expected closing for '{top}' from line {line_num})")
                    return False
                    
    if stack:
        for char, line_num in stack:
            print(f"Unmatched opening '{char}' from line {line_num}")
        return False
        
    print("All brackets, braces, and parentheses are perfectly balanced!")
    return True

check_balance('strategy-controller.js')
