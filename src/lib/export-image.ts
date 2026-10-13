import type {Report} from "./report";
import {animalSVG} from "./art";
export async function exportImage(report:Report,shop:string,url:string):Promise<Blob>{
 await document.fonts.ready;
 const canvas=document.createElement("canvas");const width=720,pad=48,inner=624;
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("浏览器暂不支持生成图片，请换浏览器重试。");
 const font=(size:number,weight=400)=>`${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
 const wrap=(text:string,size:number,max=inner)=>{ctx.font=font(size);const lines:string[]=[];let line="";for(const char of Array.from(text)){if(char==="\n"){lines.push(line);line="";continue;}if(ctx.measureText(line+char).width>max&&line){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;};
 const sections=[{title:"你的带娃模式",body:report.profile.intro},{title:"你已经拥有的力量",body:report.profile.strength},{title:"容易卡住的地方",body:report.profile.watch},{title:"一个值得了解的小知识",body:report.profile.learn},...report.insights.map(i=>({title:i.title,body:`你的选择：${i.choice}\n\n${i.analysis}`})),{title:"下次可以这样说",body:report.profile.phrase},{title:"七天小练习",body:report.profile.week.map((s,i)=>`${i+1}. ${s}`).join("\n\n")},{title:"关于这份结果",body:report.note}];
 const prepared=sections.map(s=>({...s,lines:wrap(s.body,24,inner-48)}));
 const total=720+prepared.reduce((sum,s)=>sum+92+s.lines.length*39+24,0)+200;
 canvas.width=width;canvas.height=total;
 ctx.fillStyle="#f6f2e9";ctx.fillRect(0,0,width,total);
 ctx.fillStyle="#52644f";ctx.font=font(24,600);ctx.fillText(shop,pad,60);
 ctx.fillStyle="#877f70";ctx.font=font(20);ctx.fillText("我的动物妈妈报告",pad,99);
 const img=new Image();img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(animalSVG(report.animal));await img.decode();ctx.drawImage(img,200,113,320,300);
 ctx.textAlign="center";ctx.fillStyle="#354533";ctx.font=font(48,700);ctx.fillText(report.profile.name,width/2,462);
 ctx.font=font(27);ctx.fillText(report.profile.line,width/2,511);
 if(report.secondaryName){ctx.font=font(22);ctx.fillStyle="#877f70";ctx.fillText(`也带着一点${report.secondaryName}的风格`,width/2,552);}
 ctx.font=font(20);ctx.fillStyle="#877f70";ctx.fillText(new Date(report.created).toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai"}),width/2,590);
 ctx.textAlign="left";ctx.fillStyle="#52644f";ctx.font=font(22);ctx.fillText(`情感回应：${report.dimensions.warmth}`,pad,640);ctx.fillText(`要求与边界：${report.dimensions.boundary}`,pad,679);
 let y=720;
 for(const section of prepared){const height=92+section.lines.length*39;ctx.fillStyle="#fffdf7";ctx.beginPath();ctx.roundRect(pad,y,inner,height,22);ctx.fill();ctx.fillStyle="#354533";ctx.font=font(26,700);ctx.fillText(section.title,pad+24,y+45);ctx.fillStyle="#5d6255";ctx.font=font(24);section.lines.forEach((line,i)=>ctx.fillText(line,pad+24,y+89+i*39));y+=height+24;}
 ctx.fillStyle="#877f70";ctx.font=font(19);const footer=wrap("分享结果："+url,19,inner);footer.forEach((line,i)=>ctx.fillText(line,pad,y+35+i*29));ctx.fillText("每个妈妈，都可以慢慢找到适合自己的方式。",pad,y+100);
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("图片生成失败，请重试。")),"image/png"));
}
