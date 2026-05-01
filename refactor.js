const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
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

const files = walk('src');
let modifiedCount = 0;
for (const file of files) {
  if (file.includes('firebase.ts') || file.includes('firebase-admin.ts')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replaceMap = {
    'db': 'getFirebaseDb',
    'auth': 'getFirebaseAuth',
    'storage': 'getFirebaseStorage',
    'app': 'getFirebaseApp'
  };

  const adminMap = {
    'adminDb': 'getAdminDb',
    'adminAuth': 'getAdminAuth'
  };

  const oldContent = content;

  if (content.includes('lib/firebase')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:@\/lib\/firebase|\.\/firebase)['"]/g, (match, imports) => {
       const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
       const newImports = parts.map(p => replaceMap[p] || p);
       // we should handle if replaceMap[p] matches something else
       return `import { ${newImports.join(', ')} } from '@/lib/firebase'`;
    });
    
    // replace `db.` -> `getFirebaseDb().`
    content = content.replace(/\b(db|auth|storage|app)\./g, (match, p1) => {
        return replaceMap[p1] + '().';
    });
    
    // usages like `doc(db, ...)` -> `doc(getFirebaseDb(), ...)`
    content = content.replace(/([^\w])(db|auth|storage|app)([^\w.])/g, (m, p1, p2, p3) => {
       return p1 + replaceMap[p2] + '()' + p3;
    });
  }
  
  if (content.includes('lib/firebase-admin')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:@\/lib\/firebase-admin|\.\/firebase-admin)['"]/g, (match, imports) => {
       const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
       const newImports = parts.map(p => adminMap[p] || p);
       return `import { ${newImports.join(', ')} } from '@/lib/firebase-admin'`;
    });
    
    content = content.replace(/\b(adminDb|adminAuth)\./g, (match, p1) => adminMap[p1] + '().');
    content = content.replace(/([^\w])(adminDb|adminAuth)([^\w.])/g, (m, p1, p2, p3) => p1 + adminMap[p2] + '()' + p3);
  }

  if (content !== oldContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
}
console.log('Modified ' + modifiedCount + ' files.');