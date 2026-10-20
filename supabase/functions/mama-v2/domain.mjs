
const SCORE_DIMS=['情感回应','规则与跟进','自主支持','沟通与修复','日常连接'];
const SCORE_PRIMARY=[0,0,1,1,2,2,3,3,4,4];
const SCORE_BASE=[[0,2,3,1],[2,0,1,3],[3,1,3,0],[3,3,1,0],[0,3,2,2],[3,0,1,2],[0,3,1,2],[1,0,3,2],[2,0,3,1],[0,3,1,2]];
const SCORE_EXTRA=[{q:0,a:2,d:2,v:2},{q:2,a:0,d:2,v:0},{q:2,a:1,d:2,v:1},{q:2,a:2,d:2,v:3},{q:2,a:3,d:2,v:1},{q:5,a:0,d:1,v:3},{q:5,a:2,d:1,v:2},{q:5,a:3,d:1,v:1},{q:7,a:0,d:0,v:1},{q:7,a:1,d:0,v:0},{q:7,a:2,d:0,v:3},{q:7,a:2,d:2,v:2}];
function calculateReport(input){
 if(!Array.isArray(input)||input.length!==10||input.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>3)))throw new Error('Invalid answers');
 const dimensions=SCORE_DIMS.map((name,d)=>{const anchorIndices=SCORE_PRIMARY.flatMap((dim,i)=>dim===d?[i]:[]),main=anchorIndices.filter(i=>input[i]!==null).map(i=>SCORE_BASE[i][input[i]]),extras=SCORE_EXTRA.filter(e=>e.d===d&&input[e.q]===e.a);const mean=main.length===2?(main.reduce((a,b)=>a+b,0)+.5*extras.reduce((a,e)=>a+e.v,0))/(2+.5*extras.length):null;return {name,score:mean===null?null:Math.round(mean/3*100),mean,main,anchorIndices,extraCount:extras.length,varied:main.length===2&&Math.abs(main[0]-main[1])>=2}});
 const W=dimensions[0].main.length===2?(dimensions[0].main[0]+dimensions[0].main[1])/2:null,R=dimensions[1].main.length===2?(dimensions[1].main[0]+dimensions[1].main[1])/2:null,A=dimensions[2].main.length===2?(dimensions[2].main[0]+dimensions[2].main[1])/2:null;
 let key='mixed',direction='多种方式并存';
 if(W===null||R===null){key='insufficient';direction='还需要更多信息'}else if(dimensions[0].varied||dimensions[1].varied){key='varied';direction='不同场景，不同反应'}else if(W===1.5||R===1.5){key='mixed';direction='几种倾向交织'}else if(W>1.5&&R>1.5){direction='支持与边界并重';key=A!==null&&A>=2?'elephant':'balanced'}else if(W<1.5&&R>1.5){direction='要求与执行更靠前';const evidence=[[2,0],[3,0],[4,0],[7,1]].filter(([q,a])=>input[q]===a).length;key=evidence>=2?'tiger':'demand'}else if(W>1.5&&R<1.5){direction='感受优先，边界较少';key=input[2]===1&&input[3]===2?'hen':'warm'}else{direction='回应与跟进体现较少';key=input[2]===3&&input[3]===3?'cat':'distant'}
 return {dimensions,key,direction,W,R,A};
}

