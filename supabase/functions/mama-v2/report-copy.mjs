// Editorial interpretation only. The existing question weights and type decisions stay unchanged.
export const REPORT_EDITION='warm-report-20261020';
export const THEMES={
 elephant:{animal:'elephant',name:'大象妈妈',color:'#56796e',soft:'#e4eee6',tag:'给孩子依靠，也给他长大的空间。',closing:'风雨来时，为你撑伞；\n平淡日常，陪你三餐；\n低谷迷茫，予你心安；\n岁月漫漫，与你相伴。\n\n孩子，妈妈愿陪你看四季烟火，\n也愿看你自在地翱翔蓝天。'},
 tiger:{animal:'tiger',name:'老虎妈妈',color:'#9c7046',soft:'#f5e9d8',tag:'把责任放在心上，把方向握在手里。',closing:'愿你的坚定，给他方向；\n愿你的温柔，让他敢讲。\n\n有一天，他走得很远，\n仍愿意回头，和你说说心里话。'},
 hen:{animal:'hen',name:'母鸡妈妈',color:'#b37b70',soft:'#f6e7df',tag:'总想先把孩子的心，照顾妥帖。',closing:'爱是风雨里的一把伞，\n也是出发前的一次放手。\n\n愿你陪他走过眼前的路，\n也相信，他会走出自己的远方。'},
 cat:{animal:'cat',name:'猫妈妈',color:'#7c7796',soft:'#ece9f4',tag:'给他探索的空间，也留一份回头的安心。',closing:'给他探索世界的自由，\n也给他回头找你的安心。\n\n愿他奔向远方时，心里始终知道：\n妈妈在，家就在。'},
 panda:{animal:'panda',name:'熊猫妈妈',color:'#6a786a',soft:'#e9eddf',tag:'有自己的柔软，也有自己的坚持。',closing:'有时温柔，有时着急；\n一边爱着，一边学习。\n\n愿你陪孩子慢慢长大，\n也给自己，被理解和拥抱的余地。'}
};
export function reportTheme(key){return THEMES[key]||THEMES.panda;}
export function scoreHighlights(dimensions){const values=dimensions.map(d=>d.score).filter(s=>Number.isFinite(s));if(!values.length)return {high:[],low:[],equal:true};const max=Math.max(...values),min=Math.min(...values),equal=max===min;return {high:equal?[]:dimensions.flatMap((d,i)=>d.score===max?[i]:[]),low:equal?[]:dimensions.flatMap((d,i)=>d.score===min?[i]:[]),equal,max,min};}
const BODY={
 elephant:['你愿意理解孩子，也希望事情有一个结果。','孩子难过时，你愿意先了解感受；遇到约定和选择，你也重视安排、商量与后续行动。你的关心里，既有依靠，也有让他练习独立的空间。','有时，把一小步交回孩子手里，不是少爱一点，而是相信他可以慢慢学会。'],
 tiger:['你认真守着的，是孩子以后的路。','在这次的情景选择里，你更快关注要求与执行，也更倾向于掌握方向。你希望问题及时解决，希望眼下的努力，能换来孩子未来多一些从容。','要求让孩子知道方向，理解让他更愿意和你同行。坚定之外，也可以给他的感受留一个位置。'],
 hen:['孩子一难过，你的心就容易先软下来。','你愿意照顾孩子的情绪。在上课和电子产品的分歧里，你也更容易先退让、提醒，再等他自己行动。关心已经在场，接下来还可以让约定更清楚一点。','心疼他，与坚持一个商量好的约定，可以同时发生。温柔不必以取消要求为代价。'],
 cat:['你把不少决定交给孩子，也在寻找自己的参与方式。','在学习与电子产品的选择里，你倾向于让孩子自己决定，主动回应和后续跟进相对少一些。这反映的是这些场景里的做法，并不能说明你爱得多不多，也不等于已经实现了自主支持。','交给他做，也让他知道需要时能来找你。空间之外，一份可获得的回应同样重要。'],
 varied:['你有自己的柔软，也有不能轻易退让的地方。','你在不同情绪或规则场景里，选择了差异较大的处理方式。有些事情，你愿意商量；有些事情，又会让你更快坚持要求。这次更适合看具体情境，不必用一个标签概括全部的你。','留意那些让你心软、又让你着急的时刻，你会更懂得自己真正想守护什么。'],
 mixed:['你一边照顾孩子，也一边寻找合适的分寸。','你的回答落在几种方向的交界处，还没有呈现出一个清晰、稳定的主导方式。熊猫是这张多面画像的趣味象征：你可以有不同的反应，也可以继续认识自己。','不必先成为某一种妈妈。看见自己怎样回应、怎样坚持，已经是新的起点。'],
 balanced:['你希望感受被听见，也希望约定被认真对待。','在情绪与规则问题上，你同时看重回应和落实。关于孩子参与决定、自己动手的部分，你还会采取不同做法。关心与要求，正在你的相处方式里一起出现。','在照顾感受、守住要求之外，也可以给孩子一点参与和尝试的空间。'],
 demand:['你习惯先把事情处理好，再照顾心情。','这次回答中，要求和执行更靠前，直接回应孩子感受的做法相对少一些。你关注怎么解决问题，也可以再看看：孩子是否准备好听进接下来的话。','先回应一句难过，不会削弱要求，反而可能让后面的沟通更容易。'],
 warm:['你想先照顾好孩子的心情，再慢慢想办法。','你的回答较多体现了对情绪的关心，清楚安排和后续落实则相对少一些。这是本次情境中的感受优先倾向，不等于凡事都放任孩子。','理解之后，再说清楚接下来怎么做。你的温柔，也可以有让孩子安心的边界。'],
 distant:['你与孩子的相处，有一些环节值得重新看见。','这次回答中，主动回应和后续跟进体现得相对少一些。也许你还在寻找合适的参与方式；这些片段不足以判断亲子关系的全部。','不必一次改变所有事。一句认真的回应、一个有后续的约定，都能让彼此靠近一点。']
};
const DIMENSIONS=[
 [
 ['你习惯先面对问题，感受有时还没来得及说。','在这次相关选择里，你更快转向原因、要求或处理事情，直接安慰和了解感受体现得较少。','先接住一句“这次真的很难受”，再谈怎么办。被理解，并不意味着不用承担责任。'],
 ['你愿意安慰，也会在不同事情上有不同反应。','部分场景里，你愿意了解或照顾孩子；换一种情境，你又可能更快进入解决问题的状态。','不需要每次都说得漂亮，愿意停一下、听他说完，就给沟通留出了空间。'],
 ['你很在意，孩子有没有被听见。','你的多个选择体现了安慰、倾听或了解感受。你关注的不只是发生了什么，也在意这件事对孩子意味着什么。','理解感受之后，也可以继续讨论行动。温柔与要求，不必二选一。']
 ],
 [
 ['约定已经说过，后续还需要一个落点。','在上课和电子产品的选择里，明确安排与持续跟进体现得较少。提醒之后，事情可能更多交给孩子自己推进。','孩子还在学习管理自己。把下一步、完成时间和后续确认说清楚，能让规则更容易落实。'],
 ['你会提出要求，也在寻找合适的坚持方式。','你会提醒或安排，但后续落实随场景有所不同。有的事情能坚持下来，有的事情容易暂时放一放。','先守住少而清楚的约定，比一次提出很多要求，更容易让双方做到。'],
 ['你让要求有了清楚的下一步。','你的选择较多体现了明确要求、落实安排或持续确认。这份稳定，让孩子更容易知道什么可以商量、什么需要做到。','跟进程度高，不代表越严越好。把理由讲清楚，也给孩子适龄的参与空间。']
 ],
 [
 ['你很愿意负责，有些事还握在自己手里。','在选择和收书包的情境里，你更倾向于替孩子决定、接手，或逐项指导。留给他独立尝试的空间相对少一些。','从一件他已经会做的小事开始，让他先试；需要帮助时，你仍在旁边。'],
 ['你在放手，也在拿捏支持的分寸。','有些事情你会让孩子选择或动手，有些事情仍会替他安排。不同场景中的支持方式还不完全一样。','自主支持既不是全部包办，也不是完全不管：他可以决定，你也可以提供信息和帮助。'],
 ['你愿意让孩子参与，也愿意在需要时托一把。','你的多个选择体现了让孩子表达、参与决定或独立尝试，同时保留帮助的做法。你在为他的“我能行”留出机会。','允许他慢一点、试错一点。有你的支持，他可以练习把责任一点点接过去。']
 ],
 [
 ['生活恢复了，有些话还没有说开。','误会或争执之后，你的选择较少体现主动澄清和沟通，更多是让事情过去，或等待孩子先靠近。','重新谈起，不一定会让矛盾变大。一句“刚才我也有做得不好的地方”，能为彼此打开一扇门。'],
 ['你在用自己的方式，让关系缓和下来。','你会解释、承认误会，或用行动表达关心；是否进一步听彼此说完，会随情境变化。','行动里的关心很珍贵。再补上几句清楚的话，孩子就少一些靠猜来理解你的时刻。'],
 ['你愿意把误会说开，也把关系接回来。','你在误会和冲突后的选择，较多体现了主动承认、澄清或沟通。你没有要求自己永远正确，而是愿意面对发生过的事。','关系里的安心，常常来自“我们闹过别扭，也能重新靠近”。']
 ],
 [
 ['日子很忙，也给不谈学习的相处留一点位置。','最近一个月，你报告的主动分享与非学习陪伴频率相对较低。这是两个日常片段，不代表孩子不爱你，也不能据此判断依恋。','除了任务和提醒，留一段没有考核的小时间。一起散步、听一件小事，都可以成为连接。'],
 ['你们之间，有可以慢慢积累的日常。','孩子的主动分享、一起玩或闲聊有一定发生频率，也可能随最近的生活节奏而变化。','不必每次都聊出什么道理。愿意听一个小故事，本身就是陪伴。'],
 ['你们的生活里，不只有作业和要求。','你报告的主动分享和非学习陪伴比较频繁。日常交流有较多发生的机会，是这份画像里值得珍惜的一部分。','熟悉他的生活，也继续给他保留自己的小空间。亲近，不必等于知道所有事情。']
 ]
];
function ageTip(profile={}){const age=parseInt(profile.childAge,10);if(!Number.isFinite(age))return '';if(age<6)return '可以把要求变成短一些、做得到的一小步，陪着练习。';if(age<=9)return '如果孩子还在小学低年级，约定具体一点、一次少一点，更方便一起落实。';if(age<=12)return '如果孩子已经进入小学中高年级，可以让他参与商量约定，同时保留后续确认。';return '孩子渐渐长大，边界可以更多通过商量形成，但支持和跟进仍然可以在场。';}
function contextCopy(answers,context={}){const beliefs=context.belief||[],pains=context.pain||[];let ideal='',concern='',title='';
 if(beliefs.includes(4)){ideal='你认同尊重孩子的兴趣和感受，希望他能快乐成长。';if([0,1].includes(answers[3])&&answers[4]===0){ideal+='不过，在作业和兴趣选择上，你也更倾向于由自己定下方向。对你来说，放手也许最难的地方，是还不放心。';title='你想尊重他的选择，也有自己放不下的担心。';}}
 else if(beliefs.includes(1)){ideal='你认同“没有规矩不成方圆”，希望孩子学会遵守约定。';if([2,3].includes(answers[3]))ideal+='但在手机与作业的选择中，提醒之后的跟进相对少一些。你在意规则，也许还在寻找让它落地的办法。';}
 else if(beliefs.includes(3)){ideal='你认同尽早准备，希望给孩子多一些成长的机会。适合他的节奏，也值得和投入一起被看见。';}
 else if(beliefs.includes(5)){ideal='你看重坚持和吃苦，希望孩子遇到困难时有继续走下去的力量。努力之外，他也需要知道自己可以求助。';}
 else if(beliefs.includes(2)){ideal='你比较认同学习与天赋有关。这是你理解孩子差异的一种方式；具体困难，也仍值得从方法、练习和支持中一起寻找线索。';}
 else if(beliefs.includes(0)){ideal='你认同在孩子犯错时需要较强的约束。希望他记住教训的同时，也可以看看：怎样把要求讲清楚，让他愿意说出真实的困难。';}
 if(pains.includes(2)){concern='你提到，孩子与你交流少，感觉不够亲近。';concern+=answers[8]===2||answers[8]===0?'同时，你也报告孩子会主动分享一些学校里的事。也许你期待的不只是“说过什么”，而是彼此能更懂一点。':'这与本次主动分享较少的回答有所呼应。比起立刻追问，多一些不急着评价的倾听，可能更容易为聊天留住空间。';title=title||'你想知道的，不只是他过得怎样，还有他心里怎么想。';}
 else if(pains.includes(0)){concern='你提到，孩子的学习表现还没有达到你的期待。';concern+=answers[0]===2?'但在考差的情境里，你仍愿意先安抚、了解，再分析问题。你在意成绩，也不想让他独自面对难过。':answers[0]===0?'在考差的情境里，你选择先指出学习态度和习惯。你希望他及时调整，也可以留意：着急的时候，他是否还听得见你的用心。':'期待进步与照顾关系，可能正同时牵动着你。一次表现之外，也可以和孩子一起看清他卡在哪一步。';title=title||'你放心不下他的学习，也想找到更合适的陪伴方式。';}
 else if(pains.includes(1)){concern='你提到，电子产品的使用让你反复操心。';concern+=answers[3]===1?'在答题里，你也选择重申约定并要求落实。规则已经提出，接下来值得留意的是：约定是否具体，以及双方能否持续做到。':answers[3]===0?'你的第一步是收走手机、让他开始作业。这样能结束当下的游戏，之后也可以再一起把使用约定谈清楚。':'在相关情境中，你更倾向于提醒或暂时不介入。反复催促之外，清楚的时间安排与后续确认，可以让下一步更具体。';title=title||'你想结束的，不只是一次游戏，还有反复提醒的疲惫。';}
 else if(pains.includes(3)){concern='你提到，孩子不配合要求，容易发生争执。';concern+=answers[7]===2?'但冷静之后，你仍愿意承认自己说重了、听听他的感受。这说明即使有分歧，你也在认真寻找重新沟通的路。':'要求之外，也可以留意争执结束后，有没有机会把彼此没说完的话说清楚。';title=title||'你希望他愿意配合，也希望你们不用总靠争执说话。';}
 else if(pains.includes(4)){concern='你提到，不知道该管到什么程度，怕管多了，也怕管少了。这份犹豫，并不意味着你不懂孩子，而是你在认真寻找责任与放手之间的分寸。';title=title||'你不是不想放手，而是在寻找放心放手的分寸。';}
 else if(pains.includes(5)){concern='你对目前的相处比较满意。这份感受值得珍惜；下面的五维画像，可以帮你看清哪些日常做法正在支持你们。';}
 else if(pains.includes(6)){concern='你补充了属于自己的育儿困扰。这份画像先从十个日常片段出发，帮助你找到可以进一步观察的线索；不会仅凭一段描述就判断原因。';}
 const beliefOrder=[4,1,3,5,2,0],mainBelief=beliefOrder.find(i=>beliefs.includes(i)),beliefNames=['孩子犯错时需要较强约束','孩子应学会遵守规则','学习表现主要与天赋有关','尽早准备、提前学习','尊重兴趣、快乐成长','成长需要吃苦和坚持'];const additionalBeliefs=beliefs.filter(i=>i!==mainBelief);if(additionalBeliefs.length)ideal+=' 你也比较认同“'+additionalBeliefs.map(i=>beliefNames[i]).join('”“')+'”。这些期待需要在具体生活里一起寻找平衡。';
 const painOrder=[2,0,1,3,4,5,6],mainPain=painOrder.find(i=>pains.includes(i)),otherPain=pains.find(i=>i!==mainPain);const additionalPain={0:'你也在为学习表现与期待的差距操心；一起找到具体卡点，比只盯着结果更容易着手。',1:'你也提到电子产品使用难控制；把使用时间、结束方式和后续确认商量清楚，可以让提醒更具体。',2:'你也期待和孩子更亲近；不急着评价的闲聊，可以给表达多留一点空间。',3:'你也提到配合与争执的困扰；分歧结束后，把彼此没说完的话说开，同样值得关注。',4:'你也在寻找管与放的分寸；可以从他已经会做的一件事开始，交出行动，保留支持。',6:'你还补充了自己的困扰，具体原因需要更多了解，这份画像先提供日常观察的线索。'};if(otherPain!==undefined&&additionalPain[otherPain])concern+=' '+additionalPain[otherPain];
 return {ideal,concern,title};}
