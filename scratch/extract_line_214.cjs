const fs = require('fs');
const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

const lineVal = lines[213]; // 0-indexed line 214
console.log(`Line 214 length: ${lineVal.length}`);
console.log(`Snippet: ${lineVal.substring(0, 1000)}`);
fs.writeFileSync('C:\\Users\\New\\OneDrive\\Documents\\gemini project\\scratch\\line_214.txt', lineVal, 'utf8');
