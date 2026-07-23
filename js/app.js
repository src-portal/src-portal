import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDocs, getDoc, deleteDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAsqNE9tSB2eIDtHBR8dRSVkzGFD0sKh-c",authDomain:"src-portal-a2c98.firebaseapp.com",projectId:"src-portal-a2c98",storageBucket:"src-portal-a2c98.firebasestorage.app",messagingSenderId:"817996931127",appId:"1:817996931127:web:80ae813bf8803ddf2a1fb2"};

document.addEventListener("DOMContentLoaded",()=>{const $=id=>document.getElementById(id);const calendarTitle=$("calendarTitle"),calendarGrid=$("calendarGrid"),prevMonthButton=$("prevMonthButton"),nextMonthButton=$("nextMonthButton"),helpButton=$("helpButton"),helpModal=$("helpModal"),closeHelpButton=$("closeHelpButton"),setupModal=$("setupModal"),setupModalTitle=$("setupModalTitle"),setupModalText=$("setupModalText"),closeSetupModalButton=$("closeSetupModalButton"),nameButtonGrid=$("nameButtonGrid"),changeUserButton=$("changeUserButton"),currentUserLabel=$("currentUserLabel"),homeView=$("homeView"),detailView=$("detailView"),backButton=$("backButton"),detailDate=$("detailDate"),detailEvent=$("detailEvent"),detailTime=$("detailTime"),detailPlace=$("detailPlace"),participantTitle=$("participantTitle"),participantList=$("participantList"),progressText=$("progressText"),progressFill=$("progressFill"),progressBox=$("progressBox"),progressBar=$("progressBar"),eventMessage=$("eventMessage"),joinButton=$("joinButton"),cancelButton=$("cancelButton"),myStatus=$("myStatus"),gymTab=$("gymTab"),runTab=$("runTab"),eventTitle=$("eventTitle"),eventSummary=$("eventSummary"),eventPlace=$("eventPlace"),eventTime=$("eventTime"),ruleTitle=$("ruleTitle"),ruleValue=$("ruleValue"),calendarLegend=$("calendarLegend"),nextPlanContent=$("nextPlanContent"),nextEventContent=$("nextEventContent"),nextEventCard=$("nextEventCard"),connectionCard=$("connectionCard"),connectionStatus=$("connectionStatus"),
userChangeConfirmModal=$("userChangeConfirmModal"),
cancelUserChangeButton=$("cancelUserChangeButton"),
confirmUserChangeButton=$("confirmUserChangeButton"),
sameDayStatusModal=$("sameDayStatusModal"),
closeSameDayStatusButton=$("closeSameDayStatusButton"),
sameDayStatusUser=$("sameDayStatusUser"),
monthJumpModal=$("monthJumpModal"),
closeMonthJumpButton=$("closeMonthJumpButton"),
monthJumpYear=$("monthJumpYear"),
monthJumpMonth=$("monthJumpMonth"),
monthJumpCurrentButton=$("monthJumpCurrentButton"),
cancelMonthJumpButton=$("cancelMonthJumpButton"),
applyMonthJumpButton=$("applyMonthJumpButton"),
setupAdminUnlockModal=$("setupAdminUnlockModal"),
closeSetupAdminUnlockButton=$("closeSetupAdminUnlockButton"),
setupAdminUnlockPin=$("setupAdminUnlockPin"),
setupAdminUnlockError=$("setupAdminUnlockError"),
applySetupAdminUnlockButton=$("applySetupAdminUnlockButton"),
inviteAuthModal=$("inviteAuthModal"),
closeInviteAuthButton=$("closeInviteAuthButton"),
inviteAuthMemberName=$("inviteAuthMemberName"),
inviteAuthCodeInput=$("inviteAuthCodeInput"),
inviteAuthError=$("inviteAuthError"),
confirmInviteAuthButton=$("confirmInviteAuthButton");
const app=initializeApp(firebaseConfig);const db=getFirestore(app);const today=new Date();let currentYear=today.getFullYear(),currentMonth=today.getMonth(),selectedKey=null,currentType="run";const defaultMembers=["堀部","日高","北辻","朱","近藤(夕)","ZHU Jie","竹村","岩下","野々村","藤吉","池田","伊東(大)","酒井(琴)","滝"];
let members=[...defaultMembers];
let memberRecords=[];
let eventRecords=[];
let announcementRecords=[];
let messageBoardRecords=[];
let selectedEvent=null;
const defaultSystemSettings={
  run:{time:"19:00",place:"落合公園"},
  gym:{time:"19:00",place:"サンフロッグ春日井",minParticipants:3,deadlineLabel:"前日18:00"}
};
let systemSettings=JSON.parse(JSON.stringify(defaultSystemSettings));
let requiredMembers=systemSettings.gym.minParticipants;
const storageUserKey="srcPortalCurrentUser";
const storageMemberIdKey="srcPortalCurrentMemberId";
let userSelectionMode="public";
let pendingInviteMember=null;
let setupAdminLongPressTimer=null;
let currentUser=localStorage.getItem(storageUserKey)||"",attendance={},attendanceStatuses={},selectedSameDayUser="";
let memberInvitationMigrationStarted=false;
let lastActiveUpdatedMemberId="";
function setOnline(t){connectionCard.classList.remove("offline");connectionCard.classList.add("online");connectionStatus.textContent=t}function setOffline(t){connectionCard.classList.remove("online");connectionCard.classList.add("offline");connectionStatus.textContent=t}function pad2(n){return String(n).padStart(2,"0")}function toKey(y,m,d){return `${y}-${pad2(m+1)}-${pad2(d)}`}function fmt(key){const [y,m,d]=key.split("-").map(Number);const dt=new Date(y,m-1,d);return `${m}月${d}日（${["日","月","火","水","木","金","土"][dt.getDay()]}）`}function blank(y,m){return(new Date(y,m,1).getDay()+6)%7}function show(e){
  if(e&&[
    "adminPinModal",
    "adminMenuModal",
    "adminMemberModal",
    "announcementManageModal",
    "messageBoardModal",
    "eventManageModal",
    "systemSettingsModal",
    "invitePreviewModal",
    "setupModal",
    "helpModal",
    "monthJumpModal",
    "setupAdminUnlockModal",
    "inviteAuthModal"
  ].includes(e.id)){
    positionMemberModalBelowHeader(e);
  }
  e.classList.remove("hidden");
}function hide(e){e.classList.add("hidden")}function eventId(type,key){return `${type}_${key}`}function eventPath(type,key){return doc(db,"attendance",eventId(type,key))}function getNames(type,key){return attendance[eventId(type,key)]||[]}function isToday(y,m,d){return today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d}
function todayKeyJST(){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Tokyo",
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
  }).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function isPastKey(key){return Boolean(key)&&key<todayKeyJST()}

async function migrateExistingMemberInvitationFields(records){
  if(memberInvitationMigrationStarted)return;
  const targets=records.filter(record=>record.needsInvitationMigration);
  if(targets.length===0){
    memberInvitationMigrationStarted=true;
    return;
  }
  memberInvitationMigrationStarted=true;
  try{
    const batch=writeBatch(db);
    targets.forEach(record=>{
      const fields={};
      if(record.inviteCodeMissing)fields.inviteCode="";
      if(record.inviteStatusMissing)fields.inviteStatus="registered";
      if(record.registeredAtMissing)fields.registeredAt=serverTimestamp();
      if(record.lastActiveAtMissing)fields.lastActiveAt=null;
      if(Object.keys(fields).length>0){
        fields.updatedAt=serverTimestamp();
        batch.set(doc(db,"members",record.id),fields,{merge:true});
      }
    });
    await batch.commit();
  }catch(e){
    memberInvitationMigrationStarted=false;
    console.error("member invitation migration error",e);
  }
}

async function updateCurrentUserLastActive(){
  if(!currentUser)return;
  const record=memberRecords.find(member=>member.name===currentUser&&member.active!==false);
  if(!record||!record.id||lastActiveUpdatedMemberId===record.id)return;
  lastActiveUpdatedMemberId=record.id;
  try{
    await setDoc(doc(db,"members",record.id),{
      inviteCode:record.inviteCode||"",
      inviteStatus:record.inviteStatus||"registered",
      registeredAt:record.registeredAt||serverTimestamp(),
      lastActiveAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    },{merge:true});
  }catch(e){
    lastActiveUpdatedMemberId="";
    console.error("lastActiveAt update error",e);
  }
}

onSnapshot(doc(db,"settings","system"),snap=>{
  const data=snap.exists()?snap.data():{};
  systemSettings={
    run:{
      time:data.run?.time||defaultSystemSettings.run.time,
      place:data.run?.place||defaultSystemSettings.run.place
    },
    gym:{
      time:data.gym?.time||defaultSystemSettings.gym.time,
      place:data.gym?.place||defaultSystemSettings.gym.place,
      minParticipants:Number(data.gym?.minParticipants)||defaultSystemSettings.gym.minParticipants,
      deadlineLabel:data.gym?.deadlineLabel||defaultSystemSettings.gym.deadlineLabel
    }
  };
  requiredMembers=systemSettings.gym.minParticipants;
  applySystemSettingsToInputs();
  setType(currentType);
  if(selectedKey)renderDetail();
},err=>{
  console.error("settings read error",err);
});

onSnapshot(collection(db,"attendance"),snap=>{
  attendance={};
  attendanceStatuses={};
  snap.forEach(d=>{
    const data=d.data();
    attendance[d.id]=data.participants||[];
    attendanceStatuses[d.id]=data.statuses||{};
  });
  setOnline("🟢 Firebase 接続中");
  renderAll();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(selectedKey)renderDetail();
},err=>{console.error(err);setOffline("🔴 Firebase 接続エラー")});
onSnapshot(collection(db,"members"),snap=>{
  const loaded=[];
  snap.forEach(d=>{
    const data=d.data();
    if(data.name){
      loaded.push({
        id:d.id,
        name:data.name,
        admin:data.admin===true,
        active:data.active!==false,
        order:data.order??999,
        inviteCode:data.inviteCode||"",
        inviteStatus:data.inviteStatus||"registered",
        registeredAt:data.registeredAt||null,
        lastActiveAt:data.lastActiveAt||null,
        inviteCodeMissing:!("inviteCode" in data),
        inviteStatusMissing:!("inviteStatus" in data),
        registeredAtMissing:!("registeredAt" in data),
        lastActiveAtMissing:!("lastActiveAt" in data),
        needsInvitationMigration:!("inviteCode" in data)||!("inviteStatus" in data)||!("registeredAt" in data)||!("lastActiveAt" in data)
      });
    }
  });
  memberRecords=loaded.sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,"ja"));
  migrateExistingMemberInvitationFields(memberRecords);
  updateCurrentUserLastActive();
  const activeMembers=memberRecords.filter(m=>m.active!==false);
  if(activeMembers.length>0){
    members=activeMembers.map(m=>m.name);
  }
  renderNameButtons();
  renderAll();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(adminMemberModal&&!adminMemberModal.classList.contains("hidden"))renderAdminMembers();
},err=>{
  console.error("members read error",err);
});
onSnapshot(collection(db,"announcements"),snap=>{
  const loaded=[];
  snap.forEach(d=>{const data=d.data();loaded.push({id:d.id,title:data.title||"",body:data.body||"",enabled:data.enabled!==false,createdAt:data.createdAt||null,updatedAt:data.updatedAt||null});});
  announcementRecords=loaded.sort((a,b)=>{const ta=a.updatedAt?.seconds||a.createdAt?.seconds||0;const tb=b.updatedAt?.seconds||b.createdAt?.seconds||0;return tb-ta;});
  renderAnnouncementsPublic();
  renderDashboard();
  if(announcementManageModal&&!announcementManageModal.classList.contains("hidden"))renderAdminAnnouncements();
},err=>{console.error("announcements read error",err);});