function strengths(data,high){const names=high.map(i=>data.dimensions[i].name);if(!names.length)return {title:'你的五个方面，呈现得比较接近。',text:'这次没有特别突出的高低项，可以把目光放回具体情境：哪些做法让彼此更轻松，哪些时刻还需要一起摸索。'};const max=Math.max(...data.dimensions.map(d=>d.score??0));if(max<67)return {title:'先看见已经显现的线索。',text:'“'+names.join('、')+'”是本次相对突出的方面。这里比较的是你自己的五项刻度，不表示已经达到某种标准；具体做法比一个高低标签更值得关注。'};if(high.includes(0)&&high.includes(3))return {title:'你很在意，孩子有没有被听见。',text:'情感回应、沟通与修复是本次突出的方面。孩子难过时，你愿意了解；发生误会后，你也愿意把话说开。你关注的不只是事情有没有完成，也在意关系有没有被照顾。'};const descriptions=['你愿意照顾孩子的感受，为后续沟通留出空间。','你愿意把要求变成具体行动，让约定有后续。','你给孩子参与和尝试的机会，也保留可获得的帮助。','你愿意面对误会和分歧，寻找重新靠近的方式。','你们有主动分享、一起玩或闲聊的日常机会。'];return {title:'你已经拥有，值得珍惜的力量。',text:'本次“'+names.join('、')+'”最为突出。'+high.map(i=>descriptions[i]).join('')};}
export function enrichReport(report,input={}){if(report.edition===REPORT_EDITION)return report;const answers=input.answers||[],profile=input.profile||{},context=input.context||{},key=report.key||'mixed',theme=reportTheme(key),base=BODY[key]||BODY.mixed,hasAnswers=answers.length===10,observed=hasAnswers?contextCopy(answers,context):{ideal:'',concern:'',title:''},highlights=scoreHighlights(report.dimensions);
 const dimensions=report.dimensions.map((d,i)=>{const level=d.score===null?null:d.score>=67?2:d.score<=33?0:1;let copy=level===null?['这一项还需要更多信息。','完成相关问题后，再一起看看。','']:DIMENSIONS[i][level];copy=[...copy];if(i===1&&level===0&&hasAnswers&&(answers[2]===1||answers[3]===2)){copy[0]='有时心一软，约定就暂时放到了一边。';copy[1]='在相关情境里，你倾向于先同意暂停，或提醒后等孩子自己行动。也许是不忍心，也许是提醒多了感到疲惫；具体原因还需要你自己判断。';}if(i===1&&level!==null&&level<2&&ageTip(profile))copy[2]+=' '+ageTip(profile);return {...d,title:copy[0],analysis:copy[1],reminder:copy[2]};});
 const strongest=strengths(report,highlights.high),lowNames=highlights.low.map(i=>report.dimensions[i].name),highNames=highlights.high.map(i=>report.dimensions[i].name);let summary=highlights.equal?'五项刻度比较接近。把它看成一张观察日常的地图，不需要用总分评价自己。':highlights.min>=67?'五个方面都呈现了较多相关做法。“'+lowNames.join('、')+'”只是相对较少，不代表做得不好；继续珍惜已经拥有的日常连接，也给自己留一点从容。':'你在“'+highNames.join('、')+'”上呈现得较多。在“'+lowNames.join('、')+'”的具体情境里多留意一点，能让关心和行动更好地接上。';
 const isAnimal=['elephant','tiger','hen','cat','varied','mixed'].includes(key);const p={...report.profile,name:isAnimal?theme.name:report.profile.name,tag:isAnimal?theme.tag:report.profile.tag,closing:theme.closing,body:base[1],edge:base[2]};
 return {...report,edition:REPORT_EDITION,profile:p,theme,dimensions,highlights,strengths:strongest,portrait:{title:observed.title||base[0],paragraphs:[base[1],observed.ideal,observed.concern].filter(Boolean),takeaway:base[2]},summary,reference:{kind:'within-person',text:'分数是本次回答的呈现程度；目前不展示人群排名。'}};
}
