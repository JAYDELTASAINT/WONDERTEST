// Gera dist/southrune.html (arquivo único, completo) e dist/artifact.html (página para publicar).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const scripts = [];
const inlined = html.replace(/<script src="(src\/[^"]+)"><\/script>\n?/g, (_, src) => {
  scripts.push(readFileSync(join(root, src), 'utf8'));
  return '';
});
const bundle = '<script>\n' + scripts.join('\n;\n').replace(/<\/script/gi, '<\\/script') + '\n</script>\n';
const full = inlined.replace('<!--/PAGE-->', () => bundle + '<!--/PAGE-->');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'southrune.html'), full);

// Versão para o Artifact: só o conteúdo da página (sem doctype/html/head/body).
const page = full.slice(full.indexOf('<!--PAGE-->') + '<!--PAGE-->'.length, full.indexOf('<!--/PAGE-->'))
  .replace(/^<\/head>\s*$/m, '')
  .replace(/^<body>\s*$/m, '')
  .trim() + '\n';
writeFileSync(join(root, 'dist', 'artifact.html'), page);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('dist/southrune.html', kb(full));
console.log('dist/artifact.html', kb(page));
