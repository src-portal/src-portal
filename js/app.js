import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAsqNE9tSB2eIDtHBR8dRSVkzGFD0sKh-c",authDomain:"src-portal-a2c98.firebaseapp.com",projectId:"src-portal-a2c98",storageBucket:"src-portal-a2c98.firebasestorage.app",messagingSenderId:"817996931127",appId:"1:817996931127:web:80ae813bf8803ddf2a1fb2"};

document.addEventListener("DOMContentLoaded",()=>{const $=id=>document.getElementById(id);const calendarTitle=$("calendarTitle"),calendarGrid=$("calendarGrid"),prevMonthButton=$("prevMonthButton"),nextMonthButton=$("nextMonthButton"),helpButton=$("helpButton"),helpModal=$("helpModal"),closeHelpButton=$("closeHelpButton"),setupModal=$("setupModal"),nameButtonGrid=$("nameButtonGrid"),changeUserButton=$("changeUserButton"),currentUserLabel=$("currentUserLabel"),homeView=$("homeView"),detailView=$("detailView"),backButton=$("backButton"),detailDate=$("detailDate"),detailEvent=$("detailEvent"),detailTime=$("detailTime"),detailPlace=$("detailPlace"),participantTitle=$("participantTitle"),participantList=$("participantList"),progressText=$("progressText"),progressFill=$("progressFill"),progressBox=$("progressBox"),progressBar=$("progressBar"),eventMessage=$("eventMessage"),joinButton=$("joinButton"),cancelButton=$("cancelButton"),myStatus=$("myStatus"),gymTab=$("gymTab"),runTab=$("runTab"),eventTitle=$("eventTitle"),eventSummary=$("eventSummary"),eventPlace=$("eventPlace"),eventTime=$("eventTime"),ruleTitle=$("ruleTitle"),ruleValue=$("ruleValue"),calendarLegend=$("calendarLegend"),nextPlanContent=$("nextPlanContent"),connectionCard=$("connectionCard"),connectionStatus=$("connectionStatus");
const app=initializeApp(firebaseConfig);const db=getFirestore(app);const today=new Date();let currentYear=today.getFullYear(),currentMonth=today.getMonth(),selectedKey=null,currentType="gym";const defaultMembers=["堀部","日高","北辻","朱","近藤(夕)","ZHU Jie","竹村","岩下","野々村","藤吉","池田","伊東(大)","酒井(琴)","滝"];
let members=[...defaultMembers];
let memberRecords=[];
let eventRecords=[];const requiredMembers=3,storageUserKey="srcPortalCurrentUser";let currentUser=localStorage.getItem(storageUserKey)||"",attendance={};const runEvents={"2026-07-08":{status:"scheduled",message:"通常どおり開催予定です。"},"2026-07-15":{status:"scheduled",message:"通常どおり開催予定です。"},"2026-08-12":{status:"scheduled",message:"通常どおり開催予定です。"},"2026-08-19":{status:"cancelled",message:"会社行事のため中止します。"}};
function setOnline(t){connectionCard.classList.remove("offline");connectionCard.classList.add("online");connectionStatus.textContent=t}function setOffline(t){connectionCard.classList.remove("online");connectionCard.classList.add("offline");connectionStatus.textContent=t}function pad2(n){return String(n).padStart(2,"0")}function toKey(y,m,d){return `${y}-${pad2(m+1)}-${pad2(d)}`}function fmt(key){const [y,m,d]=key.split("-").map(Number);const dt=new Date(y,m-1,d);return `${m}月${d}日（${["日","月","火","水","木","金","土"][dt.getDay()]}）`}function blank(y,m){return(new Date(y,m,1).getDay()+6)%7}function show(e){e.classList.remove("hidden")}function hide(e){e.classList.add("hidden")}function eventId(type,key){return `${type}_${key}`}function eventPath(type,key){return doc(db,"attendance",eventId(type,key))}function getNames(type,key){return attendance[eventId(type,key)]||[]}function isRunDate(key){return !!runEvents[key]}function runStatus(key){return runEvents[key]?.status||""}function isToday(y,m,d){return today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d}
onSnapshot(collection(db,"attendance"),snap=>{attendance={};snap.forEach(d=>{attendance[d.id]=d.data().participants||[]});setOnline("🟢 Firebase 接続中");renderAll();if(selectedKey)renderDetail()},err=>{console.error(err);setOffline("🔴 Firebase 接続エラー")});
onSnapshot(collection(db,"members"),snap=>{
  const loaded=[];
  snap.forEach(d=>{
    const data=d.data();
    if(data.name){
      loaded.push({id:d.id,name:data.name,admin:data.admin===true,active:data.active!==false,order:data.order??999});
    }
  });
  memberRecords=loaded.sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,"ja"));
  const activeMembers=memberRecords.filter(m=>m.active!==false);
  if(activeMembers.length>0){
    members=activeMembers.map(m=>m.name);
  }
  renderNameButtons();
  renderAll();
  if(adminMemberModal&&!adminMemberModal.classList.contains("hidden"))renderAdminMembers();
},err=>{
  console.error("members read error",err);
});
onSnapshot(collection(db,"events"),snap=>{
  const loaded=[];
  snap.forEach(d=>{
    const data=d.data();
    loaded.push({
      id:d.id,
      type:data.type||"",
      date:data.date||"",
      title:data.title||"",
      time:data.time||"19:00",
      place:data.place||"",
      status:data.status||"scheduled",
      memo:data.memo||""
    });
  });
  eventRecords=loaded.sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.type||"").localeCompare(b.type||""));
  if(eventManageModal&&!eventManageModal.classList.contains("hidden"))renderAdminEvents();
},err=>{
  console.error("events read error",err);
});

