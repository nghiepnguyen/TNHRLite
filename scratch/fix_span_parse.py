import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex: find `<span ... />icon</span>` and change to `<span ...>icon</span>`
    # this happened because the previous regex matched the `/` in `/>`
    fix_regex = re.compile(r'(<span[^>]*?)\s*/\s*>([a-zA-Z_0-9]*)</span>')
    
    new_content = fix_regex.sub(r'\1>\2</span>', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")

def walk_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root.split(os.sep):
            continue
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    walk_dir('/Users/nghiepnguyen/Documents/HR-Lite/src')