const REPORT_TYPES={
 elephant:{name:'大象妈妈',badge:'🐘',tag:'有温度，也有边界',quote:'我会陪着你，也相信你能慢慢做到。',body:'在情绪与约定相关的问题里，你既愿意回应孩子，也重视事情如何落实；在选择和尝试上，你还愿意给孩子参与的空间。你提供的，既有依靠，也有走向独立的机会。',edge:'愿意负责是一种力量。有时，把一小步交回孩子手里，也是支持他长大。',closing:'所有的努力，都是为了孩子未来能够自食其力。加油，妈妈！'},
 tiger:{name:'老虎妈妈',badge:'🐯',tag:'把责任扛在肩上',quote:'我希望你现在多努力，将来少吃一点苦。',body:'在这些场景中，你更快关注要求、进度和执行。孩子遇到困难时，你习惯先找解决办法，也更愿意把方向掌握在自己手里。你希望用明确的要求，替孩子守住成长的路。',edge:'要求能告诉孩子该做什么，理解能让他更愿意和你一起做。你认真守护的目标，也可以用更容易被听见的方式传递。',closing:'坚定里多一点理解，你们就多一点并肩前行的力量。加油，妈妈！'},
 hen:{name:'母鸡妈妈',badge:'🐔',tag:'心软，是因为在乎',quote:'看见你难受，我总想先让你轻松一点。',body:'在本次选择里，你愿意安慰、顾及孩子的感受；遇到上课和玩手机的分歧时，也更容易先退让一步。你的关心给了孩子缓冲，但约定有时还需要更清楚的落点。',edge:'接纳他的感受，不必等于取消所有要求。可预期的边界，也能让孩子感到踏实。',closing:'爱可以替他遮雨，也可以陪他学会撑伞。加油，妈妈！'},
 cat:{name:'猫妈妈',badge:'🐱',tag:'空间之外，也需要回应',quote:'我希望你能学会为自己的事情负责。',body:'在本次的学习和手机场景中，你把决定更多交给孩子，后续跟进较少；面对情绪时，直接回应的做法也体现得较少。这提示的是这些情境中的参与方式，并不能据此判断你爱得多不多。',edge:'把事情交给孩子时，也可以让他知道：决定由你来做，需要帮助时，我仍然在。',closing:'让他放心探索，也让他知道你在。加油，妈妈！'},
 balanced:{name:'支持与边界并重',badge:'🌿',tag:'关心与要求，一起出现',quote:'我愿意理解你，也希望事情有一个结果。',body:'在情绪和规则相关的问题里，你同时看重回应与执行。关于孩子自己选择、动手的部分，回答还呈现出不同做法，因此这次先保留方向，不急着用一种动物概括你。',edge:'照顾感受、守住要求之外，也可以留意：孩子是否有机会参与决定和尝试。',closing:'陪伴他成长，也给他一点自己长大的空间。加油，妈妈！'},
 demand:{name:'要求主导型妈妈',badge:'🌿',tag:'先看见事情，再照顾感受',quote:'我更在意，问题接下来该怎么解决。',body:'在这次的情绪与规则问题中，要求和执行更靠前，情绪回应相对较少。其他证据还不足以把你归进一个鲜明的动物类型，因此保留更贴近回答的中性描述。',edge:'先回应一句他的难过，不会削弱要求，反而可能让后面的沟通更容易发生。',closing:'在解决事情之前，先让彼此的心靠近一点。加油，妈妈！'},
 warm:{name:'感受优先型妈妈',badge:'🌿',tag:'愿意理解，也正在寻找边界',quote:'我想先照顾好你的心情。',body:'本次回答里，你对孩子的情绪更有回应，要求和后续落实体现得相对少一些。但现有回答还不足以认定为放任，因此先把它理解为一种感受优先的方向。',edge:'理解之后，再说清楚接下来怎么做，温柔也能有稳定的边界。',closing:'把理解留给感受，把坚定留给约定。加油，妈妈！'},
 distant:{name:'回应与跟进偏少',badge:'🌿',tag:'先看见当下的相处状态',quote:'有些事情，我还在寻找更合适的参与方式。',body:'情绪回应和主动跟进，在本次相关回答里体现得较少；但这些信息不足以认定你属于忽视型，也不能说明亲子关系的全部。比起急着给自己贴标签，更值得留意的是哪些互动环节容易被略过。',edge:'不用一次改变所有事情。一个被听见的感受、一个有后续的约定，都能让参与变得具体。',closing:'一次认真回应，就是彼此靠近的开始。加油，妈妈！'},
 varied:{name:'多面妈妈',badge:'🌿',tag:'场景变了，你的反应也会变',quote:'不同的事情，会牵动我不同的在意。',body:'你在情绪或规则的两道主问题里，选择了差异较大的处理方式。也许有的事情容易让你心软，有的事情会触碰底线。这次结果更适合看具体场景，不用把自己塞进一个单一类型。',edge:'哪一类事情最容易让你改变平时的做法？看见触发点，往往比选定一个标签更有收获。',closing:'看见自己的不同面，也就多了一份重新选择的自由。加油，妈妈！'},
 mixed:{name:'多面妈妈',badge:'🌿',tag:'几种倾向，正在你身上交织',quote:'我不是每一次都用同一种方式爱你。',body:'你的主问题得分落在几种方向的交界处。现有回答还不足以区分出一种稳定的主导类型，因此保留混合画像。下页的五维观察，会比一个标签更具体。',edge:'不必先成为某一种妈妈。理解自己在哪些时刻更坚定、在哪些时刻更心软，就是认识自己的起点。',closing:'不必成为完美的妈妈，愿意看见自己，就是成长的开始。加油，妈妈！'},
 insufficient:{name:'信息还不充分',badge:'🌿',tag:'请先完成主问题',quote:'认识自己，可以慢慢来。',body:'部分关键问题尚未作答，本次暂不判断主导类型。未回答的内容不会记成零分。',edge:'补齐相关问题后，再看看这些场景里的你。',closing:'认识自己，可以慢慢来。加油，妈妈！'}
};
const DIM_COPY=[
 ['你的选择中，情绪回应体现得较少。你可能更快转向原因、要求或解决问题；孩子的难过，有时也需要先被看见。','你在部分场景中愿意安慰或了解孩子，但不同情境下的回应方式还不一样。','你的多个选择体现了安慰、倾听或回应感受的做法。让感受被听见，是后续沟通的一部分。'],
 ['这次选择中，明确安排和后续确认体现得较少。有时孩子需要的不只是提醒，也包括清楚的下一步。','你会提出要求或进行提醒，但执行与跟进随场景有所不同。','你的选择较多体现了明确要求和落实安排。这个分数描述跟进程度，不代表要求越严格越好。'],
 ['在这些选择里，成人决定、接手或逐项指导较多。孩子参与决定和独立尝试的空间，体现得较少。','你会在部分事情上给孩子选择或动手的机会，支持的方式也有差异。交给他做，与需要时仍能得到帮助，可以同时存在。','你的多个选择体现了让孩子参与、尝试，并提供帮助的做法。自主支持既包含空间，也包含可获得的支持。'],
 ['发生误会或冲突后，你的选择较少体现主动澄清与沟通。恢复日常相处之外，未说开的事也值得被看见。','你会用解释或行动缓和关系，但是否进一步谈开，会随情境而变化。','你在误会和冲突后的选择，较多体现了主动承认、澄清或沟通。愿意修复，比要求自己永远不出错更有意义。'],
 ['你报告的主动分享和非学习陪伴频率较低。这只是两个日常片段，不能据此判断孩子是否爱你或依恋是否安全。','孩子的主动分享与非学习陪伴有一定发生频率，也可能随生活节奏而变化。','你报告的主动分享与非学习陪伴发生得较频繁。这说明日常交流机会较多，不等同于已经了解孩子的所有感受。']
];