async function joinEvent(){if(!currentUser){requireName(true);return}try{await setDoc(eventPath(currentType,selectedKey),{type:currentType,date:selectedKey,participants:arrayUnion(currentUser),updatedAt:serverTimestamp()},{merge:true})}catch(e){alert("参加登録に失敗しました。Firestoreのルールを確認してください。");console.error(e)}}async function cancelEvent(){if(!currentUser||!selectedKey)return;try{await updateDoc(eventPath(currentType,selectedKey),{participants:arrayRemove(currentUser),updatedAt:serverTimestamp()})}catch(e){alert("参加取消に失敗しました。");console.error(e)}}
function updateUser(){currentUserLabel.textContent=currentUser?`😊 ${currentUser}`:"未設定"}function renderNameButtons(){nameButtonGrid.innerHTML="";members.forEach(name=>{const b=document.createElement("button");b.type="button";b.className="name-choice-button";b.textContent=`😊 ${name}`;b.onclick=()=>{currentUser=name;localStorage.setItem(storageUserKey,name);updateUser();hide(setupModal);renderAll()};nameButtonGrid.appendChild(b)})}function requireName(force=false){if(force||!currentUser){renderNameButtons();show(setupModal)}}
function setType(type){currentType=type;gymTab.classList.toggle("active",type==="gym");runTab.classList.toggle("active",type==="run");if(type==="gym"){eventTitle.textContent="ジムトレーニング";eventSummary.textContent="好きな日を選んで参加表明";eventPlace.textContent="サンフロッグ春日井";eventTime.textContent="19:00〜";ruleTitle.textContent="開催条件";ruleValue.textContent="3名以上で開催"}else{eventTitle.textContent="ラン＆ウォーク";eventSummary.textContent="基本 第2・第3水曜。開催日は管理者が変更可能。";eventPlace.textContent="落合公園";eventTime.textContent="19:00〜";ruleTitle.textContent="開催状態";ruleValue.textContent="管理者が設定"}renderAll()}function renderAll(){renderCalendar();renderLegend();renderNextPlan()}function renderLegend(){calendarLegend.innerHTML=currentType==="gym"?'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-one"></span>あと2</span><span><span class="dot dot-warning"></span>あと1</span><span><span class="dot dot-confirmed"></span>開催</span><span><span class="dot dot-me"></span>自分</span>':'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-confirmed"></span>開催予定</span><span><span class="dot dot-cancelled"></span>中止</span><span><span class="dot dot-me"></span>自分</span>'}
function renderCalendar(){calendarGrid.innerHTML="";calendarTitle.textContent=`${currentYear}年${currentMonth+1}月`;for(let i=0;i<blank(currentYear,currentMonth);i++){const e=document.createElement("div");e.className="day-cell empty";calendarGrid.appendChild(e)}const days=new Date(currentYear,currentMonth+1,0).getDate();for(let d=1;d<=days;d++){const key=toKey(currentYear,currentMonth,d),names=getNames(currentType,key),count=names.length;const cell=document.createElement("button");cell.type="button";cell.className="day-cell";if(isToday(currentYear,currentMonth,d))cell.classList.add("today");if(currentType==="gym"){if(count===1)cell.classList.add("one");if(count===2)cell.classList.add("warn");if(count>=requiredMembers)cell.classList.add("confirmed")}else{if(!isRunDate(key))cell.classList.add("disabled");else if(runStatus(key)==="cancelled")cell.classList.add("cancelled");else cell.classList.add("confirmed")}if(currentUser&&names.includes(currentUser))cell.classList.add("me");let note="";if(currentType==="gym")note=count>=3?"開催":count===2?"あと1":count===1?"あと2":"";else note=isRunDate(key)?(runStatus(key)==="cancelled"?"中止":"開催"):"";const me=currentUser&&names.includes(currentUser)?"✓ ":"";cell.innerHTML=`<span class="day-number">${me}${d}</span><span class="day-note">${note}</span>`;cell.onclick=()=>{if(currentType==="run"&&!isRunDate(key))return;openDetail(key)};calendarGrid.appendChild(cell)}}
function renderNextPlan(){if(!currentUser){nextPlanContent.className="next-plan-empty";nextPlanContent.textContent="名前を選択すると表示されます。";return}let plans=[];Object.keys(attendance).forEach(id=>{const [type,...rest]=id.split("_");const key=rest.join("_");if((attendance[id]||[]).includes(currentUser))plans.push({type,key})});plans=plans.filter(p=>new Date(p.key)>=new Date(today.getFullYear(),today.getMonth(),today.getDate())).sort((a,b)=>a.key.localeCompare(b.key));if(plans.length===0){nextPlanContent.className="next-plan-empty";nextPlanContent.textContent="参加予定はまだありません。";return}const p=plans[0],label=p.type==="gym"?"🏋️ ジム":"🏃 ラン＆ウォーク",place=p.type==="gym"?"サンフロッグ春日井":"落合公園";nextPlanContent.className="next-plan-item";nextPlanContent.innerHTML=`${label}<br>📅 ${fmt(p.key)}<br>🕖 19:00<br>📍 ${place}`}
function openDetail(key){selectedKey=key;hide(homeView);show(detailView);renderDetail();window.scrollTo({top:0,behavior:"smooth"})}function renderDetail(){const names=getNames(currentType,selectedKey),count=names.length;detailDate.textContent=fmt(selectedKey);detailEvent.textContent=currentType==="gym"?"🏋️ ジムトレーニング":"🏃 ラン＆ウォーク";detailTime.textContent="19:00〜";detailPlace.textContent=currentType==="gym"?"📍 サンフロッグ春日井":"📍 落合公園";participantTitle.textContent=`参加者（${count}名）`;participantList.innerHTML="";if(count===0){const li=document.createElement("li");li.className="empty-message";li.textContent="まだ参加者はいません。";participantList.appendChild(li)}else names.forEach(n=>{const li=document.createElement("li");li.textContent=`😊 ${n}`;if(n===currentUser)li.classList.add("me");participantList.appendChild(li)});eventMessage.classList.add("hidden");progressBox.classList.remove("confirmed","cancelled");progressBar.style.display="block";if(currentType==="gym"){const remain=Math.max(requiredMembers-count,0),rate=Math.min(count/requiredMembers,1)*100;progressFill.style.width=`${rate}%`;if(count>=requiredMembers){progressBox.classList.add("confirmed");progressText.textContent=`🟢 開催決定（${count}名参加）`}else progressText.textContent=`🟡 あと${remain}名で開催`}else{progressFill.style.width="100%";progressBar.style.display="none";const ev=runEvents[selectedKey];if(ev.status==="cancelled"){progressBox.classList.add("cancelled");progressText.textContent="🔴 中止";eventMessage.textContent=ev.message;eventMessage.classList.remove("hidden")}else{progressBox.classList.add("confirmed");progressText.textContent="🟢 開催予定";eventMessage.textContent=ev.message;eventMessage.classList.remove("hidden")}}updateButtons()}function updateButtons(){const names=getNames(currentType,selectedKey),joined=currentUser&&names.includes(currentUser);myStatus.textContent=joined?`✅ ${currentUser}さんは参加予定です。`:`${currentUser||"未設定"}さんはまだ参加していません。`;joinButton.classList.toggle("hidden",joined);cancelButton.classList.toggle("hidden",!joined)}
joinButton.onclick=joinEvent;cancelButton.onclick=cancelEvent;backButton.onclick=()=>{hide(detailView);show(homeView);renderAll()};prevMonthButton.onclick=()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--}renderAll()};nextMonthButton.onclick=()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++}renderAll()};helpButton.onclick=()=>show(helpModal);closeHelpButton.onclick=()=>hide(helpModal);changeUserButton.style.display="none";changeUserButton.onclick=()=>{};gymTab.onclick=()=>setType("gym");runTab.onclick=()=>setType("run");
const adminPin="1979";
const adminPinModal=document.getElementById("adminPinModal");
const adminMenuModal=document.getElementById("adminMenuModal");
const adminPinInput=document.getElementById("adminPinInput");
const adminPinError=document.getElementById("adminPinError");
const adminPinSubmitButton=document.getElementById("adminPinSubmitButton");
const closeAdminPinButton=document.getElementById("closeAdminPinButton");
const closeAdminMenuButton=document.getElementById("closeAdminMenuButton");
const adminChangeUserButton=document.getElementById("adminChangeUserButton");
const versionAdminTrigger=document.getElementById("versionAdminTrigger");

