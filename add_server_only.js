const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const flowFiles = walk('src/ai/flows');
for (const file of flowFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('server-only')) {
    fs.writeFileSync(file, "import 'server-only';\n" + content);
    console.log('Added server-only to ' + file);
  }
}

const actionFiles = walk('src/app/actions');
for (const file of actionFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('genkit') && !content.includes('server-only')) {
    fs.writeFileSync(file, "import 'server-only';\n" + content);
    console.log('Added server-only to ' + file);
  }
}
