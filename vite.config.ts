import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig(({mode,command})=>{
 const vars=loadEnv(mode,process.cwd(),"");
 const key=vars.VITE_SUPABASE_PUBLISHABLE_KEY||"";
 let role="";
 try{role=JSON.parse(Buffer.from(key.split(".")[1]||"","base64url").toString()).role||"";}catch{}
 if(key.startsWith("sb_secret_")||["service_role","supabase_admin"].includes(role))throw new Error("不能把Supabase服务端密钥放进前端配置。请使用公开publishable key。");
 if(command==="build"&&vars.VITE_APP_MODE!=="demo"&&!/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/mama-api$/.test(vars.VITE_API_URL||""))throw new Error("正式构建需要先配置VITE_API_URL，防止发布无法连接后端的网站。");
 return {plugins:[react()],base:vars.VITE_BASE_PATH||"/",resolve:{alias:{"@":path.resolve("src")}},build:{outDir:"dist"},server:{host:"127.0.0.1",port:5174}};
});
