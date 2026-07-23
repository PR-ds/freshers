const fs = require('fs');
const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  if (line.toLowerCase().includes('compilerslist')) {
    const stepMatch = line.match(/"step_index":\s*(\d+)/);
    const stepIndex = stepMatch ? stepMatch[1] : 'unknown';
    console.log(`[Line ${idx + 1}] Step ${stepIndex} contains compilersList`);
    
    // Print snippet around compilersList
    let pos = -1;
    while ((pos = line.indexOf('compilersList', pos + 1)) !== -1) {
      console.log(`  Snippet: ...${line.substring(Math.max(0, pos - 80), Math.min(line.length, pos + 150)).replace(/\\n/g, ' ')}...`);
    }
  }
});
