const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Total lines in log: ${lines.length}`);

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    
    // Check in model response tool calls
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('app.jsx')) {
          console.log(`[Step ${obj.step_index}] Line ${idx + 1}: write_to_file for App.jsx. Description: ${tc.args.Description}`);
        }
        if (tc.name === 'replace_file_content' && tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('app.jsx')) {
          console.log(`[Step ${obj.step_index}] Line ${idx + 1}: replace_file_content for App.jsx. Description: ${tc.args.Description}`);
        }
        if (tc.name === 'multi_replace_file_content' && tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('app.jsx')) {
          console.log(`[Step ${obj.step_index}] Line ${idx + 1}: multi_replace_file_content for App.jsx. Description: ${tc.args.Description}`);
        }
      });
    }
    
    // Check in system action records
    if (obj.type === 'WRITE_TO_FILE' && obj.content && obj.content.toLowerCase().includes('app.jsx')) {
      console.log(`[Step ${obj.step_index}] Line ${idx + 1}: WRITE_TO_FILE matching App.jsx`);
    }
  } catch (err) {
    // Ignore parse errors
  }
});
