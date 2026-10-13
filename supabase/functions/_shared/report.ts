import { questions } from "./questions.ts";
export type Animal = "elephant" | "tiger" | "hen" | "cat";
export const profiles: Record<Animal,{name:string;line:string;intro:string;strength:string;watch:string;learn:string;phrase:string;week:string[]}> = {
elephant:{name:"大象妈妈",line:"陪你走，也教你走。",intro:"从这次选择看，你通常愿意回应孩子，也希望约定真正落实。你能给孩子帮助，同时把适龄的责任留给他。",strength:"你能把关心和要求放在一起：孩子可以表达意见，事情也有明确的下一步。",watch:"如果每件事都要解释、陪伴和检查，你也可能很累。可以让已经熟练的小事逐渐交给孩子。",learn:"理解感受与答应要求是两件事。你可以承认孩子还想玩，同时坚持今天的结束时间。",phrase:"“我听见你的想法了。今天还是按约定来，我们一起想想怎么做到。”",week:["选一件孩子已经会做的小事，交还给他。","一起说明完成时间和需要做到的程度。","只在约好的时间查看一次，减少连续提醒。","有困难先问卡在哪一步，再决定帮多少。","具体说出你看到的努力，不只评价结果。","留意自己有没有为了完美又接手。","一起回顾：哪一步已经可以少帮一点？"]},
tiger:{name:"老虎妈妈",line:"方向定了，就往前走。",intro:"从这次选择看，你更重视要求与执行，遇到问题容易先推动事情完成。孩子的解释和情绪，有时排在任务之后。",strength:"你重视责任，愿意投入精力推动约定落实，生活中的要求通常比较明确。",watch:"当孩子还没说清困难，你已经开始纠正，他可能先想着如何避免批评。可以多留一句话的空间。",learn:"坚定要求不必依靠否定孩子。把“你怎么总这样”换成具体的行为要求，更容易让孩子知道该做什么。",phrase:"“这件事还是要完成。你先说说，哪一步让你觉得难？”",week:["选一个最容易催促的场景。","提出要求前，先让孩子说完一句。","把“快点”换成具体动作和时间。","孩子有情绪时，先简短回应再谈任务。","尝试给两个都能执行的选择。","如果语气过重，把道歉与任务要求分开。","回顾：多听一句，是否减少了反复争执？"]},
hen:{name:"母鸡妈妈",line:"看你难受，我就想护着。",intro:"从这次选择看，你比较愿意接住孩子的情绪。在要求、责任或约定上，你有时会让步，或替孩子做完。",strength:"你愿意安慰、照顾和靠近，孩子的感受在你这里有位置。",watch:"为了让眼前轻松一点而不断接手，你可能越来越累。孩子也可能少了一次自己练习的机会。",learn:"允许孩子暂时失望，也可以是关心。陪着他的情绪，不一定要替他取消责任。",phrase:"“我知道你现在不想做。你先做这一小步，需要帮助再叫我。”",week:["选一件平时常由你代做的小事。","确认孩子有能力完成，再说明要求。","他撒娇时先回应，不马上答应代做。","只帮难的部分，剩下的交还给他。","在约好的时间确认一次完成情况。","坚持一个你能长期执行的小约定。","一起回顾：哪些事情他已经能自己来？"]},
cat:{name:"猫咪妈妈",line:"给你空间，也练习主动靠近。",intro:"从这次选择看，你在一些场景里较少继续追问或跟进，常让孩子自己处理。这可能与习惯、照料分工或近期状态有关，测试不能判断原因。",strength:"你给了孩子自己安排的空间。对于已经熟练的事情，这种空间可以保留。",watch:"小学生还在练习求助和自我管理。有时看起来没事，可能只是还没说出来，可以多设置一个稳定的交流入口。",learn:"让孩子自己做，与完全不参与有区别。自主支持还包括关注、必要帮助和适龄边界。",phrase:"“今天有什么想让我听一听的？你需要我帮哪一部分？”",week:["选一个每天能留出的五分钟。","主动问一件具体的小事，耐心听完。","一起定一个简单、可执行的日常约定。","到约好的时间看一眼，必要时帮一小步。","孩子分享开心的事时，追问一句细节。","检查家里谁在负责哪些照料任务。","回顾：哪个交流时间最容易坚持？"]}
};
export type Report = {version:string;animal:Animal;secondary:Animal|null;blend:boolean;created:number;profile:typeof profiles[Animal];secondaryName:string|null;dimensions:{warmth:string;boundary:string};insights:{title:string;choice:string;analysis:string}[];note:string};
export function buildReport(answers:number[]): Report {
 if(answers.length!==questions.length || answers.some(a=>!Number.isInteger(a)||a<0||a>3)) throw new Error("请完成全部16道题后再提交。");
 const picks=questions.map((q,i)=>({q,o:q.options[answers[i]]}));
 const wm=picks.map(p=>p.o.w).filter((n):n is number=>n!==null); const bm=picks.map(p=>p.o.b).filter((n):n is number=>n!==null);
 const w=wm.reduce((a,b)=>a+b,0)/wm.length,b=bm.reduce((a,b)=>a+b,0)/bm.length;
 const key=(wh:boolean,bh:boolean):Animal=>wh?(bh?"elephant":"hen"):(bh?"tiger":"cat");
 const cutoff=1.75; const animal=key(w>=cutoff,b>=cutoff); const blend=Math.min(Math.abs(w-cutoff),Math.abs(b-cutoff))<=0.35;
 const secondary=blend?(Math.abs(w-cutoff)<Math.abs(b-cutoff)?key(w<cutoff,b>=cutoff):key(w>=cutoff,b<cutoff)):null;
 const analyses:Record<string,string>={
 direct:"在这个场景里，你倾向于直接提出或执行要求。可以观察：孩子是否知道具体该做什么，也是否有机会说出困难。",
 followed:"你的选择包含后续落实。与反复提醒相比，明确下一步并在约定时间跟进，可以让要求更可预期。",
 unfollowed:"你的选择在当下较少继续跟进。可以留意这是一次灵活调整，还是同类事情经常没有明确的收尾。",
 scaffold:"你选择提供一定帮助，同时保留孩子的参与。可以根据他的熟练程度逐渐减少帮助。",
 takeover:"你选择了由大人接手。偶尔代劳很常见，可以观察这件事是否已经适合让孩子多练习一次。",
 autonomy:"你把责任交给孩子。是否还需要检查，应结合他的年龄与已有能力，不能只凭这一题判断边界强弱。",
 exit:"你选择明确停止兴趣班。退出可能是合理调整，这个答案不用于判断边界高低。",
 adjusted:"你选择调整原来的安排。关键是调整之后有没有清楚的新约定，而不是一次破例就代表没有规则。",
 listen:"你为孩子的表达留出了空间。先了解发生了什么，再决定是否需要建议，有时能减少误会。",
 repair:"你的选择包含缓和或承认失误。回应感受不等于取消原来的任务，两件事可以分别处理。",
 comfort:"你倾向于先安慰或靠近。平静之后可以再看，孩子是否还需要谈具体困难。",
 task:"你倾向于先给建议或推动事情解决。可以试着在方法前，加一句对孩子当下感受的回应。",
 pressure:"这个选择把注意力转向态度或表现。可以尝试把对人的评价换成对具体事情的说明。",
 question:"你先询问孩子自己的行为。还可以先听完整个经过，再一起判断，避免过早把责任放到他身上。",
 distracted:"你口头表示在听，但注意力仍在手机上。可以约一个能认真听的时间，并主动回来继续。",
 explain:"你先解释自己的意思。还可以补一句“那句话确实让你难受”，让解释与承认感受同时存在。",
 dismiss:"你暂时没有回应孩子的质疑。可以把他提出的事实，与原来的规则分开讨论。"
 };
 return {version:"entertainment-v1",animal,secondary,blend,created:Date.now(),profile:profiles[animal],secondaryName:secondary?profiles[secondary].name:null,
 dimensions:{warmth:w>=cutoff?"更常回应感受与想法":"更常先处理事情",boundary:b>=cutoff?"更常落实要求与约定":"更常调整或减少跟进"},
 insights:[0,3,5,13].map(i=>({title:picks[i].q.title,choice:picks[i].o.text,analysis:analyses[picks[i].o.tag||"task"]})),
 note:"这是基于教养方式概念设计的趣味自我探索，原创题目与分类规则尚未经心理测量验证。结果描述本次选择，不是人格标签、心理诊断或对孩子发展的预测。"};
}
