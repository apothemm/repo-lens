import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {inventory} from '../src/lens.ts';
test('counts files, ignores build directories and limits largest',async()=>{
 const root=await mkdtemp(join(tmpdir(),'repolens-'));try {
 await writeFile(join(root,'a.ts'),'abc');await writeFile(join(root,'b.py'),'12345');await mkdir(join(root,'node_modules'));await writeFile(join(root,'node_modules','x.js'),'ignored');
 const r=await inventory(root,1);assert.equal(r.files,2);assert.equal(r.bytes,8);assert.equal(r.largest[0].path,'b.py');assert.equal(r.extensions['.ts'].files,1);assert.deepEqual(r.errors,[]);
 await assert.rejects(()=>inventory(root,-1));
 } finally {await rm(root,{recursive:true,force:true});}
});
