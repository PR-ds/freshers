const fs = require('fs');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    const lineStr = JSON.stringify(obj);
    if (lineStr.includes('handleRequestOTP')) {
      // Find matches of handleRequestOTP inside the lineStr
      let pos = -1;
      const snippets = [];
      while ((pos = lineStr.indexOf('handleRequestOTP', pos + 1)) !== -1) {
        const start = Math.max(0, pos - 50);
        const end = Math.min(lineStr.length, pos + 100);
        snippets.push(lineStr.substring(start, end));
      }
      console.log(`[Line ${idx + 1}] Step ${obj.step_index}: type=${obj.type}, source=${obj.source}`);
      snippets.forEach((snip, sIdx) => {
        console.log(`  Match ${sIdx + 1}: ...${snip.replace(/\\n/g, ' ')}...`);
      });
    }
  } catch (err) {
    // console.log(`Error parsing line ${idx + 1}`);
  }
});
