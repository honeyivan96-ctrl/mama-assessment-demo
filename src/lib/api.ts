export const isDemo=import.meta.env.VITE_APP_MODE==="demo";
export const basePath=import.meta.env.BASE_URL;
const url=(import.meta.env.VITE_API_URL||"").replace(/\/$/,"");
const sessionKey="mama-production-session",adminKey="mama-production-admin";
export async function api(path:string,data?:unknown):Promise<any>{
 if(isDemo){const {demoApi}=await import("./demo-api");return demoApi(path,data);}
 if(!/^https:\/\/[^/]+\.supabase\.co\/functions\/v1\/mama-api$/.test(url))throw new Error("正式版尚未连接Supabase，请先完成部署配置。");
 const headers:Record<string,string>={};const token=sessionStorage.getItem(path.startsWith("admin/")?adminKey:sessionKey);
 if(token)headers[path.startsWith("admin/")?"X-Mama-Admin":"X-Mama-Session"]=token;
 if(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)headers.apikey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 if(data!==undefined)headers["Content-Type"]="application/json";
 let res:Response;try{res=await fetch(url+"/"+path,{method:data===undefined?"GET":"POST",headers,body:data===undefined?undefined:JSON.stringify(data),credentials:"omit"});}catch{throw new Error("暂时连接不到测评服务，请检查网络后重试。");}
 let out:any;try{out=await res.json();}catch{throw new Error("测评服务暂时不可用，请稍后重试。");}
 if(!res.ok){if(res.status===401){sessionStorage.removeItem(path.startsWith("admin/")?adminKey:sessionKey);}throw new Error(out.error||"操作失败，请重试。");}
 if(path==="auth"&&typeof out.token==="string")sessionStorage.setItem(sessionKey,out.token);
 if(path==="admin/login"&&typeof out.token==="string")sessionStorage.setItem(adminKey,out.token);
 if(path==="admin/logout")sessionStorage.removeItem(adminKey);
 return out;
}
