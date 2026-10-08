import { readdir, lstat } from 'node:fs/promises';
import { resolve, relative, extname, join } from 'node:path';
export async function inventory(root: string, top = 10) {
    if (!Number.isInteger(top) || top < 0 || top > 1000) throw new Error('top must be 0..1000');
    root = resolve(root);
    if (!(await lstat(root)).isDirectory()) throw new Error('Root must be a directory');
    const ignored = new Set(['.git','node_modules','.venv','bin','obj','build','dist','target']);
    const extensions: Record<string,{files:number;bytes:number}> = Object.create(null);
    const largest: {path:string;bytes:number}[] = [];
    const errors: {path:string;error:string}[] = [];
    let files = 0, bytes = 0, skippedLinks = 0;
    async function visit(dir: string): Promise<void> {
        let entries;
        try { entries = await readdir(dir,{withFileTypes:true}); }
        catch(e) { errors.push({path:relative(root,dir),error:String(e)});return; }
        for (const entry of entries) {
            const path = join(dir,entry.name);
            try {
                const st = await lstat(path);
                if (st.isSymbolicLink()) { skippedLinks++; continue; }
                if (st.isDirectory()) { if(!ignored.has(entry.name)) await visit(path); continue; }
                if (!st.isFile()) continue;
                files++;bytes += st.size;
                const extension = extname(entry.name).toLowerCase() || '[no extension]';
                const group = extensions[extension] ??= {files:0,bytes:0};group.files++;group.bytes += st.size;
                largest.push({path:relative(root,path),bytes:st.size});
                largest.sort((a,b)=>b.bytes-a.bytes || a.path.localeCompare(b.path));largest.length = Math.min(largest.length,top);
            } catch(e) { errors.push({path:relative(root,path),error:String(e)}); }
        }
    }
    await visit(root);
    return {root,files,bytes,skippedLinks,extensions,largest,errors};
}