onSnapshot(collection(db,"messageBoard"),snap=>{
  const loaded=[];
  snap.forEach(d=>loaded.push({id:d.id,...d.data()}));
  messageBoardRecords=loaded.sort((a,b)=>messageBoardDateValue(b.createdAt)-messageBoardDateValue(a.createdAt));
  renderMessageBoard();
},err=>{console.error("messageBoard read error",err);});
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
  renderNextEventPublic();
  renderCalendar();
  renderDashboard();
  if(eventManageModal&&!eventManageModal.classList.contains("hidden"))renderAdminEvents();
},err=>{
  console.error("events read error",err);
});

async function joinEvent(){
  if(isPastKey(selectedKey)){
    alert("過去の日付には参加登録できません。");
    return;
  }
  if(!currentUser){
    requireName(true);
    return;
  }

  if(currentType==="run"){
    const ev=primaryEventForDate(selectedKey,"run");
    if(!ev){
      alert("この日のラン＆ウォークイベントは登録されていません。");
      return;
    }
    if(ev.status==="cancelled"){
      alert("中止イベントには参加登録できません。");
      return;
    }
  }

  try{
    await setDoc(eventPath(currentType,selectedKey),{
      type:currentType,
      date:selectedKey,
      participants:arrayUnion(currentUser),
      updatedAt:serverTimestamp()
    },{merge:true});
  }catch(e){
    alert("参加登録に失敗しました。Firestoreのルールを確認してください。");
    console.error(e);
  }
}

async function cancelEvent(){
  if(isPastKey(selectedKey)){
    alert("過去の日付の参加取消はできません。");
    return;
  }
  if(!currentUser||!selectedKey)return;
  try{
    await updateDoc(eventPath(currentType,selectedKey),{
      participants:arrayRemove(currentUser),
      updatedAt:serverTimestamp()
    });
  }catch(e){
    alert("参加取消に失敗しました。");
    console.error(e);
  }
}

function openInviteAuthentication(member){
  pendingInviteMember=member;
  inviteAuthMemberName.textContent=member.name;
  inviteAuthCodeInput.value="";
  confirmInviteAuthButton.disabled=true;
  confirmInviteAuthButton.textContent="登録する";
  inviteAuthError.textContent="招待コードが違います。管理者から案内されたコードを確認してください。";
  hide(inviteAuthError);
  show(inviteAuthModal);
  setTimeout(()=>inviteAuthCodeInput.focus(),50);
}

function closeInviteAuthentication(){
  pendingInviteMember=null;
  inviteAuthCodeInput.value="";
  confirmInviteAuthButton.disabled=true;
  confirmInviteAuthButton.textContent="登録する";
  hide(inviteAuthError);
  hide(inviteAuthModal);
}

async function authenticateInvitedMember(){
  const member=pendingInviteMember;
  if(!member||!member.id)return;
  const entered=normalizeInviteCode(inviteAuthCodeInput.value);
  if(entered.length!==8)return;
  const expected=normalizeInviteCode(member.inviteCode);
  if(!entered||!expected||entered!==expected){
    show(inviteAuthError);
    inviteAuthCodeInput.select();
    return;
  }
  confirmInviteAuthButton.disabled=true;
  confirmInviteAuthButton.textContent="登録中...";
  try{
    await updateDoc(doc(db,"members",member.id),{
      inviteStatus:"registered",
      registeredAt:serverTimestamp(),
      lastActiveAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    currentUser=member.name;
    localStorage.setItem(storageUserKey,member.name);
    localStorage.setItem(storageMemberIdKey,member.id);
    lastActiveUpdatedMemberId=member.id;
    updateUser();
    closeInviteAuthentication();
    hide(setupModal);
    renderAll();
    alert(`🎉 登録が完了しました！\n\nSRCへようこそ、${member.name}さん！\n次回から招待コードの入力は不要です。`);
  }catch(e){
    console.error("invite authentication error",e);
    inviteAuthError.textContent="登録に失敗しました。通信状態を確認して、もう一度お試しください。";
    show(inviteAuthError);
  }finally{
    confirmInviteAuthButton.disabled=false;
    confirmInviteAuthButton.textContent="登録する";
  }
}

function updateUser(){
  currentUserLabel.textContent=currentUser||"未設定";
}
function renderNameButtons(){
  nameButtonGrid.innerHTML="";

  let records=memberRecords.filter(member=>member.active!==false);
  if(records.length===0){
    records=members.map((name,index)=>({name,order:index+1,admin:false,active:true}));
  }

  if(userSelectionMode==="public"){
    records=records.filter(member=>member.admin!==true);
  }

  records
    .sort((a,b)=>(a.order||999)-(b.order||999)||a.name.localeCompare(b.name,"ja"))
    .forEach(member=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="name-choice-button";
      b.textContent=`😊 ${member.name}`;
      b.onclick=()=>{
        if(member.inviteStatus==="pending"){
          openInviteAuthentication(member);
          return;
        }
        currentUser=member.name;
        localStorage.setItem(storageUserKey,member.name);
        if(member.id)localStorage.setItem(storageMemberIdKey,member.id);
        lastActiveUpdatedMemberId="";
        updateUser();
        updateCurrentUserLastActive();
        hide(setupModal);
        renderAll();
      };
      nameButtonGrid.appendChild(b);
    });
}
function startSetupAdminLongPress(){
  if(currentUser)return;
  clearTimeout(setupAdminLongPressTimer);
  setupAdminLongPressTimer=setTimeout(()=>{
    setupAdminUnlockPin.value="";
    hide(setupAdminUnlockError);
    show(setupAdminUnlockModal);
    setTimeout(()=>setupAdminUnlockPin.focus(),50);
  },2000);
}

function cancelSetupAdminLongPress(){
  clearTimeout(setupAdminLongPressTimer);
  setupAdminLongPressTimer=null;
}

function unlockAdminSelectionFromSetup(){
  const expectedPin=String(systemSettings.adminPin||"1979");
  if(setupAdminUnlockPin.value!==expectedPin){
    show(setupAdminUnlockError);
    setupAdminUnlockPin.select();
    return;
  }

  hide(setupAdminUnlockError);
  hide(setupAdminUnlockModal);
  userSelectionMode="admin";
  renderNameButtons();
  setupModalTitle.textContent="👤 管理者ユーザーを選択";
  setupModalText.textContent="管理者を含むユーザー一覧です。";
  closeSetupModalButton.classList.add("hidden");
}

function requireName(force=false){
  if(!currentUser)userSelectionMode="public";
  if(force||!currentUser){
    renderNameButtons();
    const isInitial=!currentUser;
    setupModalTitle.textContent=isInitial?"👤 お名前を選択":"👤 ユーザー変更";
    setupModalText.textContent=isInitial
      ?"初回だけ、自分の名前を選んでください。次回から自動で使用します。"
      :"変更するユーザーを選んでください。";
    closeSetupModalButton.classList.toggle("hidden",isInitial);
    positionMemberModalBelowHeader(setupModal);
    show(setupModal);
  }
}

function monthPrefixJST(offset=0){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Tokyo",
    year:"numeric",
    month:"2-digit"
  }).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const baseYear=Number(values.year);
  const baseMonth=Number(values.month)-1;
  const target=new Date(Date.UTC(baseYear,baseMonth+offset,1));
  return `${target.getUTCFullYear()}-${pad2(target.getUTCMonth()+1)}`;
}

function currentMonthPrefixJST(){return monthPrefixJST(0);}

function isCompletedAttendanceId(id,type,monthOffset=0){
  const prefix=`${type}_`;
  if(!id.startsWith(prefix))return false;
  const dateKey=id.slice(prefix.length);
  return dateKey.startsWith(`${monthPrefixJST(monthOffset)}-`)&&dateKey<todayKeyJST();
}

function monthlyAttendanceTotal(type){
  return Object.entries(attendance)
    .filter(([id])=>isCompletedAttendanceId(id,type))
    .reduce((sum,[,participants])=>sum+(Array.isArray(participants)?participants.length:0),0);
}

function memberMonthlyAttendance(name,type,monthOffset=0){
  return Object.entries(attendance)
    .filter(([id])=>isCompletedAttendanceId(id,type,monthOffset))
    .reduce((count,[,participants])=>{
      return count+(Array.isArray(participants)&&participants.includes(name)?1:0);
    },0);
}

function memberIsJoiningToday(name){
  const todayKey=todayKeyJST();
  return getNames("run",todayKey).includes(name)||getNames("gym",todayKey).includes(name);
}

let memberOverviewMonthOffset=0;

function renderMemberOverview(){
  if(!memberOverviewList)return;

  const activeMembers=memberRecords.length>0
    ? memberRecords.filter(member=>member.active!==false)
    : members.map((name,index)=>({name,order:index+1,active:true}));

  const sorted=[...activeMembers].sort((a,b)=>{
    const aTotal=memberMonthlyAttendance(a.name,"run",memberOverviewMonthOffset)+memberMonthlyAttendance(a.name,"gym",memberOverviewMonthOffset);
    const bTotal=memberMonthlyAttendance(b.name,"run",memberOverviewMonthOffset)+memberMonthlyAttendance(b.name,"gym",memberOverviewMonthOffset);
    return bTotal-aTotal||
      (a.order||999)-(b.order||999)||
      a.name.localeCompare(b.name,"ja");
  });

  const monthLabel=memberOverviewMonthOffset===-1?"先月":"今月";
  memberOverviewSummary.textContent=`${monthLabel}の参加回数順／登録メンバー ${sorted.length}名`;
  const totalLegend=document.getElementById("memberOverviewTotalLegend");
  if(totalLegend)totalLegend.textContent=`🔥 ${monthLabel}参加合計`;
  memberOverviewList.innerHTML="";

  sorted.forEach((member,index)=>{
    const name=member.name;
    const medal=index===0?"🥇 ":index===1?"🥈 ":index===2?"🥉 ":"";
    const runCount=memberMonthlyAttendance(name,"run",memberOverviewMonthOffset);
    const gymCount=memberMonthlyAttendance(name,"gym",memberOverviewMonthOffset);
    const total=runCount+gymCount;
    const joiningToday=memberIsJoiningToday(name);

    const row=document.createElement("div");
    row.className="member-overview-row";
    row.innerHTML=`
      <div class="member-today-status ${joiningToday?"joining":"not-joining"}" aria-label="${joiningToday?"今日参加予定":"今日参加予定なし"}">${joiningToday?"●":"○"}</div>
      <div class="member-overview-main">
        <div class="member-overview-name">${medal}${escapeHtml(name)}</div>
        <div class="member-overview-breakdown">
          <span>🏃 ${runCount}回</span>
          <span>🏋️ ${gymCount}回</span>
        </div>
      </div>
      <div class="member-overview-total">🔥 ${total}</div>
    `;
    memberOverviewList.appendChild(row);
  });
}

const dashboardAnimationState=new Map();

function animateDashboardNumber(element,target,suffix){
  if(!element)return;
  const endValue=Number(target)||0;
  const finalText=`${endValue}${suffix}`;

  if(endValue<=0){
    element.textContent=finalText;
    dashboardAnimationState.set(element.id,endValue);
    return;
  }

  if(dashboardAnimationState.get(element.id)===endValue){
    element.textContent=finalText;
    return;
  }

  const duration=1000;
  const startTime=performance.now();

  function update(now){
    const progress=Math.min((now-startTime)/duration,1);
    const eased=1-Math.pow(1-progress,3);
    element.textContent=`${Math.round(endValue*eased)}${suffix}`;

    if(progress<1){
      requestAnimationFrame(update);
    }else{
      element.textContent=finalText;
      dashboardAnimationState.set(element.id,endValue);
    }
  }

  requestAnimationFrame(update);
}

function renderDashboard(){
  if(!dashboardMemberCount)return;

  const activeMemberCount=memberRecords.length>0
    ? memberRecords.filter(m=>m.active!==false).length
    : members.length;

  const runCount=monthlyAttendanceTotal("run");
  const gymCount=monthlyAttendanceTotal("gym");

  animateDashboardNumber(dashboardMemberCount,activeMemberCount,"名");
  animateDashboardNumber(dashboardRunCount,runCount,"名");
  animateDashboardNumber(dashboardGymCount,gymCount,"名");

}