let adminPressTimer=null;
function openAdminPin(){
  adminPinInput.value="";
  adminPinError.classList.add("hidden");
  show(adminPinModal);
  setTimeout(()=>adminPinInput.focus(),100);
}
versionAdminTrigger.addEventListener("touchstart",()=>{
  adminPressTimer=setTimeout(openAdminPin,2000);
},{passive:true});
versionAdminTrigger.addEventListener("touchend",()=>clearTimeout(adminPressTimer));
versionAdminTrigger.addEventListener("touchcancel",()=>clearTimeout(adminPressTimer));
versionAdminTrigger.addEventListener("mousedown",()=>{
  adminPressTimer=setTimeout(openAdminPin,2000);
});
versionAdminTrigger.addEventListener("mouseup",()=>clearTimeout(adminPressTimer));
versionAdminTrigger.addEventListener("mouseleave",()=>clearTimeout(adminPressTimer));

adminPinSubmitButton.onclick=()=>{
  if(adminPinInput.value===adminPin){
    hide(adminPinModal);
    show(adminMenuModal);
  }else{
    adminPinError.classList.remove("hidden");
  }
};
closeAdminPinButton.onclick=()=>hide(adminPinModal);
closeAdminMenuButton.onclick=()=>hide(adminMenuModal);
adminChangeUserButton.onclick=()=>{
  hide(adminMenuModal);
  requireName(true);
};

