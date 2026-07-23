const fs = require('fs');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index >= 590 && obj.step_index <= 600) {
      console.log(`[Step ${obj.step_index}] type=${obj.type}, source=${obj.source}`);
      if (obj.tool_calls) {
        console.log(`  Tool Calls: ${JSON.stringify(obj.tool_calls, null, 2)}`);
      }
      if (obj.content) {
        console.log(`  Content: ${obj.content.substring(0, 500)}...`);
      }
    }
  } catch (err) {}
});
