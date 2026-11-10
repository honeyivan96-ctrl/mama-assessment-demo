(function(root){
 const ENTRY='https://honeyivan96-ctrl.github.io/mama-assessment-demo/';
 function page(file,filename){const u=new URL('save-image.html',ENTRY);u.hash=new URLSearchParams({image:file.imageURL,download:file.downloadURL,name:filename||'妈妈测评图片.png'}).toString();return u.href;}
 function intent(address){const u=new URL(address);if(u.protocol!=='https:'||u.origin!=='https://honeyivan96-ctrl.github.io'||u.pathname!=='/mama-assessment-demo/save-image.html')throw Error('保存链接无效。');return 'intent://'+u.host+u.pathname+u.search+u.hash+'#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url='+encodeURIComponent(u.href)+';end';}
 function allowed(value){try{const u=new URL(value);return u.protocol==='https:'&&((u.origin==='https://honeyivan96-ctrl.github.io'&&/^\/mama-assessment-demo\/cards\/(bear|tiger|hen|cat)-save\.png$/.test(u.pathname))||(u.origin==='https://apqqdkooiezejwyypwht.supabase.co'&&u.pathname.startsWith('/storage/v1/object/sign/mama-report-images/')&&u.searchParams.has('token')));}catch{return false;}}
 root.MamaImageSave={page,intent,allowed};
})(typeof globalThis==='object'?globalThis:this);
