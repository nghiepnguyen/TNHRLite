import os
import re

icon_map = {
    'Plus': 'add', 'Briefcase': 'work', 'MapPin': 'location_on', 
    'Building2': 'business', 'Building': 'domain', 'ChevronRight': 'chevron_right', 
    'ChevronLeft': 'chevron_left', 'ChevronDown': 'expand_more', 'AlertCircle': 'error', 
    'Users': 'group', 'User': 'person', 'Clock': 'schedule', 'Filter': 'filter_alt', 
    'CheckCircle': 'check_circle', 'Check': 'check', 'Mail': 'mail', 'Bell': 'notifications', 
    'XCircle': 'cancel', 'X': 'close', 'Layout': 'dashboard', 'Search': 'search', 
    'Tag': 'label', 'Pencil': 'edit', 'CalendarClock': 'history', 'Copy': 'content_copy', 
    'Eye': 'visibility', 'Trash2': 'delete', 'Brain': 'psychology', 'Ban': 'block', 
    'Info': 'info', 'UploadCloud': 'cloud_upload', 'FileText': 'description', 
    'File': 'insert_drive_file', 'LogOut': 'logout', 'Settings': 'settings', 
    'Menu': 'menu', 'MoreVertical': 'more_vert', 'MoreHorizontal': 'more_horiz', 
    'Download': 'download', 'Upload': 'upload', 'Camera': 'photo_camera', 
    'Image': 'image', 'BarChart': 'bar_chart', 'BarChart2': 'bar_chart', 
    'PieChart': 'pie_chart', 'Link': 'link', 'ExternalLink': 'open_in_new', 
    'HelpCircle': 'help', 'Grid': 'grid_view', 'List': 'list', 'MessageSquare': 'chat'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match import { ... } from 'lucide-react';
    import_regex = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"];?', re.MULTILINE)
    match = import_regex.search(content)
    if not match:
        return
        
    imported = [s.strip() for s in match.group(1).split(',')]
    imported = [s for s in imported if s]
    
    # Remove import
    content = import_regex.sub('', content)
    
    for icon in imported:
        mat_icon = icon_map.get(icon, icon.lower())
        
        # We need to find tags like <Icon .../> or <Icon></Icon>
        tag_regex = re.compile(rf'<{icon}\b([^>]*)/?>')
        
        def rel_func(m):
            attrs = m.group(1)
            
            # extract size
            size = None
            size_match = re.search(r'size=\{?[\'"]?(\d+)[\'"]?\}?', attrs)
            if size_match:
                size = size_match.group(1)
            else:
                size_str_match = re.search(r'size=["\']([^"\']+)["\']', attrs)
                if size_str_match:
                    size = size_str_match.group(1)
            
            final_class = 'material-symbols-outlined flex-shrink-0'
            if size:
                final_class += f' !text-[{size}px]'
                
            # clear size out
            other_attrs = re.sub(r'size=\{?[\'"]?\w+[\'"]?\}?', '', attrs).strip()
            
            dynamic_class = re.search(r'className=\{([^}]+)\}', other_attrs)
            static_class = re.search(r'className=["\']([^"\']+)["\']', other_attrs)
            
            combined_class_attr = f'className="{final_class}"'
            if static_class:
                combined_class_attr = f'className="{final_class} {static_class.group(1)}"'
                other_attrs = other_attrs.replace(static_class.group(0), '')
            elif dynamic_class:
                inner = dynamic_class.group(1).strip()
                if inner.startswith('`') and inner.endswith('`'):
                    inner = inner[1:-1]
                    combined_class_attr = f'className={{{f"`{final_class} {inner}`"}}}'
                else:
                    combined_class_attr = f'className={{{f"`{final_class} ${{ {inner} }}`"}}}'
                other_attrs = other_attrs.replace(dynamic_class.group(0), '')
                
            return f'<span {combined_class_attr} {other_attrs}>{mat_icon}</span>'
            
        content = tag_regex.sub(rel_func, content)
        
        # Remove any stray closing tags
        content = re.sub(rf'</{icon}>', '', content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed: {filepath}")

def walk_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root.split(os.sep):
            continue
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    walk_dir('/Users/nghiepnguyen/Documents/HR-Lite/src')
