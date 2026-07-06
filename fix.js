const fs = require('fs');
const file = 'src/utils/pdfGenerator.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/â€”/g, '-').replace(/â‚¹/g, 'Rs. ');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed encoding issues in ' + file);
