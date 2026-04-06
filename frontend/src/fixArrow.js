const fs = require('fs');
const path = 'c:/Users/Era/Desktop/Files/Projects/Final Project/Implementation/FinalProject_E-learning/frontend/src/pages/InstructorDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Find and replace the corrupted arrow bytes with →
const before = content.length;
// Replace any sequence between </span> and Auto grade: that isn't a clean arrow
content = content.replace(/(<\/span>)\s*[^\x00-\x7F]+\s*(Auto grade:)/g, '$1 → $2');

const after = content.length;
fs.writeFileSync(path, content, 'utf8');
console.log(`Done. Characters changed: ${before - after} diff. File saved.`);

// Verify
const lines = content.split('\n').filter(l => l.includes('Auto grade:'));
lines.forEach(l => console.log('Fixed line:', l.trim()));
