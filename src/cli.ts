import { inventory } from './lens.ts';
try {
    const args=process.argv.slice(2);
    if (!args.length) { console.log('RepoLens DIRECTORY [--top N]'); }
    else {
        if (args.length !== 1 && !(args.length === 3 && args[1] === '--top')) throw new Error('Invalid arguments');
        const result=await inventory(args[0],args.length===3?Number(args[2]):10);
        console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=2;
    }
} catch(e) { console.error(String(e));process.exitCode=1; }
