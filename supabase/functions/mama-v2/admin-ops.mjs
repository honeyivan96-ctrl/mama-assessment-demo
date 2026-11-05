import {typeName,refreshStoredReport} from './domain.mjs';
const enc=new TextEncoder(),hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''),bytes=h=>Uint8Array.from(h.match(/../g)||[],s=>parseInt(s,16));
export async function passwordVerifier(password,salt=hex(crypto.getRandomValues(new Uint8Array(24)))){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return {algorithm:'PBKDF2-SHA256',iterations:600000,salt,hash:hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(salt),iterations:600000,hash:'SHA-256'},key,256))};}
export async function checkPassword(password,v){if(typeof password!=='string'||!v||v.algorithm!=='PBKDF2-SHA256'||v.iterations!==600000)return false;const actual=await passwordVerifier(password,v.salt);let diff=0;for(let i=0;i<64;i++)diff|=actual.hash.charCodeAt(i)^String(v.hash).charCodeAt(i);return diff===0;}
async function encryptionKey(secret){const root=await crypto.subtle.importKey('raw',enc.encode(secret),'HKDF',false,['deriveKey']);return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:enc.encode('mama-code-v1'),info:enc.encode('admin-code-recovery-only')},root,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function sealPassword(secret,id,password){const iv=crypto.getRandomValues(new Uint8Array(12));return {v:1,iv:hex(iv),data:hex(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(id)},await encryptionKey(secret),enc.encode(password)))};}
export async function unsealPassword(secret,id,cipher){if(!cipher||cipher.v!==1)throw Error('历史密码只保存尾号，无法恢复。');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(cipher.iv),additionalData:enc.encode(id)},await encryptionKey(secret),bytes(cipher.data)));}
export function makeAdminOperations(env,store,utils,now=()=>Date.now()){
 const {HttpError,randomToken,digest,keyedHash,secureEqual,readBody}=utils;
 const fail=(msg,status=400)=>{throw new HttpError(msg,status);};
 const first=async(table,params)=>(await store.query(table,{...params,limit:'1'})).rows[0];
 const text=(v,max=300)=>{if(v===undefined||v===null)return '';if(typeof v!=='string'||v.length>max)fail('文本格式或长度不正确。');return v.trim();};
 const identity=async req=>{const raw=req.headers.get('x-mama-admin')||'';if(!/^[a-f0-9]{48}$/.test(raw))fail('请先登录管理后台。',401);const hash=await digest(raw),s=await first('mama_admin_sessions',{select:'*',token_hash:'eq.'+hash,expires:'gt.'+now()}),cred=await first('mama_admin_credentials',{select:'*',id:'eq.1'});if(!s||!cred||s.credential_version!==cred.version)fail('管理登录已过期，请重新登录。',401);return{hash,cred};};
 const rate=async(req,area,max)=>{const t=now(),ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('cf-connecting-ip')||'unknown';const key=await keyedHash(env.APP_SECRET,`${area}:${ip}:${Math.floor(t/600000)}`);const n=await store.rpc('mama_rate',{p_key:key,p_now:t,p_expires:t+600000});if(n>max)fail('操作频繁，请十分钟后重试。',429);};
 const rpc=async(name,data)=>{try{return await store.rpc(name,data);}catch(e){const m=String(e.message);if(m.includes('ADMIN_UNAUTHORIZED'))fail('管理登录已过期。',401);if(m.includes('ADMIN_CONFLICT'))fail('记录已发生变化，请刷新后重新操作。',409);if(m.includes('ADMIN_DUPLICATE'))fail('编码已存在，请更换编码或前缀。',409);if(m.includes('ADMIN_NOT_FOUND'))fail('记录不存在。',404);if(m.includes('ADMIN_ALREADY_VOID'))fail('这份答卷已经作废，不能再次返还次数。',409);if(m.includes('ADMIN_BAD_REQUEST'))fail('操作参数无效。');throw e;}};
 const mutate=async(actor,action,target,data,key,intent)=>rpc('mama_admin_mutate',{p_actor:actor,p_action:action,p_target:target,p_data:data,p_key:key,p_now:now(),p_intent:await digest(JSON.stringify(intent))});
 const safeCode=c=>{if(!c)return null;const{code_hash,password_cipher,...rest}=c;return {...rest,recoverable:!!password_cipher,remaining:c.quota-c.used};};
 const id=v=>{if(typeof v!=='string'||!/^[a-f0-9]{48}$/.test(v))fail('记录编号无效。');return v;};
 const expected=v=>{if(!Number.isInteger(v)||v<1)fail('请刷新记录后再操作。');return v;};
 const reason=v=>{const s=text(v,300);if(!s)fail('请填写操作原因。');return s;};
 const credentialCheck=async(req,password,cred)=>{await rate(req,'admin-sensitive',15);if(!await checkPassword(password,cred.verifier))fail('当前管理密码不正确。',403);};
 const filters=async params=>{const f={};for(const k of ['q','batch','channel','delivery','used','state','from','to','code_id','type','valid','version','action']){const v=params.get(k);if(v!==null&&v!=='')f[k]=text(v,100);}for(const k of ['from','to'])if(f[k]&&!/^\d{1,15}$/.test(f[k]))fail('日期范围无效。');if(f.used&&!/^\d{1,4}$/.test(f.used))fail('次数筛选无效。');if(f.q)f.password_hash=await keyedHash(env.APP_SECRET,f.q.replace(/[\s-]/g,'').toUpperCase());return f;};
 return async(req,path)=>{
  if(req.method==='POST'&&path==='analytics/home'){await rate(req,'home-views',120);const input=await readBody(req);if(typeof input.eventId!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.eventId))fail('访问标识无效。');return{data:await rpc('mama_record_home_view',{p_event_id:input.eventId,p_now:now()})};}
  if(req.method==='GET'&&/^result\/[a-f0-9]{48}$/.test(path)){const result=await first('mama_results',{select:'id,share_enabled',id:'eq.'+path.slice(7)});if(result&&!result.share_enabled)fail('此报告的分享已关闭，请联系店铺客服。',404);const version=await first('mama_report_versions',{select:'report',result_id:'eq.'+path.slice(7),published:'eq.true'});return version?{data:{id:result.id,report:version.report}}:null;}
  if(!path.startsWith('admin/'))return null;
  if(path==='admin/login'&&req.method==='POST'){
   await rate(req,'admin-login',10);const input=await readBody(req);if(typeof input.password!=='string'||input.password.length>200)fail('请输入管理密码。');let c=await first('mama_admin_credentials',{select:'*',id:'eq.1'});
   if(!c){if(!await secureEqual(input.password,env.ADMIN_PASSWORD))fail('管理密码不正确。',401);c=await rpc('mama_admin_bootstrap',{p_verifier:await passwordVerifier(input.password),p_now:now()});}
   if(!await checkPassword(input.password,c.verifier))fail('管理密码不正确。',401);
   const token=randomToken();await store.query('mama_admin_sessions',{},'POST',{token_hash:await digest(token),expires:now()+28800000,credential_version:c.version});
   await store.query('mama_audit_logs',{},'POST',{created:now(),actor:'管理员',action:'login',target:'account',reason:'',after_data:{ok:true}});return{data:{token,expires:now()+28800000,adminVersion:3}};
  }
  const{hash,cred}=await identity(req),url=new URL(req.url),method=req.method;
  if(path==='admin/logout'&&method==='POST'){await store.query('mama_admin_sessions',{token_hash:'eq.'+hash},'DELETE');await store.query('mama_audit_logs',{},'POST',{created:now(),actor:'管理员',action:'logout',target:'account',reason:''});return{data:{ok:true}};}
  if(path==='admin/stats'&&method==='GET')return{data:await rpc('mama_admin_dashboard',{p_actor:hash,p_now:now()})};
  if(path==='admin/security'&&method==='GET')return{data:{changed:cred.changed,expiresInHours:8,credentialVersion:cred.version}};
  if(method==='GET'&&['admin/stats','admin/codes','admin/submissions','admin/audit-logs','admin/batches'].includes(path)){
   const entity=({'admin/stats':'stats','admin/codes':'codes','admin/submissions':'records','admin/audit-logs':'logs','admin/batches':'batches'})[path],page=Math.max(1,Math.min(100000,Number(url.searchParams.get('page'))||1)),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||25));const data=await rpc('mama_admin_list',{p_actor:hash,p_entity:entity,p_filters:await filters(url.searchParams),p_page:Math.floor(page),p_limit:Math.floor(limit),p_now:now()});if(entity==='records')data.items=data.items.map(r=>({...r,typeName:typeName(r.report_key),publishedType:r.published_key?typeName(r.published_key):null}));return{data};
  }
  if(method==='GET'&&/^admin\/codes\/[a-f0-9]{48}$/.test(path)){
   const c=await first('mama_codes',{select:'*',id:'eq.'+path.split('/')[2]});if(!c)fail('未找到密码记录。',404);const logs=await rpc('mama_admin_list',{p_actor:hash,p_entity:'logs',p_filters:{q:c.id},p_page:1,p_limit:100,p_now:now()});const quota=(await store.query('mama_quota_events',{select:'id,delta,reason,created',code_id:'eq.'+c.id,order:'created.desc'})).rows;return{data:{code:safeCode(c),logs:logs.items,quota}};
  }
  if(method==='GET'&&/^admin\/submissions\/[a-f0-9]{48}$/.test(path)){
   const rid=path.split('/')[2],s=await first('mama_submissions',{select:'*',result_id:'eq.'+rid});if(!s)fail('未找到答卷。',404);const r=await first('mama_results',{select:'report,share_enabled',id:'eq.'+rid}),c=await first('mama_codes',{select:'*',id:'eq.'+s.code_id});const versions=(await store.query('mama_report_versions',{select:'id,revision,report,created,reason,published',result_id:'eq.'+rid,order:'revision.desc'})).rows;return{data:{submission:s,code:safeCode(c),report:r.report,shareEnabled:r.share_enabled,versions}};
  }
  if(method!=='POST')return null;
  const input=await readBody(req),key=input.requestKey;if(typeof key!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(key))fail('请求标识无效，请刷新后重试。');
  const cleanIntent={...input};delete cleanIntent.password;delete cleanIntent.currentPassword;delete cleanIntent.newPassword;
  if(path==='admin/security/password'){
   await credentialCheck(req,input.currentPassword,cred);if(typeof input.newPassword!=='string'||input.newPassword.length<10||input.newPassword.length>128||input.newPassword.trim().length<10)fail('新密码长度需为10—128位。');if(input.newPassword===input.currentPassword)fail('新密码不能与当前密码相同。');const data=await mutate(hash,'password','account',{expected:cred.version,verifier:await passwordVerifier(input.newPassword)},key,{action:'password',credentialVersion:cred.version,passwordProof:await keyedHash(env.APP_SECRET,input.newPassword)});return{data};
  }
  if(path==='admin/security/logout-all')return{data:await mutate(hash,'logout_all','account',{},key,cleanIntent)};
  if(path==='admin/codes'){
   const count=input.count;if(!Number.isInteger(count)||count<1||count>100)fail('每批生成1—100个密码。');const prefix=text(input.prefix||'CS',2).toUpperCase();if(!/^[A-Z]{2}$/.test(prefix))fail('密码前缀必须是2位英文字母。');const explicit=text(input.business_code,40);if(explicit&&(count!==1||!/^[A-Za-z0-9_-]{1,40}$/.test(explicit)))fail('自定义编码只能单个生成，格式限字母、数字、短横线和下划线。');const records=[];
   const seen=new Set();const fill=async(record)=>{let password,codeHash;for(let tries=0;tries<100;tries++){let sample;do{sample=crypto.getRandomValues(new Uint16Array(1))[0];}while(sample>=60000);password=prefix+'_'+String(sample%10000).padStart(4,'0');codeHash=await keyedHash(env.APP_SECRET,password);if(!seen.has(codeHash))break;codeHash=null;}if(!codeHash)fail('当前前缀密码较多，请更换前缀后重试。',409);seen.add(codeHash);Object.assign(record,{code_hash:codeHash,hint:password.slice(-4),password_cipher:await sealPassword(env.APP_SECRET,record.id,password)});};
   for(let i=0;i<count;i++){const codeId=randomToken(),record={id:codeId,business_code:explicit||prefix+'-'+new Date(now()+28800000).toISOString().slice(0,10).replaceAll('-','')+'-'+codeId.slice(0,8).toUpperCase()};await fill(record);records.push(record);}
   for(let pass=0;pass<30;pass++){const existing=(await store.query('mama_codes',{select:'code_hash',code_hash:'in.('+records.map(r=>r.code_hash).join(',')+')',limit:'100'})).rows;const taken=new Set(existing.map(r=>r.code_hash)),conflicts=records.filter(r=>taken.has(r.code_hash));if(!conflicts.length)break;if(pass===29)fail('当前前缀可用密码不足，请更换前缀后重试。',409);for(const record of conflicts)await fill(record);}
   const payload={records,label:text(input.label,60),batch_id:text(input.batch_id,48),channel:text(input.channel,60),note:text(input.note),order_ref:text(input.order_ref,100),expires_at:input.expires_at||null,replacement_for:input.replacement_for?id(input.replacement_for):null,disable_old:!!input.disable_old,expected:input.replacement_for?expected(input.expected):null};if(payload.expires_at!==null&&(!Number.isSafeInteger(payload.expires_at)||payload.expires_at<=now()))fail('有效期必须晚于当前时间。');if(payload.replacement_for&&!text(input.reason))fail('换码请填写原因。');payload.reason=text(input.reason);
   if(!payload.batch_id){payload.batch_id=(await keyedHash(env.APP_SECRET,'generation-batch:'+key)).slice(0,48);payload.auto_batch={name:payload.label||prefix+' '+new Date(now()+28800000).toISOString().slice(0,19).replace('T',' ')+' · '+count+'个',channel:payload.channel};}
   const generated=await mutate(hash,'generate','batch',payload,key,cleanIntent);const stored=(await store.query('mama_codes',{select:'*',id:'in.('+generated.ids.join(',')+')'})).rows;return{data:{generated:await Promise.all(stored.map(async c=>({...safeCode(c),password:await unsealPassword(env.APP_SECRET,c.id,c.password_cipher)})))}};
  }
  if(path==='admin/codes/reveal'){
   if(input.purpose!=='export')await credentialCheck(req,input.password,cred);if(!Array.isArray(input.ids)||input.ids.length<1||input.ids.length>100)fail('一次最多查看100个密码。');input.ids.forEach(id);const rows=(await store.query('mama_codes',{select:'id,business_code,hint,password_cipher',id:'in.('+input.ids.join(',')+')'})).rows;await mutate(hash,'reveal','codes',{ids:input.ids,count:rows.length},key,{ids:input.ids});return{data:{items:await Promise.all(rows.map(async c=>({id:c.id,business_code:c.business_code,hint:c.hint,password:c.password_cipher?await unsealPassword(env.APP_SECRET,c.id,c.password_cipher):null})))}};
  }
  if(/^admin\/codes\/[a-f0-9]{48}\/(metadata|delivery|status|quota|archive|restore)$/.test(path)){
   const[, ,target,action]=path.split('/'),data={expected:expected(input.expected),reason:text(input.reason)};
   if(action==='metadata'){Object.assign(data,{business_code:text(input.business_code,40),batch_id:text(input.batch_id,48),channel:text(input.channel,60),note:text(input.note),order_ref:text(input.order_ref,100),expires_at:input.expires_at||null});if(!/^[A-Za-z0-9_-]{1,40}$/.test(data.business_code))fail('编码格式无效。');if(data.expires_at!==null&&!Number.isSafeInteger(data.expires_at))fail('有效期无效。');}
   if(action==='delivery'){if(!['sent','unsent'].includes(input.delivery_status))fail('发送状态无效。');data.delivery_status=input.delivery_status;data.sent_at=input.sent_at||null;if(data.sent_at!==null&&(!Number.isSafeInteger(data.sent_at)||data.sent_at>now()))fail('实际发送时间不能晚于现在。');data.reason=reason(input.reason);}
   if(action==='archive'||action==='restore')data.reason=reason(input.reason);
   if(action==='status'){if(typeof input.active!=='boolean')fail('状态无效。');data.active=input.active;data.reason=reason(input.reason);}
   if(action==='quota'){if(!Number.isInteger(input.delta)||input.delta<1||input.delta>20)fail('每次可补1—20次。');data.delta=input.delta;data.reason=reason(input.reason);}
   return{data:await mutate(hash,action,target,data,key,cleanIntent)};
  }
  if(path==='admin/batches'||/^admin\/batches\/[a-f0-9]{48}$/.test(path)){const target=path==='admin/batches'?(await keyedHash(env.APP_SECRET,'batch:'+key)).slice(0,48):path.split('/')[2],name=text(input.name,60);if(!name)fail('请填写批次名称。');const data={name,channel:text(input.channel,60),note:text(input.note),expected:path==='admin/batches'?null:expected(input.expected)};return{data:await mutate(hash,path==='admin/batches'?'batch_create':'batch_edit',target,data,key,cleanIntent)};}
  if(/^admin\/submissions\/[a-f0-9]{48}\/(note|void|share|recalculate|report-revisions)$/.test(path)){
   const[,,target,action]=path.split('/'),s=await first('mama_submissions',{select:'*',result_id:'eq.'+target});if(!s)fail('未找到答卷。',404);const original=await first('mama_results',{select:'report',id:'eq.'+target});
   if(action==='recalculate')return{data:{report:refreshStoredReport(original.report,s),original:original.report,preview:true,explanation:'按当前支持的本问卷版本规则预览，不覆盖原始报告。'}};
   const data={expected:expected(input.expected),reason:text(input.reason)};
   if(action==='note')data.note=text(input.note,1000);
   if(action==='void'){data.reason=reason(input.reason);data.refund=input.refund===true;}
   if(action==='share'){if(typeof input.enabled!=='boolean')fail('分享状态无效。');data.enabled=input.enabled;data.reason=reason(input.reason);}
   if(action==='report-revisions'){data.reason=reason(input.reason);if(input.source==='original')data.report=original.report;else if(input.source==='current')data.report=refreshStoredReport(original.report,s);else fail('请选择原始快照或当前版本重算。');}
   return{data:await mutate(hash,action==='report-revisions'?'publish':action,target,data,key,cleanIntent)};
  }
  if(path==='admin/exports'){const mode=text(input.mode,40);if(!['codes','summary','answers','reports','finish'].includes(mode))fail('导出类型无效。');const safeFilters={};for(const k of ['from','to','batch','channel','type','valid','version','delivery','used','state'])if(input.filters?.[k]!==undefined)safeFilters[k]=text(String(input.filters[k]),100);return{data:await mutate(hash,mode==='finish'?'export_finish':'export_start',text(input.jobId,100)||key,{mode,filters:safeFilters,count:Number(input.count)||0,status:text(input.status,30)},key,cleanIntent)};}
  fail('后台接口不存在。',404);
 };
}
