const fs = require('fs');

const logPath = 'C:\\Users\\New\\.gemini\\antigravity\\brain\\752441ba-a533-4821-bcda-846cb7a85b97\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

const targetSteps = [412, 430];

targetSteps.forEach(stepIndex => {
  let matchCount = 0;
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      const stepMatch = line.match(/"step_index":\s*(\d+)/);
      const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : -1;
      
      if (currentStep === stepIndex && obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile) {
            matchCount++;
            const target = tc.args.TargetFile;
            const code = tc.args.CodeContent;
            console.log(`[Step ${stepIndex}] Match ${matchCount}: TargetFile=${target}, length=${code.length}`);
            
            const cleanTarget = target.replace(/["\\]/g, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
            const outPath = `C:\\Users\\New\\OneDrive\\Documents\\gemini project\\scratch\\step_${stepIndex}_match_${matchCount}_${cleanTarget.substring(cleanTarget.length - 20)}`;
            fs.writeFileSync(outPath, code, 'utf8');
            console.log(`Saved to ${outPath}`);
          }
        });
      }
    } catch (err) {
      // console.log(`Error parsing line ${idx + 1}: ${err.message}`);
    }
  });
});
