const fs = require('fs');
const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('app.jsx')) {
          console.log(`[Step ${obj.step_index}] TargetFile: ${tc.args.TargetFile}`);
        }
      });
    }
  } catch (err) {}
});
