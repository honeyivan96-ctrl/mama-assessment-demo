import {QUESTIONS15,VERSION15,report15,score15,TYPES15} from './questionnaire15-v1.mjs';
import * as legacy from './domain-legacy.mjs';
export const QUESTION_VERSION=VERSION15,CONSENT_VERSION=legacy.CONSENT_VERSION,QUESTION_BANK=QUESTIONS15;
const ages=['','25岁及以下','26—30岁','31—35岁','36—40岁','41—45岁','46岁及以上'],children=['5岁以下',...Array.from({length:11},(_,i)=>(i+5)+'岁'),'15岁以上'];
function indices(value,max,limit,required=false){if(!Array.isArray(value)||value.length>limit||required&&!value.length||new Set(value).size!==value.length||value.some(v=>!Number.isInteger(v)||v<0||v>max))throw Error('前置信息的选择无效，请重新选择。');return [...value];}
export function buildSubmission(input,created=Date.now()){
 if(input.version!==VERSION15)throw Error('问卷版本已更新，请刷新后重新开始。');
 if(input.consent!==true||input.consentVersion!==CONSENT_VERSION)throw Error('请先阅读并同意答题数据保存说明。');
 const p=input.profile,c=input.context;
 if(!p||![0,1,2].includes(p.role)||![0,1].includes(p.sex)||!ages.includes(p.age)||!children.includes(p.childAge))throw Error('请选择身份、孩子性别和年龄。');
 if(!c||typeof c!=='object')throw Error('请完成育儿观念与困扰选择。');
 const belief=indices(c.belief,5,3),pain=indices(c.pain,6,2,true);if(pain.includes(5)&&pain.length!==1)throw Error('暂无困扰需单独选择。');
 if(c.other!==undefined&&typeof c.other!=='string')throw Error('其他困扰格式无效。');
 const other=pain.includes(6)?(c.other||'').trim():'';if(other.length>300)throw Error('其他困扰请控制在300字以内。');
 const profile={role:p.role,age:p.age,sex:p.sex,childAge:p.childAge},context={belief,pain,other};
 const report=report15(input.answers,{profile,context},created);
 return {answers:[...input.answers],profile,context,report,questions:QUESTIONS15,version:VERSION15,consentVersion:CONSENT_VERSION};
}
export function refreshStoredReport(report,submission){if(report?.version===VERSION15)return submission?.answers?.length===15?report15(submission.answers,{profile:submission.profile,context:submission.context},report.created):report;return legacy.refreshStoredReport(report,submission);}
export function typeName(key){return TYPES15[key]?.name||legacy.typeName(key);}
export const calculateReport=score15;
