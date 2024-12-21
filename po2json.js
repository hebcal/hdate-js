/* eslint-disable require-jsdoc */
import fs from 'fs';
import path from 'path';
import {po} from 'gettext-parser';

for (const arg of process.argv.slice(2)) {
  const outpath = './src/' + path.basename(arg) + '.ts';
  console.log(`${arg} => ${outpath}`);
  writePoFile(arg, outpath);
}

function writePoFile(inpath, outpath) {
  const input = fs.readFileSync(inpath).toString().normalize();
  const poData = po.parse(input);

  const dict = {};
  for (const msg of Object.values(poData.translations[''])) {
    const msgid = msg.msgid;
    const msgstr = msg.msgstr;
    if (msgid && msgid.length && msgstr && msgstr.length) {
      dict[msgid] = msgstr;
    }
  }
  const compactPo = {
    headers: {
      'plural-forms': '',
      language: 'en',
    },
    contexts: {
      '': dict,
    },
  };
  const pluralHeader =
    poData.headers['plural-forms'] || poData.headers['Plural-Forms'];
  if (!pluralHeader) {
    throw new Error('Bad .po file. "Plural-Forms" header is missing ');
  }
  compactPo.headers['plural-forms'] = pluralHeader;
  compactPo.headers.language = poData.headers.language;

  const outstream = fs.createWriteStream(outpath, {flags: 'w'});
  outstream.write('export default ');
  outstream.write(JSON.stringify(compactPo, null, 0));
  outstream.end();
}