function setType(type){currentType=type;gymTab.classList.toggle("active",type==="gym");runTab.classList.toggle("active",type==="run");if(type==="gym"){eventTitle.textContent="ジムトレーニング";eventSummary.textContent="好きな日を選んで参加表明";eventPlace.textContent=systemSettings.gym.place;eventTime.textContent=`${systemSettings.gym.time}〜`;ruleTitle.textContent="開催条件";ruleValue.textContent=`${requiredMembers}名以上で開催／締切表示 ${systemSettings.gym.deadlineLabel}`}else{eventTitle.textContent="ラン＆ウォーク";eventSummary.textContent="イベント管理で登録された開催日を表示します。";eventPlace.textContent=systemSettings.run.place;eventTime.textContent=`${systemSettings.run.time}〜`;ruleTitle.textContent="開催状態";ruleValue.textContent="管理者がイベントごとに設定"}renderAll()}function renderAll(){renderCalendar();renderLegend();renderNextPlan();renderNextEventPublic();renderAnnouncementsPublic();renderMessageBoard();renderDashboard()}function renderLegend(){calendarLegend.innerHTML=currentType==="gym"?'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-one"></span>あと2</span><span><span class="dot dot-warning"></span>あと1</span><span><span class="dot dot-confirmed"></span>開催</span><span>⭐ 自分</span>':'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-confirmed"></span>開催予定</span><span><span class="dot dot-cancelled"></span>中止</span><span>⭐ 自分</span>'}


function eventsByDate(dateStr,type=currentType){
  return eventRecords
    .filter(ev=>ev.date===dateStr&&ev.type===type)
    .sort((a,b)=>(a.time||"").localeCompare(b.time||""));
}

function primaryEventForDate(dateStr,type=currentType){
  return eventsByDate(dateStr,type)[0]||null;
}

function populateMonthJumpYears(){
  const now=new Date();
  const startYear=Math.min(now.getFullYear()-1,currentYear-1);
  const endYear=Math.max(now.getFullYear()+5,currentYear+1);

  monthJumpYear.innerHTML="";
  for(let year=startYear;year<=endYear;year++){
    const option=document.createElement("option");
    option.value=String(year);
    option.textContent=`${year}年`;
    monthJumpYear.appendChild(option);
  }
}

function openMonthJump(){
  populateMonthJumpYears();
  monthJumpYear.value=String(currentYear);
  monthJumpMonth.value=String(currentMonth);
  show(monthJumpModal);
}

function moveToMonth(year,month){
  currentYear=year;
  currentMonth=month;
  renderAll();
  hide(monthJumpModal);
}

function renderCalendar(){
  calendarGrid.innerHTML="";
  calendarTitle.textContent=`${currentYear}年${currentMonth+1}月 ▼`;

  for(let i=0;i<blank(currentYear,currentMonth);i++){
    const empty=document.createElement("div");
    empty.className="day-cell empty";
    calendarGrid.appendChild(empty);
  }

  const days=new Date(currentYear,currentMonth+1,0).getDate();

  for(let d=1;d<=days;d++){
    const key=toKey(currentYear,currentMonth,d);
    const names=getNames(currentType,key);
    const count=names.length;
    const runEventsForDay=eventsByDate(key,"run");
    const runEvent=runEventsForDay[0]||null;

    const cell=document.createElement("button");
    cell.type="button";
    cell.className="day-cell";
    if(isPastKey(key))cell.classList.add("past-day");

    if(isToday(currentYear,currentMonth,d))cell.classList.add("today");
    if(currentUser&&names.includes(currentUser))cell.classList.add("me");

    let note="";
    let eventLabel="";

    if(currentType==="gym"){
      // Gym: any date can be selected. 3 participants confirms.
      if(count===1)cell.classList.add("one");
      if(count===2)cell.classList.add("warn");
      if(count>=requiredMembers)cell.classList.add("confirmed");

      note=count>=requiredMembers
        ? "開催"
        : count===2
          ? "あと1"
          : count===1
            ? "あと2"
            : "";

      cell.onclick=()=>openDetail(key);
    }else{
      // Run & Walk: only registered events can be selected.
      if(!runEvent){
        cell.classList.add("no-event","disabled");
        cell.disabled=true;
      }else{
        cell.classList.add("has-event","run-event");

        if(runEvent.status==="cancelled"){
          cell.classList.add("cancelled","cancelled-event");
          note="中止";
        }else{
          cell.classList.add("confirmed");
          note="開催";
        }

        eventLabel=`<span class="calendar-event-label">${escapeHtml(runEvent.title||eventTypeLabel(runEvent.type))}</span>`;
        cell.onclick=()=>showEventDetail(runEvent);
      }
    }

    const me=currentUser&&names.includes(currentUser)
      ? '<span class="my-day-star">⭐</span>'
      : "";
    cell.innerHTML=`<span class="day-number">${me}${d}</span><span class="day-note">${note}</span>${eventLabel}`;
    calendarGrid.appendChild(cell);
  }
}

function getUpcomingEvents(){
  const baseDate=new Date(today.getFullYear(),today.getMonth(),today.getDate());
  return eventRecords
    .filter(ev=>ev.date&&new Date(ev.date)>=baseDate)
    .sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.time||"").localeCompare(b.time||""));
}

function renderNextEventPublic(){
  if(!nextEventContent)return;
  const events=getUpcomingEvents();
  if(events.length===0){
    nextEventContent.className="dashboard-next-event-content empty";
    nextEventContent.textContent="なし";
    nextEventCard?.classList.add("is-empty");
    return;
  }
  const ev=events[0];
  const [,m,d]=ev.date.split("-").map(Number);
  const eventName=ev.title||ev.place||(ev.type==="gym"?"ジム":"ラン＆ウォーク");
  nextEventContent.className="dashboard-next-event-content";
  nextEventContent.innerHTML=`<span class="dashboard-next-date">${m}/${d}</span><span class="dashboard-next-name">${escapeHtml(eventName)}</span>`;
  nextEventCard?.classList.remove("is-empty");
}

function openNextEventInCalendar(){
  const events=getUpcomingEvents();
  if(events.length===0)return;
  const ev=events[0];
  currentType=ev.type==="gym"?"gym":"run";
  selectedKey=ev.date;
  const [year,month]=ev.date.split("-").map(Number);
  currentYear=year;
  currentMonth=month-1;
  setType(currentType);
  requestAnimationFrame(()=>{
    scrollToBelowHeader(document.querySelector(".calendar-card"),8);
  });
}

function renderNextPlan(){
  if(!currentUser){
    nextPlanContent.className="next-plan-empty";
    nextPlanContent.textContent="名前を選択すると表示されます。";
    return;
  }

  const todayKey=toKey(today.getFullYear(),today.getMonth(),today.getDate());
  const plans=[];

  Object.keys(attendance).forEach(id=>{
    const underscore=id.indexOf("_");
    if(underscore<0)return;

    const type=id.slice(0,underscore);
    const key=id.slice(underscore+1);
    const participants=attendance[id]||[];

    if(!participants.includes(currentUser)||key<todayKey)return;

    if(type==="gym"){
      plans.push({
        type,
        key,
        time:systemSettings.gym.time,
        place:systemSettings.gym.place
      });
      return;
    }

    const ev=primaryEventForDate(key,"run");
    if(ev){
      plans.push({
        type,
        key,
        time:ev.time||systemSettings.run.time,
        place:ev.place||systemSettings.run.place
      });
    }
  });

  plans.sort((a,b)=>a.key.localeCompare(b.key)||(a.time||"").localeCompare(b.time||""));

  if(plans.length===0){
    nextPlanContent.className="next-plan-empty";
    nextPlanContent.textContent="参加予定はまだありません。";
    return;
  }

  const p=plans[0];
  const label=p.type==="gym"?"🏋️ ジム":"🏃 ラン＆ウォーク";
  nextPlanContent.className="next-plan-item";
  nextPlanContent.innerHTML=`${label}<br>📅 ${fmt(p.key)}<br>🕖 ${p.time}<br>📍 ${escapeHtml(p.place)}`;
}

const SAME_DAY_STATUS_LABELS={
  late:"⏰ 遅れます",
  absent:"❌ 行けなくなりました",
  leaveEarly:"🏃 先に帰ります"
};

function getSameDayStatuses(type,key){
  return attendanceStatuses[eventId(type,key)]||{};
}

function openSameDayStatus(name){
  if(name!==currentUser)return;
  selectedSameDayUser=name;
  sameDayStatusUser.textContent=`${name}さんの当日連絡`;
  show(sameDayStatusModal);
}

async function saveSameDayStatus(status){
  if(!selectedKey||!currentType||!selectedSameDayUser)return;

  const id=eventId(currentType,selectedKey);
  const statuses={...getSameDayStatuses(currentType,selectedKey)};

  if(status)statuses[selectedSameDayUser]=status;
  else delete statuses[selectedSameDayUser];

  const payload={
    date:selectedKey,
    type:currentType,
    statuses,
    updatedAt:serverTimestamp()
  };

  if(status==="absent"){
    payload.participants=arrayRemove(selectedSameDayUser);
  }

  await setDoc(doc(db,"attendance",id),payload,{merge:true});
  hide(sameDayStatusModal);
}

function openDetail(key){selectedKey=key;hide(homeView);show(detailView);renderDetail();window.scrollTo({top:0,behavior:"smooth"})}function renderDetail(){
  const ev=currentType==="run"
    ? primaryEventForDate(selectedKey,"run")
    : null;

  const names=getNames(currentType,selectedKey);
  const statuses=getSameDayStatuses(currentType,selectedKey);
  const absentNames=Object.entries(statuses)
    .filter(([,status])=>status==="absent")
    .map(([name])=>name)
    .filter(name=>!names.includes(name));
  const displayNames=[...names,...absentNames];
  const count=names.length;
  const isPast=isPastKey(selectedKey);

  detailDate.textContent=fmt(selectedKey);
  detailEvent.textContent=currentType==="gym"
    ? "🏋️ ジムトレーニング"
    : "🏃 ラン＆ウォーク";

  detailTime.textContent=currentType==="gym"
    ? `${systemSettings.gym.time}〜`
    : (ev?.time ? `${ev.time}〜` : `${systemSettings.run.time}〜`);

  detailPlace.textContent=`📍 ${
    currentType==="gym"
      ? systemSettings.gym.place
      : (ev?.place||systemSettings.run.place)
  }`;

  participantTitle.textContent=`参加者（${count}名）`;
  participantList.innerHTML="";

  if(displayNames.length===0){
    const li=document.createElement("li");
    li.className="empty-message";
    li.textContent="まだ参加者はいません。";
    participantList.appendChild(li);
  }else{
    displayNames.forEach(name=>{
      const li=document.createElement("li");
      const isMe=name===currentUser;
      const status=statuses[name]||"";
      const icon=isMe?"⭐":"😊";

      li.innerHTML=`<span class="participant-name">${icon} ${escapeHtml(name)}</span>${status?`<span class="same-day-status-badge ${status}">${SAME_DAY_STATUS_LABELS[status]}</span>`:""}`;

      if(isMe){
        li.classList.add("me","same-day-status-clickable");
        li.setAttribute("role","button");
        li.setAttribute("tabindex","0");
        li.onclick=()=>openSameDayStatus(name);
        li.onkeydown=event=>{
          if(event.key==="Enter"||event.key===" "){
            event.preventDefault();
            openSameDayStatus(name);
          }
        };
      }

      participantList.appendChild(li);
    });
  }

  eventMessage.classList.add("hidden");
  progressBox.classList.remove("confirmed","cancelled");
  progressBar.style.display="block";

  if(currentType==="gym"){
    const remain=Math.max(requiredMembers-count,0);
    const rate=Math.min(count/requiredMembers,1)*100;
    progressFill.style.width=`${rate}%`;

    if(count>=requiredMembers){
      progressBox.classList.add("confirmed");
      progressText.textContent=`🟢 開催決定（${count}名参加）`;
    }else{
      progressText.textContent=`🟡 あと${remain}名で開催`;
    }

    if(isPast){
      eventMessage.textContent="過去の日付のため、参加・取消はできません。";
      eventMessage.classList.remove("hidden");
      joinButton.classList.add("hidden");
      cancelButton.classList.add("hidden");
      myStatus.textContent="";
      return;
    }

    eventMessage.textContent=`参加締切表示：${systemSettings.gym.deadlineLabel}（表示のみ）`;
    eventMessage.classList.remove("hidden");
    updateButtons();
    return;
  }

  if(!ev){
    progressBar.style.display="none";
    progressText.textContent="イベントは登録されていません。";
    joinButton.classList.add("hidden");
    cancelButton.classList.add("hidden");
    myStatus.textContent="";
    return;
  }

  if(ev.status==="cancelled"){
    progressBar.style.display="none";
    progressBox.classList.add("cancelled");
    progressText.textContent="🔴 中止";
    eventMessage.textContent=ev.memo||"";
    if(ev.memo)eventMessage.classList.remove("hidden");
  }else{
    progressFill.style.width="100%";
    progressBar.style.display="none";
    progressBox.classList.add("confirmed");
    progressText.textContent="🟢 開催予定";
    eventMessage.textContent=ev.memo||"";
    if(ev.memo)eventMessage.classList.remove("hidden");
  }

  if(isPast){
    eventMessage.textContent="過去のイベントのため、参加・取消はできません。";
    eventMessage.classList.remove("hidden");
    joinButton.classList.add("hidden");
    cancelButton.classList.add("hidden");
    myStatus.textContent="";
    return;
  }

  updateButtons();
}

