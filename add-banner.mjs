import {readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner =
  `/*! ${pkg.name} v${pkg.version}, distributed under GPLv2 https://www.gnu.org/licenses/gpl-2.0.txt */\n`;

function addBanner(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      addBanner(full);
    } else if (entry.endsWith('.js')) {
      const content = readFileSync(full, 'utf8');
      writeFileSync(full, banner + content);
    }
  }
}

addBanner('./dist/esm');
