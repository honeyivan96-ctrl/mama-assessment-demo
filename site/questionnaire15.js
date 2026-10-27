function presentationName(key){return ({bear:'棕熊妈妈',tiger:'老虎妈妈',hen:'母鸡妈妈',cat:'猫咪妈妈'})[key];}
function presentationStyle(key){return ({bear:'权威型',tiger:'专制型',hen:'随和型',cat:'佛系型'})[key];}
const meanings=[
 '保护领域关注孩子难过或不安时，能否得到及时、合适的安慰。',
 '相互回应领域强调双方愿意回应彼此合理的需要，不是凡事都由孩子决定。',
 '管教领域关注孩子如何学习规范。要求清楚、执行可预期，比临时加码更有助于理解规则。',
 '指导学习领域强调按孩子当前的能力提供帮助，让他在支持下完成原本还不会的事。',
 '共同参与领域关注孩子如何通过观察、模仿和一起行动，学习家庭中的做事方式与责任。'
];
const shortScenes=['同学交往中','日常相处时','学习教育中'];
const interpretation=[
 ['你比较能在孩子难过时提供安慰，让他有机会说出感受。这样的回应能帮助他先安定下来，再面对需要处理的问题。','你会安慰孩子，但有时也会较快转向讲道理或处理问题。孩子可能已经听见你的办法，却还想让你多听一会儿他的委屈。','在这些情境中，你较少先承接孩子的难过。孩子可能需要先确认自己可以向你求助，才更容易听进后面的要求。'],
 ['孩子的意见有机会影响安排，你也愿意说明自己的需要。这能让协商成为双方共同参与的过程。','你愿意留一些选择空间，但有时会直接决定，或直接顺着孩子。比起谁说了算，让双方的理由被听见，更有助于彼此配合。','孩子影响安排的机会相对少，或讨论没有继续。可以先从一个你愿意商量的小安排开始，让他体验表达意见之后会有回应。'],
 ['你不只口头提醒，也会确认孩子有没有履行约定。你的优势是事情比较有着落；同时值得留意，明确要求也需要给孩子说明困难的机会。','你会提出要求，但落实还不完全稳定。有时催了几次就自己接手，孩子便不容易判断约定到底需要坚持到什么时候。','责任和约定的后续落实比较少。这不等于你没有原则，而是原则还需要变成孩子看得懂、做得到的具体安排。'],
 ['你比较愿意提供示范或提示，而不是一味让孩子自己想。这样的帮助能把眼前的困难变成一次学会方法的机会。','你已经会提供一些帮助，但有时会直接接手，或让孩子继续独自尝试。更贴近他卡住的那一步，帮助往往会更有效。','具体的方法支持相对少，孩子可能得到答案，却没有学会方法，或者仍不知道从哪里开始。帮助不一定要多，先找到困难所在更重要。'],
 ['你和孩子都有实际参与，孩子也有自己的一份责任。这让他不只是被要求完成任务，也有机会从共同做事中学习。','你会让孩子参与，但有时自己接手，或转为只检查结果。安排他去做，与自己也参与其中，是两种不同的陪伴。','你们一起行动、孩子实际承担角色的机会相对少。一次短而具体的共同活动，比笼统要求他主动参与更容易开始。']
];
const choices=[
 ['你先安慰孩子，再建议他寻找其他同伴','你先了解孩子难过的原因','你让孩子独自应对失落','你先追问孩子是不是做错了什么'],
 ['你直接按自己的安排决定','你听取孩子的计划，再商量安排','你同意孩子的想法，但没有进一步讨论','你把讨论留到以后，通常没有继续'],
 ['你明确要求孩子归还，并确认完成','你了解困难，也跟进归还的约定','你会提醒，但主要等待孩子自己处理','你替孩子完成归还，不再让他处理'],
 ['你直接替孩子要回物品','你了解难处，再陪孩子练习开口','你给孩子一句可用的表达，让他尝试','你让孩子自行解决，没有提供具体帮助'],
 ['你替孩子完成自己的收拾任务','你要求孩子完成分工，自己也参与收拾','你听取想法、明确分工，和孩子一起完成','你没有继续要求孩子参与收拾'],
 ['你等待孩子自行缓过来，暂时没有回应','你靠近安慰，再听孩子表达','你要求孩子尽快停止哭泣','你先哄一哄，没有继续了解原因'],
 ['你愿意商量安排，让双方想法都有位置','你直接按孩子的想法安排','你坚持原计划，不再讨论','你愿意听理由，再决定是否调整'],
 ['反复提醒后，你替孩子完成了整理','你商量完成时间，也确认孩子有没有完成','你体谅孩子辛苦，自己接手整理','你明确要求立即整理，并确认完成'],
 ['你接手把鞋洗好，没有留下继续练习的机会','你示范一遍，再让孩子练习','你找到卡住的步骤，再提供针对性的帮助','你让孩子继续尝试，但没有具体指导'],
 ['你代替孩子核对采购物品','你要求完成分工，自己也继续准备','你商量时间，再和孩子一起完成采购准备','你取消孩子的分工，各自安排'],
 ['你先指出学习问题，让孩子吸取教训','你先安慰，让孩子休息一下','你先听孩子为什么难过','你先查看试卷上的错误'],
 ['你根据自己的比较替孩子决定','你听取双方理由，再协商决定','你直接按孩子的兴趣决定','你先筛选课程，再给孩子有限的选择'],
 ['你要求立即开始作业，并确认执行','你会提醒，主要让孩子自行安排','你先听理由，再坚持约定并跟进','你允许先玩，之后不再过问作业'],
 ['你直接提供答案，优先完成作业','你完整讲解方法，再让孩子练习','你先了解思路，再针对卡点提示','你让孩子继续自己想，没有具体提示'],
 ['你和孩子一起按原约定阅读','你听取想法、调整安排，再一起落实阅读','你和孩子都不再继续原来的阅读约定','你要求孩子完成阅读，自己没有共同参与']
];
const tips=[
 '下次孩子带着情绪来找你，先听他说最难受的是什么。等他平静后，再讨论怎样处理；安慰和解决问题可以先后进行。',
 '先划清不能改变的要求，再留下真实的商量空间。例如，作业今天需要完成，但可以让孩子选择先做哪一科，并听听理由。',
 '选一项日常责任，把“谁来做、何时完成、如何确认”提前约定好。执行时听取困难，也帮助孩子完成自己的部分。',
 '先请孩子说说已经做到哪一步，只针对卡住的一步给提示。如果仍不会，就示范一个相似的做法，再让他自己接着完成。',
 '从每周两次、每次十分钟的共同阅读开始。双方都放下手机，各读一小段，最后分享一个发现，让孩子看见你也在参与。'
];
const sceneDescriptions={
 bear:['面对孩子与同学相处的问题，你愿意了解经过，也会帮助他表达想法、承担责任。你在意孩子的感受，也希望答应别人的事得到落实。','平时相处时，你愿意听取孩子的想法，也会坚持适龄的分工和约定。你在尝试把体谅与责任放在一起。','面对作业、兴趣班和学习安排，你愿意听孩子解释，也会提出明确要求，关注事情能否落实。'],
 tiger:['面对同学交往中的问题，你更倾向先明确该怎么做，并确认孩子照着执行。孩子解释和自己尝试的空间相对少一些。','日常相处时，你更重视孩子按安排完成事情。比起调整原计划，你往往更希望他先配合要求。','面对作业、成绩和学习安排，你更看重任务能不能按要求完成。孩子有不同想法时，你比较容易先坚持原来的要求，商量的空间相对少一些。'],
 hen:['面对孩子的同学交往，你比较愿意体谅、回应他的需要；涉及应承担的责任时，提醒和后续跟进相对少一些。','平时相处时，你更愿意照顾孩子的心情。他想玩、想换个安排，你常常愿意让一步；说好的分工，有时也会由你接手。','面对学习安排，你比较愿意顺着孩子的兴趣和感受；任务的要求、开始时间和后续确认，相对没有那么明确。'],
 cat:['在这些同学交往情境中，你较常让孩子自行处理，直接回应与后续跟进都比较少。单凭这些选择，不能判断你不关心孩子。','日常相处中，你比较少继续追问、协商或跟进安排。孩子自己应对的空间较多，但可获得的具体支持也相对少一些。','在这些学习情境中，你较少提供具体回应和持续跟进。可以先从一项你和孩子都能坚持的小安排开始。']
};
function refineReport(report,answers){
 const t=report.theme,style=presentationStyle(report.key),name=presentationName(report.key);
 if(name){report.profile.name=name;t.name=name;report.profile.style=style;t.style=style;}
 const definitions={bear:'总体来说，您是个愿意了解孩子，也期待他承担适龄责任，并关注事情是否落实的妈妈。',tiger:'总体来说，您是个重视要求和执行的妈妈，希望孩子按约定把事情做好；相比之下，听取孩子的感受和理由会少一些。',hen:'总体来说，您是个愿意体谅孩子、回应他需要的妈妈；面对责任和约定，容易让步，持续跟进相对少一些。',cat:'总体来说，在这些情境中，您更常让孩子自行处理，主动回应和持续跟进相对少一些。这不等于您不爱孩子。'};
 report.profile.body=definitions[report.key]||report.profile.body;
 report.scenes.forEach(s=>{s.displayStyle=presentationStyle(s.key)||s.type;s.displayName=presentationName(s.key)||'';s.reading=sceneDescriptions[s.key]?.[s.index]||s.reading;});
 const complete=report.scenes.every(s=>s.eligible&&sceneDescriptions[s.key]);
 const phrases={bear:['交往中愿意引导，也认真跟进','日常相处时体谅与责任并重','学习上既听想法，也提出要求'],tiger:['交往中更重视要求和执行','日常相处时更希望孩子配合','学习上更看重按要求完成'],hen:['交往中比较愿意体谅孩子','日常相处时更愿意让一步','学习上更愿意顺着孩子'],cat:['交往中较常让孩子自行应对','日常相处时具体跟进较少','学习上具体支持与跟进较少']};
 report.sceneLead=complete?(report.consistent?`总体上，你是${style}的${name}。这份特点在同学交往、亲子相处和学习教育中表现得比较一致。`:`总体上，你是${name?style+'的'+name:'类型交界的妈妈'}。但遇到不同的事情，你的侧重点也会改变：${report.scenes.map(s=>phrases[s.key][s.index]).join('；')}。`):'有些情境尚未提供足够信息。下面先看已经能够观察到的表现，不用缺少的回答替你下结论。';
 report.sceneClosing=complete?(report.consistent?'不同情境中，你的侧重点比较稳定。接下来可以看看：同一种相处方式，在哪些具体互动里发挥得更好，又有哪些地方需要调整。':'你的相处方式会随着事情改变。比起只用一个名称概括自己，留意哪些时候更愿意倾听、哪些时候更坚持要求，会更了解日常里的自己。'):'未遇到的情境可以保留空白。真实作答，比凑出一个完整类型更重要。';
 report.dimensions=report.dimensions.map((d,i)=>{
  const valid=d.points.filter(p=>p.mean!==null),sum=valid.reduce((n,p)=>n+p.mean,0),ready=d.mean!==null;
  const readings=valid.map(p=>`${shortScenes[p.index]}，${choices[p.index*5+i][answers[p.index*5+i]]}。`);
  let role=ready?(d.mean>=2?'相关做法已经有所体现':d.mean>=1?'有些时候做得到，也有可以补上的地方':'从一个具体动作开始，会更容易改变'):'有效信息不足，暂不作完整判断';
  if(i===2&&ready&&d.mean>=2)role='你会认真跟进，说好的事比较有着落';
  if(i===4&&ready&&d.mean<2)role='可以补上的：和孩子真正一起做';
  const maxPoint=valid.length?Math.max(...valid.map(p=>p.mean)):null,minPoint=valid.length?Math.min(...valid.map(p=>p.mean)):null;
  const contrast=ready&&maxPoint!==minPoint?` 这种做法在${valid.filter(p=>p.mean===maxPoint).map(p=>p.scene).join('、')}中体现得更多，在${valid.filter(p=>p.mean===minPoint).map(p=>p.scene).join('、')}中相对少一些。`:'';
  return {...d,earned:ready?sum:null,max:valid.length*3,theory:meanings[i],role,reading:ready?interpretation[i][d.mean>=2?0:d.mean>=1?1:2]+contrast:'目前只有少量情境可供观察，暂不概括整体表现。',evidence:readings,suggestion:ready?tips[i]:'这类互动目前少于两道有效回答，可以先观察一次类似的日常，再看是否需要调整。'};
 });
 const valid=report.dimensions.filter(d=>d.score!==null),high=valid.length?Math.max(...valid.map(d=>d.score)):null,low=valid.length?Math.min(...valid.map(d=>d.score)):null;
 report.interactionOverview={high:high===low?[]:valid.filter(d=>d.score===high).map(d=>d.name),low:high===low?[]:valid.filter(d=>d.score===low).map(d=>d.name),title:high===null?'先看已经提供的互动信息':high===low?'五类互动的表现比较接近':'把已经做到的留住，再补上一小步',text:high===null?'这些互动尚不足以形成五维比较，不用着急给自己下结论。':high===low?'本次可比较的互动得分相同。比起寻找一个短板，更值得看看每项在不同场景中的具体做法。':`本次，“${valid.filter(d=>d.score===high).map(d=>d.name).join('、')}”的相关做法体现得相对更多；“${valid.filter(d=>d.score===low).map(d=>d.name).join('、')}”相对少一些。保留你已经做到的，再从下方建议中选一个日常动作开始，不必一次改变所有事情。`};
 if(report.interactionOverview.high.includes('行为规范与管教')&&report.interactionOverview.low.includes('共同参与')){report.interactionOverview.title='你会认真跟进，也可以多一点并肩参与';report.interactionOverview.text='你比较擅长让孩子知道事情需要完成，也会确认结果。相较之下，和孩子一起动手、一起坚持的机会少一些。在提出要求之外，让他看见你也在行动，陪伴就不只是提醒和检查。';}
 report.edition='refined-20261027-r2';
 return report;
}