const adminMemberModal=document.getElementById("adminMemberModal");
const invitePreviewModal=document.getElementById("invitePreviewModal");
const adminMemberListButton=document.getElementById("adminMemberListButton");
const adminInvitePreviewButton=document.getElementById("adminInvitePreviewButton");
const adminSeedMembersButton=document.getElementById("adminSeedMembersButton");
const closeAdminMemberButton=document.getElementById("closeAdminMemberButton");
const closeInvitePreviewButton=document.getElementById("closeInvitePreviewButton");
const memberAdminList=document.getElementById("memberAdminList");
const newMemberNameInput=document.getElementById("newMemberNameInput");
const newMemberAdminCheck=document.getElementById("newMemberAdminCheck");
const addMemberButton=document.getElementById("addMemberButton");
const addMemberError=document.getElementById("addMemberError");
const eventManageModal=document.getElementById("eventManageModal");
const adminEventManageButton=document.getElementById("adminEventManageButton");
const closeEventManageButton=document.getElementById("closeEventManageButton");
const eventAdminList=document.getElementById("eventAdminList");
const eventTypeInput=document.getElementById("eventTypeInput");
const eventDateInput=document.getElementById("eventDateInput");
const eventTitleInput=document.getElementById("eventTitleInput");
const eventTimeInput=document.getElementById("eventTimeInput");
const eventPlaceInput=document.getElementById("eventPlaceInput");
const eventStatusInput=document.getElementById("eventStatusInput");
const eventMemoInput=document.getElementById("eventMemoInput");
const addEventButton=document.getElementById("addEventButton");
const addEventError=document.getElementById("addEventError");