function dimText(d,i){if(d.score===null)return '信息不足：需要完成两道主问题后再观察。';return DIM_COPY[i][d.score>=67?2:d.score<=33?0:1];}
function dimensionSummary(data){const valid=data.dimensions.filter(d=>d.score!==null);if(!valid.length)return '先完成相关问题，再观察五个方面的日常反应。';const max=Math.max(...valid.map(d=>d.score)),min=Math.min(...valid.map(d=>d.score));if(max-min<=10)return '五个方面的刻度比较接近。比起比较高低，更值得看看每个情境里的具体做法。';const strongest=valid.filter(d=>d.score===max).map(d=>d.name).join('、'),lightest=valid.filter(d=>d.score===min).map(d=>d.name).join('、');return '本次选择中，“'+strongest+'”体现得较多，“'+lightest+'”的体现相对少一些。这是一张观察地图，不是一份好妈妈排名。';}


export const QUESTION_VERSION='ten-v2-20261020',CONSENT_VERSION='records-20261020';
export const QUESTION_BANK=[{"id":"1","title":"孩子考差了，哭着拿试卷给你看，你通常会：","options":["趁着这次考试成绩不理想，批评了他的学习态度和习惯，希望他能改正。","看他情绪低落，安慰他一次没考好不要紧，不提试卷和成绩。","询问他难过的原因，安抚他的情绪后，再跟他一起分析试卷。","让他把试卷拿出来，看错在哪，直接给他讲错题。"]},{"id":"2","title":"孩子说几个同学总是欺负他，你首先会：","options":["先安慰他，随后直接联系老师处理。","认为可能只是同学间闹别扭，让他先观察几天。","先问清事情发生的时间、地点和经过，再决定怎样处理。","先安慰他，确认是否受伤，再详细了解事情的经过，并和他说明接下来妈妈会怎么做，让他安心。"]},{"id":"3","title":"孩子突然不想去已报名的英语班，你通常会：","options":["认为已经报了班就应该去，要求他按时上课。","这次先同意不去，等下次上课前再看他的意愿。","了解原因，再商量继续、调整或退出，并明确后续安排。","让孩子自己决定，告知孩子，作为家长我们已经为你英语学习提供帮助了，学不学是你的事，我不管。"]},{"id":"4","title":"说好先写作业再玩手机，孩子却先玩起了游戏，你通常会：","options":["收走手机，要求他立即开始写作业。","跟他强调之前约定的规则，并告知他已经违反了约定，让他把手机关掉去写作业。","提醒他玩一会儿记得写，之后主要等他自己开始。","先不介入，等孩子或老师提到作业问题时再处理。"]},{"id":"5","title":"孩子想选的兴趣班与你不同，你通常会：","options":["根据自己的比较和判断，替孩子选定课程。","一起了解课程，跟孩子一起讨论，最后协商确定。","先筛出自己认可的几个课程，让孩子从中选择。","按孩子的兴趣决定。"]},{"id":"6","title":"孩子已经会收书包，却总等你帮忙，你通常会：","options":["让他先自己收，约好稍后一起检查遗漏。","为了省时间、避免漏带，直接替他收好。","陪在旁边，一样一样提醒他装进书包。","把这件事交给他，漏带后的结果自己负责，自己也不再检查。"]},{"id":"7","title":"批评后发现误会了孩子，你通常会：","options":["不再提这件事，恢复平时的相处，让事情过去。","明确承认误会，向孩子道歉，并以此事为契机，说明父母也会犯错，大家都要从错误中吸取教训。","告诉他已经知道不是他的错，之后不再讨论刚才的批评。","承认误会，同时解释自己当时为什么着急。"]},{"id":"8","title":"你发了火，孩子也不理你。冷静后，你通常会：","options":["用拿水果、陪他做事等方式缓和气氛，不再谈刚才的争吵。","等孩子先承认拖拉的问题，再恢复交流。","主动承认自己说重了，听孩子的感受，再讨论以后遇到这种事，双方如何能心平气和地解决。","简单解释自己刚才太着急，然后继续提醒他完成任务。"]},{"id":"9","title":"最近一个月，孩子主动与你分享学校里的事有多频繁？","options":["一周有几次。","很少或没有。","几乎每天都有。","偶尔，大约一周一次。"]},{"id":"10","title":"最近一个月，你们一起玩、散步或闲聊（不包括督促学习）有多频繁？","options":["很少或没有。","几乎每天都有一小段时间。","偶尔，大约一周一次。","一周有几次。"]}];
const ageOptions=['','25岁及以下','26—30岁','31—35岁','36—40岁','41—45岁','46岁及以上'];
const childOptions=['5岁以下',...Array.from({length:11},(_,i)=>(i+5)+'岁'),'15岁以上'];
function validIndices(value,max,limit,required=false){if(!Array.isArray(value)||value.length>limit||required&&!value.length||new Set(value).size!==value.length||value.some(v=>!Number.isInteger(v)||v<0||v>max))throw new Error('前置信息的选择无效，请重新选择。');return [...value]}
export function buildSubmission(input,created=Date.now()){
 if(input.version!==QUESTION_VERSION)throw new Error('问卷版本已更新，请刷新后重新开始。');
 if(input.consent!==true||input.consentVersion!==CONSENT_VERSION)throw new Error('请先阅读并同意答题数据保存说明。');
 if(!Array.isArray(input.answers)||input.answers.length!==10||input.answers.some(a=>!Number.isInteger(a)||a<0||a>3))throw new Error('请完成全部10道题。');
 const p=input.profile,c=input.context;
 if(!p||typeof p!=='object'||![0,1,2].includes(p.role)||![0,1].includes(p.sex)||!ageOptions.includes(p.age)||!childOptions.includes(p.childAge))throw new Error('请选择身份、孩子性别和年龄。');
 if(!c||typeof c!=='object')throw new Error('请完成育儿观念与困扰选择。');
 const belief=validIndices(c.belief,5,3),pain=validIndices(c.pain,6,2,true);if(pain.includes(5)&&pain.length!==1)throw new Error('暂无困扰需单独选择。');
 if(c.other!==undefined&&typeof c.other!=='string')throw new Error('其他困扰格式无效。');
 const other=pain.includes(6)?(c.other||'').trim():'';if(other.length>300)throw new Error('其他困扰请控制在300字以内。');
 const data=calculateReport(input.answers);const report={...data,version:QUESTION_VERSION,profile:REPORT_TYPES[data.key],dimensions:data.dimensions.map((d,i)=>({...d,analysis:dimText(d,i)})),summary:dimensionSummary(data),created};
 return {answers:[...input.answers],profile:{role:p.role,age:p.age,sex:p.sex,childAge:p.childAge},context:{belief,pain,other},report,questions:QUESTION_BANK,version:QUESTION_VERSION,consentVersion:CONSENT_VERSION};
}
export function typeName(key){return REPORT_TYPES[key]?.name||key;}
export {calculateReport};
