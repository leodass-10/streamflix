const fs = require('fs');
const lines = fs.readFileSync('C:/Users/railb/.gemini/antigravity-cli/brain/6401d659-d215-4f98-834a-bac42b57a201/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
const line = lines[2]; // line index 2 (line 3)
const obj = JSON.parse(line);
const call = obj.tool_calls.find(c => c.name === 'write_to_file');
let code = call.args.CodeContent;

// Apply our bug fixes to the ORIGINAL CSS-compatible markup
code = code.replace(/match\.teams\[0\]/g, 'match.teams.home')
           .replace(/match\.teams\[1\]/g, 'match.teams.away')
           .replace(/match\.teams && match\.teams\.length === 2/g, 'match.teams && match.teams.home && match.teams.away')
           .replace(/streams\[0\]\.url/g, 'streams[0].embedUrl')
           .replace(/stream\.url/g, 'stream.embedUrl')
           .replace(/stream\.quality \|\| 'HD'/g, "stream.hd ? 'HD' : 'SD'")
           .replace(/Utils\.formatDate\(/g, "Utils.formatMatchTime("); // avoid undefined function

fs.writeFileSync('D:/APPU/CODE/WEB/streamflix/js/components.js', code);
console.log('Restored components.js with fixes applied.');
