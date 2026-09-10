const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),papers=JSON.parse(fs.readFileSync(path.join(root,'papers/catalog.json'),'utf8')).filter(p=>p.year===2024),issues=[];
for(const paper of papers){const dir=path.join(root,paper.build.moduleDir);for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js'))){const source=fs.readFileSync(path.join(dir,name),'utf8');new vm.Script(source,{filename:`${paper.id}/${name}`});
 // JavaScript silently turns "\le" into "le" and "\frac" into a control character.
 // Raw TeX templates are authoritative; ordinary strings must escape the slash.
 const quoted=/M\.(?:inline|block)\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
 for(const m of source.matchAll(quoted)){if(/(?<!\\)(?:\\\\)*\\[A-Za-z]/.test(m[2]))issues.push({file:`${paper.id}/${name}`,text:m[2]});}
 assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(source),`${paper.id}/${name}: source contains control characters`);
}}
assert.deepEqual(issues,[],'Use String.raw for TeX commands in ordinary literals');console.log('PASS: registered 2024 source syntax, TeX string escaping and control-character checks.');
