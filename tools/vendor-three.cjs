// Produce an offline, version-pinned runtime. Normal lesson builds use this file.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),out=path.join(root,'vendor/three');
fs.mkdirSync(out,{recursive:true});
const result=esbuild.buildSync({stdin:{contents:"import * as THREE from 'three'; window.THREE=THREE;",resolveDir:root},bundle:true,minify:true,format:'iife',platform:'browser',target:['chrome110','firefox115','safari16'],write:false,legalComments:'inline'});
const bundle=result.outputFiles[0].contents;
fs.writeFileSync(path.join(out,'three.min.js'),bundle);
fs.copyFileSync(path.join(root,'node_modules/three/LICENSE'),path.join(out,'LICENSE'));
const version=JSON.parse(fs.readFileSync(path.join(root,'node_modules/three/package.json'),'utf8')).version;
fs.writeFileSync(path.join(out,'package-source.json'),JSON.stringify({name:'three',version,source:`https://www.npmjs.com/package/three/v/${version}`,license:'MIT',sha256:crypto.createHash('sha256').update(bundle).digest('hex'),rebuild:'npm run vendor:three'},null,2)+'\n');
console.log(`Bundled Three.js ${version}: ${bundle.length} bytes`);
