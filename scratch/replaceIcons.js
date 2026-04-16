const fs = require('fs');
const path = require('path');

const iconMap = {
  Plus: 'add',
  Briefcase: 'work',
  MapPin: 'location_on',
  Building2: 'business',
  Building: 'domain',
  ChevronRight: 'chevron_right',
  ChevronLeft: 'chevron_left',
  ChevronDown: 'expand_more',
  AlertCircle: 'error',
  Users: 'group',
  User: 'person',
  Clock: 'schedule',
  Filter: 'filter_alt',
  CheckCircle: 'check_circle',
  Check: 'check',
  Mail: 'mail',
  Bell: 'notifications',
  XCircle: 'cancel',
  X: 'close',
  Layout: 'dashboard',
  Search: 'search',
  Tag: 'label',
  Pencil: 'edit',
  CalendarClock: 'history',
  Copy: 'content_copy',
  Eye: 'visibility',
  Trash2: 'delete',
  Brain: 'psychology',
  Ban: 'block',
  Info: 'info',
  UploadCloud: 'cloud_upload',
  FileText: 'description',
  File: 'insert_drive_file',
  LogOut: 'logout',
  Settings: 'settings',
  Menu: 'menu',
  MoreVertical: 'more_vert',
  MoreHorizontal: 'more_horiz',
  Download: 'download',
  Upload: 'upload',
  Camera: 'photo_camera',
  Image: 'image',
  BarChart: 'bar_chart',
  BarChart2: 'bar_chart',
  PieChart: 'pie_chart',
  Link: 'link',
  ExternalLink: 'open_in_new',
  HelpCircle: 'help',
  Grid: 'grid_view',
  List: 'list',
  MessageSquare: 'chat'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find lucide-react import
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
  let importMatch = importRegex.exec(content);
  if (!importMatch) return;
  
  // Extract imported icons
  const importedIcons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  
  // Remove import
  content = content.replace(importRegex, '');
  
  // Replace components
  importedIcons.forEach(icon => {
    const matIcon = iconMap[icon] || icon.toLowerCase();
    
    // Regex for: <IconName ... /> or <IconName></IconName>
    const componentRegex = new RegExp(`<${icon}\\b([^>]*)/?>`, 'g');
    
    content = content.replace(componentRegex, (match, attrs) => {
      let size = null;
      let sizeMatch = attrs.match(/size=\{?['"]?(\d+)['"]?\}?/);
      if (sizeMatch) {
         size = sizeMatch[1];
      } else {
         let sizeStrMatch = attrs.match(/size=["']([^"']+)["']/);
         if (sizeStrMatch) size = sizeStrMatch[1];
      }
      
      let finalClass = 'material-symbols-outlined flex-shrink-0';
      if (size) finalClass += ` !text-[${size}px]`;
      
      // Clean up attrs to remove size that we extracted
      let otherAttrs = attrs.replace(/size=\{?['"]?\w+['"]?\}?/, '').trim();
        
      let dynamicClassMatch = otherAttrs.match(/className=\{([^}]+)\}/);
      let staticClassMatch = otherAttrs.match(/className=["']([^"']+)["']/);
      
      let combinedClassAttr = `className="${finalClass}"`;
      if (staticClassMatch) {
        combinedClassAttr = `className="${finalClass} ${staticClassMatch[1]}"`;
        otherAttrs = otherAttrs.replace(staticClassMatch[0], '');
      } else if (dynamicClassMatch) {
         // It's dynamic: className={`foo ${bar}`} or className={someVar}
         let inner = dynamicClassMatch[1].trim();
         if (inner.startsWith('`') && inner.endsWith('`')) {
            inner = inner.slice(1, -1);
            combinedClassAttr = `className={\`${finalClass} ${inner}\`}`;
         } else {
            combinedClassAttr = `className={\`${finalClass} \${${inner}}\`}`;
         }
         otherAttrs = otherAttrs.replace(dynamicClassMatch[0], '');
      }
      
      return `<span ${combinedClassAttr} ${otherAttrs}>${matIcon}</span>`;
    });
    
    // Fallback for closing tags if any (rare for lucide but just in case)
    let closeTagRegex = new RegExp(`</${icon}>`, 'g');
    content = content.replace(closeTagRegex, '');
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

function walkDir(dir) {
  let files = fs.readdirSync(dir);
  for (let file of files) {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.match(/\.(js|jsx|ts|tsx)$/) && !fullPath.includes('node_modules')) {
      processFile(fullPath);
    }
  }
}

walkDir('/Users/nghiepnguyen/Documents/HR-Lite/src');
