const fs = require('fs');
const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    
    // Check tool_calls in MODEL type
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.toLowerCase().includes('app.jsx')) {
          console.log(`[Step ${obj.step_index}] Model write_to_file call length in log: ${tc.args.CodeContent ? tc.args.CodeContent.length : 'none'}`);
        }
      });
    }
    
    // Check CODE_ACTION or SYSTEM_MESSAGE for execution result
    if (obj.type === 'CODE_ACTION' && obj.content && obj.content.toLowerCase().includes('app.jsx')) {
      console.log(`[Step ${obj.step_index}] CODE_ACTION match: length in log is ${obj.content.length}`);
    }
  } catch (err) {}
});
