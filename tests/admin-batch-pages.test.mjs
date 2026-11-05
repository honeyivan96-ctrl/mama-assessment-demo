import assert from 'node:assert/strict';import fs from 'node:fs/promises';
await import('../site/password-xlsx.js');
const source=await fs.readFile(new URL('../site/admin3.js',import.meta.url),'utf8'),body=source.slice(0,source.lastIndexOf('if(token){try{'));
const element=()=>({append(){},remove(){},setAttribute(){},style:{}}),document={getElementById:()=>null,createElement:element,body:element()},location={hostname:'example.com',hash:'#generate'},window={addEventListener(){},scrollTo(){}},sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
const build=new (Object.getPrototypeOf(async function(){}).constructor)('document','location','window','sessionStorage',body+`
const calls=[];token='test-session';shell=()=>({});message=()=>{};passwordTabs=()=>calls.push('tabs');generator=()=>calls.push('generate');listing=async()=>calls.push('list:'+(filters.codes?.batch||'all'));overview=()=>calls.push('overview');
await route();location.hash='#codes';await route();let exported;const posts=[],records=Array.from({length:205},(_,i)=>({id:'id-'+i}));
api=async path=>{const u=new URL('https://example.com/'+path),page=Number(u.searchParams.get('page'));if(u.searchParams.get('batch')!=='batch-123')throw Error('Batch filter lost');return {total:205,items:records.slice((page-1)*100,page*100)};};
post=async(path,data)=>{posts.push({path,data});if(path==='admin/exports')return {id:'job'};if(path==='admin/codes/reveal')return {items:data.ids.map(id=>({password:'CS_'+id.slice(3).padStart(4,'0')}))};throw Error('Unexpected endpoint');};
download=(blob,name)=>{exported={blob,name};};await runExport('codes','codes','',{batch:'batch-123'});return {calls,exported,posts};`);
const result=await build(document,location,window,sessionStorage);assert.deepEqual(result.calls,['tabs','generate','tabs','list:all']);
assert(result.exported.name.endsWith('.xlsx'));assert.equal(result.exported.blob.type,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
const bytes=new Uint8Array(await result.exported.blob.arrayBuffer()),view=new DataView(bytes.buffer),text=new TextDecoder();let offset=0;const files={};
while(view.getUint32(offset,true)===0x04034b50){const size=view.getUint32(offset+18,true),nameSize=view.getUint16(offset+26,true),extra=view.getUint16(offset+28,true),name=text.decode(bytes.slice(offset+30,offset+30+nameSize)),start=offset+30+nameSize+extra;files[name]=text.decode(bytes.slice(start,start+size));offset=start+size;}
assert(files['[Content_Types].xml'].includes('spreadsheetml.sheet.main+xml'));assert(files['_rels/.rels'].includes('xl/workbook.xml'));const sheet=files['xl/worksheets/sheet1.xml'];assert(sheet.includes('密码'));assert(sheet.includes('CS_0000'));assert(sheet.includes('CS_0204'));assert.equal((sheet.match(/<c /g)||[]).length,206);assert.equal((sheet.match(/<c r="A\d+" t="inlineStr"/g)||[]).length,206);assert(!sheet.includes('<f>'));assert(!sheet.includes('次数'));
const chunks=result.posts.filter(p=>p.path==='admin/codes/reveal');assert.deepEqual(chunks.map(p=>p.data.ids.length),[100,100,5]);assert(chunks.every(p=>p.data.purpose==='export'&&!('password' in p.data)));
console.log('PASS: two management tabs, all-page export, genuine single-column XLSX and no password re-entry.');