const initialMembers=[
  {id:"horibe",name:"堀部",admin:true,active:true,order:1},
  {id:"hidaka",name:"日高",admin:false,active:true,order:2},
  {id:"kitatsuji",name:"北辻",admin:false,active:true,order:3},
  {id:"zhu",name:"朱",admin:false,active:true,order:4},
  {id:"kondo_yu",name:"近藤(夕)",admin:false,active:true,order:5},
  {id:"zhu_jie",name:"ZHU Jie",admin:false,active:true,order:6},
  {id:"takemura",name:"竹村",admin:false,active:true,order:7},
  {id:"iwashita",name:"岩下",admin:false,active:true,order:8},
  {id:"nonomura",name:"野々村",admin:false,active:true,order:9},
  {id:"fujiyoshi",name:"藤吉",admin:false,active:true,order:10},
  {id:"ikeda",name:"池田",admin:false,active:true,order:11},
  {id:"ito_dai",name:"伊東(大)",admin:false,active:true,order:12},
  {id:"sakai_koto",name:"酒井(琴)",admin:false,active:true,order:13},
  {id:"taki",name:"滝",admin:false,active:true,order:14}
];

async function seedMembers(){
  if(!confirm("初期メンバーをFirestoreに登録します。よろしいですか？")) return;

  try{
    for(const m of initialMembers){
      await setDoc(doc(db,"members",m.id),{
        name:m.name,
        admin:m.admin,
        active:m.active,
        order:m.order,
        updatedAt:serverTimestamp()
      },{merge:true});
    }
    alert("初期メンバー登録が完了しました。");
  }catch(e){
    console.error(e);
    alert("初期メンバー登録に失敗しました。Firestoreルールを確認してください。");
  }
}


function eventTypeLabel(type){
  return type==="run"?"ラン＆ウォーク":"ジム";
}

function renderAdminEvents(){
  eventAdminList.innerHTML="";
  if(eventRecords.length===0){
    const div=document.createElement("div");
    div.className="event-admin-item";
    div.textContent="イベントはまだ登録されていません。";
    eventAdminList.appendChild(div);
    return;
  }

  eventRecords.forEach(ev=>{
    const div=document.createElement("div");
    div.className="event-admin-item";

    const title=document.createElement("div");
    title.className="event-admin-title";

    const badge=document.createElement("span");
    badge.className=`event-status-badge ${ev.status==="cancelled"?"cancelled":""}`;
    badge.textContent=ev.status==="cancelled"?"中止":"開催予定";

    title.textContent=`${ev.type==="run"?"🏃":"🏋️"} ${ev.date} ${ev.title||eventTypeLabel(ev.type)}`;
    title.appendChild(badge);

    const sub=document.createElement("div");
    sub.className="event-admin-sub";
    sub.innerHTML=`${ev.time||"19:00"} / ${ev.place||"-"}<br>${ev.memo||""}`;

    div.appendChild(title);
    div.appendChild(sub);
    eventAdminList.appendChild(div);
  });
}

function fillEventDefaults(){
  const type=eventTypeInput.value;
  if(type==="run"){
    if(!eventTitleInput.value)eventTitleInput.value="ラン＆ウォーク";
    if(!eventPlaceInput.value)eventPlaceInput.value="落合公園";
  }else{
    if(!eventTitleInput.value)eventTitleInput.value="ジムトレーニング";
    if(!eventPlaceInput.value)eventPlaceInput.value="サンフロッグ春日井";
  }
  if(!eventTimeInput.value)eventTimeInput.value="19:00";
}

async function addEvent(){
  const type=eventTypeInput.value;
  const date=eventDateInput.value;
  if(!type||!date){
    addEventError.classList.remove("hidden");
    return;
  }
  addEventError.classList.add("hidden");
  fillEventDefaults();

  const eventDocId=`${type}_${date}`;
  try{
    await setDoc(doc(db,"events",eventDocId),{
      type,
      date,
      title:eventTitleInput.value.trim()||eventTypeLabel(type),
      time:eventTimeInput.value||"19:00",
      place:eventPlaceInput.value.trim(),
      status:eventStatusInput.value||"scheduled",
      memo:eventMemoInput.value.trim(),
      updatedAt:serverTimestamp()
    },{merge:true});

    eventDateInput.value="";
    eventMemoInput.value="";
    alert("イベントを追加しました。");
  }catch(e){
    console.error(e);
    alert("イベント追加に失敗しました。Firestoreルールを確認してください。");
  }
}

