// Optional local-data export. All outputs stay in ignored .local/.
import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
const source=path.resolve(process.argv[2]||'../mama-test');
const directory=path.join(source,'.wrangler/state/v3/d1');
async function files(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(file));else if(file.endsWith('.sqlite'))result.push(file);}return result;}
let data;
for(const file of await files(directory)){
 const db=new DatabaseSync(file,{readOnly:true});
 try{const names=db.prepare("select name from sqlite_master where type='table'").all().map(r=>r.name);if(names.includes('codes')&&names.includes('results')){data={codes:db.prepare("select id,hash as code_hash,hint,label,used,quota,active,created from codes where label not like '%验收%'").all().map(r=>({...r,active:Boolean(r.active)})),results:db.prepare('select id,report,created from results').all().map(r=>({...r,report:JSON.parse(r.report)})),settings:db.prepare('select key,value from settings').all()};break;}}finally{db.close();}
}
if(!data)throw new Error('未找到旧版本地业务数据库');
await fs.mkdir('.local',{recursive:true});await fs.writeFile('.local/local-data.json',JSON.stringify(data));
// Never print credentials or record contents.
console.log(JSON.stringify({codes:data.codes.length,results:data.results.length,settings:data.settings.length,output:'.local/local-data.json'}));
