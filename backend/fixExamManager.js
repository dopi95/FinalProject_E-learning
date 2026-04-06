const fs = require('fs');
const path = 'c:/Users/Era/Desktop/Files/Projects/Final Project/Implementation/FinalProject_E-learning/frontend/src/components/ExamManager.jsx';

let content = fs.readFileSync(path, 'utf8');

// Find the broken spot: after the useEffect closing and before the orphaned try block
content = content.replace(
  /(\}, \[streamStatus, controlModal\]\);)\s*\n(\s*try \{)/,
  '$1\n\n  const fetchExams = async () => {\n$2'
);

fs.writeFileSync(path, content, 'utf8');

// Verify
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('const fetchExams'));
console.log('Fixed at line', idx + 1, ':', lines[idx]);
