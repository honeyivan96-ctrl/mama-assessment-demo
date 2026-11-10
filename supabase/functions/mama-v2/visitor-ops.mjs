import {sealPassword,unsealPassword} from './admin-ops.mjs';
import {QUESTION_VERSION} from './domain.mjs';
export function makeVisitorOperations(env,store,u,now=()=>Date.now()){
 const {HttpError,randomToken,digest,keyedHash,secureEqual,readBody}=u;
 const fail=(m,s=400)=>{throw new HttpError(m,s);};
 const first=async(t,p)=>(await store.query(t,{...p,limit:'1'})).rows[0];
 const normalized=p=>typeof p==='string'?p.trim().replace(/[\s-]/g,'').toUpperCase():'';
 const rate=async(req,area,max)=>{const t=now(),ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('cf-connecting-ip')||'unknown',key=await keyedHash(env.APP_SECRET,`${area}:${ip}:${Math.floor(t/600000)}`);if(await store.rpc('mama_rate',{p_key:key,p_now:t,p_expires:t+600000})>max)fail('操作太频繁，请十分钟后重试。',429);};
 const settings=async()=>{let a=await first('mama_shared_access',{select:'*',id:'eq.1'});if(!a){const code='MAMA2026';a=await store.rpc('mama_shared_bootstrap',{p_hash:await keyedHash(env.APP_SECRET,'shared:'+code),p_cipher:await sealPassword(env.APP_SECRET,'shared-entry',code),p_now:now()});}return a;};
 const admin=async req=>{const token=req.headers.get('x-mama-admin')||'';if(!/^[a-f0-9]{48}$/.test(token))fail('请先登录管理后台。',401);const hash=await digest(token),s=await first('mama_admin_sessions',{select:'*',token_hash:'eq.'+hash,expires:'gt.'+now()}),c=await first('mama_admin_credentials',{select:'version',id:'eq.1'});if(!s||!c||s.credential_version!==c.version)fail('管理登录已过期。',401);return hash;};
 const rpc=async(name,data)=>{try{return await store.rpc(name,data);}catch(e){const m=String(e.message);if(m.includes('ADMIN_UNAUTHORIZED'))fail('管理登录已过期。',401);if(m.includes('ADMIN_CONFLICT'))fail('设置已变化，请刷新后再修改。',409);if(m.includes('MAMA_SHARED_CHANGED'))fail('统一测试码已更新或暂停，请使用最新测试码重试。',409);if(m.includes('MAMA_CODE_DISABLED'))fail('当前浏览器的测评已停用，请联系客服。',401);throw e;}};
 return async(req,path)=>{
  if(path==='auth'&&req.method==='POST'){
   const body=await readBody(req.clone()),code=normalized(body.password);if(!code)return null;
   const a=await settings();if(!await secureEqual(await keyedHash(env.APP_SECRET,'shared:'+code),a.code_hash))return null;
   await rate(req,'shared-auth',60);if(!a.enabled)fail('统一测评入口暂时停用，请联系客服。');
   if(typeof body.browserCredential!=='string'||!/^[a-f0-9]{48}$/.test(body.browserCredential))fail('请刷新页面后重新输入测试码。');
   const browserHash=await keyedHash(env.APP_SECRET,'browser:'+body.browserCredential),id=randomToken(),codeId=randomToken();
   const v=await rpc('mama_visitor_auth',{p_browser_hash:browserHash,p_id:id,p_code_id:codeId,p_code_hash:await keyedHash(env.APP_SECRET,'visitor-entitlement:'+codeId),p_now:now(),p_access_version:a.version});
   if(v.remaining<=0)fail('这个浏览器的3次测评机会已用完，请联系客服。',409);
   const token=randomToken();await store.query('mama_sessions',{},'POST',{token_hash:await digest(token),code_id:v.code_id,expires:now()+604800000});
   return{data:{token,remaining:v.remaining,version:QUESTION_VERSION,visitorId:v.visitorId,mode:'browser',quota:v.quota}};
  }
  if(!['admin/access','admin/visitors'].includes(path))return null;
  const actor=await admin(req),a=await settings();
  if(path==='admin/access'&&req.method==='GET')return{data:{code:await unsealPassword(env.APP_SECRET,'shared-entry',a.code_cipher),enabled:a.enabled,quota:a.quota,version:a.version,changed:a.changed}};
  if(path==='admin/access'&&req.method==='POST'){
   const input=await readBody(req),code=normalized(input.code);if(!/^[A-Z0-9_]{4,32}$/.test(code))fail('测试码需4—32位英文字母、数字或下划线。');if(await first('mama_codes',{select:'id',code_hash:'eq.'+await keyedHash(env.APP_SECRET,code)}))fail('这个测试码已用于历史独立密码，请换一个统一测试码。');if(typeof input.enabled!=='boolean'||!Number.isInteger(input.expected))fail('设置参数无效。');if(typeof input.requestKey!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(input.requestKey))fail('请求标识无效。');
   const data=await rpc('mama_shared_update',{p_actor:actor,p_expected:input.expected,p_hash:await keyedHash(env.APP_SECRET,'shared:'+code),p_cipher:await sealPassword(env.APP_SECRET,'shared-entry',code),p_enabled:input.enabled,p_key:input.requestKey,p_intent:await keyedHash(env.APP_SECRET,JSON.stringify({code,enabled:input.enabled,expected:input.expected})),p_now:now()});return{data};
  }
  if(path==='admin/visitors'&&req.method==='GET'){
   const p=new URL(req.url).searchParams,q=(p.get('q')||'').trim();if(q.length>60)fail('搜索内容过长。');const used=p.get('used')||'';if(used&&!/^\d{1,4}$/.test(used))fail('使用次数无效。');
   const data=await rpc('mama_visitor_list',{p_actor:actor,p_filters:{q,used},p_page:Math.min(100000,Math.max(1,Math.floor(Number(p.get('page')))||1)),p_limit:Math.min(100,Math.max(1,Math.floor(Number(p.get('limit')))||25)),p_now:now()});return{data};
  }
  fail('接口不存在。',404);
 };
}