function updateButtons(){const names=getNames(currentType,selectedKey),joined=currentUser&&names.includes(currentUser);myStatus.textContent=joined?`✅ ${currentUser}さんは参加予定です。`:`${currentUser||"未設定"}さんはまだ参加していません。`;joinButton.classList.toggle("hidden",joined);cancelButton.classList.toggle("hidden",!joined)}
joinButton.onclick=joinEvent;cancelButton.onclick=cancelEvent;backButton.onclick=()=>{hide(detailView);show(homeView);renderAll()};prevMonthButton.onclick=()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--}renderAll()};
nextMonthButton.onclick=()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++}renderAll()};
calendarTitle.onclick=openMonthJump;
closeMonthJumpButton.onclick=()=>hide(monthJumpModal);
cancelMonthJumpButton.onclick=()=>hide(monthJumpModal);
applyMonthJumpButton.onclick=()=>moveToMonth(Number(monthJumpYear.value),Number(monthJumpMonth.value));
monthJumpCurrentButton.onclick=()=>{
  const now=new Date();
  moveToMonth(now.getFullYear(),now.getMonth());
};helpButton.onclick=()=>show(helpModal);closeHelpButton.onclick=()=>hide(helpModal);
if(nextEventCard){
  nextEventCard.addEventListener("click",openNextEventInCalendar);
  nextEventCard.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){
      event.preventDefault();
      openNextEventInCalendar();
    }
  });
}
closeSameDayStatusButton.onclick=()=>hide(sameDayStatusModal);
document.querySelectorAll("#sameDayStatusModal [data-same-day-status]").forEach(button=>{
  button.onclick=()=>saveSameDayStatus(button.dataset.sameDayStatus||"");
});

currentUserLabel.onclick=()=>{
  if(currentUser)show(userChangeConfirmModal);
};
cancelUserChangeButton.onclick=()=>hide(userChangeConfirmModal);
confirmUserChangeButton.onclick=()=>{
  hide(userChangeConfirmModal);
  userSelectionMode="public";
  renderNameButtons();
  setupModalTitle.textContent="👤 ユーザー変更";
  setupModalText.textContent="変更するユーザーを選んでください。";
  closeSetupModalButton.classList.remove("hidden");
  positionMemberModalBelowHeader(setupModal);
  show(setupModal);
};

closeSetupModalButton.onclick=()=>{if(currentUser)hide(setupModal)};
closeInviteAuthButton.onclick=closeInviteAuthentication;
confirmInviteAuthButton.onclick=authenticateInvitedMember;
inviteAuthCodeInput.addEventListener("input",()=>{
  const compact=inviteAuthCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
  inviteAuthCodeInput.value=compact.length===8?`${compact.slice(0,4)}-${compact.slice(4)}`:compact;
  confirmInviteAuthButton.disabled=compact.length!==8;
  hide(inviteAuthError);
});
inviteAuthCodeInput.addEventListener("keydown",event=>{
  if(event.key==="Enter")authenticateInvitedMember();
});

setupModalTitle.addEventListener("pointerdown",event=>{
  if(event.pointerType==="mouse"&&event.button!==0)return;
  startSetupAdminLongPress();
});
["pointerup","pointercancel","pointerleave"].forEach(type=>{
  setupModalTitle.addEventListener(type,cancelSetupAdminLongPress);
});
setupModalTitle.addEventListener("contextmenu",event=>{
  if(!currentUser)event.preventDefault();
});

closeSetupAdminUnlockButton.onclick=()=>{
  cancelSetupAdminLongPress();
  hide(setupAdminUnlockModal);
};
applySetupAdminUnlockButton.onclick=unlockAdminSelectionFromSetup;
setupAdminUnlockPin.addEventListener("keydown",event=>{
  if(event.key==="Enter")unlockAdminSelectionFromSetup();
});
changeUserButton.style.display="none";changeUserButton.onclick=()=>{};gymTab.onclick=()=>setType("gym");
runTab.onclick=()=>setType("run");
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
  userSelectionMode="admin";
  renderNameButtons();
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
const newMemberInviteCodeInput=document.getElementById("newMemberInviteCodeInput");
const generateInviteCodeButton=document.getElementById("generateInviteCodeButton");
const addMemberButton=document.getElementById("addMemberButton");
const addMemberError=document.getElementById("addMemberError");
const systemSettingsModal=document.getElementById("systemSettingsModal");
const adminSystemSettingsButton=document.getElementById("adminSystemSettingsButton");
const closeSystemSettingsButton=document.getElementById("closeSystemSettingsButton");
const settingsRunTime=document.getElementById("settingsRunTime");
const settingsRunPlace=document.getElementById("settingsRunPlace");
const settingsGymTime=document.getElementById("settingsGymTime");
const settingsGymPlace=document.getElementById("settingsGymPlace");
const settingsGymMinParticipants=document.getElementById("settingsGymMinParticipants");
const settingsGymDeadline=document.getElementById("settingsGymDeadline");
const saveSystemSettingsButton=document.getElementById("saveSystemSettingsButton");
const systemSettingsError=document.getElementById("systemSettingsError");
const memberOverviewModal=document.getElementById("memberOverviewModal");
const closeMemberOverviewButton=document.getElementById("closeMemberOverviewButton");
const memberOverviewSummary=document.getElementById("memberOverviewSummary");
const memberOverviewList=document.getElementById("memberOverviewList");
const memberOverviewMonthSelect=document.getElementById("memberOverviewMonthSelect");
const dashboardMemberCount=document.getElementById("dashboardMemberCount");
const dashboardRunCount=document.getElementById("dashboardRunCount");
const dashboardGymCount=document.getElementById("dashboardGymCount");

const dashboardMembersButton=document.getElementById("dashboardMembersButton");
const dashboardRunButton=document.getElementById("dashboardRunButton");
const dashboardGymButton=document.getElementById("dashboardGymButton");

const announcementCard=document.getElementById("announcementCard");
const announcementList=document.getElementById("announcementList");
const announcementManageModal=document.getElementById("announcementManageModal");
const adminAnnouncementManageButton=document.getElementById("adminAnnouncementManageButton");
const closeAnnouncementManageButton=document.getElementById("closeAnnouncementManageButton");
const announcementTitleInput=document.getElementById("announcementTitleInput");
const announcementBodyInput=document.getElementById("announcementBodyInput");
const announcementEnabledInput=document.getElementById("announcementEnabledInput");
const addAnnouncementButton=document.getElementById("addAnnouncementButton");
const addAnnouncementError=document.getElementById("addAnnouncementError");
const announcementAdminList=document.getElementById("announcementAdminList");
const messageBoardModal=document.getElementById("messageBoardModal");
const openMessageBoardButton=document.getElementById("openMessageBoardButton");
const closeMessageBoardButton=document.getElementById("closeMessageBoardButton");
const postMessageBoardButton=document.getElementById("postMessageBoardButton");

// Ver.1.3.0g: bind message-board controls only after their DOM references are initialized.
if(openMessageBoardButton)openMessageBoardButton.onclick=()=>{renderMessageBoard();show(messageBoardModal);};
if(closeMessageBoardButton)closeMessageBoardButton.onclick=()=>hide(messageBoardModal);
if(postMessageBoardButton)postMessageBoardButton.onclick=postMessageBoard;
const eventDetailModal=document.getElementById("eventDetailModal");
const closeEventDetailButton=document.getElementById("closeEventDetailButton");
const eventDetailContent=document.getElementById("eventDetailContent");
const eventDetailJoinButton=document.getElementById("eventDetailJoinButton");
const eventManageModal=document.getElementById("eventManageModal");
const adminEventManageButton=document.getElementById("adminEventManageButton");
const closeEventManageButton=document.getElementById("closeEventManageButton");
const eventAdminList=document.getElementById("eventAdminList");
const pastEventsDetails=document.getElementById("pastEventsDetails");
const pastEventCount=document.getElementById("pastEventCount");
const pastEventAdminList=document.getElementById("pastEventAdminList");
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
        inviteCode:"",
        inviteStatus:"registered",
        registeredAt:serverTimestamp(),
        lastActiveAt:null,
        updatedAt:serverTimestamp()
      },{merge:true});
    }
    alert("初期メンバー登録が完了しました。");
  }catch(e){
    console.error(e);
    alert("初期メンバー登録に失敗しました。Firestoreルールを確認してください。");
  }
}






function applySystemSettingsToInputs(){
  if(!settingsRunTime)return;
  settingsRunTime.value=systemSettings.run.time;
  settingsRunPlace.value=systemSettings.run.place;
  settingsGymTime.value=systemSettings.gym.time;
  settingsGymPlace.value=systemSettings.gym.place;
  settingsGymMinParticipants.value=String(systemSettings.gym.minParticipants);
  settingsGymDeadline.value=systemSettings.gym.deadlineLabel;
}

async function saveSystemSettings(){
  const runTime=settingsRunTime.value||"19:00";
  const runPlace=settingsRunPlace.value.trim();
  const gymTime=settingsGymTime.value||"19:00";
  const gymPlace=settingsGymPlace.value.trim();
  const minParticipants=Number(settingsGymMinParticipants.value);
  const deadlineLabel=settingsGymDeadline.value.trim();

  if(!runPlace||!gymPlace||!Number.isInteger(minParticipants)||minParticipants<1||!deadlineLabel){
    systemSettingsError.classList.remove("hidden");
    return;
  }
  systemSettingsError.classList.add("hidden");

  try{
    await setDoc(doc(db,"settings","system"),{
      run:{time:runTime,place:runPlace},
      gym:{time:gymTime,place:gymPlace,minParticipants,deadlineLabel},
      updatedAt:serverTimestamp()
    },{merge:true});
    hide(systemSettingsModal);
    alert("システム設定を保存しました。");
  }catch(e){
    console.error(e);
    alert("システム設定の保存に失敗しました。Firestoreルールを確認してください。");
  }
}