function renderAdminMembers(){
  memberAdminList.innerHTML="";
  const list=memberRecords.length>0?memberRecords:members.map((name,i)=>({name,admin:false,active:true,order:i+1}));
  if(list.length===0){
    const div=document.createElement("div");
    div.className="member-admin-item";
    div.textContent="メンバーが登録されていません。";
    memberAdminList.appendChild(div);
    return;
  }
  list.forEach((m,index)=>{
    const div=document.createElement("div");
    div.className="member-admin-item";

    const left=document.createElement("div");
    left.className="member-admin-card-left";

    const title=document.createElement("div");
    title.className="member-admin-main";
    title.textContent=`😊 ${m.name}`;

    const sub=document.createElement("div");
    sub.className="member-admin-sub";
    sub.textContent=`order: ${m.order ?? "-"} / ${m.active===false ? "無効" : "有効"} / ${m.admin ? "管理者" : "一般"}`;

    left.appendChild(title);
    left.appendChild(sub);

    const editBox=document.createElement("div");
    editBox.className="member-edit-box hidden";

    const editRow=document.createElement("div");
    editRow.className="member-edit-row";

    const nameInput=document.createElement("input");
    nameInput.type="text";
    nameInput.value=m.name;
    nameInput.placeholder="メンバー名";

    const checks=document.createElement("div");
    checks.className="member-edit-checks";

    const adminLabel=document.createElement("label");
    const adminCheck=document.createElement("input");
    adminCheck.type="checkbox";
    adminCheck.checked=m.admin===true;
    adminLabel.appendChild(adminCheck);
    adminLabel.appendChild(document.createTextNode(" 管理者"));

    const activeLabel=document.createElement("label");
    const activeCheck=document.createElement("input");
    activeCheck.type="checkbox";
    activeCheck.checked=m.active!==false;
    activeLabel.appendChild(activeCheck);
    activeLabel.appendChild(document.createTextNode(" 有効"));

    checks.appendChild(adminLabel);
    checks.appendChild(activeLabel);

    const saveBtn=document.createElement("button");
    saveBtn.type="button";
    saveBtn.className="member-small-button primary";
    saveBtn.textContent="保存";
    saveBtn.onclick=()=>saveMemberEdit(m.id,nameInput.value,adminCheck.checked,activeCheck.checked);

    const cancelBtn=document.createElement("button");
    cancelBtn.type="button";
    cancelBtn.className="member-small-button";
    cancelBtn.textContent="キャンセル";
    cancelBtn.onclick=()=>editBox.classList.add("hidden");

    editRow.appendChild(nameInput);
    editRow.appendChild(checks);
    editRow.appendChild(saveBtn);
    editRow.appendChild(cancelBtn);
    editBox.appendChild(editRow);
    left.appendChild(editBox);

    div.appendChild(left);

    const actions=document.createElement("div");
    actions.className="member-admin-actions";

    const editBtn=document.createElement("button");
    editBtn.type="button";
    editBtn.className="member-small-button";
    editBtn.textContent="編集";
    editBtn.onclick=()=>editBox.classList.toggle("hidden");

    const adminBtn=document.createElement("button");
    adminBtn.type="button";
    adminBtn.className=`member-toggle-button ${m.admin ? "on" : ""}`;
    adminBtn.textContent=m.admin ? "管理者ON" : "管理者OFF";
    adminBtn.onclick=()=>toggleMemberFlag(m.id,"admin",!m.admin);

    const activeBtn=document.createElement("button");
    activeBtn.type="button";
    activeBtn.className=`member-toggle-button ${m.active===false ? "off" : "on"}`;
    activeBtn.textContent=m.active===false ? "無効" : "有効";
    activeBtn.onclick=()=>toggleMemberFlag(m.id,"active",m.active===false);

    const orderBox=document.createElement("div");
    orderBox.className="member-order-buttons";

    const upBtn=document.createElement("button");
    upBtn.type="button";
    upBtn.className="member-small-button";
    upBtn.textContent="↑";
    upBtn.disabled=index===0;
    upBtn.onclick=()=>moveMember(m,index,-1);

    const downBtn=document.createElement("button");
    downBtn.type="button";
    downBtn.className="member-small-button";
    downBtn.textContent="↓";
    downBtn.disabled=index===list.length-1;
    downBtn.onclick=()=>moveMember(m,index,1);

    orderBox.appendChild(upBtn);
    orderBox.appendChild(downBtn);

    actions.appendChild(editBtn);
    actions.appendChild(adminBtn);
    actions.appendChild(activeBtn);
    actions.appendChild(orderBox);
    div.appendChild(actions);

    memberAdminList.appendChild(div);
  });
}

