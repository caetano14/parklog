// Verifica se cada importação do projeto existe: ficheiros em falta/na pasta errada e pacotes que não estão no package.json
const fs = require('fs');
const path = require('path');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = ['App.js', ...walk('src')].filter((f) => f.endsWith('.js'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

let bad = 0;
const missingPkgs = new Set();
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:from\s+|require\()\s*['"]([^'"]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith('.')) {
            const base = path.resolve(path.dirname(f), spec);
            const found = ['', '.js', '/index.js'].some((ext) => fs.existsSync(base + ext) && fs.statSync(base + ext).isFile());
            if (!found) { console.log('FICHEIRO EM FALTA:', spec, '(importado em ' + f + ')'); bad++; }
        } else {
            const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
            if (!deps[name]) missingPkgs.add(name);
        }
    }
}
missingPkgs.forEach((p) => console.log('PACOTE EM FALTA no package.json:', p));
console.log(bad || missingPkgs.size ? '\nHá problemas por resolver.' : `\nTudo certo: ${files.length} ficheiros, todas as importações e pacotes existem.`);