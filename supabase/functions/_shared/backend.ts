import {publicQuestions} from "./questions.ts";
import {buildReport} from "./report.ts";
export type Environment={SUPABASE_URL:string;SUPABASE_SERVICE_ROLE_KEY:string;APP_SECRET:string;ADMIN_PASSWORD:string;ALLOWED_ORIGINS:string};
export class HttpError extends Error{constructor(message:string,public status=400){super(message);}}
export interface Store{query(table:string,params:Record<string,string>,method?:string,value?:unknown,prefer?:string):Promise<{rows:any[];total:number}>;rpc(name:string,value:unknown):Promise<any>;}
export function createStore(env:Environment):Store{
 const request=async(path:string,method:string,value?:unknown,prefer?:string)=>{
  const res=await fetch(env.SUPABASE_URL+"/rest/v1/"+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json",...(prefer?{Prefer:prefer}:{})},body:value===undefined?undefined:JSON.stringify(value)});
  const raw=await res.text();let data:any;try{data=raw?JSON.parse(raw):[];}catch{throw new HttpError("数据库暂时不可用，请稍后重试。",503);}
  if(!res.ok){const message=String(data.message||"");if(message.includes("MAMA_QUOTA_EXHAUSTED"))throw new HttpError("这个密码的3次机会已用完，本次未扣次数。",409);if(message.includes("MAMA_CODE_DISABLED"))throw new HttpError("密码已停用，请联系店铺客服。",401);if(message.includes("MAMA_SESSION_EXPIRED"))throw new HttpError("验证已过期，请重新输入密码。",401);if(message.includes("MAMA_ATTEMPT_EXPIRED"))throw new HttpError("本次答题已超过24小时，请重新开始。未扣次数。");if(message.includes("MAMA_ATTEMPT_INVALID"))throw new HttpError("答题记录无效，请重新开始。");throw new HttpError("数据库暂时不可用，请稍后重试。",503);}
  return {data,total:Number(res.headers.get("content-range")?.split("/")[1])||0};
 };
 return {async query(table,params,method="GET",value,prefer){const r=await request(table+"?"+new URLSearchParams(params),method,value,prefer);return {rows:Array.isArray(r.data)?r.data:[],total:r.total};},async rpc(name,value){return (await request("rpc/"+name,"POST",value)).data;}};
}
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,"0")).join("");}
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,"0")).join("");}
export async function keyedHash(secret:string,value:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,"0")).join("");}
export async function secureEqual(a:string,b:string){const x=await digest(a),y=await digest(b);let difference=0;for(let i=0;i<x.length;i++)difference|=x.charCodeAt(i)^y.charCodeAt(i);return difference===0;}
async function readBody(req:Request){if(!req.headers.get("content-type")?.startsWith("application/json"))throw new HttpError("请求格式错误。",415);if(Number(req.headers.get("content-length")||0)>16384)throw new HttpError("请求过大。",413);if(!req.body)throw new HttpError("请求内容为空。");const reader=req.body.getReader();const chunks:Uint8Array[]=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16384){await reader.cancel();throw new HttpError("请求过大。",413);}chunks.push(value);}const all=new Uint8Array(length);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}try{const data=JSON.parse(new TextDecoder().decode(all));if(!data||typeof data!=="object"||Array.isArray(data))throw new Error();return data;}catch{throw new HttpError("请求格式错误。");}}
export function makeHandler(env:Environment,store:Store=createStore(env),now=()=>Date.now()){
 const origins=env.ALLOWED_ORIGINS.split(",").map(v=>v.trim()).filter(Boolean);
 const first=async(table:string,params:Record<string,string>)=>(await store.query(table,{...params,limit:"1"})).rows[0];
 const settings=async()=>{const rows=(await store.query("mama_settings",{select:"key,value"})).rows;const values=Object.fromEntries(rows.map(r=>[r.key,r.value]));return {shop:values.shop||"妈妈成长小站",contact:values.contact||"请通过购买测评的店铺联系客服",reward:"感谢你的支持！在店铺好评后，联系客服发送好评截图，即可获得1元返现。"};};
 const headerToken=(req:Request,header:string)=>{const t=req.headers.get(header)||"";if(!/^[a-f0-9]{48}$/.test(t))throw new HttpError(header==="x-mama-admin"?"请先登录管理后台。":"请先输入测评密码。",401);return t;};
 const buyer=async(req:Request)=>{const hash=await digest(headerToken(req,"x-mama-session"));const s=await first("mama_sessions",{select:"token_hash,code_id",token_hash:"eq."+hash,expires:"gt."+now()});if(!s)throw new HttpError("验证已过期，请重新输入测评密码。",401);const c=await first("mama_codes",{select:"id,used,quota,active",id:"eq."+s.code_id});if(!c||!c.active)throw new HttpError("密码已失效或停用，请联系店铺客服。",401);return {hash,...c};};
 const admin=async(req:Request)=>{const hash=await digest(headerToken(req,"x-mama-admin"));if(!await first("mama_admin_sessions",{select:"token_hash",token_hash:"eq."+hash,expires:"gt."+now()}))throw new HttpError("管理登录已过期。",401);return hash;};
 const rate=async(req:Request,area:string,max:number)=>{const time=now(),ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("cf-connecting-ip")||"unknown";const key=await keyedHash(env.APP_SECRET,`${area}:${ip}:${Math.floor(time/600000)}`);const count=await store.rpc("mama_rate",{p_key:key,p_now:time,p_expires:time+600000});if(count>max)throw new HttpError("操作太频繁，请十分钟后再试。",429);};
 return async(req:Request):Promise<Response>=>{
  const origin=req.headers.get("origin");const allowed=origin!==null&&origins.includes(origin);
  const headers:Record<string,string>={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Origin",...(allowed?{"Access-Control-Allow-Origin":origin!}:{}),"Access-Control-Allow-Headers":"content-type,apikey,x-mama-session,x-mama-admin","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Max-Age":"600"};
  const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
  try{
   if(origin!==null&&!allowed)throw new HttpError("请求来源未获授权。",403);
   if(req.method==="OPTIONS")return new Response(null,{status:allowed?204:403,headers});
   if(!["GET","POST"].includes(req.method))throw new HttpError("请求方法不支持。",405);
   if(req.method==="POST"&&!allowed)throw new HttpError("请求来源未获授权。",403);
   if(env.APP_SECRET.length<32||env.ADMIN_PASSWORD.length<16)throw new HttpError("服务尚未完成安全配置。",503);
   const url=new URL(req.url),marker="/mama-api/",index=url.pathname.indexOf(marker);if(index<0)throw new HttpError("接口不存在。",404);const path=url.pathname.slice(index+marker.length);
   if(req.method==="GET"&&path==="config")return json(await settings());
   if(req.method==="POST"&&path==="auth"){
    await rate(req,"buyer-auth",20);const input=await readBody(req);if(typeof input.password!=="string")throw new HttpError("请输入测评密码。");const password=input.password.trim().replace(/[\s-]/g,"").toUpperCase();if(password.length<8||password.length>64)throw new HttpError("密码无效，请检查后重试。");
    const c=await first("mama_codes",{select:"id,used,quota,active",code_hash:"eq."+await keyedHash(env.APP_SECRET,password)});if(!c||!c.active)throw new HttpError("密码无效或已停用，请检查后重试。");if(c.used>=c.quota)throw new HttpError("这个密码的3次机会已用完，请联系店铺客服。");
    const token=randomToken();await store.query("mama_sessions",{},"POST",{token_hash:await digest(token),code_id:c.id,expires:now()+604800000});return json({token,remaining:c.quota-c.used});
   }
   if(req.method==="GET"&&path==="session"){const s=await buyer(req);return json({remaining:s.quota-s.used,questions:publicQuestions()});}
   if(req.method==="POST"&&path==="start"){
    const s=await buyer(req);if(s.used>=s.quota)throw new HttpError("测评次数已用完，请联系店铺客服。");await rate(req,"start",60);const token=randomToken();await store.query("mama_attempts",{},"POST",{token_hash:await digest(token),session_hash:s.hash,code_id:s.id,expires:now()+86400000});return json({attempt:token,remaining:s.quota-s.used});
   }
   if(req.method==="POST"&&path==="complete"){
    const s=await buyer(req);const input=await readBody(req);if(typeof input.attempt!=="string"||!/^[a-f0-9]{48}$/.test(input.attempt)||!Array.isArray(input.answers))throw new HttpError("答题记录无效，请重新开始。");let report;try{report=buildReport(input.answers);}catch(e){throw new HttpError((e as Error).message);}
    const data=await store.rpc("mama_complete",{p_attempt_hash:await digest(input.attempt),p_session_hash:s.hash,p_report:report,p_result_id:randomToken(),p_now:now()});return json(data);
   }
   if(req.method==="GET"&&path.startsWith("result/")){
    const id=path.slice(7);if(!/^[a-f0-9]{48}$/.test(id))throw new HttpError("结果链接无效。",404);const r=await first("mama_results",{select:"id,report",id:"eq."+id});if(!r)throw new HttpError("未找到这份结果，请检查链接。",404);return json(r);
   }
   if(req.method==="POST"&&path==="admin/login"){
    await rate(req,"admin-auth",10);const input=await readBody(req);if(typeof input.password!=="string"||!await secureEqual(input.password,env.ADMIN_PASSWORD))throw new HttpError("管理密码不正确。",401);const token=randomToken();await store.query("mama_admin_sessions",{},"POST",{token_hash:await digest(token),expires:now()+28800000});return json({token});
   }
   if(path.startsWith("admin/")){
    const adminHash=await admin(req);
    if(req.method==="POST"&&path==="admin/logout"){await store.query("mama_admin_sessions",{token_hash:"eq."+adminHash},"DELETE");return json({ok:true});}
    if(req.method==="GET"&&path==="admin/codes"){
     const page=Math.max(1,Math.min(100000,Math.floor(Number(url.searchParams.get("page")))||1));const r=await store.query("mama_codes",{select:"id,hint,label,used,quota,active,created",order:"created.desc,id.desc",limit:"100",offset:String((page-1)*100)},"GET",undefined,"count=exact");return json({codes:r.rows.map(c=>({...c,active:c.active?1:0})),total:r.total,page,config:await settings()});
    }
    if(req.method==="POST"&&path==="admin/codes"){
     const input=await readBody(req);if(!Number.isInteger(input.count)||input.count<1||input.count>100)throw new HttpError("每批可生成1至100个密码。");const label=typeof input.label==="string"?input.label.trim().slice(0,60):"",created=now();const records=[];for(let i=0;i<input.count;i++){const password=randomToken().slice(0,16).toUpperCase();records.push({id:randomToken(),password:password.match(/.{4}/g)!.join("-"),code_hash:await keyedHash(env.APP_SECRET,password),hint:password.slice(-4),label,created});}
     await store.query("mama_codes",{},"POST",records.map(({password,...record})=>record));return json({generated:records.map(r=>({password:r.password,label:r.label,quota:3}))});
    }
    if(req.method==="POST"&&path==="admin/toggle"){
     const input=await readBody(req);if(typeof input.id!=="string"||!/^[a-f0-9]{48}$/.test(input.id)||![0,1].includes(input.active))throw new HttpError("操作参数错误。");await store.query("mama_codes",{id:"eq."+input.id},"PATCH",{active:Boolean(input.active)});return json({ok:true});
    }
    if(req.method==="POST"&&path==="admin/settings"){
     const input=await readBody(req);if(typeof input.shop!=="string"||typeof input.contact!=="string"||!input.shop.trim()||!input.contact.trim()||input.shop.length>40||input.contact.length>300)throw new HttpError("店铺名需1—40字，客服提示需1—300字。");await store.query("mama_settings",{on_conflict:"key"},"POST",[{key:"shop",value:input.shop.trim()},{key:"contact",value:input.contact.trim()}],"resolution=merge-duplicates");return json(await settings());
    }
   }
   throw new HttpError("接口不存在。",404);
  }catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);return json({error:"服务暂时不可用，请稍后重试。未成功生成结果不会扣次数。"},503);}
 };
}