async function toggleMemberFlag(memberId,field,value){
  if(!memberId){
    alert("このメンバーはFirestoreのIDがないため変更できません。");
    return;
  }
  try{
    await updateDoc(doc(db,"members",memberId),{
      [field]:value,
      updatedAt:serverTimestamp()
    });
  }catch(e){
    console.error(e);
    alert("メンバー情報の更新に失敗しました。Firestoreルールを確認してください。");
  }
}

async function saveMemberEdit(memberId,name,admin,active){
  const cleanName=name.trim();
  if(!memberId){
    alert("このメンバーはFirestoreのIDがないため変更できません。");
    return;
  }
  if(!cleanName){
    alert("メンバー名を入力してください。");
    return;
  }
  try{
    await updateDoc(doc(db,"members",memberId),{
      name:cleanName,
      admin,
      active,
      updatedAt:serverTimestamp()
    });
    alert("メンバー情報を保存しました。");
  }catch(e){
    console.error(e);
    alert("メンバー情報の保存に失敗しました。Firestoreルールを確認してください。");
  }
}

async function moveMember(member,index,direction){
  const target=memberRecords[index+direction];
  if(!member||!target||!member.id||!target.id)return;
  try{
    const currentOrder=member.order??index+1;
    const targetOrder=target.order??index+direction+1;
    await updateDoc(doc(db,"members",member.id),{
      order:targetOrder,
      updatedAt:serverTimestamp()
    });
    await updateDoc(doc(db,"members",target.id),{
      order:currentOrder,
      updatedAt:serverTimestamp()
    });
  }catch(e){
    console.error(e);
    alert("表示順の変更に失敗しました。Firestoreルールを確認してください。");
  }
}

function makeMemberId(name){
  const base=name.trim().toLowerCase().replace(/[\s　]+/g,"_").replace(/[()（）]/g,"").replace(/[^a-z0-9_\-]/g,"");
  return base || `member_${Date.now()}`;
}

async function getNextMemberOrder(){
  try{
    const snap=await getDocs(collection(db,"members"));
    let maxOrder=0;
    snap.forEach(d=>{
      const order=Number(d.data().order||0);
      if(order>maxOrder)maxOrder=order;
    });
    return maxOrder+1;
  }catch(e){
    console.error(e);
    return memberRecords.length+1;
  }
}

async function addMember(){
  const name=newMemberNameInput.value.trim();
  if(!name){
    addMemberError.classList.remove("hidden");
    return;
  }
  addMemberError.classList.add("hidden");
  const id=makeMemberId(name);
  const order=await getNextMemberOrder();
  try{
    await setDoc(doc(db,"members",id),{
      name,
      admin:newMemberAdminCheck.checked,
      active:true,
      order,
      updatedAt:serverTimestamp()
    },{merge:true});
    newMemberNameInput.value="";
    newMemberAdminCheck.checked=false;
    alert("メンバーを追加しました。");
  }catch(e){
    console.error(e);
    alert("メンバー追加に失敗しました。Firestoreルールを確認してください。");
  }
}

adminMemberListButton.onclick=()=>{
  renderAdminMembers();
  show(adminMemberModal);
};
adminEventManageButton.onclick=()=>{
  renderAdminEvents();
  show(eventManageModal);
};
closeEventManageButton.onclick=()=>hide(eventManageModal);
eventTypeInput.onchange=fillEventDefaults;
addEventButton.onclick=addEvent;
adminInvitePreviewButton.onclick=()=>show(invitePreviewModal);
adminSeedMembersButton.onclick=seedMembers;
closeAdminMemberButton.onclick=()=>hide(adminMemberModal);
closeInvitePreviewButton.onclick=()=>hide(invitePreviewModal);
addMemberButton.onclick=addMember;



renderNameButtons();updateUser();renderAll();requireName(false)});
