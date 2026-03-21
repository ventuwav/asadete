text = open('src/pages/Dashboard.tsx').read()
def check_braces(s):
    stack = []
    lines = s.split('\n')
    for i, line in enumerate(lines):
        line = line.split('//')[0] # ignore comments very roughly
        for j, c in enumerate(line):
            if c == '{': stack.append((i+1, j))
            elif c == '}':
                if not stack:
                    print(f"Extra closing brace at line {i+1}")
                    return
                stack.pop()
    if stack:
        print("Unclosed braces at lines:")
        for line, col in stack:
            print(f"- line {line}, col {col}")
    else:
        print("Braces match!")
check_braces(text)