function messageBoardDateValue(value){
  if(!value)return 0;
  if(typeof value.toDate==="function")return value.toDate().getTime();
  const date=new Date(value);
  return Number.isNaN(date.getTime())?0:date.getTime();
}
function activeMessageBoardRecords(){
  const now=Date.now();
  return messageBoardRecords.filter(item=>!item.expiresAt||messageBoardDateValue(item.expiresAt)>now);
}
function currentMemberRecord(){
  return memberRecords.find(member=>member.name===currentUser&&member.active!==false)||null;
}
function currentUserIsAdmin(){
  return currentMemberRecord()?.admin===true;
}
function formatMessageBoardDate(value){
  const time=messageBoardDateValue(value);
  if(!time)return "";
  const date=new Date(time);
  return `${date.getMonth()+1}/${date.getDate()}`;
}
function buildMessageBoardItem(item,allowDelete){
  const wrapper=document.createElement("article");
  wrapper.className="message-board-item";
  const head=document.createElement("div");
  head.className="message-board-item-head";
  const author=document.createElement("strong");
  author.textContent=item.authorName||"メンバー";
  const date=document.createElement("span");
  date.textContent=formatMessageBoardDate(item.createdAt);
  head.append(author,date);
  const body=document.createElement("div");
  body.className="message-board-item-body";
  body.textContent=item.text||"";
  wrapper.append(head,body);
  if(allowDelete){
    const button=document.createElement("button");
    button.type="button";
    button.className="message-board-delete-button";
    button.textContent="削除";
    button.onclick=()=>deleteMessageBoardPost(item);
    wrapper.appendChild(button);
  }
  return wrapper;
}
function renderMessageBoard(){
  const preview=document.getElementById("messageBoardPreview");
  const list=document.getElementById("messageBoardList");
  const active=activeMessageBoardRecords();
  if(preview){
    preview.innerHTML="";
    if(active.length===0){preview.className="message-board-empty";preview.textContent="伝言はまだありません。";}
    else{preview.className="message-board-preview";active.slice(0,3).forEach(item=>preview.appendChild(buildMessageBoardItem(item,false)));}
  }
  if(list){
    list.innerHTML="";
    if(active.length===0){const empty=document.createElement("div");empty.className="message-board-empty";empty.textContent="伝言はまだありません。";list.appendChild(empty);}
    else active.forEach(item=>{const canDelete=currentUserIsAdmin()||(item.authorName&&item.authorName===currentUser)||(item.authorId&&item.authorId===currentMemberRecord()?.id);list.appendChild(buildMessageBoardItem(item,canDelete));});
  }
}
async function postMessageBoard(){
  const input=document.getElementById("messageBoardTextInput");
  const expiry=document.getElementById("messageBoardExpirySelect");
  const error=document.getElementById("messageBoardError");
  const text=input?.value.trim()||"";
  const member=currentMemberRecord();
  if(!currentUser||!member||!text){error?.classList.remove("hidden");return;}
  error?.classList.add("hidden");
  const days=Number(expiry?.value)||7;
  const expiresAt=new Date(Date.now()+days*24*60*60*1000).toISOString();
  try{
    await setDoc(doc(db,"messageBoard",`message_${Date.now()}`),{text,authorName:currentUser,authorId:member.id||"",createdAt:serverTimestamp(),expiresAt});
    input.value="";
  }catch(e){console.error(e);alert("伝言の投稿に失敗しました。Firestoreルールを確認してください。");}
}
async function deleteMessageBoardPost(item){
  const allowed=currentUserIsAdmin()||(item.authorName&&item.authorName===currentUser)||(item.authorId&&item.authorId===currentMemberRecord()?.id);
  if(!allowed||!confirm("この伝言を削除しますか？"))return;
  try{await deleteDoc(doc(db,"messageBoard",item.id));}catch(e){console.error(e);alert("伝言の削除に失敗しました。");}
}

function formatAnnouncementDate(timestamp){
  if(!timestamp)return "";
  const date=timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if(Number.isNaN(date.getTime()))return "";
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0");
  return `${y}/${m}/${d}`;
}

function renderAnnouncementsPublic(){
  if(!announcementList)return;

  const active=announcementRecords.filter(a=>a.enabled);
  const heading=document.getElementById("announcementHeading");
  if(heading)heading.textContent=`📢 お知らせ（${active.length}件）`;

  if(active.length===0){
    announcementList.className="announcement-empty";
    announcementList.textContent="現在のお知らせはありません。";
    return;
  }

  announcementList.className="announcement-list";
  announcementList.innerHTML="";

  active.forEach(a=>{
    const item=document.createElement("div");
    item.className="announcement-item";

    const head=document.createElement("div");
    head.className="announcement-item-head";

    const title=document.createElement("div");
    title.className="announcement-item-title";
    title.textContent=a.title||"お知らせ";

    const date=document.createElement("div");
    date.className="announcement-item-date";
    date.textContent=formatAnnouncementDate(a.updatedAt||a.createdAt);

    const body=document.createElement("div");
    body.className="announcement-item-body";
    body.textContent=a.body||"";

    head.appendChild(title);
    if(date.textContent)head.appendChild(date);
    item.appendChild(head);
    if(a.body)item.appendChild(body);
    announcementList.appendChild(item);
  });
}

function renderAdminAnnouncements(){
  announcementAdminList.innerHTML="";
  if(announcementRecords.length===0){const div=document.createElement("div");div.className="announcement-admin-item";div.textContent="お知らせはまだ登録されていません。";announcementAdminList.appendChild(div);return;}
  announcementRecords.forEach(a=>{const div=document.createElement("div");div.className="announcement-admin-item";const title=document.createElement("div");title.className="event-admin-title";title.textContent=`${a.enabled?"🟢":"⚪"} ${a.title||"お知らせ"}`;const body=document.createElement("div");body.className="announcement-admin-sub";body.textContent=a.body||"";const actions=document.createElement("div");actions.className="announcement-admin-actions";const editBtn=document.createElement("button");editBtn.type="button";editBtn.className="event-small-button";editBtn.textContent="編集";const toggleBtn=document.createElement("button");toggleBtn.type="button";toggleBtn.className="event-small-button";toggleBtn.textContent=a.enabled?"非表示にする":"表示する";toggleBtn.onclick=()=>toggleAnnouncement(a.id,!a.enabled);const deleteBtn=document.createElement("button");deleteBtn.type="button";deleteBtn.className="event-small-button danger";deleteBtn.textContent="削除";deleteBtn.onclick=()=>deleteAnnouncement(a.id);const editBox=document.createElement("div");editBox.className="announcement-edit-box hidden";editBox.innerHTML=`<label class="admin-form-label">タイトル</label><input class="admin-input announcement-edit-title" type="text" value="${escapeHtml(a.title||"")}"><label class="admin-form-label">本文</label><textarea class="admin-input admin-textarea announcement-edit-body">${escapeHtml(a.body||"")}</textarea><label class="announcement-check-label"><input class="announcement-edit-enabled" type="checkbox" ${a.enabled?"checked":""}> 表示する</label><button class="event-small-button primary announcement-save-button" type="button">保存</button><button class="event-small-button announcement-cancel-button" type="button">キャンセル</button>`;editBox.querySelector(".announcement-save-button").onclick=()=>saveAnnouncementEdit(a.id,editBox);editBox.querySelector(".announcement-cancel-button").onclick=()=>editBox.classList.add("hidden");editBtn.onclick=()=>editBox.classList.toggle("hidden");actions.appendChild(editBtn);actions.appendChild(toggleBtn);actions.appendChild(deleteBtn);div.appendChild(title);if(a.body)div.appendChild(body);div.appendChild(actions);div.appendChild(editBox);announcementAdminList.appendChild(div);});
}

async function addAnnouncement(){const title=announcementTitleInput.value.trim();const body=announcementBodyInput.value.trim();if(!title&&!body){addAnnouncementError.classList.remove("hidden");return;}addAnnouncementError.classList.add("hidden");try{const id=`announcement_${Date.now()}`;await setDoc(doc(db,"announcements",id),{title:title||"お知らせ",body,enabled:announcementEnabledInput.checked,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});announcementTitleInput.value="";announcementBodyInput.value="";announcementEnabledInput.checked=true;alert("お知らせを追加しました。");}catch(e){console.error(e);alert("お知らせの追加に失敗しました。Firestoreルールを確認してください。");}}

async function saveAnnouncementEdit(id,editBox){const title=editBox.querySelector(".announcement-edit-title").value.trim();const body=editBox.querySelector(".announcement-edit-body").value.trim();const enabled=editBox.querySelector(".announcement-edit-enabled").checked;if(!title&&!body){alert("タイトルまたは本文を入力してください。");return;}try{await updateDoc(doc(db,"announcements",id),{title:title||"お知らせ",body,enabled,updatedAt:serverTimestamp()});alert("お知らせを保存しました。");}catch(e){console.error(e);alert("お知らせの保存に失敗しました。");}}

async function toggleAnnouncement(id,enabled){try{await updateDoc(doc(db,"announcements",id),{enabled,updatedAt:serverTimestamp()});}catch(e){console.error(e);alert("表示状態の変更に失敗しました。");}}

async function deleteAnnouncement(id){if(!confirm("このお知らせを削除します。よろしいですか？"))return;try{await deleteDoc(doc(db,"announcements",id));alert("お知らせを削除しました。");}catch(e){console.error(e);alert("お知らせの削除に失敗しました。");}}

function showEventDetail(ev){
  selectedEvent=ev;
  if(!eventDetailContent)return;

  const statusText=ev.status==="cancelled"?"中止":"開催予定";
  const statusIcon=ev.status==="cancelled"?"🔴":"🟢";
  const label=ev.type==="run"?"🏃 ラン＆ウォーク":"🏋️ ジム";

  eventDetailContent.innerHTML=`
    <div class="event-detail-card">
      <div class="event-detail-title">${statusIcon} ${label} ${statusText}</div>
      <div class="event-detail-sub">📅 ${fmt(ev.date)}<br>🕖 ${ev.time||"19:00"}<br>📍 ${ev.place||"-"}</div>
      ${ev.memo?`<div class="event-detail-memo">📝 ${ev.memo}</div>`:""}
    </div>
  `;
  show(eventDetailModal);
}

function openSelectedEventAttendance(){
  if(!selectedEvent)return;
  currentType=selectedEvent.type==="run"?"run":"gym";
  selectedKey=selectedEvent.date;

  const [y,m]=selectedEvent.date.split("-").map(Number);
  currentYear=y;
  currentMonth=m-1;

  hide(eventDetailModal);
  hide(homeView);
  show(detailView);
  setType(currentType);
  renderCalendar();
  renderDetail();
  window.scrollTo({top:0,behavior:"smooth"});
}

function eventTypeLabel(type){
  return type==="run"?"ラン＆ウォーク":"ジム";
}

function renderAdminEvents(){
  eventAdminList.innerHTML="";
  pastEventAdminList.innerHTML="";

  const todayKey=toKey(today.getFullYear(),today.getMonth(),today.getDate());
  const upcoming=eventRecords
    .filter(ev=>ev.date>=todayKey)
    .sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.time||"").localeCompare(b.time||""));
  const past=eventRecords
    .filter(ev=>ev.date<todayKey)
    .sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.time||"").localeCompare(a.time||""));

  pastEventCount.textContent=String(past.length);

  if(upcoming.length===0){
    const div=document.createElement("div");
    div.className="event-admin-item";
    div.textContent="今後のイベントは登録されていません。";
    eventAdminList.appendChild(div);
  }else{
    upcoming.forEach(ev=>eventAdminList.appendChild(createEventAdminItem(ev)));
  }

  if(past.length===0){
    const div=document.createElement("div");
    div.className="event-admin-item";
    div.textContent="終了したイベントはありません。";
    pastEventAdminList.appendChild(div);
  }else{
    past.forEach(ev=>pastEventAdminList.appendChild(createEventAdminItem(ev)));
  }
}

