import {refineReport} from './refinement-editorial.mjs';
export const VERSION15='fifteen-v3-20261027-r2';
export const EDITION15='refined-20261027-r2';
export const SCENES15=['社会交往','亲子相处','学习教育'];
export const DOMAINS15=['保护与安慰','协商与相互回应','行为规范与管教','指导与学习','共同参与'];
export const SOURCES15={style:'https://files.eric.ed.gov/fulltext/ED427896.pdf',interaction:'https://doi.org/10.1111/j.1467-8624.2010.01426.x'};
const raw=[
 [
  "孩子说，几个同学一起玩，却没有叫上自己，说着有些难过。你通常先怎么处理？",
  [
   "安慰他别难过，建议找其他同学玩。",
   "听他说说经过，了解他最难受的是什么。",
   "觉得这种事很正常，让他自己想办法。",
   "先问是不是他做了什么，让同学不愿和他玩。"
  ]
 ],
 [
  "孩子想邀请同学周末来家里玩，但你原本想在家安静休息。你通常怎么决定？",
  [
   "按自己的安排拒绝，不再听他解释。",
   "听听他的计划，也说明自己的需要，再商量时间。",
   "同意同学来玩，提醒他们别太吵。",
   "先说以后再看，之后通常没有继续讨论。"
  ]
 ],
 [
  "孩子借了同学的书，说好周一归还，到了周二还在家里。他说忘记了，也不好意思再解释。你通常怎么处理？",
  [
   "要求他尽快归还并确认完成，不再听其他解释。",
   "听听他担心什么，再确定归还和说明的办法，之后确认。",
   "提醒他记得还，之后主要等他自己处理。",
   "自己替他归还，不再要求他处理这件事。"
  ]
 ],
 [
  "孩子把东西借给同学，对方一直没还。他想要回来，却不知道怎么开口，来找你帮忙。你通常怎么做？",
  [
   "直接替他联系对方，把东西要回来。",
   "了解他不好开口的原因，一起练习可以怎样说。",
   "给他一句可以用的说法，让他先试试。",
   "觉得这点小事应该自己解决，不再提供帮助。"
  ]
 ],
 [
  "几家人一起聚餐，结束时大家都在收拾。事先说好孩子收好自己的水杯和物品，他却想继续玩。你通常怎么做？",
  [
   "心疼他还没玩够，自己替他收好。",
   "让他完成自己负责的部分，和大家一起收拾。",
   "听听他的想法，明确他负责什么，再和大家一起完成。",
   "不特别要求，他想收就收，不收也算了。"
  ]
 ],
 [
  "你和孩子因一件小事发生争执，孩子委屈地哭了。你已经冷静下来，此刻通常怎么处理？",
  [
   "等他自己缓过来，暂时不回应。",
   "靠近安慰，等他愿意说时再听他讲。",
   "认为没有必要哭，让他尽快停止。",
   "递水、哄一哄，暂时不询问原因。"
  ]
 ],
 [
  "你想周末带孩子去公园，他却想去图书馆。两种安排都可行，你通常怎么决定？",
  [
   "比较双方想法，商量这次怎么安排，或轮流决定。",
   "这次直接听孩子的，不再讨论。",
   "按原来的计划去公园，希望孩子不要再反对。",
   "先听完他的理由，再决定是否调整原计划。"
  ]
 ],
 [
  "说好周末整理书桌，孩子却一直拖着，快到晚饭时间还没动。你通常怎么处理？",
  [
   "提醒几次后，还是自己替他整理好。",
   "问问他准备怎么整理，一起确定完成时间，到时确认是否完成。",
   "觉得他平时上学也辛苦，这次自己收拾，不再要求他做。",
   "要求他现在就整理，并确认完成，不再商量。"
  ]
 ],
 [
  "孩子想自己洗运动鞋，但试着刷了一会儿，鞋面还是没洗干净，便来找你帮忙。你通常怎么处理？",
  [
   "接过来替他洗好，让他去做其他事情。",
   "完整示范一遍，再让他照着做。",
   "看看他是哪里没洗干净，针对那一步教他，再让他继续洗。",
   "让他自己多刷几遍，不再具体指导。"
  ]
 ],
 [
  "一家人准备周末去超市采购，约好你列清单、孩子核对家里还缺什么。到了准备时间，他却想继续看电视。你通常怎么处理？",
  [
   "让他继续看，自己把需要买的东西都核对好。",
   "要求他先完成核对，自己继续列清单。",
   "听听他还想看多久，商量好开始时间，再一起完成采购准备。",
   "不再叫他参与，自己列自己的，缺什么到了超市再说。"
  ]
 ],
 [
  "孩子考差了，哭着把试卷拿给你。你通常先怎么处理？",
  [
   "指出最近学习中的问题，让他吸取教训。",
   "先安慰他，让他休息一会儿，暂时不谈试卷。",
   "听他说为什么难过，回应他当下的感受。",
   "拿过试卷，先找出错在哪里。"
  ]
 ],
 [
  "孩子想报的兴趣班与你想选的不同，两种课程在费用和时间上都可行。你通常怎么决定？",
  [
   "根据自己的比较，替他选定。",
   "一起了解课程，听听双方理由，再协商决定。",
   "按孩子的兴趣报名，不再讨论其他因素。",
   "先选出自己认可的几个课程，让他从中选择。"
  ]
 ],
 [
  "说好先完成当天作业再玩游戏，孩子却先玩了起来。你通常怎么处理？",
  [
   "要求结束游戏、开始作业，并确认他开始了，不再听解释。",
   "提醒先写作业，之后主要让他自己安排。",
   "听听他为什么先玩，再按约定要求开始作业，并确认执行。",
   "让他今天先玩，作业什么时候写也不再过问。"
  ]
 ],
 [
  "孩子一道题做了几次都不对，来问你怎么做。你通常怎么帮助？",
  [
   "直接告诉他答案，让他先把作业完成。",
   "从头讲一遍完整解法，再让他自己做。",
   "请他讲讲原来的思路，找到卡点后给提示。",
   "认为是他不够用心，让他继续自己想。"
  ]
 ],
 [
  "你们约好周日晚饭后一起阅读二十分钟，你也参加。到了时间，孩子却想让你陪他玩。你通常怎么处理？",
  [
   "和孩子一起按原安排阅读，完成后再做别的事。",
   "听听他想玩的内容，必要时调整时段，再落实共同阅读。",
   "理解他想玩，自己也不读了，原约定不再提。",
   "仍要求孩子读完，自己去忙手机，之后确认他是否完成。"
  ]
 ]
];
export const QUESTIONS15=raw.map(([title,options],i)=>({id:'q'+String(i+1).padStart(2,'0'),title,scene:Math.floor(i/5),domain:i%5,options:[...options,'未遇到／无法判断']}));
// Exact approved trial rubric [responsiveness, demandingness or null, interaction observation].
export const WEIGHTS15=[
 [[2,null,2],[3,null,3],[0,null,0],[0,null,0]],[[0,null,0],[3,null,3],[2,null,2],[0,null,0]],
 [[0,3,3],[3,3,3],[1,1,1],[1,0,1]],[[1,null,1],[3,null,3],[2,null,2],[0,null,0]],[[2,0,1],[1,3,3],[3,3,3],[0,0,0]],
 [[0,null,0],[3,null,3],[0,null,0],[2,null,2]],[[3,null,3],[2,null,2],[0,null,0],[3,null,3]],
 [[1,1,1],[3,3,3],[2,0,1],[0,3,3]],[[1,null,1],[2,null,3],[3,null,3],[0,null,0]],[[2,0,1],[1,3,3],[3,3,3],[0,0,0]],
 [[0,null,0],[2,null,2],[3,null,3],[0,null,0]],[[0,null,0],[3,null,3],[2,null,2],[2,null,2]],
 [[0,3,3],[1,1,1],[3,3,3],[1,0,0]],[[1,null,0],[2,null,2],[3,null,3],[0,null,0]],[[1,3,3],[3,3,3],[2,0,1],[0,3,1]]
];
export const TYPES15={
 bear:{name:'棕熊妈妈',style:'权威型',color:'#56796e',soft:'#e4eee6',animal:'bear',tag:'理解孩子，也认真守住约定。',definition:'权威型教养同时体现较多回应与明确要求：愿意了解孩子，也期待他承担适龄责任，并关注事情是否落实。',closing:'风雨来时，为你撑伞；\n平淡日常，陪你三餐；\n低谷迷茫，予你心安；\n岁月漫漫，与你相伴。\n\n孩子，妈妈愿陪你看四季烟火，\n也愿看你自在地翱翔蓝天。'},
 tiger:{name:'老虎妈妈',style:'专制型',color:'#9c7046',soft:'#f5e9d8',animal:'tiger',tag:'要求比较明确，理解还可以多留一步。',definition:'专制型倾向表现为要求与落实较多，而了解和回应孩子感受、观点的做法相对较少。这里描述本次相处方式，不是在评价你的整个人格。',closing:'愿你的坚定，给他方向；\n愿你的温柔，让他敢讲。\n\n有一天，他走得很远，\n仍愿意回头，和你说说心里话。'},
 hen:{name:'母鸡妈妈',style:'随和型',color:'#b37b70',soft:'#f6e7df',animal:'hen',tag:'你很在意感受，也可以让约定更有后续。',definition:'宽容／放任型倾向表现为较多关心和回应，而明确要求、让孩子承担责任与持续跟进的做法相对较少。',closing:'爱是风雨里的一把伞，\n也是出发前的一次放手。\n\n愿你陪他走过眼前的路，\n也相信，他会走出自己的远方。'},
 cat:{name:'猫咪妈妈',style:'佛系型',color:'#7c7796',soft:'#ece9f4',animal:'cat',tag:'多一点回应，多一个有后续的约定。',definition:'低投入型表示本次回答中，直接回应与明确跟进体现得都较少。问卷不能据此判断你不爱孩子，也不能说明日常照护的全部。',closing:'给他探索世界的自由，\n也给他回头找你的安心。\n\n愿他奔向远方时，心里始终知道：\n妈妈在，家就在。'},
 mixed15:{name:'本次类型交界',style:'类型交界',color:'#6a786a',soft:'#e9eddf',animal:'panda',tag:'先看具体做法，不急着用一个类型概括。',definition:'回应性或要求性恰好落在本版试测分界，暂不强行确定唯一动物类型。可以继续查看不同场景和具体互动。',closing:'一边爱着，一边学习；\n允许自己，也有不同的样子。\n\n愿你陪孩子慢慢长大，\n也给自己被理解的余地。'},
 insufficient15:{name:'本次信息不足',style:'信息不足',color:'#6a786a',soft:'#e9eddf',animal:'panda',tag:'有些情境尚未遇到，保留真实比填满更重要。',definition:'有效回答尚不足以支持总体分型。已完成的互动观察仍可阅读，不把“未遇到”当作低分。',closing:'不必急着给自己一个答案，\n从看见一件真实的小事开始。\n\n愿你与孩子，在日常里慢慢靠近。'}
};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const percent=x=>x===null?null:Math.round(x/3*100);
function classify15(r,d,eligible){if(!eligible||r===null||d===null)return 'insufficient15';if(Math.abs(r-1.5)<1e-9||Math.abs(d-1.5)<1e-9)return 'mixed15';return r>1.5?(d>1.5?'bear':'hen'):(d>1.5?'tiger':'cat');}
export function score15(answers){
 if(!Array.isArray(answers)||answers.length!==15||answers.some(a=>!Number.isInteger(a)||a<0||a>4))throw Error('请完成全部15道题；未遇到可选择“无法判断”。');
 const entries=answers.map((a,i)=>a===4?null:WEIGHTS15[i][a]);
 const scenes=SCENES15.map((name,s)=>{const e=entries.slice(s*5,s*5+5),r=e.filter(Boolean).map(x=>x[0]),d=e.filter(x=>x&&x[1]!==null).map(x=>x[1]),R=mean(r),D=mean(d),eligible=r.length>=4&&d.length===2,key=classify15(R,D,eligible);return {name,index:s,R,D,r:percent(R),d:percent(D),rCount:r.length,dCount:d.length,key,type:TYPES15[key].style,eligible,border:R!==null&&D!==null&&(Math.abs(R-1.5)<=.25||Math.abs(D-1.5)<=.25)};});
 const rCount=entries.filter(Boolean).length,dCount=entries.filter(e=>e&&e[1]!==null).length,eligible=rCount>=12&&dCount>=5&&scenes.every(s=>s.rCount>0&&s.dCount>0),R=mean(scenes.map(s=>s.R).filter(x=>x!==null)),D=mean(scenes.map(s=>s.D).filter(x=>x!==null)),key=classify15(R,D,eligible);
 const interactions=DOMAINS15.map((name,k)=>{const points=scenes.map((s,i)=>({scene:s.name,index:i,mean:entries[i*5+k]?.[2]??null,score:percent(entries[i*5+k]?.[2]??null)})),valid=points.filter(p=>p.mean!==null),m=valid.length>=2?mean(valid.map(p=>p.mean)):null;return {name,index:k,mean:m,score:percent(m),count:valid.length,points,varied:valid.length>=2&&Math.max(...valid.map(p=>p.mean))-Math.min(...valid.map(p=>p.mean))>=2};});
 return {R,D,r:percent(R),d:percent(D),rCount,dCount,key,eligible,border:eligible&&(Math.abs(R-1.5)<=.25||Math.abs(D-1.5)<=.25),scenes,interactions};
}
const sceneRead=s=>!s.eligible?'有效信息不足，暂不确定本场景类型。':s.key==='mixed15'?'本场景处于类型交界，结合具体选择理解。':s.key==='bear'?'你会回应孩子，也保留明确要求与后续落实。':s.key==='tiger'?'要求和任务落实更靠前，倾听与回应体现得较少。':s.key==='hen'?'照顾意愿与感受较多，对责任和约定的跟进相对少。':'直接回应与后续跟进都较少，不能据此判断关爱程度。';
const domainCopy=[
 ['孩子表达难过时，你更常了解和承接他的感受。','安慰有时会出现，也有些情境更快进入处理问题。','直接安慰与了解难过的做法较少，更容易进入纠错或让他自己面对。'],
 ['你愿意听取理由，让孩子的意见有参与安排的机会。','你提供一些表达或选择机会，但不同事情的商量空间有区别。','决定更多由家长作出，孩子解释和影响安排的机会较少。'],
 ['相关约定和责任比较明确，也体现了落实或确认。','会提醒或提出要求，但后续落实还不完全稳定。','提醒之后常等待、接手或不再要求，孩子需要承担什么还可更清楚。'],
 ['你较多提供示范、提示或练习，帮助孩子学会方法。','实际帮助已经出现，但有时更集中在完成眼前事情。','更容易直接接手、给答案，或让孩子自行解决，具体方法支持较少。'],
 ['你和孩子有实际参与，孩子也拥有适当角色与责任。','一起做事的机会有所体现，但有时会由家长接手或各自完成。','共同完成与孩子实际参与体现较少，可以从一件日常小事开始。']
];
export function report15(answers,{profile={},context={}}={},created=Date.now()){
 const score=score15(answers),t=TYPES15[score.key],pains=Array.isArray(context.pain)?context.pain:[],beliefs=Array.isArray(context.belief)?context.belief:[],axis=score.eligible?`本次回应性 ${score.r}，要求性 ${score.d}。`:'有效信息尚不足以确定总体类型。';
 const dimensions=score.interactions.map(x=>({...x,title:x.score===null?'本项信息不足':x.mean>=2?'相关做法体现较多':x.mean>=1?'已有部分做法':'值得留意的部分',analysis:x.score===null?'至少两道有效回答后，再观察这类互动。':domainCopy[x.index][x.mean>=2?0:x.mean>=1?1:2],reminder:x.varied?'三个场景的处理差异较大，建议结合下方各场景点位理解。':'分数表示本次相关做法的呈现程度，不是能力排名。'}));
 const validScenes=score.scenes.filter(s=>s.eligible&&!['mixed15','insufficient15'].includes(s.key)),consistent=validScenes.length===3&&new Set(validScenes.map(s=>s.key)).size===1;
 const sceneSummary=consistent?'三个场景的分类方向一致。具体回应与要求仍可随事情合理调整，不代表所有行为都完全相同。':validScenes.length===3?'你的处理方式会随场景变化。下面分别说明在哪些事情上更愿意回应，哪些事情上更坚持要求。':'部分场景的信息或倾向尚不明确，保留已完成的观察，不用总体类型填补缺失信息。';
 const highlights={high:[],low:[],equal:true};const v=dimensions.filter(d=>d.score!==null);if(v.length){const max=Math.max(...v.map(d=>d.score)),min=Math.min(...v.map(d=>d.score));Object.assign(highlights,{max,min,equal:max===min,high:max===min?[]:dimensions.flatMap((d,i)=>d.score===max?[i]:[]),low:max===min?[]:dimensions.flatMap((d,i)=>d.score===min?[i]:[])});}
 const evidence=[...new Set([score.key==='tiger'||score.key==='cat'?10:0,score.key==='hen'?7:12,score.key==='bear'?14:3])].filter(i=>answers[i]!==4).slice(0,3).map(i=>({scene:SCENES15[Math.floor(i/5)]+' · '+DOMAINS15[i%5],question:i+1,choice:QUESTIONS15[i].options[answers[i]],meaning:'此选择作为对应情境中的行为依据，不单独决定总体类型。'}));
 const intentions=[];const add=(title,text)=>intentions.push({title,text});
 if(beliefs.includes(0))add('你认同较强约束能帮助孩子记住教训','这是观念认同，不能直接证明实际发生过打骂。报告仍以具体做法判断回应与要求。');
 if(beliefs.includes(1))add('你希望孩子懂得规则与责任',score.D!==null&&score.D>1.5?'具体回答中也体现了明确要求与落实。坚持的同时，仍可以给孩子说明困难的机会。':'具体回答中，要求后的落实相对较少。需要补上的可以是一项清楚、可执行的后续安排。');
 if(beliefs.includes(2))add('你认为天赋影响学习表现',[1,2].includes(answers[13])?'遇到不会的题，你仍提供讲解或提示，说明也在关注能够改变的方法。':'天赋观念与提供具体学习帮助是两件事。本次指导题可帮助你观察自己通常怎样介入。');
 if(beliefs.includes(3))add('你希望提前准备，增加孩子的机会','可以结合兴趣班与学习约定的回答，看准备目标与孩子参与怎样同时落实。');
 if(beliefs.includes(4))add('你希望尊重孩子的兴趣和感受',answers[11]===0?'但兴趣班意见不同时，你选择由自己作最终决定。在这个场景中，孩子影响安排的空间较少。':answers[11]===4?'兴趣班一题未提供有效回答，不据此判断理念和做法是否一致。':'兴趣班选择中，你给了孩子一定参与空间；范围与协商方式可结合具体选择理解。');
 if(beliefs.includes(5))add('你重视努力和坚持','坚持需要适合孩子能力的方法与安排。可以对照指导题，看看自己提供了哪些帮助。');
 const advice=[],seen=new Set();const tip=(id,title,text)=>{if(seen.has(id)||advice.length>=3)return;seen.add(id);advice.push({id,title,text});};
 const learning=()=>tip('study','把学习期待落实成具体帮助',answers[13]===2?'你已经会了解思路、针对卡点给提示。可以和孩子约定一小段练习，再让他解释怎样完成，观察方法是否掌握。':'孩子不会做时，先请他讲思路，确认卡在哪一步，再决定示范或提示。把目标缩小到一类题或一个步骤，避免只要求认真一点。');
 const phone=()=>tip('phone','把游戏结束的办法提前说清',answers[12]===0||answers[12]===2?'你已经会要求结束游戏、开始作业。下一步可以提前商量使用时段、结束提醒和超时后的处理，减少临时争论。':'你更多依靠提醒或让孩子安排。可以共同明确先后顺序、开始时间与确认方式，并按同一安排持续执行。');
 const relation=()=>tip('relationship','把亲近落到一个可发生的回应里',answers[5]===1?'你已经愿意靠近、安慰并听孩子讲。可以继续留出不围绕学习的相处机会，先听完，再问是否需要一起想办法。':'争执后先等双方冷静，再承认需要调整的表达，听孩子说完。平时留一小段不检查学习的相处时间，让交流有机会自然发生。');
 const boundary=()=>tip('boundary','给选择，也说明需要承担的责任','先分清哪些是可商量的偏好，哪些是已约定的责任。让孩子参与安排，同时明确下一步做什么、什么时候确认；合理调整也应形成新约定。');
 for(const i of pains){if(i===0)learning();if(i===1)phone();if(i===2)relation();if(i===3)boundary();if(i===4)tip('independence','根据会不会做，调整介入程度','已经会做、后果可承担的事，让孩子先负责；还不会时先教方法，再逐步减少帮助。接手完成与帮助学会，需要分别看。');if(i===6)tip('other','先把补充困扰缩小到一个具体片段','自由描述不足以确定原因。可以记录最近一次发生了什么、你怎样处理、孩子如何回应，再对照相关互动建议选择一个可调整的环节。');}
 if(!pains.includes(5)&&advice.length<3){const low=dimensions.filter(d=>d.mean!==null&&d.mean<1.5).sort((a,b)=>a.mean-b.mean)[0];if(low){if(low.index===0)relation();if(low.index===1||low.index===2)boundary();if(low.index===3)learning();if(low.index===4)tip('participation','让孩子在共同做事中有一个实际角色','选择一件他能够完成的小事，说明负责哪一部分，和家人一起做。遇到不会的地方提供示范，避免一着急就全部代劳。');}}
 if(!advice.length)tip('keep','先保留已经有效的做法','你暂时没有明显困惑，可以继续保持已有的回应和安排。选择一项你愿意观察的互动，看孩子是否有参与机会、约定能否持续，再按需要调整。');
 return refineReport({schema:'mama15',version:VERSION15,edition:EDITION15,key:score.key,created,profile:{name:t.name,style:t.style,tag:t.tag,body:t.definition,quote:t.tag,edge:'',closing:t.closing},theme:{...t},axes:{R:score.R,D:score.D,r:score.r,d:score.d,rCount:score.rCount,dCount:score.dCount,eligible:score.eligible,border:score.border},scenes:score.scenes.map(s=>({...s,reading:sceneRead(s)})),consistent,sceneSummary,dimensions,highlights,intentions,advice,identity:{definition:t.definition,evidence,symbolism:'动物名称为本产品的趣味表达，不是研究原有分类；不代表固定人格或孩子的真实感受。'},summary:axis+(score.eligible?'类型描述本次自述的主要育儿倾向。':''),sources:SOURCES15,reference:{text:'分数与1.5分界为本版试测规则，非标准化诊断、常模或人群排名。'}},answers);
}
