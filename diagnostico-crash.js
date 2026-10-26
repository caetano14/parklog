// Descobre qual componente nativo faz a app crashar no arranque (crash em RCTThirdPartyComponentsProvider:
// "attempt to insert nil object from objects[N]"). Uso, na raiz do projeto:  node diagnostico-crash.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const find = (dir, name, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) find(p, name, out);
    else if (e.name === name) out.push(p);
  }
  return out;
};

// Todas as classes Objective-C implementadas nas pastas indicadas
const implemented = (dirs) => {
  const set = new Set();
  for (const dir of dirs.filter(fs.existsSync)) {
    let out = '';
    try {
      out = execSync(`grep -rhoE "@implementation +[A-Za-z0-9_]+" "${dir}" --include=*.m --include=*.mm 2>/dev/null`, { maxBuffer: 1 << 28 }).toString();
    } catch (e) {
      out = e.stdout ? e.stdout.toString() : '';
    }
    out.split('\n').forEach((l) => { const m = l.match(/@implementation +(\w+)/); if (m) set.add(m[1]); });
  }
  return set;
};

if (!fs.existsSync('ios')) { console.log('Não encontro a pasta ios/. Corre isto na raiz do projeto (npx expo prebuild --platform ios cria-a).'); process.exit(1); }
const files = find('ios', 'RCTThirdPartyComponentsProvider.mm');
if (!files.length) { console.log('Não encontrei o RCTThirdPartyComponentsProvider.mm dentro de ios/. Compila uma vez no Xcode (ou corre pod install) e repete.'); process.exit(1); }

const entries = [];
for (const line of fs.readFileSync(files[0], 'utf8').split('\n')) {
  const m = line.match(/@"([^"]+)"\s*:\s*NSClassFromString\(@"([^"]+)"\)\s*,?\s*(?:\/\/\s*(.*))?/);
  if (m) entries.push({ component: m[1], cls: m[2], lib: (m[3] || '').trim() });
}
if (!entries.length) { console.log('Ficheiro encontrado mas sem entradas reconhecidas:', files[0], '\n(cola aqui as primeiras 40 linhas dele)'); process.exit(1); }

console.log('Ficheiro:', files[0], '\n');
const pods = implemented(['ios/Pods']);
const modules = implemented(['node_modules']);
let firstBad = null;
entries.forEach((e, i) => {
  const inPods = pods.has(e.cls);
  const inModules = modules.has(e.cls);
  const status = inPods || inModules ? 'ok' : 'SEM IMPLEMENTAÇÃO';
  if (status !== 'ok' && firstBad === null) firstBad = i;
  const mark = i === 2 ? '   ← é este o do crash (objects[2])' : '';
  console.log(`${String(i).padStart(2)}  ${e.component.padEnd(28)} ${status.padEnd(18)} ${e.lib}${mark}`);
});

const crash = entries[2];
console.log('\n--- Resultado ---');
if (crash) {
  const found = pods.has(crash.cls) || modules.has(crash.cls);
  console.log(`Entrada 2: ${crash.component} (classe ${crash.cls}) da biblioteca "${crash.lib || '?'}".`);
  console.log(found
    ? 'A classe existe no código mas não foi compilada para dentro da app: os pods estão desatualizados em relação ao node_modules.'
    : 'A classe não existe em lado nenhum: o componente é de uma biblioteca (ou parte dela) que não está a ser compilada nesta build.');
}