function createEventAdminItem(ev){
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
  sub.innerHTML=`${ev.time||"19:00"} / ${escapeHtml(ev.place||"-")}<br>${escapeHtml(ev.memo||"")}`;

  const actions=document.createElement("div");
  actions.className="event-admin-actions";

  const editBtn=document.createElement("button");
  editBtn.type="button";
  editBtn.className="event-small-button";
  editBtn.textContent="編集";

  const deleteBtn=document.createElement("button");
  deleteBtn.type="button";
  deleteBtn.className="event-small-button danger";
  deleteBtn.textContent="削除";
  deleteBtn.onclick=()=>deleteEvent(ev);

  const editBox=document.createElement("div");
  editBox.className="event-edit-box hidden";
  editBox.innerHTML=`
    <label class="admin-form-label">タイトル</label>
    <input class="admin-input event-edit-title" type="text" value="${escapeHtml(ev.title||eventTypeLabel(ev.type))}">
    <label class="admin-form-label">開始時刻</label>
    <input class="admin-input event-edit-time" type="time" value="${ev.time||"19:00"}">
    <label class="admin-form-label">場所</label>
    <input class="admin-input event-edit-place" type="text" value="${escapeHtml(ev.place||"")}">
    <label class="admin-form-label">状態</label>
    <select class="admin-input event-edit-status">
      <option value="scheduled" ${ev.status!=="cancelled"?"selected":""}>開催予定</option>
      <option value="cancelled" ${ev.status==="cancelled"?"selected":""}>中止</option>
    </select>
    <label class="admin-form-label">メモ</label>
    <textarea class="admin-input admin-textarea event-edit-memo">${escapeHtml(ev.memo||"")}</textarea>
    <button class="event-small-button primary event-save-button" type="button">保存</button>
    <button class="event-small-button event-cancel-button" type="button">キャンセル</button>`;

  editBox.querySelector(".event-save-button").onclick=()=>saveEventEdit(ev.id,editBox);
  editBox.querySelector(".event-cancel-button").onclick=()=>editBox.classList.add("hidden");
  editBtn.onclick=()=>editBox.classList.toggle("hidden");

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  div.appendChild(title);
  div.appendChild(sub);
  div.appendChild(actions);
  div.appendChild(editBox);
  return div;
}

function escapeHtml(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function saveEventEdit(eventId,editBox){
  if(!eventId)return;
  const title=editBox.querySelector(".event-edit-title").value.trim();
  const time=editBox.querySelector(".event-edit-time").value||"19:00";
  const place=editBox.querySelector(".event-edit-place").value.trim();
  const status=editBox.querySelector(".event-edit-status").value;
  const memo=editBox.querySelector(".event-edit-memo").value.trim();

  try{
    await updateDoc(doc(db,"events",eventId),{
      title,
      time,
      place,
      status,
      memo,
      updatedAt:serverTimestamp()
    });
    alert("イベントを保存しました。");
  }catch(e){
    console.error(e);
    alert("イベント保存に失敗しました。Firestoreルールを確認してください。");
  }
}

async function deleteEvent(ev){
  if(!ev||!ev.id)return;
  const hasParticipants=(attendance[eventId(ev.type,ev.date)]||[]).length>0;
  const message=hasParticipants?"このイベントを削除します。参加データも同時に削除されます。よろしいですか？":"このイベントを削除します。よろしいですか？";
  if(!confirm(message))return;
  try{
    const batch=writeBatch(db);
    batch.delete(doc(db,"events",ev.id));
    batch.delete(doc(db,"attendance",eventId(ev.type,ev.date)));
    await batch.commit();
    if(selectedEvent&&selectedEvent.id===ev.id){selectedEvent=null;hide(eventDetailModal)}
    alert("イベントと参加データを削除しました。");
  }catch(e){
    console.error(e);
    alert("イベント削除に失敗しました。Firestoreルールを確認してください。");
  }
}

function fillEventDefaults(){
  if(!eventTitleInput.value)eventTitleInput.value="ラン＆ウォーク";
  if(!eventPlaceInput.value)eventPlaceInput.value=systemSettings.run.place;
  if(!eventTimeInput.value)eventTimeInput.value=systemSettings.run.time;
}

async function addEvent(){
  const type="run";
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
      time:eventTimeInput.value||systemSettings.run.time,
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

function generateInviteCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values=new Uint32Array(8);
  if(window.crypto&&window.crypto.getRandomValues){
    window.crypto.getRandomValues(values);
  }else{
    for(let i=0;i<values.length;i++)values[i]=Math.floor(Math.random()*chars.length);
  }
  const raw=Array.from(values,v=>chars[v%chars.length]).join("");
  return `${raw.slice(0,4)}-${raw.slice(4)}`;
}

function normalizeInviteCode(value){
  return String(value||"").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,8);
}

function invitationStatusLabel(member){
  if(member.active===false||member.inviteStatus==="inactive")return "🔴 停止";
  if(member.inviteStatus==="pending")return "🟡 未登録";
  return "🟢 登録済み";
}

function appInviteUrl(){
  return `${window.location.origin}${window.location.pathname}`;
}

function buildInviteMessage(member){
  return `SRCアプリへようこそ！\n\n以下のURLからアクセスしてください。\n${appInviteUrl()}\n\n名前\n${member.name}\n\n招待コード\n${member.inviteCode}\n\n初回起動時に、名前と招待コードを入力してください。`;
}

async function copyText(text){
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(text);
    }else{
      const textarea=document.createElement("textarea");
      textarea.value=text;
      textarea.style.position="fixed";
      textarea.style.opacity="0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok=document.execCommand("copy");
      textarea.remove();
      if(!ok)throw new Error("copy failed");
    }
    return true;
  }catch(e){
    console.error("copy error",e);
    return false;
  }
}

async function copyInviteInformation(member){
  if(!member.inviteCode){
    alert("招待コードがありません。先に再発行してください。");
    return;
  }
  const copied=await copyText(buildInviteMessage(member));
  alert(copied?"招待情報をコピーしました。LINE・メール・SMSへ貼り付けて送信してください。":"コピーできませんでした。招待コードを長押ししてコピーしてください。");
}

async function reissueInviteCode(member){
  if(!member.id)return;
  if(!confirm(`${member.name}さんの招待コードを再発行します。以前のコードは使えなくなります。よろしいですか？`))return;
  const inviteCode=generateInviteCode();
  try{
    await updateDoc(doc(db,"members",member.id),{
      inviteCode,
      inviteStatus:"pending",
      registeredAt:null,
      updatedAt:serverTimestamp()
    });
    alert(`招待コードを再発行しました。\n${inviteCode}`);
  }catch(e){
    console.error(e);
    alert("招待コードの再発行に失敗しました。Firestoreルールを確認してください。");
  }
}

function renderAdminMembers(){
  memberAdminList.innerHTML="";
  const list=memberRecords.length>0?memberRecords:members.map((name,i)=>({name,admin:false,active:true,order:i+1}));
  if(list.length===0){
    const div=document.createElement("div");
    div.className="member-admin-item empty";
    div.textContent="メンバーが登録されていません。";
    memberAdminList.appendChild(div);
    return;
  }

  list.forEach((m,index)=>{
    const card=document.createElement("div");
    card.className="member-admin-item member-admin-compact-card";

    const summary=document.createElement("button");
    summary.type="button";
    summary.className="member-admin-summary";
    summary.setAttribute("aria-expanded","false");

    const summaryText=document.createElement("div");
    summaryText.className="member-admin-summary-text";

    const title=document.createElement("div");
    title.className="member-admin-main";
    title.textContent=`😊 ${m.name}`;

    const status=document.createElement("div");
    status.className="member-admin-summary-status";
    status.textContent=invitationStatusLabel(m);

    summaryText.appendChild(title);
    summaryText.appendChild(status);

    const chevron=document.createElement("span");
    chevron.className="member-admin-chevron";
    chevron.textContent="›";
    chevron.setAttribute("aria-hidden","true");

    summary.appendChild(summaryText);
    summary.appendChild(chevron);

    const detail=document.createElement("div");
    detail.className="member-admin-detail hidden";

    const meta=document.createElement("div");
    meta.className="member-admin-meta-grid";
    meta.innerHTML=`
      <div><span>区分</span><strong>${m.admin?"管理者":"一般"}</strong></div>
      <div><span>状態</span><strong>${m.active===false?"停止":"有効"}</strong></div>
      <div><span>表示順</span><strong>${m.order ?? "-"}</strong></div>
      <div><span>招待コード</span><strong class="member-code-value">${m.inviteCode?escapeHtml(m.inviteCode):"コードなし"}</strong></div>`;
    detail.appendChild(meta);

    const primaryActions=document.createElement("div");
    primaryActions.className="member-detail-actions member-detail-primary-actions";

    const copyInviteBtn=document.createElement("button");
    copyInviteBtn.type="button";
    copyInviteBtn.className="member-small-button invite-action-button";
    copyInviteBtn.textContent="招待情報をコピー";
    copyInviteBtn.disabled=!m.inviteCode;
    copyInviteBtn.onclick=()=>copyInviteInformation(m);

    const reissueBtn=document.createElement("button");
    reissueBtn.type="button";
    reissueBtn.className="member-small-button";
    reissueBtn.textContent=m.inviteCode?"コード再発行":"コード発行";
    reissueBtn.onclick=()=>reissueInviteCode(m);

    primaryActions.appendChild(copyInviteBtn);
    primaryActions.appendChild(reissueBtn);
    detail.appendChild(primaryActions);

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
    detail.appendChild(editBox);

    const secondaryActions=document.createElement("div");
    secondaryActions.className="member-detail-actions member-detail-secondary-actions";

    const editBtn=document.createElement("button");
    editBtn.type="button";
    editBtn.className="member-small-button";
    editBtn.textContent="名前・権限を編集";
    editBtn.onclick=()=>editBox.classList.toggle("hidden");

    const adminBtn=document.createElement("button");
    adminBtn.type="button";
    adminBtn.className=`member-toggle-button ${m.admin ? "on" : ""}`;
    adminBtn.textContent=m.admin ? "管理者ON" : "管理者OFF";
    adminBtn.onclick=()=>toggleMemberFlag(m.id,"admin",!m.admin);

    const activeBtn=document.createElement("button");
    activeBtn.type="button";
    activeBtn.className=`member-toggle-button ${m.active===false ? "off" : "on"}`;
    activeBtn.textContent=m.active===false ? "停止中" : "有効";
    activeBtn.onclick=()=>toggleMemberFlag(m.id,"active",m.active===false);

    const upBtn=document.createElement("button");
    upBtn.type="button";
    upBtn.className="member-small-button member-order-button";
    upBtn.textContent="↑ 上へ";
    upBtn.disabled=index===0;
    upBtn.onclick=()=>moveMember(m,index,-1);

    const downBtn=document.createElement("button");
    downBtn.type="button";
    downBtn.className="member-small-button member-order-button";
    downBtn.textContent="↓ 下へ";
    downBtn.disabled=index===list.length-1;
    downBtn.onclick=()=>moveMember(m,index,1);

    secondaryActions.appendChild(editBtn);
    secondaryActions.appendChild(adminBtn);
    secondaryActions.appendChild(activeBtn);
    secondaryActions.appendChild(upBtn);
    secondaryActions.appendChild(downBtn);
    detail.appendChild(secondaryActions);

    summary.onclick=()=>{
      const opening=detail.classList.contains("hidden");
      detail.classList.toggle("hidden",!opening);
      card.classList.toggle("open",opening);
      summary.setAttribute("aria-expanded",opening?"true":"false");
    };

    card.appendChild(summary);
    card.appendChild(detail);
    memberAdminList.appendChild(card);
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
  let inviteCode=normalizeInviteCode(newMemberInviteCodeInput.value);
  if(!inviteCode){
    inviteCode=generateInviteCode();
    newMemberInviteCodeInput.value=inviteCode;
  }
  while(memberRecords.some(member=>normalizeInviteCode(member.inviteCode)===inviteCode)){
    inviteCode=generateInviteCode();
    newMemberInviteCodeInput.value=inviteCode;
  }
  if(!name){
    addMemberError.classList.remove("hidden");
    return;
  }
  addMemberError.classList.add("hidden");
  if(memberRecords.some(member=>member.name===name)){
    alert("同じ名前のメンバーがすでに登録されています。");
    return;
  }
  const id=makeMemberId(name);
  const order=await getNextMemberOrder();
  try{
    await setDoc(doc(db,"members",id),{
      name,
      admin:newMemberAdminCheck.checked,
      active:true,
      order,
      inviteCode,
      inviteStatus:"pending",
      registeredAt:null,
      lastActiveAt:null,
      invitedAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    },{merge:true});
    const addedMember={id,name,inviteCode,inviteStatus:"pending",active:true};
    newMemberNameInput.value="";
    newMemberAdminCheck.checked=false;
    newMemberInviteCodeInput.value="";
    const copied=await copyText(buildInviteMessage(addedMember));
    alert(copied?`メンバーを追加し、招待情報をコピーしました。\n招待コード：${inviteCode}`:`メンバーを追加しました。\n招待コード：${inviteCode}`);
  }catch(e){
    console.error(e);
    alert("メンバー追加に失敗しました。Firestoreルールを確認してください。");
  }
}

adminMemberListButton.onclick=()=>{
  renderAdminMembers();
  positionMemberModalBelowHeader(adminMemberModal);
  show(adminMemberModal);
};
closeEventDetailButton.onclick=()=>hide(eventDetailModal);
eventDetailJoinButton.onclick=openSelectedEventAttendance;
adminSystemSettingsButton.onclick=()=>{
  applySystemSettingsToInputs();
  show(systemSettingsModal);
};
closeSystemSettingsButton.onclick=()=>hide(systemSettingsModal);
saveSystemSettingsButton.onclick=saveSystemSettings;
adminAnnouncementManageButton.onclick=()=>{renderAdminAnnouncements();show(announcementManageModal);};
closeAnnouncementManageButton.onclick=()=>hide(announcementManageModal);
addAnnouncementButton.onclick=addAnnouncement;
adminEventManageButton.onclick=()=>{
  // システム設定の最新値を、新規イベント入力欄へ毎回反映する
  eventTimeInput.value=systemSettings.run.time;
  eventPlaceInput.value=systemSettings.run.place;
  if(!eventTitleInput.value)eventTitleInput.value="ラン＆ウォーク";
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
if(generateInviteCodeButton)generateInviteCodeButton.onclick=()=>{newMemberInviteCodeInput.value=generateInviteCode();addMemberError.classList.add("hidden");};
newMemberNameInput.addEventListener("input",()=>{if(!newMemberInviteCodeInput.value)newMemberInviteCodeInput.value=generateInviteCode();});
addMemberButton.onclick=addMember;





// Ver.0.9.0l fixed-header scroll helper
function positionMemberModalBelowHeader(modal){
  if(!modal)return;
  const header=document.querySelector(".app-header.app-header-image");
  const headerHeight=header?Math.ceil(header.getBoundingClientRect().height):0;
  modal.style.setProperty("--member-modal-top",`${headerHeight+12}px`);
  modal.style.setProperty("--member-modal-bottom","16px");
}

function scrollToBelowHeader(element,extraGap=8){
  if(!element)return;

  const header=document.querySelector(".app-header.app-header-image");
  const headerHeight=header?header.getBoundingClientRect().height:0;
  const elementTop=element.getBoundingClientRect().top+window.scrollY;
  const destination=Math.max(elementTop-headerHeight-extraGap,0);

  window.scrollTo({
    top:destination,
    behavior:"smooth"
  });
}

closeMemberOverviewButton.addEventListener("click",()=>hide(memberOverviewModal));
memberOverviewMonthSelect?.addEventListener("change",()=>{
  memberOverviewMonthOffset=Number(memberOverviewMonthSelect.value)===-1?-1:0;
  renderMemberOverview();
});

// Ver.0.9.0l Dashboard card handlers
dashboardMembersButton.addEventListener("click",()=>{
  renderMemberOverview();
  positionMemberModalBelowHeader(memberOverviewModal);
  show(memberOverviewModal);
});

dashboardRunButton.addEventListener("click",()=>{
  setType("run");
  requestAnimationFrame(()=>{
    scrollToBelowHeader(document.querySelector(".event-switch-card"),8);
  });
});

dashboardGymButton.addEventListener("click",()=>{
  setType("gym");
  requestAnimationFrame(()=>{
    scrollToBelowHeader(document.querySelector(".event-switch-card"),8);
  });
});



window.addEventListener("resize",()=>{
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))positionMemberModalBelowHeader(memberOverviewModal);
  if(adminMemberModal&&!adminMemberModal.classList.contains("hidden"))positionMemberModalBelowHeader(adminMemberModal);
});

renderNameButtons();updateUser();renderAll();requireName(false)});

