export type Option = { text: string; w: number | null; b: number | null; tag?: string };
export type Question = { id: number; title: string; scene: string; focus: "w" | "b"; options: Option[] };
const o = (text: string, w: number | null, b: number | null, tag?: string): Option => ({text,w,b,tag});
export const questions: Question[] = [
{ id:1,title:"“玩完这把再写”",scene:"你走进房间，看见孩子正在用手机玩游戏。你问：“作业写完了吗？”他头也不抬：“还没，玩完这把再写。”",focus:"b",options:[
o("“作业没写完就玩游戏？手机给我！”拿走手机，让他先写。",null,3,"direct"),o("“你能不能先写作业，写完再玩？”劝了几句，他不动，你先去忙别的。",null,1,"unfollowed"),o("“这把还有多久？打完就写，不能再开了啊。”到时间会过去看。",null,3,"followed"),o("“行，玩完记得写。”之后没再问，等他自己开始。",null,1,"unfollowed")]},
{id:2,title:"“你讲的我听不懂！”",scene:"一道数学题你讲了两遍。孩子把笔一放：“你讲的我听不懂！我不想做了！”",focus:"w",options:[
o("“哪一步没听懂？指给我看。”换个方法再讲。",3,null,"listen"),o("“先歇一会儿，等下咱们再看。”缓一缓，再回来处理。",3,null,"repair"),o("“先照着我刚才说的做一遍。”让他继续做。",1,null,"task"),o("“我讲的时候你到底听没听？”要求他认真听，再讲一遍。",0,null,"pressure")]},
{id:3,title:"“再看一集嘛！”",scene:"周六晚上，你和孩子说好看两集动画。第二集结束，他拿着遥控器：“再看一集嘛！明天又不用早起。”",focus:"b",options:[
o("“行，你看吧。”没有再约定什么时候关。",null,0,"unfollowed"),o("“那就再看一集，不能再加了啊。”这一集结束后让他关掉。",null,2,"adjusted"),o("“说好两集，今天就看到这儿，明天再看。”他继续央求，你仍坚持，最后关掉。",null,3,"followed"),o("“说好两集就是两集。”不再听他央求，拿过遥控器关掉。",null,3,"direct")]},
{id:4,title:"“你别生气……”",scene:"孩子拿回一张比平时低不少的试卷，递给你时小声说：“你别生气……”",focus:"w",options:[
o("“怎么考成这样？平时让你认真，你就是不听。”先批评。",0,null,"pressure"),o("“卷子拿来，我看看错在哪儿。”先查看失分的地方。",1,null,"task"),o("“先别紧张，跟我说说这次考试怎么了。”让他先讲。",3,null,"listen"),o("“一次没考好不算什么。”先安慰，当晚不再谈考试。",2,null,"comfort")]},
{id:5,title:"“你帮我收书包吧”",scene:"孩子平时能自己收书包。今晚他坐在沙发上：“妈妈，你帮我收一下吧。”",focus:"b",options:[
o("“行，你去洗漱，我来收。”帮他收好。",null,0,"takeover"),o("“自己的书包自己收。”让他起来完成。",null,3,"direct"),o("“你先收，等下我帮你再检查一遍。”他收好，你再检查。",null,3,"scaffold"),o("“别忘了收啊。”提醒后不再查看，让他自己负责。",null,2,"autonomy")]},
{id:6,title:"“今天他们都不跟我玩”",scene:"孩子放学回来，书包一放：“今天他们都不跟我玩。”说着眼圈红了。",focus:"w",options:[
o("“今天发生什么了？跟我说说。”听他把事情讲完。",3,null,"listen"),o("“不跟你玩就算了，明天找别人玩。”给个建议，不再细问。",1,null,"task"),o("“过来，妈妈抱抱。”先安慰，等他平静下来再听。",3,null,"comfort"),o("“是不是你做了什么，让他们不高兴了？”先问他的行为。",1,null,"question")]},
{id:7,title:"“太难了，我不想去了”",scene:"兴趣班是孩子自己提出要学的。最近内容变难，他连着两次出门前说：“太难了，我不想去了。”",focus:"b",options:[
o("“自己要学的，这一期得上完。”仍按原安排上课。",null,3,"direct"),o("“哪部分太难？跟老师说说，再试两次。”两次后重新决定。",null,3,"scaffold"),o("“不想学就不学了。”联系机构停课。",null,null,"exit"),o("“今天不想去就不去了，下次再说。”每次看他当天的意愿。",null,0,"unfollowed")]},
{id:8,title:"“你根本没听！”",scene:"你正在回复工作消息。孩子讲了几句学校里的事，停下来问：“妈妈，你根本没听，对不对？”",focus:"w",options:[
o("“刚才确实没听清，你再说一遍。”放下手机听。",3,null,"listen"),o("“让我回完这条，你再讲。”回完后主动叫他继续。",3,null,"followed"),o("“我听着呢，你说。”继续看手机，偶尔应几声。",1,null,"distracted"),o("“妈妈忙着呢，你先自己玩。”之后没有再问。",0,null,"unfollowed")]},
{id:9,title:"“别人都有，就我没有！”",scene:"你们上周说好，这个月不再买玩具。孩子又看中一款：“班里好多人都有，就我没有！”",focus:"b",options:[
o("“好吧，这次买，下次不能再要了。”这次破例。",null,1,"adjusted"),o("“你想要，但说好这个月不买了。”这次不买。",null,3,"followed"),o("“不买就是不买，别再说了。”直接结束讨论。",null,3,"direct"),o("“这个月不买，先记下来，下个月再看。”之后再决定。",null,3,"scaffold")]},
{id:10,title:"“我是不是很笨？”",scene:"听写错了好几个字，孩子低头看着本子：“妈妈，我是不是很笨？”",focus:"w",options:[
o("“不是笨，这几个字还没记住，咱们想个办法。”一起找记忆方法。",3,null,"scaffold"),o("“别这么说自己，错几个字不代表笨。”先安慰他。",3,null,"comfort"),o("“怎么突然这么想？今天有人说你了吗？”了解原因。",3,null,"listen"),o("“那就认真点，赶紧把错的改了。”让他继续改错。",0,null,"task")]},
{id:11,title:"他兴冲冲地拿来一张画",scene:"孩子放学进门，举着画：“妈妈！老师今天把我的画贴墙上了！”你正在做饭。",focus:"w",options:[
o("“真的？拿近点，我看看！”听他介绍自己的画。",3,null,"listen"),o("“挺好的，先去写作业吧。”很快转到作业上。",1,null,"task"),o("“这锅马上好，你先放桌上。”忙完主动叫他拿来讲。",3,null,"followed"),o("“嗯，看到了。”继续做饭，之后没再提起。",0,null,"unfollowed")]},
{id:12,title:"“今天不刷牙了吧”",scene:"到了刷牙时间，孩子躺在床上：“我好困，今天不刷牙了吧。”他没有生病，只是不想起来。",focus:"b",options:[
o("“今天算了，明天好好刷。”让他直接睡。",null,0,"adjusted"),o("“不行，起来刷完再睡。”要求他完成。",null,3,"direct"),o("“刷完就能睡了，我陪你过去。”最后让他刷完。",null,3,"scaffold"),o("“最好还是刷一下。”提醒后让他自己决定。",null,1,"unfollowed")]},
{id:13,title:"奶奶说：“我帮他收”",scene:"你让孩子收积木。奶奶说：“我帮他收就行。”孩子听见后，转身去看电视了。",focus:"b",options:[
o("“奶奶，你先歇着，让他收。”叫孩子回来完成。",null,3,"followed"),o("奶奶愿意帮，就让奶奶收，不再叫孩子。",null,0,"takeover"),o("“奶奶可以帮，但你也得收。”叫他回来一起收。",null,3,"scaffold"),o("“今天奶奶帮你，下次自己收。”让他继续看电视。",null,1,"takeover")]},
{id:14,title:"“你刚才那样说，我很难受”",scene:"你刚才着急，说了句：“这么简单都不会！”过了一会儿，孩子说：“你刚才那样说，我很难受。”",focus:"w",options:[
o("“那句话是我说错了，对不起。”明确道歉。",3,null,"repair"),o("“我是着急，不是真的觉得你笨。”主要解释自己的意思。",1,null,"explain"),o("“那你认真点，我也就不会急了。”转回他的表现。",0,null,"pressure"),o("不太好意思道歉，给他拿点吃的，陪他坐一会儿。",2,null,"comfort")]},
{id:15,title:"答应拿碗，又忘了",scene:"孩子会自己把碗拿到厨房，也答应晚饭后自己拿。你忙完回来，碗还在桌上，他已经去玩了。",focus:"b",options:[
o("顺手收走，觉得为这点事叫他没必要。",null,0,"takeover"),o("“你的碗还在桌上，过来拿一下。”让他回来完成。",null,3,"followed"),o("“这次我收，下次记着。”自己收掉，再提醒一句。",null,1,"takeover"),o("“手上这点玩完，就过来收碗。”过一会儿确认他收了。",null,3,"followed")]},
{id:16,title:"“你自己也看手机！”",scene:"你提醒孩子吃饭时不要看视频。他指着你的手机：“你自己不也在看手机吗？”你刚才确实在刷视频。",focus:"w",options:[
o("“对，是我也没做到。”放下手机，让他一起放下。",3,null,"repair"),o("“我看一会儿怎么了？你先把你的放下。”自己继续看。",0,null,"dismiss"),o("“现在说的是你，别扯我。”不回应他的质疑。",0,null,"dismiss"),o("“今天都先放下，吃完再看。”之后一起重新明确约定。",2,null,"followed")]}
];
export function publicQuestions() { return questions.map(q=>({id:q.id,title:q.title,scene:q.scene,options:q.options.map((p,id)=>({id,text:p.text}))})); }
