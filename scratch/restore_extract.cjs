const fs = require('fs');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

const targetSteps = [412, 430];

targetSteps.forEach(stepIndex => {
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (obj.step_index === stepIndex && tc.name === 'write_to_file') {
            const content = tc.args.CodeContent;
            console.log(`[Step ${stepIndex}] CodeContent length: ${content.length} characters`);
            const outPath = `C:\\Users\\New\\OneDrive\\Documents\\gemini project\\scratch\\step_${stepIndex}_app.jsx`;
            fs.writeFileSync(outPath, content, 'utf8');
            console.log(`Saved to ${outPath}`);
          }
        });
      }
    } catch (err) {
      console.error(`Error processing line ${idx + 1}: ${err.message}`);
    }
  });
});
