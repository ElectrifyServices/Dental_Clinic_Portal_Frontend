const fs = require('fs');
let tsPath = 'src/components/Treatments/TreatmentSessionManager.tsx';
let tsContent = fs.readFileSync(tsPath, 'utf8');

tsContent = tsContent.replace(/<button\b/g, '<Button');
tsContent = tsContent.replace(/<\/button>/g, '</Button>');
tsContent = tsContent.replace(/<label\b/g, '<Label');
tsContent = tsContent.replace(/<\/label>/g, '</Label>');
tsContent = tsContent.replace(/<textarea\b/g, '<Textarea');
tsContent = tsContent.replace(/<\/textarea>/g, '</Textarea>');
tsContent = tsContent.replace(/<input\b/g, '<Input');

tsContent = tsContent.replace('import { Modal, Button, Badge } from "@/components/ui";',
    'import { Modal, Button, Badge, Label, Input, Textarea } from "@/components/ui";\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";');

fs.writeFileSync(tsPath, tsContent, 'utf8');
