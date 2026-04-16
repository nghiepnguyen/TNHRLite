import os

def fix_arrow_back():
    base_dir = '/Users/nghiepnguyen/Documents/HR-Lite/src'
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.js', '.jsx', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                if '>arrowleft</span>' in content:
                    content = content.replace('>arrowleft</span>', '>arrow_back</span>')
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Fixed {filepath}")

if __name__ == '__main__':
    fix_arrow_back()