/* SRC Portal Ver.1.3.0g - basic-operation multilingual display
   Detects the browser/device language: ja / ko / zh; all others use English.
   Only fixed user-facing labels are translated. Firestore content and admin screens remain unchanged. */
(() => {
  "use strict";

  const rawLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  const normalized = rawLanguage.toLowerCase();
  const language = normalized.startsWith("ja") ? "ja" : normalized.startsWith("ko") ? "ko" : normalized.startsWith("zh") ? "zh" : "en";
  document.documentElement.lang = language === "zh" ? "zh-CN" : language;

  const messages = {
    ja: {
      help:"ヘルプ", currentUser:"現在のユーザー", unset:"未設定", change:"変更",
      members:"登録メンバー", monthlyRun:"今月ラン参加", monthlyGym:"今月ジム参加", announcements:"お知らせ",
      noAnnouncements:"現在のお知らせはありません。", nextPlan:"あなたの次回参加予定", noNextPlan:"参加予定はまだありません。",
      nextEvent:"次回イベント", noNextEvent:"今後のイベントは登録されていません。", openEvent:"このイベントを開く",
      runWalk:"ラン＆ウォーク", gym:"ジム", calendarBack:"カレンダーへ戻る",
      runSummary:"イベント管理で登録された開催日を表示します。", gymSummary:"好きな日を選んで参加表明",
      runRuleTitle:"開催状態", runRuleValue:"管理者がイベントごとに設定", gymRuleTitle:"開催条件",
      participants:"参加者", notJoined:"まだ参加していません。", join:"参加する", cancelJoin:"参加取消",
      chooseUser:"ユーザー変更", chooseName:"自分の名前を選んでください。", confirmUserChange:"現在のユーザーを変更しますか？",
      cancel:"キャンセル", changeUser:"変更する", close:"閉じる",
      inviteCheck:"招待コード確認", inviteCode:"招待コード", invitePrompt:"さんの招待コードを入力してください。",
      inviteHelp:"8文字入力すると「-」は自動で入ります。", inviteError:"招待コードが違います。管理者から案内されたコードを確認してください。",
      register:"登録する", inviteNote:"招待コードは管理者から届いたものを入力してください。登録後は次回から入力不要です。",
      statusToday:"当日の状況", late:"遅れます", absent:"行けなくなりました", leaveEarly:"先に帰ります", clearStatus:"連絡を取り消す",
      selectMonth:"表示する年月", currentMonth:"今月へ戻る", previousMonth:"先月", attendanceCount:"参加回数", show:"表示する",
      today:"今日", mine:"自分", held:"開催", cancelled:"中止", scheduled:"開催予定",
      noParticipants:"まだ参加者はいません。", pastNoJoin:"過去の日付には参加登録できません。",
      pastEventReadOnly:"過去のイベントのため、参加・取消はできません。", cancelledNoJoin:"中止イベントには参加登録できません。",
      joined:"参加予定です。", notJoinedPerson:"まだ参加していません。", people:"名", times:"回",
      weekdays:["月","火","水","木","金","土","日"]
    },
    en: {
      help:"Help", currentUser:"Current user", unset:"Not selected", change:"Change",
      members:"Members", monthlyRun:"Run this month", monthlyGym:"Gym this month", announcements:"Announcements",
      noAnnouncements:"There are no announcements.", nextPlan:"Your next plan", noNextPlan:"You have no upcoming plans.",
      nextEvent:"Next event", noNextEvent:"There are no upcoming events.", openEvent:"Open this event",
      runWalk:"Run & Walk", gym:"Gym", calendarBack:"Back to calendar",
      runSummary:"Shows dates registered in Event Management.", gymSummary:"Choose any date to join.",
      runRuleTitle:"Event status", runRuleValue:"Set for each event by the administrator", gymRuleTitle:"Event conditions",
      participants:"Participants", notJoined:"You are not joining yet.", join:"Join", cancelJoin:"Cancel participation",
      chooseUser:"Select user", chooseName:"Select your name.", confirmUserChange:"Change the current user?",
      cancel:"Cancel", changeUser:"Change", close:"Close",
      inviteCheck:"Verify invitation code", inviteCode:"Invitation code", invitePrompt:" — enter the invitation code.",
      inviteHelp:"The hyphen is inserted automatically after 8 characters.", inviteError:"The invitation code is incorrect. Check the code from the administrator.",
      register:"Register", inviteNote:"Enter the code sent by the administrator. You will not need it again after registration.",
      statusToday:"Today's status", late:"I will be late", absent:"I cannot attend", leaveEarly:"I will leave early", clearStatus:"Clear status",
      selectMonth:"Select month", currentMonth:"Back to this month", previousMonth:"Previous month", attendanceCount:"Attendance count", show:"Show",
      today:"Today", mine:"Me", held:"Open", cancelled:"Cancelled", scheduled:"Scheduled",
      noParticipants:"No participants yet.", pastNoJoin:"You cannot join a past date.",
      pastEventReadOnly:"This event is in the past. Participation cannot be changed.", cancelledNoJoin:"You cannot join a cancelled event.",
      joined:"is participating.", notJoinedPerson:"is not participating yet.", people:"", times:"times",
      weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    },
    ko: {
      help:"도움말", currentUser:"현재 사용자", unset:"미설정", change:"변경",
      members:"등록 멤버", monthlyRun:"이번 달 러닝", monthlyGym:"이번 달 체육관", announcements:"공지사항",
      noAnnouncements:"현재 공지사항이 없습니다.", nextPlan:"다음 참가 예정", noNextPlan:"참가 예정이 없습니다.",
      nextEvent:"다음 이벤트", noNextEvent:"예정된 이벤트가 없습니다.", openEvent:"이 이벤트 열기",
      runWalk:"러닝 & 워킹", gym:"체육관", calendarBack:"달력으로 돌아가기",
      runSummary:"이벤트 관리에 등록된 개최일을 표시합니다.", gymSummary:"원하는 날짜를 선택해 참가 의사를 표시합니다.",
      runRuleTitle:"개최 상태", runRuleValue:"관리자가 이벤트별로 설정", gymRuleTitle:"개최 조건",
      participants:"참가자", notJoined:"아직 참가하지 않았습니다.", join:"참가하기", cancelJoin:"참가 취소",
      chooseUser:"사용자 선택", chooseName:"본인의 이름을 선택하세요.", confirmUserChange:"현재 사용자를 변경하시겠습니까?",
      cancel:"취소", changeUser:"변경", close:"닫기",
      inviteCheck:"초대 코드 확인", inviteCode:"초대 코드", invitePrompt:" 님의 초대 코드를 입력하세요.",
      inviteHelp:"8자를 입력하면 하이픈이 자동으로 삽입됩니다.", inviteError:"초대 코드가 올바르지 않습니다. 관리자에게 받은 코드를 확인하세요.",
      register:"등록", inviteNote:"관리자에게 받은 코드를 입력하세요. 등록 후에는 다시 입력할 필요가 없습니다.",
      statusToday:"당일 상황", late:"늦습니다", absent:"참석할 수 없습니다", leaveEarly:"먼저 가겠습니다", clearStatus:"연락 취소",
      selectMonth:"표시할 연월", currentMonth:"이번 달로 돌아가기", previousMonth:"지난달", attendanceCount:"참가 횟수", show:"표시",
      today:"오늘", mine:"나", held:"개최", cancelled:"취소", scheduled:"개최 예정",
      noParticipants:"아직 참가자가 없습니다.", pastNoJoin:"지난 날짜에는 참가 등록을 할 수 없습니다.",
      pastEventReadOnly:"지난 이벤트이므로 참가 상태를 변경할 수 없습니다.", cancelledNoJoin:"취소된 이벤트에는 참가할 수 없습니다.",
      joined:" 님은 참가 예정입니다.", notJoinedPerson:" 님은 아직 참가하지 않았습니다.", people:"명", times:"회",
      weekdays:["월","화","수","목","금","토","일"]
    },
    zh: {
      help:"帮助", currentUser:"当前用户", unset:"未设置", change:"更改",
      members:"注册成员", monthlyRun:"本月跑步", monthlyGym:"本月健身", announcements:"通知",
      noAnnouncements:"目前没有通知。", nextPlan:"您的下次参加计划", noNextPlan:"目前没有参加计划。",
      nextEvent:"下次活动", noNextEvent:"目前没有即将举行的活动。", openEvent:"打开此活动",
      runWalk:"跑步与健走", gym:"健身房", calendarBack:"返回日历",
      runSummary:"显示在活动管理中登记的举办日期。", gymSummary:"选择任意日期报名参加。",
      runRuleTitle:"活动状态", runRuleValue:"由管理员按活动设置", gymRuleTitle:"举办条件",
      participants:"参加者", notJoined:"您尚未参加。", join:"参加", cancelJoin:"取消参加",
      chooseUser:"选择用户", chooseName:"请选择您的姓名。", confirmUserChange:"要更改当前用户吗？",
      cancel:"取消", changeUser:"更改", close:"关闭",
      inviteCheck:"确认邀请码", inviteCode:"邀请码", invitePrompt:"的请输入邀请码。",
      inviteHelp:"输入8个字符后会自动插入连字符。", inviteError:"邀请码不正确。请确认管理员提供的代码。",
      register:"注册", inviteNote:"请输入管理员发送的邀请码。注册后下次无需再次输入。",
      statusToday:"当天状态", late:"会迟到", absent:"无法参加", leaveEarly:"会提前离开", clearStatus:"取消状态通知",
      selectMonth:"选择年月", currentMonth:"返回本月", previousMonth:"上个月", attendanceCount:"参加次数", show:"显示",
      today:"今天", mine:"自己", held:"举行", cancelled:"取消", scheduled:"计划举行",
      noParticipants:"目前没有参加者。", pastNoJoin:"过去的日期不能报名参加。",
      pastEventReadOnly:"该活动已结束，不能更改参加状态。", cancelledNoJoin:"不能参加已取消的活动。",
      joined:"已计划参加。", notJoinedPerson:"尚未参加。", people:"人", times:"次",
      weekdays:["一","二","三","四","五","六","日"]
    }
  };

  const m = messages[language];
  window.SRC_I18N = { language, t: key => m[key] ?? messages.ja[key] ?? key };

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  };
  const setAttr = (selector, name, value) => {
    const el = document.querySelector(selector);
    if (el && value != null) el.setAttribute(name, value);
  };

  function applyStaticTranslations() {
    if (language === "ja") return;
    setText("#helpButton", `❓ ${m.help}`);
    setText(".user-card .small-label", m.currentUser);
    setText("#currentUserLabel", m.unset);
    setText("#changeUserButton", m.change);
    const dashboardLabels = document.querySelectorAll("#dashboardCard .dashboard-label");
    [m.members,m.monthlyRun,m.monthlyGym,m.nextEvent].forEach((text,i)=>{ if(dashboardLabels[i]) dashboardLabels[i].textContent=text; });
    setText("#announcementCard .section-label", `📢 ${m.announcements}`);
    setText("#announcementList", m.noAnnouncements);
    setText(".next-card .section-label", `✨ ${m.nextPlan}`);
    setText("#nextPlanContent", m.noNextPlan);
    setText("#runTab", `🏃 ${m.runWalk}`);
    setText("#gymTab", `🏋️ ${m.gym}`);
    setText("#eventTitle", m.runWalk);
    setText("#eventSummary", m.runSummary);
    setText("#ruleTitle", m.runRuleTitle);
    setText("#ruleValue", m.runRuleValue);
    setText("#backButton", `← ${m.calendarBack}`);
    setText("#participantTitle", `${m.participants}（0${m.people}）`);
    setText("#myStatus", m.notJoined);
    setText("#joinButton", m.join);
    setText("#cancelButton", m.cancelJoin);
    setText("#setupModalTitle", `👤 ${m.chooseUser}`);
    setText("#setupModalText", m.chooseName);
    setText("#userChangeConfirmModal h2", m.confirmUserChange);
    setText("#cancelUserChangeButton", m.cancel);
    setText("#confirmUserChangeButton", m.changeUser);
    setText("#inviteAuthModal h2", `🔐 ${m.inviteCheck}`);
    setText("#inviteAuthModal label[for='inviteAuthCodeInput']", m.inviteCode);
    setText("#inviteAuthCodeHelp", m.inviteHelp);
    setText("#inviteAuthError", m.inviteError);
    setText("#confirmInviteAuthButton", m.register);
    setText("#inviteAuthModal .settings-note", m.inviteNote);
    setText("#sameDayStatusModal h2", m.statusToday);
    const statusButtons = document.querySelectorAll("#sameDayStatusModal [data-same-day-status]");
    const statusTexts = [`⏰ ${m.late}`,`❌ ${m.absent}`,`🏃 ${m.leaveEarly}`,m.clearStatus];
    statusButtons.forEach((button,i)=>{ if(statusTexts[i]) button.textContent=statusTexts[i]; });
    setText("#memberOverviewModal .member-overview-controls label", m.attendanceCount);
    const monthSelect=document.getElementById("memberOverviewMonthSelect");
    if(monthSelect){
      const options=monthSelect.options;
      if(options[0])options[0].textContent=m.currentMonth.replace(/へ戻る$|로 돌아가기$|返回$/u,"");
      if(options[1])options[1].textContent=m.previousMonth;
    }
    setText("#monthJumpModal h2", m.selectMonth);
    setText("#monthJumpCurrentButton", m.currentMonth);
    setText("#cancelMonthJumpButton", m.cancel);
    setText("#applyMonthJumpButton", m.show);
    document.querySelectorAll(".weekday-row span").forEach((el,i)=>{ el.textContent=m.weekdays[i] || el.textContent; });
    setAttr("#calendarTitle","aria-label",m.selectMonth);
    document.querySelectorAll("#setupModal button[aria-label='閉じる'], #inviteAuthModal button[aria-label='閉じる'], #sameDayStatusModal button[aria-label='閉じる'], #monthJumpModal button[aria-label='閉じる']")
      .forEach(el=>el.setAttribute("aria-label",m.close));
  }

  function translateDynamicElement(el) {
    if (language === "ja" || !(el instanceof Element)) return;
    if (el.closest("#adminPinModal,#adminMenuModal,#adminMemberModal,#announcementManageModal,#eventManageModal,#systemSettingsModal,#invitePreviewModal,#helpModal")) return;
    const text = el.textContent.trim();
    if (!text) return;

    if (el.id === "announcementList" && text === "現在のお知らせはありません。") el.textContent=m.noAnnouncements;
    else if (el.id === "memberOverviewSummary") {
      const hit=text.match(/(今月|先月)の参加回数順／登録メンバー (\d+)名/);
      if(hit){
        const label=hit[1]==="先月"?m.previousMonth:m.currentMonth.replace(/へ戻る$|로 돌아가기$|返回$/u,"");
        el.textContent=`${label} / ${m.members} ${hit[2]}`;
      }
    } else if (el.id === "memberOverviewTotalLegend") {
      const label=text.includes("先月")?m.previousMonth:m.currentMonth.replace(/へ戻る$|로 돌아가기$|返回$/u,"");
      el.textContent=`🔥 ${label}`;
    }
    else if (el.id === "nextPlanContent" && text === "参加予定はまだありません。") el.textContent=m.noNextPlan;
    else if (el.id === "eventTitle") {
      if(text === "ラン＆ウォーク") el.textContent=m.runWalk;
      else if(text === "ジムトレーニング") el.textContent=m.gym;
    } else if (el.id === "eventSummary") {
      if(text === "イベント管理で登録された開催日を表示します。") el.textContent=m.runSummary;
      else if(text === "好きな日を選んで参加表明") el.textContent=m.gymSummary;
    } else if (el.id === "ruleTitle") {
      if(text === "開催状態") el.textContent=m.runRuleTitle;
      else if(text === "開催条件") el.textContent=m.gymRuleTitle;
    } else if (el.id === "ruleValue" && text === "管理者がイベントごとに設定") el.textContent=m.runRuleValue;
    else if (el.id === "nextEventContent" && (text === "今後のイベントは登録されていません。" || text === "登録されたイベントはまだありません。")) el.textContent=m.noNextEvent;
    else if (el.id === "participantTitle") {
      const hit=text.match(/参加者（(\d+)名）/); if(hit) el.textContent=`${m.participants}（${hit[1]}${m.people}）`;
    } else if (el.id === "myStatus") {
      if(text === "まだ参加していません。") el.textContent=m.notJoined;
      else if(/さんは参加予定です。$/.test(text)) el.textContent=text.replace(/さんは参加予定です。$/, language==="ko"?m.joined:` ${m.joined}`);
      else if(/さんはまだ参加していません。$/.test(text)) el.textContent=text.replace(/さんはまだ参加していません。$/, language==="ko"?m.notJoinedPerson:` ${m.notJoinedPerson}`);
      else if(text === "過去のイベントのため、参加・取消はできません。" || text === "過去の日付のため、参加・取消はできません。") el.textContent=m.pastEventReadOnly;
      else if(text === "中止イベントには参加登録できません。") el.textContent=m.cancelledNoJoin;
    } else if (el.id === "joinButton" && text === "参加する") el.textContent=m.join;
    else if (el.id === "cancelButton" && text === "参加取消") el.textContent=m.cancelJoin;
    else if (el.id === "setupModalTitle" && text.includes("ユーザー変更")) el.textContent=`👤 ${m.chooseUser}`;
    else if (el.id === "setupModalText" && (text.includes("自分の名前を選んでください") || text.includes("変更するユーザーを選んでください") || text.includes("初回だけ、自分の名前を選んでください"))) el.textContent=m.chooseName;
    else if (el.id === "inviteAuthError" && text.startsWith("招待コードが違います")) el.textContent=m.inviteError;
    else if (el.classList.contains("empty-message") && text === "まだ参加者はいません。") el.textContent=m.noParticipants;
    else if (el.classList.contains("day-note")) {
      if(text === "今日") el.textContent=m.today;
      else if(text === "自分") el.textContent=m.mine;
      else if(text === "開催") el.textContent=m.held;
      else if(text === "中止") el.textContent=m.cancelled;
      else if(text === "開催予定") el.textContent=m.scheduled;
    } else if (el.id === "calendarLegend") {
      el.querySelectorAll("span").forEach(span=>{
        const t=span.textContent.trim();
        if(t.includes("今日")) span.lastChild.textContent=` ${m.today}`;
        else if(t.includes("自分")) span.lastChild.textContent=` ${m.mine}`;
        else if(t.includes("開催予定")) span.lastChild.textContent=` ${m.scheduled}`;
        else if(t.includes("開催")) span.lastChild.textContent=` ${m.held}`;
        else if(t.includes("中止")) span.lastChild.textContent=` ${m.cancelled}`;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStaticTranslations();
    document.querySelectorAll("#homeView,#detailView,#setupModal,#inviteAuthModal,#userChangeConfirmModal,#sameDayStatusModal,#monthJumpModal").forEach(translateDynamicElement);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.target.nodeType === Node.TEXT_NODE) translateDynamicElement(record.target.parentElement);
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateDynamicElement(node);
            node.querySelectorAll?.("*").forEach(translateDynamicElement);
          } else if (node.nodeType === Node.TEXT_NODE) translateDynamicElement(node.parentElement);
        });
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  });
})();