const VERSION15='fifteen-v3-20261027-r2';
const EDITION15='refined-20261027-r2';
const SCENES15=['社会交往','亲子相处','学习教育'];
const DOMAINS15=['保护与安慰','协商与相互回应','行为规范与管教','指导与学习','共同参与'];
const SOURCES15={style:'https://files.eric.ed.gov/fulltext/ED427896.pdf',interaction:'https://doi.org/10.1111/j.1467-8624.2010.01426.x'};
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
const QUESTIONS15=raw.map(([title,options],i)=>({id:'q'+String(i+1).padStart(2,'0'),title,scene:Math.floor(i/5),domain:i%5,options:[...options,'未遇到／无法判断']}));
// Exact approved trial rubric [responsiveness, demandingness or null, interaction observation].
const WEIGHTS15=[
 [[2,null,2],[3,null,3],[0,null,0],[0,null,0]],[[0,null,0],[3,null,3],[2,null,2],[0,null,0]],
 [[0,3,3],[3,3,3],[1,1,1],[1,0,1]],[[1,null,1],[3,null,3],[2,null,2],[0,null,0]],[[2,0,1],[1,3,3],[3,3,3],[0,0,0]],
 [[0,null,0],[3,null,3],[0,null,0],[2,null,2]],[[3,null,3],[2,null,2],[0,null,0],[3,null,3]],
 [[1,1,1],[3,3,3],[2,0,1],[0,3,3]],[[1,null,1],[2,null,3],[3,null,3],[0,null,0]],[[2,0,1],[1,3,3],[3,3,3],[0,0,0]],
 [[0,null,0],[2,null,2],[3,null,3],[0,null,0]],[[0,null,0],[3,null,3],[2,null,2],[2,null,2]],
 [[0,3,3],[1,1,1],[3,3,3],[1,0,0]],[[1,null,0],[2,null,2],[3,null,3],[0,null,0]],[[1,3,3],[3,3,3],[2,0,1],[0,3,1]]
];
const TYPES15={
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
function score15(answers){
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
function report15(answers,{profile={},context={}}={},created=Date.now()){
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

globalThis.Mama15={VERSION15,EDITION15,SCENES15,DOMAINS15,SOURCES15,QUESTIONS15,TYPES15,WEIGHTS15,score15,report15};
