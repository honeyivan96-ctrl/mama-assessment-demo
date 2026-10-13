import {publicQuestions} from "../../supabase/functions/_shared/questions";
import {buildReport} from "../../supabase/functions/_shared/report";
const config={shop:"动物妈妈 · 免费演示",contact:"此页面为免费体验，不售卖密码、不提供返现。",reward:"此页面为免费演示。"};
export async function demoApi(path:string,data?:any){
 if(path==="config")return config;
 if(path==="session")return {remaining:3,questions:publicQuestions()};
 if(path==="start")return {attempt:crypto.randomUUID(),remaining:3};
 if(path==="complete"){
  const answers=data?.answers;buildReport(answers);
  const id="demo_"+btoa(JSON.stringify([Date.now(),...answers])).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
  return {id,remaining:3};
 }
 if(path.startsWith("result/demo_")){
  try{const raw=path.slice("result/demo_".length);if(raw.length>200)throw new Error();const values=JSON.parse(atob(raw.replaceAll("-","+").replaceAll("_","/")));if(!Array.isArray(values)||values.length!==17||!Number.isSafeInteger(values[0])||values[0]<0)throw new Error();const report=buildReport(values.slice(1));report.created=values[0];return {id:path.slice(7),report};}catch{throw new Error("演示结果链接无效。");}
 }
 if(path.startsWith("admin/"))throw new Error("免费演示版不提供店铺管理。");
 throw new Error("免费演示版不支持这个操作。");
}
