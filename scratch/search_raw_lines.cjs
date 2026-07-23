const fs = require('fs');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  if (line.includes('handleRequestOTP')) {
    // Find the step_index by parsing it using regex instead of JSON.parse
    const stepMatch = line.match(/"step_index":\s*(\d+)/);
    const stepIndex = stepMatch ? stepMatch[1] : 'unknown';
    
    // Find matching snippets
    let pos = -1;
    const snippets = [];
    while ((pos = line.indexOf('handleRequestOTP', pos + 1)) !== -1) {
      const start = Math.max(0, pos - 50);
      const end = Math.min(line.length, pos + 150);
      snippets.push(line.substring(start, end));
    }
    console.log(`[Line ${idx + 1}] Step ${stepIndex}`);
    snippets.forEach((snip, sIdx) => {
      console.log(`  Match ${sIdx + 1}: ...${snip.replace(/\\n/g, ' ').substring(0, 150)}...`);
    });
  }
});
