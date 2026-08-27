import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDocs, getDoc, getDocsFromServer, getDocFromServer, deleteDoc, writeBatch, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyAd4Uv89V4hZQyjYaR7MfalE8Oyp8ioAbc",authDomain:"src-portal-a2c98.firebaseapp.com",projectId:"src-portal-a2c98",storageBucket:"src-portal-a2c98.firebasestorage.app",messagingSenderId:"817996931127",appId:"1:817996931127:web:80ae813bf8803ddf2a1fb2"};

document.addEventListener("DOMContentLoaded",async()=>{
const splashScreen=document.getElementById("startupSplash");
let splashFinished=false;
const pendingDashboardAnimations=new Map();

function flushPendingDashboardAnimations(){
  if(!pendingDashboardAnimations.size)return;
  const pending=[...pendingDashboardAnimations.entries()];
  pendingDashboardAnimations.clear();
  pending.forEach(([element,{target,suffix}])=>animateDashboardNumber(element,target,suffix));
}

function finishStartupSplash(){
  if(splashFinished)return;
  splashFinished=true;
  document.body.classList.remove("splash-active");
  splashScreen?.remove();
  flushPendingDashboardAnimations();
}


window.setTimeout(()=>{
  if(!splashScreen){finishStartupSplash();return;}
  splashScreen.classList.add("is-hiding");
  window.setTimeout(finishStartupSplash,420);
},2400);

const $=id=>document.getElementById(id);const calendarTitle=$("calendarTitle"),calendarGrid=$("calendarGrid"),prevMonthButton=$("prevMonthButton"),nextMonthButton=$("nextMonthButton"),helpButton=$("helpButton"),helpModal=$("helpModal"),closeHelpButton=$("closeHelpButton"),setupModal=$("setupModal"),setupModalTitle=$("setupModalTitle"),setupModalText=$("setupModalText"),closeSetupModalButton=$("closeSetupModalButton"),nameButtonGrid=$("nameButtonGrid"),changeUserButton=$("changeUserButton"),currentUserLabel=$("currentUserLabel"),currentUserMeta=$("currentUserMeta"),currentUserSrcMember=$("currentUserSrcMember"),currentUserKyroSeparator=$("currentUserKyroSeparator"),currentUserKyroBadge=$("currentUserKyroBadge"),currentUserNickname=$("currentUserNickname"),homeView=$("homeView"),detailView=$("detailView"),backButton=$("backButton"),detailDate=$("detailDate"),detailEvent=$("detailEvent"),detailTime=$("detailTime"),detailPlace=$("detailPlace"),participantTitle=$("participantTitle"),participantList=$("participantList"),progressText=$("progressText"),progressFill=$("progressFill"),progressBox=$("progressBox"),progressBar=$("progressBar"),eventMessage=$("eventMessage"),joinButton=$("joinButton"),cancelButton=$("cancelButton"),myStatus=$("myStatus"),gymTab=$("gymTab"),runTab=$("runTab"),eventTitle=$("eventTitle"),eventSummary=$("eventSummary"),eventPlace=$("eventPlace"),eventTime=$("eventTime"),ruleTitle=$("ruleTitle"),ruleValue=$("ruleValue"),calendarLegend=$("calendarLegend"),nextPlanContent=$("nextPlanContent"),gymQuestCard=$("gymQuestCard"),gymQuestHeading=$("gymQuestHeading"),gymQuestContent=$("gymQuestContent"),gymQuestActionButton=$("gymQuestActionButton"),gymQuestModal=$("gymQuestModal"),closeGymQuestModalButton=$("closeGymQuestModalButton"),gymQuestModalLead=$("gymQuestModalLead"),gymQuestOptionList=$("gymQuestOptionList"),confirmGymQuestButton=$("confirmGymQuestButton"),reminderCard=$("reminderCard"),reminderContent=$("reminderContent"),nextEventContent=$("nextEventContent"),nextEventCard=$("nextEventCard"),connectionCard=$("connectionCard"),connectionStatus=$("connectionStatus"),
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
const app=initializeApp(firebaseConfig);const auth=getAuth(app);try{await auth.authStateReady();if(!auth.currentUser){await signInAnonymously(auth);}}catch(error){console.error("Firebase anonymous authentication failed",error);alert("Firebaseへの認証に失敗しました。\n"+(error?.code||"")+"\n"+(error?.message||String(error)));return;}const db=getFirestore(app);
const portalLastUpdated=$("portalLastUpdated"),refreshPortalTopButton=$("refreshPortalTopButton");
const portalSnapshotSources=new Set();
const portalSnapshotSourceCount=8;
function portalUpdateTimeText(date=new Date()){
  const parts=new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(date);
  const value=type=>parts.find(part=>part.type===type)?.value||"";
  return `${value("year")}/${value("month")}/${value("day")} ${value("hour")}:${value("minute")}`;
}
function setPortalLastUpdatedNow(){
  if(portalLastUpdated)portalLastUpdated.textContent=`🕒 ${uiT("lastUpdated","最終更新")} ${portalUpdateTimeText()}`;
}
function markPortalSnapshotReceived(source){
  portalSnapshotSources.add(source);
  if(portalSnapshotSources.size>=portalSnapshotSourceCount)setPortalLastUpdatedNow();
}
async function refreshPortalDataFromServer(){
  // Ver.1.9.0zxa: メニューの「最新版に更新」から、サーバー最新値を画面用データへ直接反映する。
  // 保存・認証・現在ユーザー(localStorage)には触れない。
  const [systemSnap,kyroSnap,attendanceSnap,membersSnap,announcementsSnap,messageBoardSnap,recommendationsSnap,eventsSnap]=await Promise.all([
    getDocFromServer(doc(db,"settings","system")),
    getDocFromServer(doc(db,"settings","kyro")),
    getDocsFromServer(collection(db,"attendance")),
    getDocsFromServer(collection(db,"members")),
    getDocsFromServer(collection(db,"announcements")),
    getDocsFromServer(collection(db,"messageBoard")),
    getDocsFromServer(collection(db,"recommendations")),
    getDocsFromServer(collection(db,"events"))
  ]);

  const systemData=systemSnap.exists()?systemSnap.data():{};
  systemSettings={
    run:{
      time:systemData.run?.time||defaultSystemSettings.run.time,
      place:systemData.run?.place||defaultSystemSettings.run.place,
      mapUrl:systemData.run?.mapUrl||defaultSystemSettings.run.mapUrl
    },
    gym:{
      time:systemData.gym?.time||defaultSystemSettings.gym.time,
      place:systemData.gym?.place||defaultSystemSettings.gym.place,
      minParticipants:Number(systemData.gym?.minParticipants)||defaultSystemSettings.gym.minParticipants,
      mapUrl:systemData.gym?.mapUrl||defaultSystemSettings.gym.mapUrl,
      calendarUrl:systemData.gym?.calendarUrl||defaultSystemSettings.gym.calendarUrl
    },
    features:{
      seasonActivityVisibility:systemData.features?.seasonActivityVisibility==="public"?"public":"admin"
    }
  };
  requiredMembers=systemSettings.gym.minParticipants;
  applySystemSettingsToInputs();

  const kyroData=kyroSnap.exists()?kyroSnap.data():{};
  kyroInfo={
    area:kyroData.area||"",
    japanRank:kyroData.japanRank||"",
    aichiRank:kyroData.aichiRank||"",
    previousArea:kyroData.previousArea||"",
    previousJapanRank:kyroData.previousJapanRank||"",
    previousAichiRank:kyroData.previousAichiRank||"",
    news:kyroData.news||"",
    goal:kyroData.goal||"",
    updatedAt:kyroData.updatedAt||null
  };

  attendance={};
  attendanceStatuses={};
  attendanceQuestSelections={};
  attendancePointRecords={};
  attendanceSnap.forEach(d=>{
    const data=d.data();
    attendance[d.id]=data.participants||[];
    attendanceStatuses[d.id]=data.statuses||{};
    attendanceQuestSelections[d.id]=data.questSelections||{};
    attendancePointRecords[d.id]=data.pointRecords||{};
  });

  const loadedMembers=[];
  membersSnap.forEach(d=>{
    const data=d.data();
    if(data.name){
      loadedMembers.push({
        id:d.id,
        name:data.name,
        admin:data.admin===true,
        kyroMember:data.kyroMember===true,
        kyroUserName:data.kyroUserName||data.kyroName||"",
        kyroDistanceKm:Number.isFinite(Number(data.kyroDistanceKm))?Number(data.kyroDistanceKm):null,
        kyroDistanceRank:Number.isFinite(Number(data.kyroDistanceRank))?Number(data.kyroDistanceRank):null,
        kyroDataDate:data.kyroDataDate||"",
        kyroDataUpdatedAt:data.kyroDataUpdatedAt||null,
        kyroPreviousDistanceKm:Number.isFinite(Number(data.kyroPreviousDistanceKm))?Number(data.kyroPreviousDistanceKm):null,
        kyroPreviousDistanceRank:Number.isFinite(Number(data.kyroPreviousDistanceRank))?Number(data.kyroPreviousDistanceRank):null,
        kyroPreviousDataDate:data.kyroPreviousDataDate||"",
        active:data.active!==false,
        order:data.order??999,
        inviteCode:data.inviteCode||"",
        inviteStatus:data.inviteStatus||"registered",
        registeredAt:data.registeredAt||null,
        lastActiveAt:data.lastActiveAt||null,
        profile:{
          nickname:data.profile?.nickname||"",
          introduction:data.profile?.introduction||"",
          department:data.profile?.department||"",
          hobbies:data.profile?.hobbies||"",
          runningHistory:data.profile?.runningHistory||"",
          bestTime:data.profile?.bestTime||"",
          goal:data.profile?.goal||""
        },
        profileUpdatedAt:data.profileUpdatedAt||null,
        hasExistingProfile:Object.values(data.profile||{}).some(value=>String(value||"").trim()),
        profileUpdatedAtMissing:!("profileUpdatedAt" in data)||!data.profileUpdatedAt,
        inviteCodeMissing:!("inviteCode" in data),
        inviteStatusMissing:!("inviteStatus" in data),
        registeredAtMissing:!("registeredAt" in data),
        lastActiveAtMissing:!("lastActiveAt" in data),
        needsInvitationMigration:!("inviteCode" in data)||!("inviteStatus" in data)||!("registeredAt" in data)||!("lastActiveAt" in data)
      });
    }
  });
  memberRecords=loadedMembers.sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,"ja"));
  const activeMembers=memberRecords.filter(m=>m.active!==false);
  if(activeMembers.length>0)members=activeMembers.map(m=>m.name);

  const loadedAnnouncements=[];
  announcementsSnap.forEach(d=>{
    const data=d.data();
    loadedAnnouncements.push({id:d.id,title:data.title||"",body:data.body||"",enabled:data.enabled!==false,createdAt:data.createdAt||null,updatedAt:data.updatedAt||null});
  });
  announcementRecords=loadedAnnouncements.sort((a,b)=>{
    const ta=a.updatedAt?.seconds||a.createdAt?.seconds||0;
    const tb=b.updatedAt?.seconds||b.createdAt?.seconds||0;
    return tb-ta;
  });

  const loadedMessages=[];
  messageBoardSnap.forEach(d=>loadedMessages.push({id:d.id,...d.data()}));
  messageBoardRecords=loadedMessages.sort((a,b)=>messageBoardDateValue(b.createdAt)-messageBoardDateValue(a.createdAt));

  recommendationRecords=recommendationsSnap.docs.map(item=>{
    const data=item.data()||{};
    return {id:item.id,...data,likes:Array.isArray(data.likes)?data.likes:[]};
  });

  const loadedEvents=[];
  eventsSnap.forEach(d=>{
    const data=d.data();
    loadedEvents.push({
      id:d.id,
      type:data.type||"",
      date:data.date||"",
      title:data.title||"",
      time:data.time||"19:00",
      place:data.place||"",
      status:data.status||"scheduled",
      memo:data.memo||"",
      trainingResults:Array.isArray(data.trainingResults)?data.trainingResults.filter(v=>typeof v==="string"):[]
    });
  });
  eventRecords=loadedEvents.sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.type||"").localeCompare(b.type||""));

  setOnline("🟢 Firebase 接続中");
  renderNameButtons();
  setType(currentType);
  renderAll();
  renderKyroPublic();
  renderAnnouncementsPublic();
  renderMessageBoard();
  if(typeof renderRecommendations==="function"&&recommendationsModal&&!recommendationsModal.classList.contains("hidden"))renderRecommendations();
  if(typeof renderRecommendationPreview==="function")renderRecommendationPreview();
  if(selectedKey)renderDetail();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(adminMemberModal&&!adminMemberModal.classList.contains("hidden"))renderAdminMembers();
  if(announcementManageModal&&!announcementManageModal.classList.contains("hidden"))renderAdminAnnouncements();
  if(eventManageModal&&!eventManageModal.classList.contains("hidden"))renderAdminEvents();
  setPortalLastUpdatedNow();
}

let today=new Date();let currentYear=today.getFullYear(),currentMonth=today.getMonth(),selectedKey=null,currentType="run";const defaultMembers=["堀部","日高","北辻","朱","近藤(夕)","ZHU Jie","竹村","岩下","野々村","藤吉","池田","伊東(大)","酒井(琴)","滝"];
let members=[...defaultMembers];
let memberRecords=[];
let eventRecords=[];
let announcementRecords=[];
let messageBoardRecords=[];
let kyroInfo={area:"",japanRank:"",aichiRank:"",previousArea:"",previousJapanRank:"",previousAichiRank:"",news:"",goal:"",updatedAt:null};
let recommendationRecords=[];
let recommendationSort="newest";
let recommendationCategory="all";
let editingRecommendationId=null;
let nextPlanTarget=null;
function uiT(key,fallback){return window.SRC_I18N?.t?.(key) ?? fallback;}
let selectedEvent=null;
const defaultSystemSettings={
  run:{time:"19:00",place:"落合公園",mapUrl:"https://www.google.com/maps?q=35.2705363,136.9915385"},
  gym:{time:"19:00",place:"サンフロッグ春日井",minParticipants:3,mapUrl:"https://maps.app.goo.gl/1eCRggPsgc3Z2HMKA",calendarUrl:"https://www.spofure-kasugai.or.jp/sports/pool/calendar/"},
  features:{seasonActivityVisibility:"admin"}
};
let systemSettings=JSON.parse(JSON.stringify(defaultSystemSettings));
let requiredMembers=systemSettings.gym.minParticipants;
const storageUserKey="srcPortalCurrentUser";
const storageMemberIdKey="srcPortalCurrentMemberId";
let userSelectionMode="public";
let returnToAdminMenuAfterSetup=false;
let pendingInviteMember=null;
let setupAdminLongPressTimer=null;
let currentUser=localStorage.getItem(storageUserKey)||"",attendance={},attendanceStatuses={},attendanceQuestSelections={},attendancePointRecords={},selectedSameDayUser="",gymQuestTargetKey="",gymQuestSelectedId="";
let memberInvitationMigrationStarted=false;
let memberProfileDateMigrationStarted=false;
let lastActiveUpdatedMemberId="";
function setOnline(t){connectionCard.classList.remove("offline");connectionCard.classList.add("online");connectionStatus.textContent=t}function setOffline(t){connectionCard.classList.remove("online");connectionCard.classList.add("offline");connectionStatus.textContent=t}function pad2(n){return String(n).padStart(2,"0")}function toKey(y,m,d){return `${y}-${pad2(m+1)}-${pad2(d)}`}function fmt(key){const [y,m,d]=key.split("-").map(Number);const dt=new Date(y,m-1,d);return `${m}月${d}日（${["日","月","火","水","木","金","土"][dt.getDay()]}）`}function blank(y,m){return(new Date(y,m,1).getDay()+6)%7}function show(e){
  if(e&&[
    "adminPinModal",
    "adminMenuModal",
    "adminMemberModal",
    "announcementManageModal",
    "announcementPublicModal",
    "messageBoardModal",
    "eventManageModal",
    "systemSettingsModal",
    "invitePreviewModal",
    "setupModal",
    "helpModal",
    "monthJumpModal",
    "setupAdminUnlockModal",
    "inviteAuthModal",
    "memberProfileModal",
    "memberProfileEditModal",
    "mainMenuModal",
    "recommendationsModal",
    "kyroPageModal",
    "adminKyroModal",
    "adminKyroImportModal",
    "seasonActivityModal",
    "fitnessPointModal",
    "fitnessPointRecordModal",
    "kyroDistanceListModal"
  ].includes(e.id)){
    positionMemberModalBelowHeader(e);
  }
  e.classList.remove("hidden");
}function hide(e){e.classList.add("hidden")}
let appToastTimer=null;
function showAppToast(message){
  const toast=document.getElementById("appToast");
  if(!toast)return;
  clearTimeout(appToastTimer);
  toast.innerHTML=message;
  toast.classList.remove("hidden","show");
  requestAnimationFrame(()=>toast.classList.add("show"));
  appToastTimer=setTimeout(()=>{
    toast.classList.remove("show");
    setTimeout(()=>toast.classList.add("hidden"),180);
  },2600);
}function eventId(type,key){return `${type}_${key}`}function eventPath(type,key){return doc(db,"attendance",eventId(type,key))}function getNames(type,key){return attendance[eventId(type,key)]||[]}function isToday(y,m,d){return today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d}
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

let lastKnownTodayKey=todayKeyJST();
function refreshAfterAppResume(){
  const currentTodayKey=todayKeyJST();
  if(currentTodayKey===lastKnownTodayKey)return;

  lastKnownTodayKey=currentTodayKey;
  today=new Date();
  renderAll();
  if(selectedKey)renderDetail();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(eventManageModal&&!eventManageModal.classList.contains("hidden"))renderAdminEvents();
}

document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")refreshAfterAppResume();
});
window.addEventListener("pageshow",refreshAfterAppResume);
window.addEventListener("focus",refreshAfterAppResume);

async function grantLegacyGymAttendancePoints20260806(){
  if(!isCurrentAdmin()){
    alert("管理者ユーザーで実行してください。");
    return;
  }

  const key="2026-08-06";
  const id=eventId("gym",key);

  try{
    // 8/6の実データをサーバーから直接確認してから付与する。
    const serverSnap=await getDocFromServer(eventPath("gym",key));
    if(!serverSnap.exists()){
      alert("8/6のフィットネス参加データが見つかりません。");
      return;
    }

    const data=serverSnap.data()||{};
    const names=Array.isArray(data.participants)?data.participants:[];
    const existing=data.pointRecords||{};

    if(!names.length){
      alert("8/6の参加者が0名のため、POINTは付与しません。");
      return;
    }

    const additions={};
    names.forEach(name=>{
      if(existing[name])return;
      additions[name]={
        date:key,
        attendance:1,
        cardio:0,
        stretch:0,
        machines:0,
        questId:"",
        questClear:false,
        questPoint:0,
        total:1,
        test:false,
        legacyGrant:true,
        updatedAt:new Date().toISOString()
      };
    });

    const targets=Object.keys(additions);

    if(!targets.length){
      attendancePointRecords[id]=existing;
      try{renderFitnessPointSummary();}catch(e){console.error(e);}
      alert("8/6参加者の来館1ptはすでに登録済みです。");
      return;
    }

    if(!confirm(
      `8/6フィットネス参加者 ${targets.length}名に来館1ptを付与します。\n`+
      `${targets.join("、")}\n\nよろしいですか？`
    ))return;

    await setDoc(
      eventPath("gym",key),
      {
        pointRecords:{
          ...existing,
          ...additions
        },
        updatedAt:serverTimestamp()
      },
      {merge:true}
    );

    // サーバー保存後、同じドキュメントを再取得して確定内容を画面へ反映。
    const confirmedSnap=await getDocFromServer(eventPath("gym",key));
    const confirmed=confirmedSnap.exists()?confirmedSnap.data()||{}:{};
    attendancePointRecords[id]=confirmed.pointRecords||{};

    try{renderFitnessPointSummary();}catch(e){console.error(e);}

    alert(
      `8/6参加者 ${targets.length}名に来館1ptを登録しました。\n`+
      `${targets.join("、")}`
    );
  }catch(error){
    console.error("legacy gym point grant error",error);
    alert("8/6の来館POINT登録に失敗しました。通信状態を確認してください。");
  }
}

const grantLegacyGymPointsButton=document.getElementById("grantLegacyGymPointsButton");
if(grantLegacyGymPointsButton){
  grantLegacyGymPointsButton.onclick=grantLegacyGymAttendancePoints20260806;
}

function renderFitnessPointHomeSummary(){
  const totalEl=document.getElementById("fitnessPointTopTotal");
  const rankEl=document.getElementById("fitnessPointTopRank");
  if(!totalEl||!rankEl)return;

  if(!currentUser){
    totalEl.textContent="--pt";
    rankEl.textContent="--位";
    return;
  }

  const todayKey=todayKeyJST();
  const [year,month]=todayKey.split("-").map(Number);
  const seasonStart=month>=4&&month<=9
    ? `${year}-04-01`
    : `${month>=10?year:year-1}-10-01`;
  const seasonEnd=month>=4&&month<=9
    ? `${year}-09-30`
    : `${month>=10?year+1:year}-03-31`;

  const totals=new Map();

  Object.entries(attendancePointRecords||{}).forEach(([id,records])=>{
    if(!id.startsWith("gym_"))return;
    const date=id.slice(4);
    if(date<seasonStart||date>seasonEnd)return;

    const participants=Array.isArray(attendance[id])?attendance[id]:[];

    Object.entries(records||{}).forEach(([name,record])=>{
      if(!record||record.test===true)return;
      if(!participants.includes(name))return;
      totals.set(name,(totals.get(name)||0)+Math.max(0,Number(record.total)||0));
    });
  });

  const ranking=[...totals.entries()]
    .map(([name,total])=>({name,total}))
    .sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,"ja"));

  let previousScore=null;
  let previousRank=0;
  ranking.forEach((row,index)=>{
    if(previousScore===null||row.total!==previousScore){
      previousScore=row.total;
      previousRank=index+1;
    }
    row.rank=previousRank;
  });

  const me=ranking.find(row=>row.name===currentUser)||null;
  totalEl.textContent=`${me?.total||0}pt`;
  rankEl.textContent=me?`${me.rank}位`:"--位";
}

async function migrateExistingMemberInvitationFields(records){
  if(memberInvitationMigrationStarted)return;
  const targets=records.filter(record=>record.needsInvitationMigration);
  if(targets.length===0){
    memberInvitationMigrationStarted=true;
    return;
  }
  memberInvitationMigrationStarted=true;
  try{
    // 旧ベータ版メンバーの不足フィールドは、必ず最新のFirestore状態を確認して補完する。
    // コード発行と同時に動いても、発行済みinviteCode/inviteStatusを上書きしない。
    for(const record of targets){
      await runTransaction(db,async transaction=>{
        const ref=doc(db,"members",record.id);
        const snap=await transaction.get(ref);
        if(!snap.exists())return;
        const data=snap.data()||{};
        const fields={};

        // inviteCodeは未設定のままでも正常。コード発行時に初めて保存する。
        if(!("inviteStatus" in data))fields.inviteStatus="registered";
        if(!("registeredAt" in data))fields.registeredAt=serverTimestamp();
        if(!("lastActiveAt" in data))fields.lastActiveAt=null;

        if(Object.keys(fields).length>0){
          fields.updatedAt=serverTimestamp();
          transaction.set(ref,fields,{merge:true});
        }
      });
    }
  }catch(e){
    memberInvitationMigrationStarted=false;
    console.error("member invitation migration error",e);
  }
}


async function migrateExistingMemberProfileDates(records){
  if(memberProfileDateMigrationStarted)return;
  const targets=records.filter(record=>record.hasExistingProfile&&record.profileUpdatedAtMissing);
  if(targets.length===0){
    memberProfileDateMigrationStarted=true;
    return;
  }
  memberProfileDateMigrationStarted=true;
  try{
    const batch=writeBatch(db);
    const initialProfileDate=new Date("2026-07-25T12:00:00+09:00");
    targets.forEach(record=>{
      batch.set(doc(db,"members",record.id),{profileUpdatedAt:initialProfileDate},{merge:true});
    });
    await batch.commit();
  }catch(e){
    memberProfileDateMigrationStarted=false;
    console.error("member profile date migration error",e);
  }
}

async function updateCurrentUserLastActive(){
  if(!currentUser)return;
  const record=memberRecords.find(member=>member.name===currentUser&&member.active!==false);
  if(!record||!record.id||lastActiveUpdatedMemberId===record.id)return;
  lastActiveUpdatedMemberId=record.id;
  try{
    await updateDoc(doc(db,"members",record.id),{
      lastActiveAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
  }catch(e){
    lastActiveUpdatedMemberId="";
    console.error("lastActiveAt update error",e);
  }
}

onSnapshot(doc(db,"settings","system"),snap=>{
  markPortalSnapshotReceived("system");
  const data=snap.exists()?snap.data():{};
  systemSettings={
    run:{
      time:data.run?.time||defaultSystemSettings.run.time,
      place:data.run?.place||defaultSystemSettings.run.place,
      mapUrl:data.run?.mapUrl||defaultSystemSettings.run.mapUrl
    },
    gym:{
      time:data.gym?.time||defaultSystemSettings.gym.time,
      place:data.gym?.place||defaultSystemSettings.gym.place,
      minParticipants:Number(data.gym?.minParticipants)||defaultSystemSettings.gym.minParticipants,
      mapUrl:data.gym?.mapUrl||defaultSystemSettings.gym.mapUrl,
      calendarUrl:data.gym?.calendarUrl||defaultSystemSettings.gym.calendarUrl
    },
    features:{
      seasonActivityVisibility:data.features?.seasonActivityVisibility==="public"?"public":"admin"
    }
  };
  requiredMembers=systemSettings.gym.minParticipants;
  applySystemSettingsToInputs();
  setType(currentType);
  if(selectedKey)renderDetail();
},err=>{
  console.error("settings read error",err);
});

onSnapshot(doc(db,"settings","kyro"),snap=>{
  markPortalSnapshotReceived("kyro");
  const data=snap.exists()?snap.data():{};
  kyroInfo={
    area:data.area||"",
    japanRank:data.japanRank||"",
    aichiRank:data.aichiRank||"",
    previousArea:data.previousArea||"",
    previousJapanRank:data.previousJapanRank||"",
    previousAichiRank:data.previousAichiRank||"",
    news:data.news||"",
    goal:data.goal||"",
    updatedAt:data.updatedAt||null
  };
  renderKyroPublic();
},err=>console.error("KYRO settings read error",err));

onSnapshot(collection(db,"attendance"),snap=>{
  markPortalSnapshotReceived("attendance");
  attendance={};
  attendanceStatuses={};
  attendanceQuestSelections={};
  attendancePointRecords={};
  snap.forEach(d=>{
    const data=d.data();
    attendance[d.id]=data.participants||[];
    attendanceStatuses[d.id]=data.statuses||{};
    attendanceQuestSelections[d.id]=data.questSelections||{};
    attendancePointRecords[d.id]=data.pointRecords||{};
  });
  setOnline("🟢 Firebase 接続中");
  renderAll();
  // POINTデータ取得完了時はホーム表示だけを安全に更新する。
  renderFitnessPointHomeSummary();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(selectedKey)renderDetail();
},err=>{console.error(err);setOffline("🔴 Firebase 接続エラー")});
onSnapshot(collection(db,"members"),snap=>{
  markPortalSnapshotReceived("members");
  const loaded=[];
  snap.forEach(d=>{
    const data=d.data();
    if(data.name){
      loaded.push({
        id:d.id,
        name:data.name,
        admin:data.admin===true,
        kyroMember:data.kyroMember===true,
        kyroUserName:data.kyroUserName||data.kyroName||"",
        kyroDistanceKm:Number.isFinite(Number(data.kyroDistanceKm))?Number(data.kyroDistanceKm):null,
        kyroDistanceRank:Number.isFinite(Number(data.kyroDistanceRank))?Number(data.kyroDistanceRank):null,
        kyroDataDate:data.kyroDataDate||"",
        kyroDataUpdatedAt:data.kyroDataUpdatedAt||null,
        kyroPreviousDistanceKm:Number.isFinite(Number(data.kyroPreviousDistanceKm))?Number(data.kyroPreviousDistanceKm):null,
        kyroPreviousDistanceRank:Number.isFinite(Number(data.kyroPreviousDistanceRank))?Number(data.kyroPreviousDistanceRank):null,
        kyroPreviousDataDate:data.kyroPreviousDataDate||"",
        active:data.active!==false,
        order:data.order??999,
        inviteCode:data.inviteCode||"",
        inviteStatus:data.inviteStatus||"registered",
        registeredAt:data.registeredAt||null,
        lastActiveAt:data.lastActiveAt||null,
        profile:{
          nickname:data.profile?.nickname||"",
          introduction:data.profile?.introduction||"",
          department:data.profile?.department||"",
          hobbies:data.profile?.hobbies||"",
          runningHistory:data.profile?.runningHistory||"",
          bestTime:data.profile?.bestTime||"",
          goal:data.profile?.goal||""
        },
        profileUpdatedAt:data.profileUpdatedAt||null,
        hasExistingProfile:Object.values(data.profile||{}).some(value=>String(value||"").trim()),
        profileUpdatedAtMissing:!("profileUpdatedAt" in data)||!data.profileUpdatedAt,
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
  migrateExistingMemberProfileDates(memberRecords);
  updateCurrentUserLastActive();
  const activeMembers=memberRecords.filter(m=>m.active!==false);
  if(activeMembers.length>0){
    members=activeMembers.map(m=>m.name);
  }
  renderNameButtons();
  updateUser();
  renderAll();
  // ユーザー情報取得がPOINTより後になった場合にもホーム集計を確定する。
  renderFitnessPointHomeSummary();
  renderKyroPublic();
  if(memberOverviewModal&&!memberOverviewModal.classList.contains("hidden"))renderMemberOverview();
  if(adminMemberModal&&!adminMemberModal.classList.contains("hidden"))renderAdminMembers();
},err=>{
  console.error("members read error",err);
});
onSnapshot(collection(db,"announcements"),snap=>{
  markPortalSnapshotReceived("announcements");
  const loaded=[];
  snap.forEach(d=>{const data=d.data();loaded.push({id:d.id,title:data.title||"",body:data.body||"",enabled:data.enabled!==false,createdAt:data.createdAt||null,updatedAt:data.updatedAt||null});});
  announcementRecords=loaded.sort((a,b)=>{const ta=a.updatedAt?.seconds||a.createdAt?.seconds||0;const tb=b.updatedAt?.seconds||b.createdAt?.seconds||0;return tb-ta;});
  cleanupAnnouncementReadState();
  renderAnnouncementsPublic();
  renderDashboard();
  if(announcementManageModal&&!announcementManageModal.classList.contains("hidden"))renderAdminAnnouncements();
},err=>{console.error("announcements read error",err);});

onSnapshot(collection(db,"messageBoard"),snap=>{
  markPortalSnapshotReceived("messageBoard");
  const loaded=[];
  snap.forEach(d=>loaded.push({id:d.id,...d.data()}));
  messageBoardRecords=loaded.sort((a,b)=>messageBoardDateValue(b.createdAt)-messageBoardDateValue(a.createdAt));
  renderMessageBoard();
},err=>{console.error("messageBoard read error",err);});

onSnapshot(collection(db,"recommendations"),snap=>{
  markPortalSnapshotReceived("recommendations");
  recommendationRecords=snap.docs.map(item=>{
    const data=item.data()||{};
    return {id:item.id,...data,likes:Array.isArray(data.likes)?data.likes:[]};
  });
  if(typeof renderRecommendations==="function")renderRecommendations();
  if(typeof renderRecommendationPreview==="function")renderRecommendationPreview();
},error=>console.error("Recommendations snapshot error",error));

onSnapshot(collection(db,"events"),snap=>{
  markPortalSnapshotReceived("events");
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
      memo:data.memo||"",
      trainingResults:Array.isArray(data.trainingResults)?data.trainingResults.filter(v=>typeof v==="string"):[]
    });
  });
  eventRecords=loaded.sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.type||"").localeCompare(b.type||""));
  renderNextEventPublic();
  renderReminder();
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

  if(currentType==="gym"){
    openGymQuestModal(selectedKey);
    return;
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
    const ref=eventPath(currentType,selectedKey);

    // GYMは参加取消時に、本人に紐づくQUEST/POINTも同時に整理する。
    // 他の参加者のデータには触れない。
    if(currentType==="gym"){
      const snap=await getDocFromServer(ref);
      if(!snap.exists())return;

      const data=snap.data()||{};
      const participants=Array.isArray(data.participants)
        ? data.participants.filter(name=>name!==currentUser)
        : [];

      const questSelections={...(data.questSelections||{})};
      const pointRecords={...(data.pointRecords||{})};
      delete questSelections[currentUser];
      delete pointRecords[currentUser];

      // 最後の参加者が取消し、QUEST/POINTも空ならattendanceドキュメント自体を削除。
      // date/type/updatedAtだけの空ドキュメントを残さない。
      if(
        participants.length===0 &&
        Object.keys(questSelections).length===0 &&
        Object.keys(pointRecords).length===0
      ){
        await deleteDoc(ref);
        return;
      }

      await setDoc(ref,{
        ...data,
        participants,
        questSelections,
        pointRecords,
        updatedAt:serverTimestamp()
      });
      return;
    }

    // ラン＆ウォークは従来どおり参加者だけを外す。
    await updateDoc(ref,{
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
    alert(`🎉 本人確認が完了しました！\n\n${member.name}さんとしてこの端末を設定しました。\n通常利用では招待コードの再入力は不要です。別の端末で設定する場合は、同じ招待コードを入力してください。`);
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
  const currentUserNameText=currentUserLabel.querySelector("strong");
  if(currentUserNameText)currentUserNameText.textContent=currentUser||"未設定";
  else currentUserLabel.textContent=currentUser||"未設定";

  const member=memberRecords.find(item=>item.name===currentUser&&item.active!==false)||null;
  const nickname=String(member?.profile?.nickname||"").trim();

  currentUserMeta?.classList.toggle("hidden",!member);
  currentUserSrcMember?.classList.toggle("hidden",!member);
  currentUserKyroSeparator?.classList.toggle("hidden",!member?.kyroMember);
  currentUserKyroBadge?.classList.toggle("hidden",!member?.kyroMember);
  if(currentUserNickname){
    currentUserNickname.textContent=nickname;
    currentUserNickname.classList.toggle("hidden",!nickname);
    currentUserNickname.title=nickname;
  }
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
        // Ver.1.9.0zzx:
        // 招待コードは登録後も本人確認コードとして保持する。
        // 別端末、または別ユーザーからこのメンバーへ変更する場合は、
        // inviteStatusに関係なく、inviteCodeがあるメンバーはコード確認を行う。
        // この端末ですでに同じmemberIdが選択済みなら再入力は不要。
        const verifiedMemberId=localStorage.getItem(storageMemberIdKey)||"";
        const needsInviteVerification=Boolean(member.inviteCode) && verifiedMemberId!==member.id;
        if(needsInviteVerification || member.inviteStatus==="pending"){
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
        renderFitnessPointHomeSummary();
        if(returnToAdminMenuAfterSetup){
          returnToAdminMenuAfterSetup=false;
          show(adminMenuModal);
        }
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

    const row=document.createElement("button");
    row.type="button";
    row.className="member-overview-row member-profile-open-row";
    row.setAttribute("aria-label",`${name} ${uiT("openProfile","プロフィールを開く")}`);
    row.innerHTML=`
      <div class="member-today-status ${joiningToday?"joining":"not-joining"}" aria-label="${joiningToday?"今日参加予定":"今日参加予定なし"}">${joiningToday?"●":"○"}</div>
      <div class="member-overview-main">
        <div class="member-overview-name">${medal}${escapeHtml(name)}${member.kyroMember?'<span class="kyro-badge member-kyro-badge">KYRO</span>':""}</div>
        <div class="member-overview-breakdown">
          <span>🏃 ${runCount}${uiT("times","回")}</span>
          <span>🏋️ ${gymCount}${uiT("times","回")}</span>
        </div>
      </div>
      <div class="member-overview-total">🔥 ${total}<span class="member-profile-chevron">›</span></div>
    `;
    row.onclick=()=>openMemberProfile(member);
    memberOverviewList.appendChild(row);
  });
}

function profileValue(value){return String(value||"").trim();}
function profileDisplayRow(icon,label,value){
  const clean=profileValue(value);
  if(!clean)return "";
  return `<div class="member-profile-field"><div class="member-profile-field-label">${icon} ${escapeHtml(label)}</div><div class="member-profile-field-value">${escapeHtml(clean).replace(/\n/g,"<br>")}</div></div>`;
}
function kyroDataDateLabel(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  const match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match?`${match[1]}/${match[2]}/${match[3]}`:raw.replaceAll("-","/");
}
function kyroUpdatedDateTimeLabel(value,fallbackDate=""){
  const date=value?.toDate?.()||null;
  if(date instanceof Date&&!Number.isNaN(date.getTime())){
    return `${date.getFullYear()}/${pad2(date.getMonth()+1)}/${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }
  const fallback=kyroDataDateLabel(fallbackDate);
  return fallback?`${fallback} --:--`:"未登録";
}
function latestKyroUpdatedDateTimeLabel(){
  const latest=memberRecords
    .map(member=>member.kyroDataUpdatedAt?.toDate?.()||null)
    .filter(date=>date instanceof Date&&!Number.isNaN(date.getTime()))
    .sort((a,b)=>b.getTime()-a.getTime())[0];
  if(latest)return `${latest.getFullYear()}/${pad2(latest.getMonth()+1)}/${pad2(latest.getDate())} ${pad2(latest.getHours())}:${pad2(latest.getMinutes())}`;
  const fallback=memberRecords.find(member=>member.kyroDataDate)?.kyroDataDate||"";
  return fallback?`${kyroDataDateLabel(fallback)} --:--`:"未登録";
}
function kyroDataMemberCount(){
  return memberRecords.filter(member=>member.active!==false&&member.kyroMember&&Number.isFinite(Number(member.kyroDistanceKm))).length;
}
function memberKyroSummaryHtml(member){
  const distance=Number(member?.kyroDistanceKm);
  const rank=Number(member?.kyroDistanceRank);
  if(!member?.kyroMember||!Number.isFinite(distance))return "";
  const memberCount=kyroDataMemberCount();
  const rankText=Number.isFinite(rank)&&rank>0?`${rank}位${memberCount>0?` / ${memberCount}人`:""}`:"未集計";
  const dateText=kyroUpdatedDateTimeLabel(member.kyroDataUpdatedAt,member.kyroDataDate);
  const previousDistance=Number(member?.kyroPreviousDistanceKm);
  const previousDateText=kyroDataDateLabel(member?.kyroPreviousDataDate);
  const hasPrevious=Number.isFinite(previousDistance)&&!!previousDateText;
  const difference=hasPrevious?distance-previousDistance:null;
  const differenceText=hasPrevious?`${difference>=0?"+":""}${difference.toFixed(2)} km`:"初回データ";
  const previousDateLabel=hasPrevious?previousDateText:"―";
  return `<section class="member-profile-kyro"><div class="member-profile-kyro-title">🗺️ KYRO <span>（SRC-KYRO-Club）</span></div><div class="member-profile-kyro-grid"><div><span>累積走行距離</span><strong>${distance.toFixed(2)} km</strong></div><div><span>前回更新比</span><strong>${escapeHtml(differenceText)}</strong></div><div><span>前回更新日</span><strong>${escapeHtml(previousDateLabel)}</strong></div><div><span>距離順位</span><strong>${escapeHtml(rankText)}</strong></div></div><div class="member-profile-kyro-date"><span>🕒 最終更新</span><strong>${escapeHtml(dateText)}</strong></div></section>`;
}
function renderKyroDistanceList(){
  if(!kyroDistanceList)return;
  const kyroDistanceUpdated=document.getElementById("kyroDistanceUpdated");
  if(kyroDistanceUpdated)kyroDistanceUpdated.textContent=latestKyroUpdatedDateTimeLabel();
  const activeKyro=memberRecords.filter(member=>member.active!==false&&member.kyroMember);
  const withData=activeKyro
    .filter(member=>Number.isFinite(Number(member.kyroDistanceKm)))
    .sort((a,b)=>Number(b.kyroDistanceKm)-Number(a.kyroDistanceKm)||a.name.localeCompare(b.name,"ja"));
  const withoutData=activeKyro.filter(member=>!Number.isFinite(Number(member.kyroDistanceKm))).sort((a,b)=>a.name.localeCompare(b.name,"ja"));
  let previousDistance=null;
  let rank=0;
  const rows=withData.map((member,index)=>{
    const distance=Number(member.kyroDistanceKm);
    if(previousDistance===null||distance!==previousDistance)rank=index+1;
    previousDistance=distance;
    const isCurrent=member.name===currentUser;
    const previousRank=Number(member.kyroPreviousDistanceRank);
    const rankDelta=Number.isFinite(previousRank)&&previousRank>0&&previousRank!==rank?previousRank-rank:0;
    const rankChange=rankDelta>0?`<small class="kyro-rank-change is-up">↑${rankDelta}</small>`:rankDelta<0?`<small class="kyro-rank-change is-down">↓${Math.abs(rankDelta)}</small>`:"";
    return `<div class="kyro-distance-row${isCurrent?" is-current":""}"><span class="kyro-distance-rank"><span>${rank}位</span>${rankChange}</span><span class="kyro-distance-member"><strong>${escapeHtml(member.name)}</strong>${member.kyroUserName?`<small>${escapeHtml(member.kyroUserName)}</small>`:""}</span><span class="kyro-distance-value">${distance.toFixed(2)} km</span>${isCurrent?'<span class="kyro-distance-you">あなた</span>':""}</div>`;
  });
  const pending=withoutData.map(member=>`<div class="kyro-distance-row is-pending"><span class="kyro-distance-rank">―</span><span class="kyro-distance-member"><strong>${escapeHtml(member.name)}</strong>${member.kyroUserName?`<small>${escapeHtml(member.kyroUserName)}</small>`:""}</span><span class="kyro-distance-value">未更新</span></div>`);
  kyroDistanceList.innerHTML=[...rows,...pending].join("")||'<div class="kyro-distance-empty">表示できるKYROデータがありません。</div>';
}
function openKyroDistanceList(){
  renderKyroDistanceList();
  hide(kyroPageModal);
  show(kyroDistanceListModal);
}
function closeKyroDistanceList(){
  hide(kyroDistanceListModal);
  show(kyroPageModal);
}

function formatProfileUpdatedDate(timestamp){
  if(!timestamp)return "";
  const date=timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if(Number.isNaN(date.getTime()))return "";
  const parts=new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Tokyo"}).formatToParts(date);
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}/${values.month}/${values.day}`;
}

function openMemberProfile(member){
  selectedProfileMember=member;
  const profile=member.profile||{};
  const nickname=profileValue(profile.nickname)||member.name;
  const hasProfile=Object.values(profile).some(value=>profileValue(value));
  const profileUpdatedDate=formatProfileUpdatedDate(member.profileUpdatedAt);
  memberProfileContent.innerHTML=`
    <div class="member-profile-identity"><div class="member-profile-avatar">😊</div><div class="member-profile-identity-main"><div class="member-profile-name">${escapeHtml(member.name)}</div><div class="member-profile-nickname">${escapeHtml(nickname)}</div></div>${profileUpdatedDate?`<div class="member-profile-updated">📝 ${escapeHtml(profileUpdatedDate)}</div>`:""}</div>
    ${hasProfile?"":`<div class="member-profile-empty">${escapeHtml(uiT("profileNotRegistered","自己紹介はまだ登録されていません。"))}</div>`}
    ${profileDisplayRow("💬",uiT("introduction","ひとこと"),profile.introduction)}
    ${profileDisplayRow("🏢",uiT("department","所属"),profile.department)}
    ${profileDisplayRow("🎯",uiT("hobbies","趣味・好きなこと"),profile.hobbies)}
    ${profileDisplayRow("🏃",uiT("runningHistory","ランニング歴"),profile.runningHistory)}
    ${profileDisplayRow("🏅",uiT("bestTime","ベストタイム"),profile.bestTime)}
    ${profileDisplayRow("🌱",uiT("goal","現在の目標"),profile.goal)}
`;
  editOwnProfileButton.classList.toggle("hidden",member.name!==currentUser);
  hide(memberOverviewModal);
  show(memberProfileModal);
}
function openOwnProfileEditor(){
  const member=currentMemberRecord();
  if(!member)return;
  selectedProfileMember=member;
  const profile=member.profile||{};
  profileNicknameInput.value=profile.nickname||"";
  profileIntroductionInput.value=profile.introduction||"";
  profileDepartmentInput.value=profile.department||"";
  profileHobbiesInput.value=profile.hobbies||"";
  profileRunningHistoryInput.value=profile.runningHistory||"";
  profileBestTimeInput.value=profile.bestTime||"";
  profileGoalInput.value=profile.goal||"";
  profileEditError.classList.add("hidden");
  hide(memberProfileModal);
  show(memberProfileEditModal);
}
async function saveOwnProfile(){
  const member=currentMemberRecord();
  if(!member?.id)return;
  const nickname=profileNicknameInput.value.trim();
  const introduction=profileIntroductionInput.value.trim();
  if(!nickname||!introduction){profileEditError.classList.remove("hidden");return;}
  profileEditError.classList.add("hidden");
  const profile={nickname,introduction,department:profileDepartmentInput.value.trim(),hobbies:profileHobbiesInput.value.trim(),runningHistory:profileRunningHistoryInput.value.trim(),bestTime:profileBestTimeInput.value.trim(),goal:profileGoalInput.value.trim()};
  try{
    await setDoc(doc(db,"members",member.id),{profile,profileUpdatedAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
    hide(memberProfileEditModal);
  }catch(e){console.error(e);alert(uiT("profileSaveFailed","自己紹介の保存に失敗しました。Firestoreルールを確認してください。"));}
}
function kyroUpdatedLabel(value){
  if(!value)return "";
  const date=value.toDate?value.toDate():new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return `🕒 クラブ更新　${date.getFullYear()}/${pad2(date.getMonth()+1)}/${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
function kyroMiniUpdatedLabel(value){
  if(!value)return "🕒 更新中…";
  const date=value.toDate?value.toDate():new Date(value);
  if(Number.isNaN(date.getTime()))return "🕒 更新中…";
  return `🕒 ${date.getFullYear()}/${pad2(date.getMonth()+1)}/${pad2(date.getDate())}`;
}
function kyroNumber(value){
  if(typeof value==="number")return Number.isFinite(value)?value:null;
  const matched=String(value??"").replace(/,/g,"").match(/-?\d+(?:\.\d+)?/);
  if(!matched)return null;
  const number=Number(matched[0]);
  return Number.isFinite(number)?number:null;
}
function kyroTrend(currentValue,previousValue,type){
  const current=kyroNumber(currentValue);
  const previous=kyroNumber(previousValue);
  if(current===null||previous===null||current===previous)return "➡️";
  if(type==="rank")return current<previous?"⤴️":"⤵️";
  return current>previous?"⤴️":"⤵️";
}
function kyroRankText(value,previousValue,prefix=""){
  const number=kyroNumber(value);
  if(number===null)return "未登録";
  return `${prefix}${Math.trunc(number)}位 ${kyroTrend(number,previousValue,"rank")}`;
}
function kyroAreaText(value,previousValue,prefix=""){
  const number=kyroNumber(value);
  if(number===null)return "未登録";
  const decimals=Number.isInteger(number)?0:1;
  return `${prefix}${number.toFixed(decimals)}km² ${kyroTrend(number,previousValue,"area")}`;
}
function renderCurrentUserKyroSummary(){
  const member=currentMemberRecord();
  const kyroDistance=Number(member?.kyroDistanceKm);
  const hasKyroData=!!(member?.kyroMember&&Number.isFinite(kyroDistance));
  seasonDetailKyroSection?.classList.toggle("hidden",!hasKyroData);
  if(!hasKyroData)return;
  const rank=Number(member.kyroDistanceRank);
  const memberCount=kyroDataMemberCount();
  const previousDistance=Number(member.kyroPreviousDistanceKm);
  const previousDateText=kyroDataDateLabel(member.kyroPreviousDataDate);
  const hasPrevious=Number.isFinite(previousDistance)&&!!previousDateText;
  const difference=hasPrevious?kyroDistance-previousDistance:null;
  if(seasonDetailKyroMemberName)seasonDetailKyroMemberName.textContent=member.name||"--";
  if(seasonDetailKyroUserName)seasonDetailKyroUserName.textContent=member.kyroUserName||"--";
  seasonDetailKyroDistance.textContent=`${kyroDistance.toFixed(2)} km`;
  seasonDetailKyroDifference.textContent=hasPrevious?`${difference>=0?"+":""}${difference.toFixed(2)} km`:"初回データ";
  seasonDetailKyroPreviousDate.textContent=hasPrevious?previousDateText:"―";
  seasonDetailKyroRank.textContent=Number.isFinite(rank)&&rank>0?`${rank}位${memberCount>0?` / ${memberCount}人`:""}`:"未集計";
  seasonDetailKyroUpdated.textContent=kyroUpdatedDateTimeLabel(member.kyroDataUpdatedAt,member.kyroDataDate);
}
function renderKyroPublic(){
  const kyroMembers=memberRecords.filter(member=>member.active!==false&&member.kyroMember);
  if(kyroMemberCount)kyroMemberCount.textContent=`${kyroMembers.length}名`;
  if(kyroArea)kyroArea.textContent=kyroAreaText(kyroInfo.area,kyroInfo.previousArea);
  if(kyroJapanRank)kyroJapanRank.textContent=kyroRankText(kyroInfo.japanRank,kyroInfo.previousJapanRank);
  if(kyroAichiRank)kyroAichiRank.textContent=kyroRankText(kyroInfo.aichiRank,kyroInfo.previousAichiRank);
  if(kyroNews)kyroNews.textContent=kyroInfo.news||"未登録です。";
  if(kyroGoal)kyroGoal.textContent=kyroInfo.goal||"未登録です。";
  renderCurrentUserKyroSummary();
  if(kyroUpdatedAt)kyroUpdatedAt.textContent=kyroUpdatedLabel(kyroInfo.updatedAt);
  if(kyroMiniUpdated)kyroMiniUpdated.textContent=kyroMiniUpdatedLabel(kyroInfo.updatedAt);
  if(kyroMiniJapanRank)kyroMiniJapanRank.textContent=`🏆 ${kyroRankText(kyroInfo.japanRank,kyroInfo.previousJapanRank,"全国")}`;
  if(kyroMiniArea)kyroMiniArea.textContent=`🗺 ${kyroAreaText(kyroInfo.area,kyroInfo.previousArea,"領土")}`;
}
function openKyroPage(){renderKyroPublic();hide(mainMenuModal);show(kyroPageModal);}
function openAdminKyro(){
  const area=kyroNumber(kyroInfo.area);
  const japanRank=kyroNumber(kyroInfo.japanRank);
  const aichiRank=kyroNumber(kyroInfo.aichiRank);
  kyroAreaInput.value=area===null?"":String(area);
  kyroJapanRankInput.value=japanRank===null?"":String(Math.trunc(japanRank));
  kyroAichiRankInput.value=aichiRank===null?"":String(Math.trunc(aichiRank));
  kyroNewsInput.value=kyroInfo.news||"";
  kyroGoalInput.value=kyroInfo.goal||"";
  openAdminChildModal(adminKyroModal);
}
async function saveKyroInfo(){
  const area=Number(kyroAreaInput.value);
  const japanRank=Number(kyroJapanRankInput.value);
  const aichiRank=Number(kyroAichiRankInput.value);
  if(!Number.isFinite(area)||area<0||!Number.isInteger(japanRank)||japanRank<1||!Number.isInteger(aichiRank)||aichiRank<1){
    alert("領土・全国順位・愛知県順位を数字で入力してください。");
    return;
  }
  const currentArea=kyroNumber(kyroInfo.area);
  const currentJapanRank=kyroNumber(kyroInfo.japanRank);
  const currentAichiRank=kyroNumber(kyroInfo.aichiRank);
  try{
    await setDoc(doc(db,"settings","kyro"),{
      previousArea:currentArea===null?area:currentArea,
      previousJapanRank:currentJapanRank===null?japanRank:currentJapanRank,
      previousAichiRank:currentAichiRank===null?aichiRank:currentAichiRank,
      area,
      japanRank,
      aichiRank,
      news:kyroNewsInput.value.trim(),
      goal:kyroGoalInput.value.trim(),
      updatedAt:serverTimestamp()
    },{merge:true});
    alert("SRC-KYRO情報を保存しました。矢印は前回値との比較で自動表示されます。");
    closeAdminChildModal(adminKyroModal);
  }catch(e){console.error(e);alert("SRC-KYRO情報の保存に失敗しました。Firestoreルールを確認してください。");}
}

function openKyroImport(){
  kyroImportPrepared=null;
  kyroImportDateInput.value=todayKeyJST();
  kyroImportTextInput.value="";
  kyroImportError.textContent="";
  kyroImportError.classList.add("hidden");
  kyroImportSummary.classList.add("hidden");
  kyroImportSummary.textContent="";
  kyroImportPreview.innerHTML="";
  applyKyroImportButton.disabled=true;
  openAdminChildModal(adminKyroImportModal);
}

function buildKyroAiPrompt(){
  const names=memberRecords.filter(m=>m.active!==false&&m.kyroMember&&m.kyroUserName).map(m=>m.kyroUserName);
  return `添付したKYROメンバー一覧のスクリーンショットから、KYROネームと累積走行距離を読み取ってください。\n\n【ルール】\n・画像左端の番号は使用しない\n・順位は計算しない\n・距離はkmの数値だけ出力する\n・説明、見出し、表、コードブロックは付けない\n・読み取れない値は推測せず「確認必要」とする\n\n出力形式（1人1行）\nKYROネーム,累積走行距離\n\n登録済みKYROネーム\n${names.join("\n")}`;
}
async function copyKyroAiPrompt(){
  const ok=await copyText(buildKyroAiPrompt());
  alert(ok?"AI依頼文をコピーしました。このAIへ貼り付け、KYRO画像を添付してください。":"依頼文をコピーできませんでした。");
}
function splitKyroImportLine(line){
  if(line.includes("\t"))return line.split("\t").map(v=>v.trim());
  return line.split(/[,，]/).map(v=>v.trim());
}
function parseKyroImportText(text){
  const rows=[],errors=[],seen=new Set();
  const targetMembers=memberRecords.filter(m=>m.active!==false&&m.kyroMember);
  const byKyro=new Map(targetMembers.filter(m=>m.kyroUserName).map(m=>[m.kyroUserName.toLocaleLowerCase(),m]));
  String(text||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).forEach((line,index)=>{
    if(/^#/.test(line))return;
    const cols=splitKyroImportLine(line);
    if(cols.length<2){errors.push(`${index+1}行目：2項目必要です。`);return;}
    const [kyroName,distanceText]=cols;
    if(/^(KYROネーム|kyroName)$/i.test(kyroName))return;
    if(!kyroName){errors.push(`${index+1}行目：KYROネームが空欄です。`);return;}
    if(seen.has(kyroName.toLocaleLowerCase())){errors.push(`${index+1}行目：KYROネーム「${kyroName}」が重複しています。`);return;}
    seen.add(kyroName.toLocaleLowerCase());
    const normalized=String(distanceText).replace(/km/ig,"").replace(/,/g,"").trim();
    const distanceKm=Number(normalized);
    if(!Number.isFinite(distanceKm)||distanceKm<0){errors.push(`${index+1}行目：距離が正しくありません。`);return;}
    const member=byKyro.get(kyroName.toLocaleLowerCase());
    rows.push({kyroName,distanceKm,member,sourceLine:index+1});
  });
  const matched=rows.filter(r=>r.member&&r.member.id),unmatched=rows.filter(r=>!r.member||!r.member.id);
  const included=new Set(matched.map(r=>r.member.id));
  const missing=targetMembers.filter(m=>m.id&&!included.has(m.id));
  const sorted=[...matched].sort((a,b)=>b.distanceKm-a.distanceKm||a.kyroName.localeCompare(b.kyroName));
  let lastDistance=null,lastRank=0;
  sorted.forEach((row,index)=>{if(lastDistance===null||row.distanceKm!==lastDistance)lastRank=index+1;row.rank=lastRank;lastDistance=row.distanceKm;});
  return {rows,matched:sorted,unmatched,missing,errors};
}
function renderKyroImportPreview(){
  kyroImportPrepared=null;applyKyroImportButton.disabled=true;kyroImportPreview.innerHTML="";kyroImportError.classList.add("hidden");
  const snapshotDate=kyroImportDateInput.value;
  if(!snapshotDate){kyroImportError.textContent="取得日を選択してください。";kyroImportError.classList.remove("hidden");return;}
  const result=parseKyroImportText(kyroImportTextInput.value);
  if(result.errors.length){kyroImportError.textContent=result.errors.join("\n");kyroImportError.classList.remove("hidden");}
  kyroImportSummary.textContent=`読込 ${result.rows.length}件／反映可能 ${result.matched.length}件／未登録 ${result.unmatched.length}件／不足 ${result.missing.length}件／形式エラー ${result.errors.length}件`;
  kyroImportSummary.classList.remove("hidden");
  result.matched.forEach(row=>{const d=document.createElement("div");d.className="kyro-import-row";d.innerHTML=`<strong class="kyro-import-name">${escapeHtml(row.member.name)}</strong><span class="kyro-import-user">${escapeHtml(row.kyroName)}</span><span class="kyro-import-distance">${row.distanceKm.toFixed(2)} km</span><span class="kyro-import-rank">${row.rank}位</span>`;kyroImportPreview.appendChild(d);});
  result.unmatched.forEach(row=>{const d=document.createElement("div");d.className="kyro-import-row kyro-import-error-row";d.textContent=`未登録KYROネーム：${row.kyroName}`;kyroImportPreview.appendChild(d);});
  result.missing.forEach(m=>{const d=document.createElement("div");d.className="kyro-import-row kyro-import-warning";d.textContent=`今回のデータにありません：${m.name}（${m.kyroUserName||"KYROネーム未登録"}）`;kyroImportPreview.appendChild(d);});
  if(!result.rows.length&&!result.errors.length){kyroImportError.textContent="取込データを貼り付けてください。";kyroImportError.classList.remove("hidden");return;}
  if(result.matched.length&&result.unmatched.length===0&&result.missing.length===0&&result.errors.length===0){kyroImportPrepared={snapshotDate,records:result.matched};applyKyroImportButton.disabled=false;}
}
async function applyKyroImport(){
  if(!kyroImportPrepared?.records?.length)return;
  const {snapshotDate,records}=kyroImportPrepared;if(!confirm(`${snapshotDate} のKYRO個人データ ${records.length}件をFirestoreへ反映しますか？`))return;
  applyKyroImportButton.disabled=true;
  try{const batch=writeBatch(db),snapshotMembers=[];records.forEach(row=>{const sameSnapshotDate=String(row.member.kyroDataDate||"")===snapshotDate;const updateData={kyroUserName:row.kyroName,kyroDistanceKm:row.distanceKm,kyroDistanceRank:row.rank,kyroDataDate:snapshotDate,kyroDataUpdatedAt:serverTimestamp(),updatedAt:serverTimestamp()};if(!sameSnapshotDate&&row.member.kyroDataDate){if(Number.isFinite(Number(row.member.kyroDistanceKm)))updateData.kyroPreviousDistanceKm=Number(row.member.kyroDistanceKm);if(Number.isFinite(Number(row.member.kyroDistanceRank))&&Number(row.member.kyroDistanceRank)>0)updateData.kyroPreviousDistanceRank=Number(row.member.kyroDistanceRank);updateData.kyroPreviousDataDate=row.member.kyroDataDate;}batch.set(doc(db,"members",row.member.id),updateData,{merge:true});snapshotMembers.push({memberId:row.member.id,memberName:row.member.name,kyroUserName:row.kyroName,distanceKm:row.distanceKm,distanceRank:row.rank,previousDistanceKm:!sameSnapshotDate&&Number.isFinite(Number(row.member.kyroDistanceKm))?Number(row.member.kyroDistanceKm):(Number.isFinite(Number(row.member.kyroPreviousDistanceKm))?Number(row.member.kyroPreviousDistanceKm):null),previousDistanceRank:!sameSnapshotDate&&Number.isFinite(Number(row.member.kyroDistanceRank))?Number(row.member.kyroDistanceRank):(Number.isFinite(Number(row.member.kyroPreviousDistanceRank))?Number(row.member.kyroPreviousDistanceRank):null),previousDataDate:!sameSnapshotDate&&row.member.kyroDataDate?row.member.kyroDataDate:(row.member.kyroPreviousDataDate||"")});});batch.set(doc(db,"kyroSnapshots",snapshotDate),{snapshotDate,metric:"cumulativeDistanceKm",memberCount:snapshotMembers.length,members:snapshotMembers,importedBy:currentUser||"",updatedAt:serverTimestamp()},{merge:true});await batch.commit();alert(`KYRO個人データ ${records.length}件を反映しました。`);kyroImportPrepared=null;applyKyroImportButton.disabled=true;closeAdminChildModal(adminKyroImportModal);}catch(e){console.error(e);applyKyroImportButton.disabled=false;alert("KYRO個人データの反映に失敗しました。Firestoreルールを確認してください。");}
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

  if(!splashFinished){
    pendingDashboardAnimations.set(element,{target:endValue,suffix});
    element.textContent=`0${suffix}`;
    return;
  }

  if(dashboardAnimationState.get(element.id)===endValue){
    element.textContent=finalText;
    return;
  }

  const duration=2000;
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

function setType(type){currentType=type;gymTab.classList.toggle("active",type==="gym");runTab.classList.toggle("active",type==="run");const eventTimeRow=eventTime.closest("div");if(type==="gym"){eventTitle.textContent="フィットネストレーニング";eventSummary.textContent="😊 一緒に行ける方募集中！";const safePlace=escapeHtml(systemSettings.gym.place);const mapUrl=String(systemSettings.gym.mapUrl||"").trim();const safeMapUrl=/^https?:\/\//i.test(mapUrl)?escapeHtml(mapUrl):"";const placeLink=safeMapUrl?`<a class="gym-location-link" href="${safeMapUrl}" target="_blank" rel="noopener noreferrer">📍 ${safePlace}</a>`:`<span>📍 ${safePlace}</span>`;const url=String(systemSettings.gym.calendarUrl||"").trim();const safeUrl=/^https?:\/\//i.test(url)?escapeHtml(url):"";const calendarLink=safeUrl?`（<a class="gym-calendar-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">🔗 休場日を確認</a>）`:"";eventPlace.innerHTML=`${placeLink}${calendarLink}<span class="gym-summary-time">🕖 ${escapeHtml(systemSettings.gym.time)}〜</span>`;if(eventTimeRow)eventTimeRow.style.display="none";ruleTitle.textContent="補助条件";ruleValue.textContent=`${requiredMembers}名集まれば利用料300円/人補助`}else{eventTitle.textContent="ラン＆ウォーク";eventSummary.textContent="イベント管理で登録された開催日を表示します。";const runMapUrl=String(systemSettings.run.mapUrl||"").trim();const safeRunMapUrl=/^https?:\/\//i.test(runMapUrl)?escapeHtml(runMapUrl):"";const runPlaceHtml=safeRunMapUrl?`<a class="run-location-link" href="${safeRunMapUrl}" target="_blank" rel="noopener noreferrer">📍 ${escapeHtml(systemSettings.run.place)}</a>`:`<span>📍 ${escapeHtml(systemSettings.run.place)}</span>`;eventPlace.innerHTML=`${runPlaceHtml}<span class="run-summary-time">🕖 ${escapeHtml(systemSettings.run.time)}〜</span>`;if(eventTimeRow)eventTimeRow.style.display="none";ruleTitle.textContent="開催状態";ruleValue.textContent="管理者がイベントごとに設定"}renderAll()}function renderAll(){renderCalendar();renderLegend();renderNextPlan();renderGymQuestCard();renderReminder();renderNextEventPublic();renderAnnouncementsPublic();renderMessageBoard();renderRecommendationPreview();renderDashboard();renderSeasonActivity()}function renderLegend(){calendarLegend.innerHTML=currentType==="gym"?'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-one"></span>あと2</span><span><span class="dot dot-warning"></span>あと1</span><span><span class="dot dot-confirmed"></span>補助対象</span><span>⭐ 自分</span>':'<span><span class="dot dot-today"></span>今日</span><span><span class="dot dot-confirmed"></span>開催予定</span><span><span class="dot dot-cancelled"></span>中止</span><span>⭐ 自分</span>'}


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
      // Gym: any date can be selected. 3 participants qualifies for the subsidy.
      if(count===1)cell.classList.add("one");
      if(count===2)cell.classList.add("warn");
      if(count>=requiredMembers)cell.classList.add("confirmed");

      note=count>=requiredMembers
        ? "補助"
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

        // Ver.1.9.0zxn: 「落合公園」だけ通常のラン＆ウォーク色。
        const calendarEventTitle=String(runEvent.title||eventTypeLabel(runEvent.type)).trim();
        const isStandardRunWalk=calendarEventTitle==="落合公園";
        cell.classList.add(isStandardRunWalk?"standard-run-event":"other-run-event");

        if(runEvent.status==="cancelled"){
          cell.classList.add("cancelled","cancelled-event");
          note="中止";
        }else{
          cell.classList.add("confirmed");
          note="開催";
        }

        eventLabel=`<span class="calendar-event-label">${escapeHtml(calendarEventTitle)}</span>`;
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
    nextEventContent.className="dashboard-value dashboard-next-event-content empty";
    nextEventContent.textContent="なし";
    nextEventCard?.classList.add("is-empty");
    return;
  }
  const ev=events[0];
  const [,m,d]=ev.date.split("-").map(Number);
  const eventName=ev.title||ev.place||(ev.type==="gym"?"フィットネス":"ラン＆ウォーク");
  nextEventContent.className="dashboard-value dashboard-next-event-content";
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

const GYM_QUESTS=[
  {id:"new_one",icon:"🎲",name:"NEW ONE",text:"いつもと違うマシンを1つ使う"},
  {id:"plus5",icon:"🔥",name:"PLUS 5",text:"有酸素運動を5分だけプラス"},
  {id:"one_more",icon:"💪",name:"ONE MORE",text:"いつものメニューに1種目だけ追加"},
  {id:"cool_down",icon:"🧘",name:"COOL DOWN",text:"最後に5分ストレッチ"},
  {id:"warm_up",icon:"🚶",name:"WARM UP",text:"最初に5分ウォームアップ"},
  {id:"balance",icon:"⚖️",name:"BALANCE",text:"上半身と下半身を1種目ずつ"}
];
function gymQuestById(id){return GYM_QUESTS.find(q=>q.id===id)||null}
function gymQuestFor(key,name=currentUser){return attendanceQuestSelections[eventId("gym",key)]?.[name]||""}
function upcomingGymKeys(){
  const todayKey=todayKeyJST();
  return Object.keys(attendance)
    .filter(id=>id.startsWith("gym_")&&id.slice(4)>=todayKey&&(attendance[id]||[]).length>0)
    .map(id=>id.slice(4))
    .sort();
}
function myUpcomingGymKey(){return upcomingGymKeys().find(key=>getNames("gym",key).includes(currentUser))||""}
function renderGymQuestCard(){
  if(!gymQuestCard)return;
  gymQuestCard.classList.remove("gym-quest-compact","gym-quest-candidate","gym-quest-mine","gym-quest-subsidy");
  gymQuestActionButton?.classList.remove("gym-quest-action-hidden");
  gymQuestCard.dataset.key="";
  if(!currentUser){
    gymQuestCard.classList.add("gym-quest-compact");
    gymQuestHeading.textContent="🎮 GYM QUEST";
    gymQuestContent.innerHTML='<div class="gym-quest-main">名前を選択すると表示されます。</div>';
    gymQuestActionButton.textContent="ジムを見る ＞";
    gymQuestActionButton.dataset.mode="calendar";
    return;
  }
  const myKey=myUpcomingGymKey();
  const candidateKey=upcomingGymKeys()[0]||"";
  const key=myKey||candidateKey;
  gymQuestCard.dataset.key=key||"";
  if(!key){
    gymQuestCard.classList.add("gym-quest-compact");
    gymQuestHeading.textContent="🎮 GYM QUEST";
    gymQuestContent.innerHTML=`<div class="gym-quest-main">次のフィットネス、誰が最初に動く？</div><div class="gym-quest-sub">🏋️ ${escapeHtml(systemSettings.gym.time)} START　QUESTでジムを楽しもう！</div>`;
    gymQuestActionButton.textContent="フィットネス行きたい！ ＞";
    gymQuestActionButton.dataset.mode="calendar";
    gymQuestActionButton.dataset.key="";
    return;
  }
  const names=getNames("gym",key);
  const joined=names.includes(currentUser);
  const count=names.length;
  const remain=Math.max(requiredMembers-count,0);
  const subsidy=count>=requiredMembers;
  if(joined){
    gymQuestCard.classList.add("gym-quest-mine");
    if(subsidy)gymQuestCard.classList.add("gym-quest-subsidy");
    gymQuestHeading.textContent="🎮 NEXT GYM QUEST";
    const q=gymQuestById(gymQuestFor(key));
    const support=subsidy?'🎁 補助対象！':`あと${remain}名で補助対象`;
    gymQuestContent.innerHTML=`<div class="gym-quest-date">📅 ${escapeHtml(fmt(key))}　🕖 ${escapeHtml(systemSettings.gym.time)}〜</div><div class="gym-quest-participants">👥 参加予定 ${count}名　<span>${escapeHtml(support)}</span></div>${q?`<div class="gym-quest-selected"><div class="gym-quest-selected-head"><span>あなたのQUEST</span><button class="gym-quest-inline-action" type="button" data-gym-quest-inline="1">QUESTを変更 ＞</button></div><strong>${q.icon} ${escapeHtml(q.name)}</strong><small>${escapeHtml(q.text)}</small></div><div class="gym-quest-level">🏅 GYM QUEST Lv.1 <span>⚡ 30 / 50 XP</span></div>`:'<div class="gym-quest-selected empty"><div class="gym-quest-selected-head"><span>あなたのQUEST</span><button class="gym-quest-inline-action" type="button" data-gym-quest-inline="1">QUESTを選ぶ ＞</button></div><strong>まだ選んでいません</strong></div>'}`;
    gymQuestActionButton.textContent=q?"QUESTを変更 ＞":"QUESTを選ぶ ＞";
    gymQuestActionButton.dataset.mode="quest";
    gymQuestActionButton.dataset.key=key;
    gymQuestActionButton.classList.add("gym-quest-action-hidden");
    return;
  }
  gymQuestCard.classList.add("gym-quest-candidate");
  if(subsidy)gymQuestCard.classList.add("gym-quest-subsidy");
  gymQuestHeading.textContent="🔥 次回フィットネス開催候補";
  const starter=names[0]||"メンバー";
  const starterLine=count===1?`${escapeHtml(starter)}さんが「フィットネス行きたい！」`:`${escapeHtml(starter)}さんほか${count-1}名が参加希望`;
  const support=subsidy?'🎁 補助対象！':`あと${remain}名で補助対象`;
  gymQuestContent.innerHTML=`<div class="gym-quest-date">📅 ${escapeHtml(fmt(key))}　🕖 ${escapeHtml(systemSettings.gym.time)}〜</div><div class="gym-quest-main">${starterLine}</div><div class="gym-quest-participants">👥 現在 ${count}名　<span>${escapeHtml(support)}</span></div><div class="gym-quest-sub">🎲 参加するとQUESTを選べます</div>`;
  gymQuestActionButton.textContent="自分も参加する ＞";
  gymQuestActionButton.dataset.mode="quest";
  gymQuestActionButton.dataset.key=key;
}
function openGymCalendarForQuest(key=""){
  currentType="gym";
  setType("gym");
  if(/^\d{4}-\d{2}-\d{2}$/.test(key)){
    const [y,m]=key.split("-").map(Number);
    currentYear=y;currentMonth=m-1;
  }else{
    const now=new Date();currentYear=now.getFullYear();currentMonth=now.getMonth();
  }
  renderAll();
  requestAnimationFrame(()=>scrollToBelowHeader(document.querySelector(".calendar-card"),8));
}
function renderGymQuestOptions(){
  const current=gymQuestSelectedId;
  gymQuestOptionList.innerHTML=GYM_QUESTS.map(q=>`<button class="gym-quest-option ${current===q.id?"selected":""}" type="button" data-quest-id="${q.id}"><span class="gym-quest-option-icon">${q.icon}</span><span class="gym-quest-option-copy"><strong>${escapeHtml(q.name)}</strong><small>${escapeHtml(q.text)}</small></span><span class="gym-quest-option-check">${current===q.id?"✓":""}</span></button>`).join("");
  confirmGymQuestButton.disabled=!gymQuestSelectedId;
}
function openGymQuestModal(key){
  if(!currentUser){requireName(true);return}
  gymQuestTargetKey=key;
  gymQuestSelectedId=gymQuestFor(key)||"";
  const joined=getNames("gym",key).includes(currentUser);
  gymQuestModalLead.textContent=`${fmt(key)} ${systemSettings.gym.time}〜　今回のQUESTを1つ選ぼう！`;
  confirmGymQuestButton.textContent=joined?"このQUESTに変更":"このQUESTで参加する";
  renderGymQuestOptions();
  show(gymQuestModal);
}
async function saveGymQuestSelection(){
  if(!gymQuestTargetKey||!gymQuestSelectedId||!currentUser)return;

  const targetKey=gymQuestTargetKey;
  const selectedQuestId=gymQuestSelectedId;
  const selectedQuest=gymQuestById(selectedQuestId);
  const ref=eventPath("gym",targetKey);
  const attendanceId=eventId("gym",targetKey);
  const originalLabel=confirmGymQuestButton.textContent;

  confirmGymQuestButton.disabled=true;
  confirmGymQuestButton.textContent="保存中…";
  confirmGymQuestButton.classList.add("is-saving");

  try{
    await setDoc(ref,{
      type:"gym",
      date:targetKey,
      participants:arrayUnion(currentUser),
      questSelections:{[currentUser]:selectedQuestId},
      updatedAt:serverTimestamp()
    },{merge:true});

    const localParticipants=Array.isArray(attendance[attendanceId])?[...attendance[attendanceId]]:[];
    if(!localParticipants.includes(currentUser))localParticipants.push(currentUser);
    attendance[attendanceId]=localParticipants;
    attendanceQuestSelections[attendanceId]={
      ...(attendanceQuestSelections[attendanceId]||{}),
      [currentUser]:selectedQuestId
    };

    confirmGymQuestButton.textContent="✓ 参加登録完了";
    confirmGymQuestButton.classList.remove("is-saving");
    confirmGymQuestButton.classList.add("is-success");

    renderAll();
    if(currentType==="gym"&&selectedKey===targetKey)renderDetail();

    setTimeout(()=>{
      hide(gymQuestModal);
      confirmGymQuestButton.classList.remove("is-success");
      confirmGymQuestButton.textContent=originalLabel;
      confirmGymQuestButton.disabled=false;
      const questLabel=selectedQuest?`${selectedQuest.icon} ${escapeHtml(selectedQuest.name)}`:escapeHtml(selectedQuestId);
      showAppToast(`✅ <strong>参加登録しました！</strong><br>🎮 QUEST：${questLabel}`);
    },420);
  }catch(e){
    console.error(e);
    confirmGymQuestButton.classList.remove("is-saving","is-success");
    confirmGymQuestButton.textContent=originalLabel;
    confirmGymQuestButton.disabled=false;
    showAppToast('⚠️ <strong>参加登録に失敗しました</strong><br>通信状態を確認して、もう一度お試しください。');
  }
}
function renderNextPlan(){
  nextPlanTarget=null;
  if(gymQuestActionButton){
  gymQuestActionButton.onclick=event=>{
    event.stopPropagation();
    const mode=gymQuestActionButton.dataset.mode||"calendar";
    const key=gymQuestActionButton.dataset.key||"";
    if(mode==="quest"&&key)openGymQuestModal(key);else openGymCalendarForQuest(key);
  };
}
if(gymQuestCard){
  gymQuestCard.onclick=event=>{
    if(event.target.closest("button"))return;
    openGymCalendarForQuest(gymQuestCard.dataset.key||"");
  };
  gymQuestCard.onkeydown=event=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    if(event.target.closest("button"))return;
    event.preventDefault();
    openGymCalendarForQuest(gymQuestCard.dataset.key||"");
  };
}
if(gymQuestCard){
  gymQuestCard.addEventListener("click",event=>{
    const inline=event.target.closest("[data-gym-quest-inline]");
    if(!inline)return;
    event.preventDefault();
    event.stopPropagation();
    const key=gymQuestCard.dataset.key||"";
    if(key)openGymQuestModal(key);
  });
}
if(gymQuestOptionList){gymQuestOptionList.onclick=event=>{const button=event.target.closest("[data-quest-id]");if(!button)return;gymQuestSelectedId=button.dataset.questId||"";renderGymQuestOptions();};}
if(closeGymQuestModalButton)closeGymQuestModalButton.onclick=()=>hide(gymQuestModal);
if(gymQuestModal)gymQuestModal.onclick=event=>{if(event.target===gymQuestModal)hide(gymQuestModal);};
if(confirmGymQuestButton)confirmGymQuestButton.onclick=saveGymQuestSelection;

/* FITNESS POINT: isolated season aggregation. Never called from renderAll(). */
const fitnessPointCard=document.getElementById("fitnessPointCard");
const fitnessPointModal=document.getElementById("fitnessPointModal");
const closeFitnessPointModalButton=document.getElementById("closeFitnessPointModalButton");
const fitnessPointRankingTab=document.getElementById("fitnessPointRankingTab");
const fitnessPointMyTab=document.getElementById("fitnessPointMyTab");
const fitnessPointRankingPanel=document.getElementById("fitnessPointRankingPanel");
const fitnessPointMyPanel=document.getElementById("fitnessPointMyPanel");
const fitnessPointMyQuestCount=document.getElementById("fitnessPointMyQuestCount");
const fitnessPointActivityVisits=document.getElementById("fitnessPointActivityVisits");
const fitnessPointActivityCardio=document.getElementById("fitnessPointActivityCardio");
const fitnessPointActivityStretch=document.getElementById("fitnessPointActivityStretch");
const fitnessPointActivityMachines=document.getElementById("fitnessPointActivityMachines");
const fitnessPointActivityQuest=document.getElementById("fitnessPointActivityQuest");
const fitnessPointAdminTestBox=document.getElementById("fitnessPointAdminTestBox");
const fitnessPointIncludeTestButton=document.getElementById("fitnessPointIncludeTestButton");
let fitnessPointIncludeTestRecords=false;

function getFitnessPointUi(){
  return {
    topTotal:document.getElementById("fitnessPointTopTotal"),
    topRank:document.getElementById("fitnessPointTopRank"),
    seasonLabel:document.getElementById("fitnessPointSeasonLabel"),
    rankingList:document.getElementById("fitnessPointRankingList"),
    myTotal:document.getElementById("fitnessPointMyTotal"),
    myRank:document.getElementById("fitnessPointMyRank"),
    myVisits:document.getElementById("fitnessPointMyVisits"),
    myAverage:document.getElementById("fitnessPointMyAverage"),
    historyList:document.getElementById("fitnessPointHistoryList")
  };
}

function fitnessSeasonForKey(key){
  const [year,month]=String(key||"").split("-").map(Number);
  if(!year||!month)return null;

  if(month>=4&&month<=9){
    return {
      label:`${year}年度 上期（4/1〜9/30）`,
      start:`${year}-04-01`,
      end:`${year}-09-30`
    };
  }

  const fiscalYear=month>=10?year:year-1;
  return {
    label:`${fiscalYear}年度 下期（10/1〜${fiscalYear+1}/3/31）`,
    start:`${fiscalYear}-10-01`,
    end:`${fiscalYear+1}-03-31`
  };
}

function currentFitnessSeason(){
  return fitnessSeasonForKey(todayKeyJST());
}

function fitnessPointRowsForSeason(season=currentFitnessSeason()){
  if(!season)return [];
  const rows=[];

  Object.entries(attendancePointRecords||{}).forEach(([id,records])=>{
    if(!id.startsWith("gym_"))return;
    const date=id.slice(4);
    if(date<season.start||date>season.end)return;

    const participants=Array.isArray(attendance[id])?attendance[id]:[];

    Object.entries(records||{}).forEach(([name,record])=>{
      if(!record)return;

      // POINT記録が残っていても、その日の参加者に本人がいなければ集計しない。
      if(!participants.includes(name))return;

      const includeTest=fitnessPointIncludeTestRecords&&isCurrentAdmin();
      if(record.test===true&&!includeTest)return;

      rows.push({
        name,
        date,
        total:Math.max(0,Number(record.total)||0),
        record
      });
    });
  });

  return rows;
}

function buildFitnessPointRanking(season=currentFitnessSeason()){
  const totals=new Map();

  fitnessPointRowsForSeason(season).forEach(row=>{
    const item=totals.get(row.name)||{name:row.name,total:0,visits:0};
    item.total+=row.total;
    item.visits+=1;
    totals.set(row.name,item);
  });

  const ranking=[...totals.values()].sort((a,b)=>
    b.total-a.total||a.name.localeCompare(b.name,"ja")
  );

  let previousScore=null;
  let previousRank=0;

  ranking.forEach((row,index)=>{
    if(previousScore===null||row.total!==previousScore){
      previousScore=row.total;
      previousRank=index+1;
    }
    row.rank=previousRank;
  });

  return ranking;
}

function myFitnessPointHistory(season=currentFitnessSeason()){
  if(!currentUser)return [];
  return fitnessPointRowsForSeason(season)
    .filter(row=>row.name===currentUser)
    .sort((a,b)=>b.date.localeCompare(a.date));
}

function renderFitnessPointSummary(){
  const ui=getFitnessPointUi();
  const admin=isCurrentAdmin();

  if(fitnessPointAdminTestBox){
    fitnessPointAdminTestBox.classList.toggle("hidden",!admin);
  }
  if(fitnessPointIncludeTestButton){
    fitnessPointIncludeTestButton.classList.toggle("is-active",admin&&fitnessPointIncludeTestRecords);
    fitnessPointIncludeTestButton.setAttribute("aria-pressed",admin&&fitnessPointIncludeTestRecords?"true":"false");
    fitnessPointIncludeTestButton.textContent=admin&&fitnessPointIncludeTestRecords
      ? "✓ テスト記録を含めています"
      : "テスト記録を含める";
  }

  if(!admin)fitnessPointIncludeTestRecords=false;

  const season=currentFitnessSeason();
  const ranking=buildFitnessPointRanking(season);
  const me=ranking.find(row=>row.name===currentUser)||null;
  const history=myFitnessPointHistory(season);

  const total=me?.total||0;
  const visits=me?.visits||history.length||0;
  const average=visits?total/visits:0;

  const activity=history.reduce((summary,row)=>{
    const record=row.record||{};
    summary.visits+=1;
    if(record.cardio)summary.cardio+=1;
    if(record.stretch)summary.stretch+=1;
    summary.machines+=Math.max(0,Number(record.machines)||0);
    if(record.questClear)summary.quest+=1;
    return summary;
  },{visits:0,cardio:0,stretch:0,machines:0,quest:0});

  if(ui.seasonLabel)ui.seasonLabel.textContent=season?.label||"--";
  if(ui.topTotal)ui.topTotal.textContent=currentUser?`${total}pt`:"--pt";
  if(ui.topRank)ui.topRank.textContent=currentUser&&me?`${me.rank}位`:"--位";
  if(ui.myTotal)ui.myTotal.textContent=currentUser?`${total} pt`:"-- pt";
  if(ui.myRank)ui.myRank.textContent=currentUser&&me?`${me.rank} 位`:"-- 位";
  if(ui.myVisits)ui.myVisits.textContent=currentUser?`${visits} 回`:"-- 回";
  if(ui.myAverage)ui.myAverage.textContent=currentUser&&visits?`${average.toFixed(1)} pt`:"-- pt";
  if(fitnessPointMyQuestCount)fitnessPointMyQuestCount.textContent=currentUser?`${activity.quest} 回`:"-- 回";
  if(fitnessPointActivityVisits)fitnessPointActivityVisits.textContent=currentUser?`${activity.visits} 回`:"-- 回";
  if(fitnessPointActivityCardio)fitnessPointActivityCardio.textContent=currentUser?`${activity.cardio} 回`:"-- 回";
  if(fitnessPointActivityStretch)fitnessPointActivityStretch.textContent=currentUser?`${activity.stretch} 回`:"-- 回";
  if(fitnessPointActivityMachines)fitnessPointActivityMachines.textContent=currentUser?`${activity.machines} 台`:"-- 台";
  if(fitnessPointActivityQuest)fitnessPointActivityQuest.textContent=currentUser?`${activity.quest} 回`:"-- 回";

  if(ui.rankingList){
    if(!ranking.length){
      ui.rankingList.innerHTML=`<div class="fitness-point-ranking-empty">${fitnessPointIncludeTestRecords&&isCurrentAdmin()?"今季のPOINT記録はまだありません。":"今季の本番POINT記録はまだありません。"}</div>`;
    }else{
      ui.rankingList.innerHTML=ranking.map(row=>{
        const rankLabel=row.rank===1?"🥇 1位":row.rank===2?"🥈 2位":row.rank===3?"🥉 3位":`${row.rank}位`;
        return `<div class="fitness-point-ranking-row ${row.name===currentUser?"is-me":""}">
          <span class="fitness-point-ranking-position">${rankLabel}</span>
          <span class="fitness-point-ranking-name">${escapeHtml(row.name)}${row.name===currentUser?"（あなた）":""}</span>
          <strong class="fitness-point-ranking-score">${row.total} pt</strong>
        </div>`;
      }).join("");
    }
  }

  if(ui.historyList){
    if(!currentUser){
      ui.historyList.innerHTML='<div class="fitness-point-ranking-empty">名前を選択すると自分の記録を表示します。</div>';
    }else if(!history.length){
      ui.historyList.innerHTML=`<div class="fitness-point-ranking-empty">${fitnessPointIncludeTestRecords&&isCurrentAdmin()?"今季のPOINT記録はまだありません。":"今季の本番POINT記録はまだありません。"}</div>`;
    }else{
      ui.historyList.innerHTML=history.map(row=>{
        const quest=gymQuestById(row.record.questId||"");
        const details=[
          row.record.cardio?"有酸素":"",
          row.record.stretch?"柔軟":"",
          Number(row.record.machines)>0?`マシン${row.record.machines}台`:"",
          row.record.questClear&&quest?`QUEST ${quest.name}`:""
        ].filter(Boolean).join(" / ")||"来館";

        return `<div class="fitness-point-history-row">
          <span class="fitness-point-history-date">${escapeHtml(fmt(row.date))}</span>
          <span class="fitness-point-history-main">
            <strong>フィットネス</strong>
            <small>${escapeHtml(details)}</small>
          </span>
          <strong class="fitness-point-history-score">+${row.total}pt</strong>
        </div>`;
      }).join("");
    }
  }
}

function setFitnessPointTab(mode){
  const ranking=mode!=="my";
  fitnessPointRankingTab?.classList.toggle("active",ranking);
  fitnessPointMyTab?.classList.toggle("active",!ranking);
  fitnessPointRankingPanel?.classList.toggle("hidden",!ranking);
  fitnessPointMyPanel?.classList.toggle("hidden",ranking);
  renderFitnessPointSummary();
}

if(fitnessPointCard){
  fitnessPointCard.onclick=()=>{
    renderFitnessPointSummary();
    setFitnessPointTab("ranking");
    show(fitnessPointModal);
  };
}
if(closeFitnessPointModalButton)closeFitnessPointModalButton.onclick=()=>{
  fitnessPointIncludeTestRecords=false;
  hide(fitnessPointModal);
};
if(fitnessPointModal)fitnessPointModal.onclick=event=>{
  if(event.target===fitnessPointModal){
    fitnessPointIncludeTestRecords=false;
    hide(fitnessPointModal);
  }
};
if(fitnessPointRankingTab)fitnessPointRankingTab.onclick=()=>setFitnessPointTab("ranking");
if(fitnessPointMyTab)fitnessPointMyTab.onclick=()=>setFitnessPointTab("my");
if(fitnessPointIncludeTestButton){
  fitnessPointIncludeTestButton.onclick=()=>{
    if(!isCurrentAdmin())return;
    fitnessPointIncludeTestRecords=!fitnessPointIncludeTestRecords;
    renderFitnessPointSummary();
  };
}

const nextPlanCard=document.getElementById("nextPlanCard");
  const nextPlanLabel=nextPlanCard?.querySelector(".section-label");
  const resetNextPlanLabel=()=>{
    if(nextPlanLabel)nextPlanLabel.textContent="✨ あなたの次回参加予定";
  };
  if(!currentUser){
    resetNextPlanLabel();
    nextPlanContent.className="next-plan-empty";
    nextPlanContent.textContent="名前を選択すると表示されます。";
    nextPlanCard?.classList.add("is-empty");
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
      plans.push({type,key,time:systemSettings.gym.time,place:systemSettings.gym.place,title:"ジム"});
      return;
    }

    const ev=primaryEventForDate(key,"run");
    if(ev){
      plans.push({
        type,
        key,
        time:ev.time||systemSettings.run.time,
        place:ev.place||systemSettings.run.place,
        title:ev.title||"ラン＆ウォーク"
      });
    }
  });

  plans.sort((a,b)=>a.key.localeCompare(b.key)||(a.time||"").localeCompare(b.time||""));

  if(plans.length===0){
    resetNextPlanLabel();
    nextPlanContent.className="next-plan-empty";
    nextPlanContent.textContent="参加予定はまだありません。";
    nextPlanCard?.classList.add("is-empty");
    nextPlanCard?.classList.remove("is-today","is-tomorrow");
    return;
  }

  const p=plans[0];
  nextPlanTarget=p;
  const isToday=p.key===todayKeyJST();
  const isTomorrow=p.key===tomorrowKeyJST();
  if(nextPlanLabel){
    nextPlanLabel.textContent=isToday
      ? "📢 今日は参加予定です！"
      : isTomorrow
        ? "🔔 明日は参加予定です！"
        : "✨ あなたの次回参加予定";
  }
  const label=p.type==="gym"?"🏋️ フィットネス":`🏃 ${escapeHtml(p.title||"ラン＆ウォーク")}`;
  nextPlanContent.className="next-plan-item next-plan-compact";
  nextPlanContent.innerHTML=`<span class="next-plan-name">${label}</span><span class="next-plan-meta">📅 ${fmt(p.key)}　🕖${escapeHtml(p.time)}　📍${escapeHtml(p.place)}</span>`;
  nextPlanCard?.classList.remove("is-empty","is-today","is-tomorrow");
  if(isToday)nextPlanCard?.classList.add("is-today");
  else if(isTomorrow)nextPlanCard?.classList.add("is-tomorrow");
}

function openNextPlanInCalendar(){
  if(!nextPlanTarget)return;
  currentType=nextPlanTarget.type==="gym"?"gym":"run";
  selectedKey=nextPlanTarget.key;
  const [year,month]=nextPlanTarget.key.split("-").map(Number);
  currentYear=year;
  currentMonth=month-1;
  setType(currentType);
  requestAnimationFrame(()=>scrollToBelowHeader(document.querySelector(".calendar-card"),8));
}
function tomorrowKeyJST(){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  const tomorrow=new Date(Date.UTC(Number(values.year),Number(values.month)-1,Number(values.day)+1));
  return `${tomorrow.getUTCFullYear()}-${pad2(tomorrow.getUTCMonth()+1)}-${pad2(tomorrow.getUTCDate())}`;
}

function reminderDateLabel(key){
  const [year,month,day]=key.split("-").map(Number);
const language=window.SRC_I18N?.language||"ja";
  const locale=language==="ko"?"ko-KR":language==="zh"?"zh-CN":language==="en"?"en-US":"ja-JP";
  return new Intl.DateTimeFormat(locale,{month:"long",day:"numeric",weekday:"short",timeZone:"Asia/Tokyo"}).format(new Date(Date.UTC(year,month-1,day)));
}

function renderReminder(){
  if(!reminderCard||!reminderContent)return;
  if(!currentUser){
    reminderContent.innerHTML="";
    reminderCard.classList.add("hidden");
    return;
  }

  const key=tomorrowKeyJST();
  const items=[];
  const runEvent=eventsByDate(key,"run").find(ev=>ev.status!=="cancelled")||null;
  const runParticipants=getNames("run",key);
  const gymParticipants=getNames("gym",key);

  if(runEvent&&!runParticipants.includes(currentUser)){
    const eventName=runEvent.title||runEvent.place||uiT("eventGeneric","イベント");
    const time=runEvent.time||systemSettings.run.time;
    const place=runEvent.place||systemSettings.run.place;
    const title=uiT("reminderUnanswered",`明日の「${eventName}」への参加をまだ登録していません`).replace("{event}",eventName);
    items.push({
      time,
      html:`<div class="reminder-title">🔔 ${escapeHtml(title)}</div><div class="reminder-detail">📅 ${escapeHtml(reminderDateLabel(key))}　🕖 ${escapeHtml(time)}</div><div class="reminder-detail">📍 ${escapeHtml(place)}</div>`
    });
  }

  if(!gymParticipants.includes(currentUser)&&gymParticipants.length>0){
    const participantText=uiT("participantsPlanned",`{count}名参加予定`).replace("{count}",String(gymParticipants.length));
    items.push({
      time:systemSettings.gym.time,
      html:`<div class="reminder-title">🔔 ${escapeHtml(uiT("reminderGymUnanswered","明日のジム参加をまだ登録していません"))}</div><div class="reminder-detail">📅 ${escapeHtml(reminderDateLabel(key))}　🕖 ${escapeHtml(systemSettings.gym.time)}</div><div class="reminder-detail">📍 ${escapeHtml(systemSettings.gym.place)}　👥 ${escapeHtml(participantText)}</div>`
    });
  }

  if(items.length===0){
    reminderContent.innerHTML="";
    reminderCard.classList.add("hidden");
    return;
  }

  items.sort((a,b)=>(a.time||"").localeCompare(b.time||""));
  reminderContent.innerHTML=items.map(item=>`<div class="reminder-item">${item.html}</div>`).join("");
  reminderCard.classList.remove("hidden");
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
  fitnessPointRecordButton?.classList.add("hidden");
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
    ? "🏋️ フィットネストレーニング"
    : `🏃 ${ev?.title||"ラン＆ウォーク"}`;

  if(currentType==="gym"){
    detailTime.classList.add("hidden");
    const safePlace=escapeHtml(systemSettings.gym.place);
    const safeTime=escapeHtml(`${systemSettings.gym.time}〜`);
    const mapUrl=String(systemSettings.gym.mapUrl||"").trim();
    const safeMapUrl=/^https?:\/\//i.test(mapUrl)?escapeHtml(mapUrl):"";
    const placeLink=safeMapUrl?`<a class="gym-location-link" href="${safeMapUrl}" target="_blank" rel="noopener noreferrer">📍 ${safePlace}</a>`:`<span>📍 ${safePlace}</span>`;
    const url=String(systemSettings.gym.calendarUrl||"").trim();
    const safeUrl=/^https?:\/\//i.test(url)?escapeHtml(url):"";
    const calendarLink=safeUrl?`（<a class="gym-calendar-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">🔗 休場日を確認</a>）`:"";
    detailPlace.innerHTML=`${placeLink}${calendarLink}<span class="gym-detail-time">🕖 ${safeTime}</span>`;
  }else{
    detailTime.classList.remove("hidden");
    detailTime.textContent=ev?.time ? `${ev.time}〜` : `${systemSettings.run.time}〜`;
    detailPlace.textContent=`📍 ${ev?.place||systemSettings.run.place}`;
  }

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
      progressText.innerHTML=`🟢 補助対象です（${count}名参加）<div class="progress-subtext">💰 利用料300円/人補助</div>`;
    }else{
      progressText.innerHTML=`🟡 あと${remain}名で補助<div class="progress-subtext">💰 ${requiredMembers}人集まれば利用料300円/人補助</div>`;
    }

    renderFitnessPointRecordAction();

    if(isPast){
      eventMessage.textContent="過去の日付のため、参加・取消はできません。";
      eventMessage.classList.remove("hidden");
      joinButton.classList.add("hidden");
      cancelButton.classList.add("hidden");
      myStatus.textContent="";
      return;
    }

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
    eventMessage.innerHTML=linkifyEventMemo(ev.memo||"");
    if(ev.memo)eventMessage.classList.remove("hidden");
  }else{
    progressFill.style.width="100%";
    progressBar.style.display="none";
    progressBox.classList.add("confirmed");
    const displayStatus=eventDisplayStatus(ev);
    progressText.textContent=`${displayStatus.icon} ${displayStatus.text}`;
    eventMessage.innerHTML=linkifyEventMemo(ev.memo||"");
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

const fitnessPointRecordButton=document.getElementById("fitnessPointRecordButton");
const fitnessPointRecordModal=document.getElementById("fitnessPointRecordModal");
const closeFitnessPointRecordModalButton=document.getElementById("closeFitnessPointRecordModalButton");
const fitnessPointRecordDate=document.getElementById("fitnessPointRecordDate");
const fitnessPointTestNotice=document.getElementById("fitnessPointTestNotice");
const fitnessPointCardio=document.getElementById("fitnessPointCardio");
const fitnessPointStretch=document.getElementById("fitnessPointStretch");
const fitnessPointQuestRow=document.getElementById("fitnessPointQuestRow");
const fitnessPointQuestClear=document.getElementById("fitnessPointQuestClear");
const fitnessPointQuestName=document.getElementById("fitnessPointQuestName");
const fitnessPointTodayTotal=document.getElementById("fitnessPointTodayTotal");
const saveFitnessPointButton=document.getElementById("saveFitnessPointButton");

let fitnessPointTargetKey="";
let fitnessPointSavedSnapshot=null;

function gymStartReached(key){
  if(!key)return false;
  const todayKey=todayKeyJST();
  if(key<todayKey)return true;
  if(key>todayKey)return false;
  const [h,m]=String(systemSettings.gym.time||"19:00").split(":").map(Number);
  const parts=new Intl.DateTimeFormat("en-GB",{
    timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hour12:false
  }).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return Number(values.hour)*60+Number(values.minute)>=h*60+m;
}

function renderFitnessPointRecordAction(){
  if(!fitnessPointRecordButton)return;

  const joined=currentUser&&selectedKey&&getNames("gym",selectedKey).includes(currentUser);
  const started=gymStartReached(selectedKey);
  const adminTest=currentType==="gym"&&joined&&!started&&isCurrentAdmin();
  const available=currentType==="gym"&&joined&&(started||adminTest);

  fitnessPointRecordButton.classList.toggle("hidden",!available);

  if(available){
    const saved=attendancePointRecords[eventId("gym",selectedKey)]?.[currentUser];
    if(adminTest){
      fitnessPointRecordButton.textContent=saved
        ? "🧪 POINTテストを修正 ＞"
        : "🧪 POINT登録をテスト ＞";
    }else{
      fitnessPointRecordButton.textContent=saved
        ? "🏆 今日のPOINTを修正 ＞"
        : "🏆 今日のPOINTを記録 ＞";
    }
  }
}

function fitnessMachinePoint(){
  return Math.min(3,Math.max(0,Number(document.querySelector('input[name="fitnessPointMachines"]:checked')?.value||0)));
}
function fitnessQuestPoint(){
  return gymQuestFor(fitnessPointTargetKey,currentUser)&&fitnessPointQuestClear?.checked?1:0;
}
function fitnessPointTotal(){
  return 1+(fitnessPointCardio?.checked?1:0)+(fitnessPointStretch?.checked?1:0)+fitnessMachinePoint()+fitnessQuestPoint();
}
function currentFitnessPointSnapshot(){
  const questId=gymQuestFor(fitnessPointTargetKey,currentUser)||"";
  const test=!gymStartReached(fitnessPointTargetKey)&&isCurrentAdmin();
  return {
    cardio:fitnessPointCardio.checked?1:0,
    stretch:fitnessPointStretch.checked?1:0,
    machines:fitnessMachinePoint(),
    questId,
    questClear:Boolean(questId&&fitnessPointQuestClear.checked),
    questPoint:fitnessQuestPoint(),
    total:fitnessPointTotal(),
    test
  };
}
function normalizeSavedFitnessPoint(record){
  if(!record)return null;
  return {
    cardio:Number(record.cardio)||0,
    stretch:Number(record.stretch)||0,
    machines:Math.min(3,Math.max(0,Number(record.machines)||0)),
    questId:record.questId||"",
    questClear:Boolean(record.questClear),
    questPoint:Number(record.questPoint)||0,
    total:Number(record.total)||0,
    test:Boolean(record.test)
  };
}
function sameFitnessPointSnapshot(a,b){
  if(!a||!b)return false;
  return ["cardio","stretch","machines","questId","questClear","questPoint","total","test"].every(key=>a[key]===b[key]);
}
function refreshFitnessPointSaveState(){
  if(fitnessPointTodayTotal)fitnessPointTodayTotal.textContent=`${fitnessPointTotal()} pt`;
  if(!saveFitnessPointButton)return;
  if(!fitnessPointSavedSnapshot){
    saveFitnessPointButton.disabled=false;
    saveFitnessPointButton.textContent="この内容で記録する";
    return;
  }
  const unchanged=sameFitnessPointSnapshot(currentFitnessPointSnapshot(),fitnessPointSavedSnapshot);
  saveFitnessPointButton.disabled=unchanged;
  saveFitnessPointButton.textContent=unchanged?"✓ 記録済み":"変更内容を保存する";
}
async function openFitnessPointRecord(){
  if(!selectedKey||currentType!=="gym"||!currentUser)return;

  fitnessPointTargetKey=selectedKey;
  fitnessPointRecordDate.textContent=fmt(selectedKey);

  const testMode=!gymStartReached(selectedKey)&&isCurrentAdmin();
  fitnessPointTestNotice?.classList.toggle("hidden",!testMode);

  const id=eventId("gym",selectedKey);

  // POINT画面だけは対象日のgymドキュメントをサーバーから1件読み直す。
  // ラン＆ウォークの参加表示ロジックには一切触れない。
  try{
    const serverSnap=await getDocFromServer(eventPath("gym",selectedKey));
    if(serverSnap.exists()){
      const data=serverSnap.data()||{};
      attendancePointRecords[id]=data.pointRecords||{};
      attendanceQuestSelections[id]=data.questSelections||attendanceQuestSelections[id]||{};
    }
  }catch(error){
    console.warn("fitness point server read failed; use snapshot cache",error);
  }

  const saved=attendancePointRecords[id]?.[currentUser]||null;

  fitnessPointCardio.checked=Boolean(saved?.cardio);
  fitnessPointStretch.checked=Boolean(saved?.stretch);

  const machineValue=Math.min(3,Math.max(0,Number(saved?.machines)||0));
  const radio=document.querySelector(`input[name="fitnessPointMachines"][value="${machineValue}"]`);
  if(radio)radio.checked=true;

  const quest=gymQuestById(gymQuestFor(selectedKey,currentUser));
  fitnessPointQuestRow.classList.toggle("hidden",!quest);

  if(quest){
    fitnessPointQuestName.textContent=`${quest.icon} ${quest.name}｜${quest.text}`;
    fitnessPointQuestClear.checked=Boolean(saved?.questClear);
  }else{
    fitnessPointQuestClear.checked=false;
  }

  fitnessPointSavedSnapshot=normalizeSavedFitnessPoint(saved);
  refreshFitnessPointSaveState();
  show(fitnessPointRecordModal);
}
async function saveFitnessPointRecord(){
  if(!fitnessPointTargetKey||!currentUser)return;
  const id=eventId("gym",fitnessPointTargetKey);
  if(!getNames("gym",fitnessPointTargetKey).includes(currentUser)){
    alert("参加登録が確認できないため、POINTを保存できません。");
    return;
  }
  const snapshot=currentFitnessPointSnapshot();
  if(fitnessPointSavedSnapshot&&sameFitnessPointSnapshot(snapshot,fitnessPointSavedSnapshot)){
    saveFitnessPointButton.disabled=true;
    saveFitnessPointButton.textContent="✓ 記録済み";
    return;
  }
  const record={date:fitnessPointTargetKey,attendance:1,...snapshot,updatedAt:new Date().toISOString()};
  saveFitnessPointButton.disabled=true;
  saveFitnessPointButton.textContent="保存中…";
  try{
    await setDoc(eventPath("gym",fitnessPointTargetKey),{
      pointRecords:{[currentUser]:record},
      updatedAt:serverTimestamp()
    },{merge:true});
    attendancePointRecords[id]={...(attendancePointRecords[id]||{}),[currentUser]:record};
    fitnessPointSavedSnapshot={...snapshot};
    hide(fitnessPointRecordModal);
    renderFitnessPointRecordAction();
    try{renderFitnessPointSummary();}catch(pointSummaryError){console.error("fitness point summary render error",pointSummaryError);}
  }catch(error){
    console.error("fitness point save error",error);
    alert("POINTの保存に失敗しました。通信状態を確認してください。");
    refreshFitnessPointSaveState();
  }
}
if(fitnessPointRecordButton)fitnessPointRecordButton.onclick=openFitnessPointRecord;
if(closeFitnessPointRecordModalButton)closeFitnessPointRecordModalButton.onclick=()=>hide(fitnessPointRecordModal);
if(fitnessPointRecordModal)fitnessPointRecordModal.onclick=event=>{if(event.target===fitnessPointRecordModal)hide(fitnessPointRecordModal);};
[fitnessPointCardio,fitnessPointStretch,fitnessPointQuestClear].forEach(el=>{if(el)el.onchange=refreshFitnessPointSaveState;});
document.querySelectorAll('input[name="fitnessPointMachines"]').forEach(el=>el.onchange=refreshFitnessPointSaveState);
if(saveFitnessPointButton)saveFitnessPointButton.onclick=saveFitnessPointRecord;

function updateButtons(){const names=getNames(currentType,selectedKey),joined=currentUser&&names.includes(currentUser);myStatus.textContent=joined?`✅ ${currentUser}さんは参加予定です。`:`${currentUser||"未設定"}さんはまだ参加していません。`;if(currentType==="gym"&&!joined)joinButton.textContent=names.length===0?"🏋️ フィットネス行きたい！":"🏋️ 参加する";else if(currentType==="run")joinButton.textContent="参加する";joinButton.classList.toggle("hidden",joined);cancelButton.classList.toggle("hidden",!joined)}
joinButton.onclick=joinEvent;cancelButton.onclick=cancelEvent;backButton.onclick=()=>{const returnType=currentType;hide(detailView);show(homeView);setType(returnType);requestAnimationFrame(()=>{document.querySelector(".calendar-card")?.scrollIntoView({behavior:"smooth",block:"start"})})};prevMonthButton.onclick=()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--}renderAll()};
nextMonthButton.onclick=()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++}renderAll()};
calendarTitle.onclick=openMonthJump;
closeMonthJumpButton.onclick=()=>hide(monthJumpModal);
cancelMonthJumpButton.onclick=()=>hide(monthJumpModal);
applyMonthJumpButton.onclick=()=>moveToMonth(Number(monthJumpYear.value),Number(monthJumpMonth.value));
monthJumpCurrentButton.onclick=()=>{
  const now=new Date();
  moveToMonth(now.getFullYear(),now.getMonth());
};helpButton.onclick=()=>{hide(mainMenuModal);show(helpModal);};closeHelpButton.onclick=()=>hide(helpModal);
const nextPlanCard=document.getElementById("nextPlanCard");
if(nextPlanCard){
  nextPlanCard.addEventListener("click",openNextPlanInCalendar);
  nextPlanCard.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){event.preventDefault();openNextPlanInCalendar();}
  });
}

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
  returnToAdminMenuAfterSetup=false;
  renderNameButtons();
  setupModalTitle.textContent="👤 ユーザー変更";
  setupModalText.textContent="変更するユーザーを選んでください。";
  closeSetupModalButton.classList.remove("hidden");
  positionMemberModalBelowHeader(setupModal);
  show(setupModal);
};

closeSetupModalButton.onclick=()=>{
  if(!currentUser)return;
  hide(setupModal);
  if(returnToAdminMenuAfterSetup){
    returnToAdminMenuAfterSetup=false;
    show(adminMenuModal);
  }
};
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
function openAdminChildModal(modal){
  hide(adminMenuModal);
  show(modal);
}
function closeAdminChildModal(modal){
  hide(modal);
  show(adminMenuModal);
}
adminChangeUserButton.onclick=()=>{
  userSelectionMode="admin";
  returnToAdminMenuAfterSetup=true;
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
const newMemberKyroCheck=document.getElementById("newMemberKyroCheck");
const newMemberKyroNameRow=document.getElementById("newMemberKyroNameRow");
const newMemberKyroNameInput=document.getElementById("newMemberKyroNameInput");
const newMemberInviteCodeInput=document.getElementById("newMemberInviteCodeInput");
const generateInviteCodeButton=document.getElementById("generateInviteCodeButton");
const addMemberButton=document.getElementById("addMemberButton");
const addMemberError=document.getElementById("addMemberError");
const systemSettingsModal=document.getElementById("systemSettingsModal");
const adminSystemSettingsButton=document.getElementById("adminSystemSettingsButton");
const closeSystemSettingsButton=document.getElementById("closeSystemSettingsButton");
const settingsRunTime=document.getElementById("settingsRunTime");
const settingsRunPlace=document.getElementById("settingsRunPlace");
const settingsRunMapUrl=document.getElementById("settingsRunMapUrl");
const settingsGymTime=document.getElementById("settingsGymTime");
const settingsGymPlace=document.getElementById("settingsGymPlace");
const settingsGymMinParticipants=document.getElementById("settingsGymMinParticipants");
const settingsGymMapUrl=document.getElementById("settingsGymMapUrl");
const settingsGymCalendarUrl=document.getElementById("settingsGymCalendarUrl");
const settingsSeasonActivityVisibility=document.getElementById("settingsSeasonActivityVisibility");
const seasonActivityCard=document.getElementById("seasonActivityCard");
const seasonActivityAdminBadge=document.getElementById("seasonActivityAdminBadge");
const seasonActivityPeriod=document.getElementById("seasonActivityPeriod");
const seasonActivityUserName=document.getElementById("seasonActivityUserName");
const seasonActivityRunCount=document.getElementById("seasonActivityRunCount");
const seasonActivityGymCount=document.getElementById("seasonActivityGymCount");
const seasonActivityModal=document.getElementById("seasonActivityModal");
const closeSeasonActivityModalButton=document.getElementById("closeSeasonActivityModalButton");
const seasonDetailPeriod=document.getElementById("seasonDetailPeriod");
const seasonDetailUserName=document.getElementById("seasonDetailUserName");
const seasonDetailRunCurrent=document.getElementById("seasonDetailRunCurrent");
const seasonDetailRunPrevious=document.getElementById("seasonDetailRunPrevious");
const seasonDetailRunDifference=document.getElementById("seasonDetailRunDifference");
const seasonDetailRunMessage=document.getElementById("seasonDetailRunMessage");
const seasonDetailGymCurrent=document.getElementById("seasonDetailGymCurrent");
const seasonDetailGymPrevious=document.getElementById("seasonDetailGymPrevious");
const seasonDetailGymDifference=document.getElementById("seasonDetailGymDifference");
const seasonDetailGymMessage=document.getElementById("seasonDetailGymMessage");
const seasonDetailTeamMembers=document.getElementById("seasonDetailTeamMembers");
const seasonDetailTeamAverage=document.getElementById("seasonDetailTeamAverage");
const seasonDetailKyroSection=document.getElementById("seasonDetailKyroSection");
const seasonDetailKyroMemberName=document.getElementById("seasonDetailKyroMemberName");
const seasonDetailKyroUserName=document.getElementById("seasonDetailKyroUserName");
const seasonDetailKyroDistance=document.getElementById("seasonDetailKyroDistance");
const seasonDetailKyroRank=document.getElementById("seasonDetailKyroRank");
const seasonDetailKyroRankCard=document.getElementById("seasonDetailKyroRankCard");
const kyroDistanceListModal=document.getElementById("kyroDistanceListModal");
const closeKyroDistanceListButton=document.getElementById("closeKyroDistanceListButton");
const kyroDistanceList=document.getElementById("kyroDistanceList");
const seasonDetailKyroUpdated=document.getElementById("seasonDetailKyroUpdated");
const seasonDetailPreviousButton=document.getElementById("seasonDetailPreviousButton");
const seasonDetailNextButton=document.getElementById("seasonDetailNextButton");
const seasonDetailNavigationLabel=document.getElementById("seasonDetailNavigationLabel");
const saveSystemSettingsButton=document.getElementById("saveSystemSettingsButton");
const systemSettingsError=document.getElementById("systemSettingsError");
const memberOverviewModal=document.getElementById("memberOverviewModal");
const closeMemberOverviewButton=document.getElementById("closeMemberOverviewButton");
const memberOverviewSummary=document.getElementById("memberOverviewSummary");
const memberOverviewList=document.getElementById("memberOverviewList");
const memberOverviewMonthSelect=document.getElementById("memberOverviewMonthSelect");
const memberProfileModal=document.getElementById("memberProfileModal");
const closeMemberProfileButton=document.getElementById("closeMemberProfileButton");
const memberProfileContent=document.getElementById("memberProfileContent");
const editOwnProfileButton=document.getElementById("editOwnProfileButton");
const memberProfileEditModal=document.getElementById("memberProfileEditModal");
const closeMemberProfileEditButton=document.getElementById("closeMemberProfileEditButton");
const profileNicknameInput=document.getElementById("profileNicknameInput");
const profileIntroductionInput=document.getElementById("profileIntroductionInput");
const profileDepartmentInput=document.getElementById("profileDepartmentInput");
const profileHobbiesInput=document.getElementById("profileHobbiesInput");
const profileRunningHistoryInput=document.getElementById("profileRunningHistoryInput");
const profileBestTimeInput=document.getElementById("profileBestTimeInput");
const profileGoalInput=document.getElementById("profileGoalInput");
const profileEditError=document.getElementById("profileEditError");
const saveProfileButton=document.getElementById("saveProfileButton");
const mainMenuButton=document.getElementById("mainMenuButton");
const mainMenuModal=document.getElementById("mainMenuModal");
const closeMainMenuButton=document.getElementById("closeMainMenuButton");
const openKyroPageButton=document.getElementById("openKyroPageButton");
const kyroMiniCard=document.getElementById("kyroMiniCard");
const kyroMiniStatus=document.getElementById("kyroMiniStatus");
const kyroMiniUpdated=document.getElementById("kyroMiniUpdated");
const kyroMiniJapanRank=document.getElementById("kyroMiniJapanRank");
const kyroMiniArea=document.getElementById("kyroMiniArea");
const kyroPageModal=document.getElementById("kyroPageModal");
const closeKyroPageButton=document.getElementById("closeKyroPageButton");
const kyroMemberCount=document.getElementById("kyroMemberCount");
const kyroMemberCountButton=document.getElementById("kyroMemberCountButton");
const kyroArea=document.getElementById("kyroArea");
const kyroJapanRank=document.getElementById("kyroJapanRank");
const kyroAichiRank=document.getElementById("kyroAichiRank");
const kyroNews=document.getElementById("kyroNews");
const kyroGoal=document.getElementById("kyroGoal");
const kyroMemberList=document.getElementById("kyroMemberList");
const kyroUpdatedAt=document.getElementById("kyroUpdatedAt");
const adminKyroManageButton=document.getElementById("adminKyroManageButton");
const adminKyroModal=document.getElementById("adminKyroModal");
const closeAdminKyroButton=document.getElementById("closeAdminKyroButton");
const kyroAreaInput=document.getElementById("kyroAreaInput");
const kyroJapanRankInput=document.getElementById("kyroJapanRankInput");
const kyroAichiRankInput=document.getElementById("kyroAichiRankInput");
const kyroNewsInput=document.getElementById("kyroNewsInput");
const kyroGoalInput=document.getElementById("kyroGoalInput");
const saveKyroInfoButton=document.getElementById("saveKyroInfoButton");
const adminKyroImportButton=document.getElementById("adminKyroImportButton");
const adminKyroImportModal=document.getElementById("adminKyroImportModal");
const closeAdminKyroImportButton=document.getElementById("closeAdminKyroImportButton");
const kyroImportDateInput=document.getElementById("kyroImportDateInput");
const kyroImportTextInput=document.getElementById("kyroImportTextInput");
const copyKyroAiPromptButton=document.getElementById("copyKyroAiPromptButton");
const previewKyroImportButton=document.getElementById("previewKyroImportButton");
const applyKyroImportButton=document.getElementById("applyKyroImportButton");
const kyroImportError=document.getElementById("kyroImportError");
const kyroImportSummary=document.getElementById("kyroImportSummary");
const kyroImportPreview=document.getElementById("kyroImportPreview");
let kyroImportPrepared=null;

const recommendationsModal=document.getElementById("recommendationsModal");
const openRecommendationsButton=document.getElementById("openRecommendationsButton");
const openMessageBoardFromMenuButton=document.getElementById("openMessageBoardFromMenuButton");
const refreshPortalFromMenuButton=document.getElementById("refreshPortalFromMenuButton");
const openAdminFromMainMenuButton=document.getElementById("openAdminFromMainMenuButton");
const closeRecommendationsButton=document.getElementById("closeRecommendationsButton");
const recommendationCategoryFilter=document.getElementById("recommendationCategoryFilter");
const recommendationNewestButton=document.getElementById("recommendationNewestButton");
const recommendationPopularButton=document.getElementById("recommendationPopularButton");
const openRecommendationFormButton=document.getElementById("openRecommendationFormButton");
const recommendationFormBox=document.getElementById("recommendationFormBox");
const recommendationFormTitle=document.getElementById("recommendationFormTitle");
const recommendationCategoryInput=document.getElementById("recommendationCategoryInput");
const recommendationTitleInput=document.getElementById("recommendationTitleInput");
const recommendationCommentInput=document.getElementById("recommendationCommentInput");
const recommendationLocationInput=document.getElementById("recommendationLocationInput");
const recommendationUrlInput=document.getElementById("recommendationUrlInput");
const recommendationFormError=document.getElementById("recommendationFormError");
const saveRecommendationButton=document.getElementById("saveRecommendationButton");
const cancelRecommendationFormButton=document.getElementById("cancelRecommendationFormButton");
const recommendationsSummary=document.getElementById("recommendationsSummary");
const recommendationsList=document.getElementById("recommendationsList");
const recommendationCategoryLabels={course:"🏃 コース・運動",cafe:"☕ カフェ・グルメ",event:"🏆 大会・イベント",goods:"👟 グッズ・用品",kyro:"🗺 KYRO",relax:"♨ 温泉・リラックス",season:"🌸 季節",other:"💡 その他"};

function recommendationDateValue(value){
  if(value&&typeof value.toDate==="function")return value.toDate();
  if(value instanceof Date)return value;
  if(typeof value==="string"||typeof value==="number"){
    const date=new Date(value);if(!Number.isNaN(date.getTime()))return date;
  }
  return new Date(0);
}
function recommendationDateLabel(value){
  const date=recommendationDateValue(value);
  if(!date.getTime())return "投稿直後";
  return `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,"0")}/${String(date.getDate()).padStart(2,"0")}`;
}
function currentMemberRecord(){return memberRecords.find(member=>member.name===currentUser&&member.active!==false)||null;}
function isCurrentAdmin(){const member=currentMemberRecord();return !!(member&&member.admin===true);}
function safeRecommendationUrl(value){
  const text=String(value||"").trim();if(!text)return "";
  try{const url=new URL(text);return ["http:","https:"].includes(url.protocol)?url.href:"";}catch{return "";}
}
function resetRecommendationForm(){
  editingRecommendationId=null;
  recommendationFormTitle.textContent="＋ おすすめを投稿";
  saveRecommendationButton.textContent="投稿する";
  recommendationCategoryInput.value="course";
  recommendationTitleInput.value="";recommendationCommentInput.value="";recommendationLocationInput.value="";recommendationUrlInput.value="";
  recommendationFormError.classList.add("hidden");
}
function closeRecommendationForm(){resetRecommendationForm();recommendationFormBox.classList.add("hidden");openRecommendationFormButton.classList.remove("hidden");}
function openRecommendationForm(record=null){
  if(!currentUser){alert("最初に自分の名前を選択してください。");return;}
  recommendationFormError.classList.add("hidden");
  if(record){
    editingRecommendationId=record.id;recommendationFormTitle.textContent="✏️ おすすめを編集";saveRecommendationButton.textContent="更新する";
    recommendationCategoryInput.value=record.category||"other";recommendationTitleInput.value=record.title||"";recommendationCommentInput.value=record.comment||"";recommendationLocationInput.value=record.location||"";recommendationUrlInput.value=record.url||"";
  }else resetRecommendationForm();
  recommendationFormBox.classList.remove("hidden");openRecommendationFormButton.classList.add("hidden");
  setTimeout(()=>recommendationTitleInput.focus(),50);
}
function renderRecommendationPreview(){
  const preview=document.getElementById("recommendationMiniPreview");
  const card=document.getElementById("recommendationMiniCard");
  const title=document.getElementById("recommendationMiniTitle");
  const moreIndicator=document.getElementById("recommendationMoreIndicator");
  if(!preview||!card)return;
  const list=[...recommendationRecords].sort((a,b)=>recommendationDateValue(b.createdAt).getTime()-recommendationDateValue(a.createdAt).getTime());
  if(title)title.textContent=`⭐ みんなのおすすめ（${list.length}件）`;
  if(moreIndicator)moreIndicator.classList.toggle("hidden",list.length<=3);
  if(!list.length){
    preview.className="recommendation-mini-preview recommendation-mini-empty";
    preview.textContent="おすすめ情報を投稿してみよう";
    card.classList.add("is-empty");
    card.setAttribute("aria-label","みんなのおすすめ 0件を開く");
    return;
  }
  preview.className="recommendation-mini-preview recommendation-mini-list";
  preview.innerHTML=list.slice(0,3).map(record=>{
    const likes=Array.isArray(record.likes)?record.likes.length:0;
    const category=recommendationCategoryLabels[record.category]||recommendationCategoryLabels.other;
    return `<span class="recommendation-mini-item"><span class="recommendation-mini-item-title">${escapeHtml(category)} ${escapeHtml(record.title||"")}</span><span class="recommendation-mini-likes">👍 ${likes}</span></span>`;
  }).join("");
  card.classList.remove("is-empty");
  card.setAttribute("aria-label",`みんなのおすすめ ${list.length}件を開く`);
}

function renderRecommendations(){
  if(!recommendationsList)return;
  let list=recommendationRecords.filter(record=>recommendationCategory==="all"||record.category===recommendationCategory);
  list.sort((a,b)=>{
    const likeDiff=(Array.isArray(b.likes)?b.likes.length:0)-(Array.isArray(a.likes)?a.likes.length:0);
    const dateDiff=recommendationDateValue(b.createdAt).getTime()-recommendationDateValue(a.createdAt).getTime();
    return recommendationSort==="popular"?(likeDiff||dateDiff):dateDiff;
  });
  recommendationNewestButton.classList.toggle("active",recommendationSort==="newest");
  recommendationPopularButton.classList.toggle("active",recommendationSort==="popular");
  recommendationsSummary.textContent=`${list.length}件を${recommendationSort==="popular"?"人気順":"新着順"}で表示`;
  if(!list.length){recommendationsList.innerHTML='<div class="recommendations-empty">おすすめはまだありません。</div>';return;}
  recommendationsList.innerHTML=list.map(record=>{
    const likes=Array.isArray(record.likes)?record.likes:[];
    const liked=currentUser&&likes.includes(currentUser);
    const own=currentUser&&record.authorName===currentUser;
    const canDelete=own||isCurrentAdmin();
    const url=safeRecommendationUrl(record.url);
    return `<article class="recommendation-card" data-recommendation-id="${escapeHtml(record.id)}">
      <div class="recommendation-card-head"><div><div class="recommendation-category">${escapeHtml(recommendationCategoryLabels[record.category]||recommendationCategoryLabels.other)}</div><div class="recommendation-title">${escapeHtml(record.title||"")}</div></div></div>
      <div class="recommendation-comment">${escapeHtml(record.comment||"")}</div>
      ${record.location?`<div class="recommendation-location">📍 ${escapeHtml(record.location)}</div>`:""}
      ${url?`<a class="recommendation-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">🔗 リンクを開く</a>`:""}
      <div class="recommendation-meta">😊 ${escapeHtml(record.authorName||"メンバー")} ・ ${recommendationDateLabel(record.createdAt)}</div>
      <div class="recommendation-card-actions"><button class="recommendation-like-button ${liked?"liked":""}" type="button" data-action="like">👍 いいね ${likes.length}</button>
      ${(own||canDelete)?`<div class="recommendation-owner-actions">${own?'<button type="button" data-action="edit">編集</button>':""}${canDelete?'<button class="danger" type="button" data-action="delete">削除</button>':""}</div>`:""}</div>
    </article>`;
  }).join("");
}
async function saveRecommendation(){
  const member=currentMemberRecord();
  const title=recommendationTitleInput.value.trim(),comment=recommendationCommentInput.value.trim();
  if(!member||!title||!comment){recommendationFormError.classList.remove("hidden");return;}
  const urlText=recommendationUrlInput.value.trim();
  if(urlText&&!safeRecommendationUrl(urlText)){recommendationFormError.textContent="リンクは http:// または https:// で始まるURLを入力してください。";recommendationFormError.classList.remove("hidden");return;}
  recommendationFormError.textContent="現在のユーザー、タイトル、コメントを確認してください。";
  const ownCount=recommendationRecords.filter(record=>record.authorName===currentUser).length;
  if(!editingRecommendationId&&ownCount>=20){alert("投稿は1人20件までです。不要な投稿を削除してから追加してください。");return;}
  const fields={category:recommendationCategoryInput.value,title,comment,location:recommendationLocationInput.value.trim(),url:urlText,updatedAt:serverTimestamp()};
  try{
    if(editingRecommendationId){
      const record=recommendationRecords.find(item=>item.id===editingRecommendationId);
      if(!record||record.authorName!==currentUser){alert("自分の投稿だけ編集できます。");return;}
      await updateDoc(doc(db,"recommendations",editingRecommendationId),fields);
    }else{
      await addDoc(collection(db,"recommendations"),{...fields,authorId:member.id,authorName:member.name,createdAt:serverTimestamp(),likes:[]});
    }
    closeRecommendationForm();
  }catch(error){console.error(error);alert("保存できませんでした。Firestoreルールを確認してください。");}
}
async function toggleRecommendationLike(record){
  if(!currentUser){alert("最初に自分の名前を選択してください。");return;}
  const likes=Array.isArray(record.likes)?record.likes:[];
  try{await updateDoc(doc(db,"recommendations",record.id),{likes:likes.includes(currentUser)?arrayRemove(currentUser):arrayUnion(currentUser),updatedAt:serverTimestamp()});}
  catch(error){console.error(error);alert("いいねを更新できませんでした。Firestoreルールを確認してください。");}
}
async function removeRecommendation(record){
  const own=currentUser&&record.authorName===currentUser;
  if(!own&&!isCurrentAdmin())return;
  if(!confirm(`「${record.title||"この投稿"}」を削除しますか？`))return;
  try{await deleteDoc(doc(db,"recommendations",record.id));if(editingRecommendationId===record.id)closeRecommendationForm();}
  catch(error){console.error(error);alert("削除できませんでした。Firestoreルールを確認してください。");}
}
function openRecommendations(){hide(mainMenuModal);recommendationCategory="all";recommendationCategoryFilter.value="all";recommendationSort="newest";closeRecommendationForm();renderRecommendations();show(recommendationsModal);}

let selectedProfileMember=null;
if(closeMemberProfileButton)closeMemberProfileButton.onclick=()=>{hide(memberProfileModal);show(memberOverviewModal);};
if(editOwnProfileButton)editOwnProfileButton.onclick=openOwnProfileEditor;
if(closeMemberProfileEditButton)closeMemberProfileEditButton.onclick=()=>hide(memberProfileEditModal);
if(saveProfileButton)saveProfileButton.onclick=saveOwnProfile;
if(mainMenuButton)mainMenuButton.onclick=()=>{
  if(openAdminFromMainMenuButton)openAdminFromMainMenuButton.classList.toggle("hidden",!isCurrentAdmin());
  show(mainMenuModal);
};
if(openRecommendationsButton)openRecommendationsButton.onclick=openRecommendations;
const recommendationMiniCard=document.getElementById("recommendationMiniCard");
if(recommendationMiniCard)recommendationMiniCard.onclick=openRecommendations;
if(openMessageBoardFromMenuButton)openMessageBoardFromMenuButton.onclick=()=>{hide(mainMenuModal);renderMessageBoard();show(messageBoardModal);};
let portalRefreshInProgress=false;
async function runPortalRefresh(){
  if(portalRefreshInProgress)return;
  portalRefreshInProgress=true;
  const buttons=[refreshPortalTopButton,refreshPortalFromMenuButton].filter(Boolean);
  const defaultLabel=uiT("refreshLatest","最新版に更新");
  buttons.forEach(button=>{button.disabled=true;button.textContent=`🔄 ${uiT("refreshing","最新情報を取得中...")}`;});
  try{
    await refreshPortalDataFromServer();
    buttons.forEach(button=>button.textContent=`✅ ${uiT("refreshDone","最新情報に更新しました")}`);
  }catch(error){
    console.error("manual refresh error",error);
    buttons.forEach(button=>button.textContent=`⚠️ ${uiT("refreshFailed","更新できませんでした")}`);
  }finally{
    window.setTimeout(()=>{
      buttons.forEach(button=>{button.disabled=false;button.textContent=`🔄 ${defaultLabel}`;});
      portalRefreshInProgress=false;
    },900);
  }
}
if(refreshPortalFromMenuButton)refreshPortalFromMenuButton.onclick=runPortalRefresh;
if(refreshPortalTopButton)refreshPortalTopButton.onclick=runPortalRefresh;
if(openAdminFromMainMenuButton)openAdminFromMainMenuButton.onclick=()=>{hide(mainMenuModal);openAdminPin();};
if(closeRecommendationsButton)closeRecommendationsButton.onclick=()=>{closeRecommendationForm();hide(recommendationsModal);};
if(openRecommendationFormButton)openRecommendationFormButton.onclick=()=>openRecommendationForm();
if(cancelRecommendationFormButton)cancelRecommendationFormButton.onclick=closeRecommendationForm;
if(saveRecommendationButton)saveRecommendationButton.onclick=saveRecommendation;
if(recommendationCategoryFilter)recommendationCategoryFilter.onchange=()=>{recommendationCategory=recommendationCategoryFilter.value;renderRecommendations();};
if(recommendationNewestButton)recommendationNewestButton.onclick=()=>{recommendationSort="newest";renderRecommendations();};
if(recommendationPopularButton)recommendationPopularButton.onclick=()=>{recommendationSort="popular";renderRecommendations();};
if(recommendationsList)recommendationsList.addEventListener("click",event=>{
  const button=event.target.closest("button[data-action]");if(!button)return;
  const card=button.closest("[data-recommendation-id]");const record=recommendationRecords.find(item=>item.id===card?.dataset.recommendationId);if(!record)return;
  if(button.dataset.action==="like")toggleRecommendationLike(record);
  else if(button.dataset.action==="edit")openRecommendationForm(record);
  else if(button.dataset.action==="delete")removeRecommendation(record);
});

if(closeMainMenuButton)closeMainMenuButton.onclick=()=>hide(mainMenuModal);
if(openKyroPageButton)openKyroPageButton.onclick=openKyroPage;
if(kyroMiniCard)kyroMiniCard.onclick=openKyroPage;
if(closeKyroPageButton)closeKyroPageButton.onclick=()=>hide(kyroPageModal);
if(adminKyroManageButton)adminKyroManageButton.onclick=openAdminKyro;
if(closeAdminKyroButton)closeAdminKyroButton.onclick=()=>closeAdminChildModal(adminKyroModal);
if(saveKyroInfoButton)saveKyroInfoButton.onclick=saveKyroInfo;
if(adminKyroImportButton)adminKyroImportButton.onclick=openKyroImport;
if(closeAdminKyroImportButton)closeAdminKyroImportButton.onclick=()=>closeAdminChildModal(adminKyroImportModal);
if(copyKyroAiPromptButton)copyKyroAiPromptButton.onclick=copyKyroAiPrompt;
if(previewKyroImportButton)previewKyroImportButton.onclick=renderKyroImportPreview;
if(applyKyroImportButton)applyKyroImportButton.onclick=applyKyroImport;
const dashboardMemberCount=document.getElementById("dashboardMemberCount");
const dashboardRunCount=document.getElementById("dashboardRunCount");
const dashboardGymCount=document.getElementById("dashboardGymCount");

const dashboardMembersButton=document.getElementById("dashboardMembersButton");
const dashboardRunButton=document.getElementById("dashboardRunButton");
const dashboardGymButton=document.getElementById("dashboardGymButton");

const announcementCard=document.getElementById("announcementCard");
const announcementList=document.getElementById("announcementList");
const announcementPublicModal=document.getElementById("announcementPublicModal");
const announcementPublicModalTitle=document.getElementById("announcementPublicModalTitle");
const announcementPublicList=document.getElementById("announcementPublicList");
const closeAnnouncementPublicButton=document.getElementById("closeAnnouncementPublicButton");
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
const messageBoardCard=document.getElementById("messageBoardCard");
const closeMessageBoardButton=document.getElementById("closeMessageBoardButton");
const postMessageBoardButton=document.getElementById("postMessageBoardButton");

// Ver.1.9.0zxe: トップのお知らせは見出しのみ。カード全体から全件モーダルを開く。
function openAnnouncementPublicModal(){
  renderAnnouncementsModal();
  show(announcementPublicModal);
}
if(announcementCard){
  announcementCard.onclick=openAnnouncementPublicModal;
  announcementCard.onkeydown=e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      openAnnouncementPublicModal();
    }
  };
}
if(closeAnnouncementPublicButton)closeAnnouncementPublicButton.onclick=()=>hide(announcementPublicModal);

// Ver.1.3.0k: bind message-board controls only after their DOM references are initialized.
if(messageBoardCard)messageBoardCard.onclick=()=>{renderMessageBoard();show(messageBoardModal);};
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







let seasonDetailOffset=0;

function currentSeasonInfo(referenceDate=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(referenceDate);
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  const year=Number(values.year);
  const month=Number(values.month);
  if(month>=4&&month<=9){
    return {label:`${year}年度 上期`,start:`${year}-04-01`,end:`${year}-09-30`};
  }
  const fiscalYear=month>=10?year:year-1;
  return {label:`${fiscalYear}年度 下期`,start:`${fiscalYear}-10-01`,end:`${fiscalYear+1}-03-31`};
}

function shiftSeasonInfo(season,offset){
  const [year,month]=season.start.split("-").map(Number);
  const startDate=new Date(year,month-1+offset*6,1,12,0,0);
  return currentSeasonInfo(startDate);
}

function seasonComparisonPresentation(current,previous){
  const difference=current-previous;
  if(difference>0){
    return {className:"increase",difference:`＋${difference}回 ↑`,message:`✨ 前期より${difference}回増えました！`};
  }
  if(difference===0){
    return {className:"same",difference:"変わらず",message:"😊 今期も同じペースです"};
  }
  return {className:"decrease",difference:`${difference}回`,message:`前期 ${previous}回`};
}

function applySeasonComparison(element,messageElement,current,previous){
  const presentation=seasonComparisonPresentation(current,previous);
  element.className=`season-detail-difference ${presentation.className}`;
  element.textContent=presentation.difference;
  messageElement.className=`season-detail-message ${presentation.className}`;
  messageElement.textContent=presentation.message;
}

function seasonCompletedRunIds(season){
  const todayKey=todayKeyJST();
  return eventRecords
    .filter(event=>event.type==="run"&&event.status!=="cancelled"&&event.date>=season.start&&event.date<=season.end&&event.date<todayKey)
    .map(event=>eventId("run",event.date));
}

function seasonCompletedGymIds(season){
  const todayKey=todayKeyJST();
  return Object.keys(attendance).filter(id=>{
    if(!id.startsWith("gym_"))return false;
    const dateKey=id.slice(4);
    const participants=attendance[id];
    return dateKey>=season.start&&dateKey<=season.end&&dateKey<todayKey&&Array.isArray(participants)&&participants.length>0;
  });
}

function seasonActivityStats(season){
  const runIds=[...new Set(seasonCompletedRunIds(season))];
  const gymIds=[...new Set(seasonCompletedGymIds(season))];
  const countFor=(ids,name)=>ids.reduce((count,id)=>count+(Array.isArray(attendance[id])&&attendance[id].includes(name)?1:0),0);
  const participantTotals=new Map();
  [...runIds,...gymIds].forEach(id=>{
    const uniqueNames=[...new Set(Array.isArray(attendance[id])?attendance[id]:[])];
    uniqueNames.forEach(name=>participantTotals.set(name,(participantTotals.get(name)||0)+1));
  });
  const teamMembers=participantTotals.size;
  const teamTotal=[...participantTotals.values()].reduce((sum,value)=>sum+value,0);
  return {
    runCount:currentUser?countFor(runIds,currentUser):0,
    gymCount:currentUser?countFor(gymIds,currentUser):0,
    teamMembers,
    teamAverage:teamMembers>0?teamTotal/teamMembers:0
  };
}

function renderSeasonActivity(){
  if(!seasonActivityCard)return;
  const visibility=systemSettings.features?.seasonActivityVisibility||"admin";
  const admin=isCurrentAdmin();
  const canView=visibility==="public"||admin;
  seasonActivityCard.classList.toggle("hidden",!canView);
  if(!canView){
    if(seasonActivityModal)hide(seasonActivityModal);
    return;
  }

  const season=currentSeasonInfo();
  const stats=seasonActivityStats(season);
  seasonActivityAdminBadge.classList.toggle("hidden",visibility!=="admin");
  seasonActivityPeriod.textContent=`${season.label}（${season.start.replaceAll("-","/")}～${season.end.replaceAll("-","/")}）`;
  const seasonCountHtml=(count)=>{
    const safeCount=Number.isFinite(Number(count))?Number(count):0;
    const compactClass=Math.abs(safeCount)>=10?" season-count-number-compact":"";
    return `<span class="season-count-number${compactClass}">${safeCount}</span><span class="season-count-unit">回</span>`;
  };
  seasonActivityRunCount.innerHTML=seasonCountHtml(stats.runCount);
  seasonActivityGymCount.innerHTML=seasonCountHtml(stats.gymCount);
  if(seasonActivityModal&&!seasonActivityModal.classList.contains("hidden"))renderSeasonActivityDetail();
}

function renderSeasonActivityDetail(){
  const currentBase=currentSeasonInfo();
  const selectedSeason=shiftSeasonInfo(currentBase,seasonDetailOffset);
  const previousSeason=shiftSeasonInfo(selectedSeason,-1);
  const currentStats=seasonActivityStats(selectedSeason);
  const previousStats=seasonActivityStats(previousSeason);
  seasonDetailPeriod.textContent=`${selectedSeason.label}（${selectedSeason.start.replaceAll("-","/")}～${selectedSeason.end.replaceAll("-","/")}）`;
  seasonDetailNavigationLabel.textContent=selectedSeason.label;
  seasonDetailUserName.textContent=currentUser||"ユーザー未選択";
  seasonDetailRunCurrent.textContent=`${currentStats.runCount}回`;
  seasonDetailRunPrevious.textContent=`${previousStats.runCount}回`;
  seasonDetailGymCurrent.textContent=`${currentStats.gymCount}回`;
  seasonDetailGymPrevious.textContent=`${previousStats.gymCount}回`;
  applySeasonComparison(seasonDetailRunDifference,seasonDetailRunMessage,currentStats.runCount,previousStats.runCount);
  applySeasonComparison(seasonDetailGymDifference,seasonDetailGymMessage,currentStats.gymCount,previousStats.gymCount);
  seasonDetailTeamMembers.textContent=`${currentStats.teamMembers}人`;
  seasonDetailTeamAverage.textContent=`${currentStats.teamAverage.toFixed(1)}回`;
  seasonDetailNextButton.disabled=seasonDetailOffset>=0;
}

function openSeasonActivityDetail(){
  seasonDetailOffset=0;
  renderSeasonActivityDetail();
  show(seasonActivityModal);
}

function applySystemSettingsToInputs(){
  if(!settingsRunTime)return;
  settingsRunTime.value=systemSettings.run.time;
  settingsRunPlace.value=systemSettings.run.place;
  settingsRunMapUrl.value=systemSettings.run.mapUrl||"";
  settingsGymTime.value=systemSettings.gym.time;
  settingsGymPlace.value=systemSettings.gym.place;
  settingsGymMinParticipants.value=String(systemSettings.gym.minParticipants);
  settingsGymMapUrl.value=systemSettings.gym.mapUrl||"";
  settingsGymCalendarUrl.value=systemSettings.gym.calendarUrl||"";
  if(settingsSeasonActivityVisibility){
    settingsSeasonActivityVisibility.value=systemSettings.features?.seasonActivityVisibility||"admin";
  }
}

async function saveSystemSettings(){
  const runTime=settingsRunTime.value||"19:00";
  const runPlace=settingsRunPlace.value.trim();
  const runMapUrl=settingsRunMapUrl.value.trim();
  const gymTime=settingsGymTime.value||"19:00";
  const gymPlace=settingsGymPlace.value.trim();
  const minParticipants=Number(settingsGymMinParticipants.value);
  const gymMapUrl=settingsGymMapUrl.value.trim();
  const calendarUrl=settingsGymCalendarUrl.value.trim();
  const seasonActivityVisibility=settingsSeasonActivityVisibility?.value==="public"?"public":"admin";

  if(!runPlace||!gymPlace||!Number.isInteger(minParticipants)||minParticipants<1||(runMapUrl&&!/^https?:\/\//i.test(runMapUrl))||(gymMapUrl&&!/^https?:\/\//i.test(gymMapUrl))||(calendarUrl&&!/^https?:\/\//i.test(calendarUrl))){
    systemSettingsError.classList.remove("hidden");
    return;
  }
  systemSettingsError.classList.add("hidden");

  try{
    await setDoc(doc(db,"settings","system"),{
      run:{time:runTime,place:runPlace,mapUrl:runMapUrl},
      gym:{time:gymTime,place:gymPlace,minParticipants,mapUrl:gymMapUrl,calendarUrl},
      features:{seasonActivityVisibility},
      updatedAt:serverTimestamp()
    },{merge:true});
    closeAdminChildModal(systemSettingsModal);
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
function formatMessageBoardPeriod(createdAt,expiresAt){
  const startTime=messageBoardDateValue(createdAt);
  if(!startTime)return "";
  const start=new Date(startTime);
  const endTime=messageBoardDateValue(expiresAt);
  if(!endTime)return `${start.getMonth()+1}/${start.getDate()}`;
  const end=new Date(endTime);
  end.setDate(end.getDate()-1);
  return `${start.getMonth()+1}/${start.getDate()}～${end.getMonth()+1}/${end.getDate()}`;
}
function buildMessageBoardItem(item,allowDelete){
  const wrapper=document.createElement("article");
  wrapper.className="message-board-item";
  const head=document.createElement("div");
  head.className="message-board-item-head";
  const author=document.createElement("strong");
  author.textContent=item.authorName||uiT("memberGeneric","メンバー");
  const date=document.createElement("span");
  date.textContent=formatMessageBoardPeriod(item.createdAt,item.expiresAt);
  head.append(author,date);
  const body=document.createElement("div");
  body.className="message-board-item-body";
  body.textContent=item.text||"";
  wrapper.append(head,body);
  if(allowDelete){
    const button=document.createElement("button");
    button.type="button";
    button.className="message-board-delete-button";
    button.textContent=uiT("delete","削除");
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
    if(active.length===0){preview.className="message-board-empty";preview.textContent=uiT("noMessages","伝言はまだありません。");}
    else{preview.className="message-board-preview";active.slice(0,3).forEach(item=>preview.appendChild(buildMessageBoardItem(item,false)));}
  }
  if(list){
    list.innerHTML="";
    if(active.length===0){const empty=document.createElement("div");empty.className="message-board-empty";empty.textContent=uiT("noMessages","伝言はまだありません。");list.appendChild(empty);}
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
  }catch(e){console.error(e);alert(uiT("messagePostFailed","伝言の投稿に失敗しました。Firestoreルールを確認してください。"));}
}
async function deleteMessageBoardPost(item){
  const allowed=currentUserIsAdmin()||(item.authorName&&item.authorName===currentUser)||(item.authorId&&item.authorId===currentMemberRecord()?.id);
  if(!allowed||!confirm(uiT("confirmDeleteMessage","この伝言を削除しますか？")))return;
  try{await deleteDoc(doc(db,"messageBoard",item.id));}catch(e){console.error(e);alert(uiT("messageDeleteFailed","伝言の削除に失敗しました。"));}
}

function announcementReadStorageKey(){
  return `srcAnnouncementReads:${currentUser||"guest"}`;
}

function announcementVersionKey(record){
  const value=record?.updatedAt||record?.createdAt||null;
  if(value&&typeof value.toMillis==="function")return String(value.toMillis());
  if(value&&typeof value.seconds==="number")return `${value.seconds}:${value.nanoseconds||0}`;
  if(value instanceof Date)return String(value.getTime());
  if(typeof value==="string"||typeof value==="number")return String(value);
  return "0";
}

function loadAnnouncementReadState(){
  try{
    const raw=localStorage.getItem(announcementReadStorageKey());
    if(!raw)return {};
    const parsed=JSON.parse(raw);
    if(Array.isArray(parsed)){
      // 旧形式（ID配列）は現在版を読んだ扱いに移行。
      const migrated={};
      parsed.forEach(id=>{
        const record=announcementRecords.find(item=>item.id===id);
        if(record)migrated[id]=announcementVersionKey(record);
      });
      return migrated;
    }
    return parsed&&typeof parsed==="object"?parsed:{};
  }catch(error){
    console.warn("announcement read state load error",error);
    return {};
  }
}

function saveAnnouncementReadState(state){
  try{
    localStorage.setItem(announcementReadStorageKey(),JSON.stringify(state||{}));
  }catch(error){
    console.warn("announcement read state save error",error);
  }
}

function cleanupAnnouncementReadState(){
  const state=loadAnnouncementReadState();
  const activeIds=new Set(announcementRecords.map(record=>record.id));
  let changed=false;
  Object.keys(state).forEach(id=>{
    if(!activeIds.has(id)){
      delete state[id];
      changed=true;
    }
  });
  if(changed)saveAnnouncementReadState(state);
}

function isAnnouncementRead(record){
  if(!record?.id)return true;
  const state=loadAnnouncementReadState();
  return state[record.id]===announcementVersionKey(record);
}

function markAnnouncementRead(record){
  if(!record?.id||!currentUser)return;
  const state=loadAnnouncementReadState();
  state[record.id]=announcementVersionKey(record);
  saveAnnouncementReadState(state);
}

function getReadAnnouncementIds(){
  try{
    const value=JSON.parse(localStorage.getItem(announcementReadStorageKey())||"[]");
    return Array.isArray(value)?value.filter(id=>typeof id==="string"):[];
  }catch{
    return [];
  }
}

function saveReadAnnouncementIds(ids){
  try{
    localStorage.setItem(announcementReadStorageKey(),JSON.stringify([...new Set(ids)]));
  }catch(error){
    console.warn("announcement read state save failed",error);
  }
}

function cleanupReadAnnouncementIds(active){
  const valid=new Set((active||[]).map(a=>a.id));
  const cleaned=getReadAnnouncementIds().filter(id=>valid.has(id));
  saveReadAnnouncementIds(cleaned);
  return cleaned;
}

function markAnnouncementRead(id){
  if(!id)return;
  const ids=getReadAnnouncementIds();
  if(!ids.includes(id)){
    ids.push(id);
    saveReadAnnouncementIds(ids);
  }
  renderAnnouncementsPublic();
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
  const readIds=cleanupReadAnnouncementIds(active);
  const readSet=new Set(readIds);
  const unreadCount=active.filter(a=>!readSet.has(a.id)).length;

  if(heading)heading.textContent=`📢 ${uiT("announcements","お知らせ")}`;

  announcementList.className="announcement-card-status";
  if(active.length===0){
    announcementList.textContent=uiT("noAnnouncements","現在のお知らせはありません。");
    announcementCard?.classList.remove("has-unread");
    announcementCard?.classList.add("all-read");
    announcementCard?.setAttribute("aria-label",uiT("announcements","お知らせ"));
    return;
  }

  if(unreadCount>0){
    announcementList.innerHTML=`${active.length}${uiT("itemsSuffix","件")}　<span class="announcement-unread-count">🟠 未読 ${unreadCount}${uiT("itemsSuffix","件")}</span>`;
    announcementCard?.classList.add("has-unread");
    announcementCard?.classList.remove("all-read");
  }else{
    announcementList.innerHTML=`${active.length}${uiT("itemsSuffix","件")}　<span class="announcement-read-complete">✓ 未読なし</span>`;
    announcementCard?.classList.remove("has-unread");
    announcementCard?.classList.add("all-read");
  }

  announcementCard?.setAttribute(
    "aria-label",
    `${uiT("announcements","お知らせ")} ${active.length}${uiT("itemsSuffix","件")}、${unreadCount?`未読${unreadCount}${uiT("itemsSuffix","件")}`:"未読なし"}`
  );
}

function renderAnnouncementsModal(){
  if(!announcementPublicList)return;

  const active=announcementRecords.filter(a=>a.enabled);
  const readSet=new Set(cleanupReadAnnouncementIds(active));
  const unreadCount=active.filter(a=>!readSet.has(a.id)).length;

  if(announcementPublicModalTitle){
    announcementPublicModalTitle.textContent=`📢 ${uiT("announcements","お知らせ")}（${active.length}${uiT("itemsSuffix","件")} / 未読${unreadCount}${uiT("itemsSuffix","件")}）`;
  }
  announcementPublicList.innerHTML="";

  if(active.length===0){
    const empty=document.createElement("div");
    empty.className="announcement-public-empty";
    empty.textContent=uiT("noAnnouncements","現在のお知らせはありません。");
    announcementPublicList.appendChild(empty);
    return;
  }

  active.forEach(a=>{
    const isRead=readSet.has(a.id);
    const item=document.createElement("article");
    item.className=`announcement-public-item announcement-read-item ${isRead?"is-read":"is-unread"}`;
    item.dataset.announcementId=a.id;

    const button=document.createElement("button");
    button.type="button";
    button.className="announcement-public-item-toggle";
    button.setAttribute("aria-expanded","false");

    const head=document.createElement("span");
    head.className="announcement-public-item-head";

    const titleWrap=document.createElement("span");
    titleWrap.className="announcement-public-title-wrap";

    const badge=document.createElement("span");
    badge.className="announcement-read-badge";
    badge.textContent=isRead?"✓ 既読":"● 未読";

    const title=document.createElement("span");
    title.className="announcement-public-item-title";
    title.textContent=a.title||"お知らせ";

    const date=document.createElement("span");
    date.className="announcement-public-item-date";
    date.textContent=formatAnnouncementDate(a.updatedAt||a.createdAt);

    const chevron=document.createElement("span");
    chevron.className="announcement-item-chevron";
    chevron.textContent="›";

    const body=document.createElement("div");
    body.className="announcement-public-item-body announcement-item-body-collapsed hidden";
    body.textContent=a.body||"";

    titleWrap.appendChild(badge);
    titleWrap.appendChild(title);
    head.appendChild(titleWrap);
    if(date.textContent)head.appendChild(date);
    button.appendChild(head);
    button.appendChild(chevron);
    item.appendChild(button);
    if(a.body)item.appendChild(body);

    button.onclick=()=>{
      const opening=button.getAttribute("aria-expanded")!=="true";
      button.setAttribute("aria-expanded",opening?"true":"false");
      chevron.textContent=opening?"⌄":"›";
      if(a.body)body.classList.toggle("hidden",!opening);

      if(opening&&!item.classList.contains("is-read")){
        markAnnouncementRead(a.id);
        item.classList.remove("is-unread");
        item.classList.add("is-read");
        badge.textContent="✓ 既読";
        const latestUnread=active.filter(record=>!new Set(getReadAnnouncementIds()).has(record.id)).length;
        if(announcementPublicModalTitle){
          announcementPublicModalTitle.textContent=`📢 ${uiT("announcements","お知らせ")}（${active.length}${uiT("itemsSuffix","件")} / 未読${latestUnread}${uiT("itemsSuffix","件")}）`;
        }
      }
    };

    announcementPublicList.appendChild(item);
  });
}

function renderAdminAnnouncements(){
  announcementAdminList.innerHTML="";
  if(announcementRecords.length===0){const div=document.createElement("div");div.className="announcement-admin-item";div.textContent="お知らせはまだ登録されていません。";announcementAdminList.appendChild(div);return;}
  announcementRecords.forEach(a=>{const div=document.createElement("div");div.className="announcement-admin-item";const head=document.createElement("div");head.className="announcement-admin-head";const title=document.createElement("div");title.className="event-admin-title announcement-admin-title";title.textContent=`${a.enabled?"🟢":"⚪"} ${a.title||"お知らせ"}`;const date=document.createElement("div");date.className="announcement-admin-date";date.textContent=formatAnnouncementDate(a.updatedAt||a.createdAt);head.appendChild(title);if(date.textContent)head.appendChild(date);const body=document.createElement("div");body.className="announcement-admin-sub";body.textContent=a.body||"";const actions=document.createElement("div");actions.className="announcement-admin-actions";const editBtn=document.createElement("button");editBtn.type="button";editBtn.className="event-small-button";editBtn.textContent="編集";const toggleBtn=document.createElement("button");toggleBtn.type="button";toggleBtn.className="event-small-button";toggleBtn.textContent=a.enabled?"非表示にする":"表示する";toggleBtn.onclick=()=>toggleAnnouncement(a.id,!a.enabled);const deleteBtn=document.createElement("button");deleteBtn.type="button";deleteBtn.className="event-small-button danger";deleteBtn.textContent="削除";deleteBtn.onclick=()=>deleteAnnouncement(a.id);const editBox=document.createElement("div");editBox.className="announcement-edit-box hidden";editBox.innerHTML=`<label class="admin-form-label">タイトル</label><input class="admin-input announcement-edit-title" type="text" value="${escapeHtml(a.title||"")}"><label class="admin-form-label">本文</label><textarea class="admin-input admin-textarea announcement-edit-body">${escapeHtml(a.body||"")}</textarea><label class="announcement-check-label"><input class="announcement-edit-enabled" type="checkbox" ${a.enabled?"checked":""}> 表示する</label><button class="event-small-button primary announcement-save-button" type="button">保存</button><button class="event-small-button announcement-cancel-button" type="button">キャンセル</button>`;editBox.querySelector(".announcement-save-button").onclick=()=>saveAnnouncementEdit(a.id,editBox);editBox.querySelector(".announcement-cancel-button").onclick=()=>editBox.classList.add("hidden");editBtn.onclick=()=>editBox.classList.toggle("hidden");actions.appendChild(editBtn);actions.appendChild(toggleBtn);actions.appendChild(deleteBtn);div.appendChild(head);if(a.body)div.appendChild(body);div.appendChild(actions);div.appendChild(editBox);announcementAdminList.appendChild(div);});
}

async function addAnnouncement(){const title=announcementTitleInput.value.trim();const body=announcementBodyInput.value.trim();if(!title&&!body){addAnnouncementError.classList.remove("hidden");return;}addAnnouncementError.classList.add("hidden");try{const id=`announcement_${Date.now()}`;await setDoc(doc(db,"announcements",id),{title:title||"お知らせ",body,enabled:announcementEnabledInput.checked,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});announcementTitleInput.value="";announcementBodyInput.value="";announcementEnabledInput.checked=true;alert("お知らせを追加しました。");}catch(e){console.error(e);alert("お知らせの追加に失敗しました。Firestoreルールを確認してください。");}}

async function saveAnnouncementEdit(id,editBox){const title=editBox.querySelector(".announcement-edit-title").value.trim();const body=editBox.querySelector(".announcement-edit-body").value.trim();const enabled=editBox.querySelector(".announcement-edit-enabled").checked;if(!title&&!body){alert("タイトルまたは本文を入力してください。");return;}try{await updateDoc(doc(db,"announcements",id),{title:title||"お知らせ",body,enabled,updatedAt:serverTimestamp()});alert("お知らせを保存しました。");}catch(e){console.error(e);alert("お知らせの保存に失敗しました。");}}

async function toggleAnnouncement(id,enabled){try{await updateDoc(doc(db,"announcements",id),{enabled,updatedAt:serverTimestamp()});}catch(e){console.error(e);alert("表示状態の変更に失敗しました。");}}

async function deleteAnnouncement(id){if(!confirm("このお知らせを削除します。よろしいですか？"))return;try{await deleteDoc(doc(db,"announcements",id));alert("お知らせを削除しました。");}catch(e){console.error(e);alert("お知らせの削除に失敗しました。");}}

function eventDisplayStatus(ev){
  if(ev?.status==="cancelled")return {text:"中止",icon:"🔴"};

  const date=String(ev?.date||"").trim();
  const time=String(ev?.time||"19:00").trim()||"19:00";
  const match=time.match(/^(\d{1,2}):(\d{2})/);

  if(!date||!match)return {text:"開催予定",icon:"🟢"};

  const [year,month,day]=date.split("-").map(Number);
  const hour=Number(match[1]);
  const minute=Number(match[2]);

  if(!year||!month||!day||!Number.isFinite(hour)||!Number.isFinite(minute)){
    return {text:"開催予定",icon:"🟢"};
  }

  // イベント日時はJSTとして比較。Firestoreのstatus自体は変更しない。
  const eventAt=new Date(Date.UTC(year,month-1,day,hour-9,minute,0,0));
  return Date.now()>=eventAt.getTime()
    ? {text:"開催済み",icon:"⚫"}
    : {text:"開催予定",icon:"🟢"};
}

function showEventDetail(ev){
  selectedEvent=ev;
  if(!eventDetailContent)return;

  const displayStatus=eventDisplayStatus(ev);
  const statusText=displayStatus.text;
  const statusIcon=displayStatus.icon;
  const typeIcon=ev.type==="run"?"🏃":"🏋️";
  const displayTitle=(ev.title||eventTypeLabel(ev.type)).trim();
  const results=Array.isArray(ev.trainingResults)?ev.trainingResults.filter(Boolean):[];
  const resultsHtml=ev.type==="run"&&results.length
    ? `<div class="training-results-box"><div class="training-results-title">🏃 今日の練習</div><div class="training-results-list">${results.map(line=>`<div class="training-result-row">${escapeHtml(line)}</div>`).join("")}</div></div>`
    : "";
  const adminEditHtml=ev.type==="run"&&isCurrentAdmin()
    ? `<div class="training-results-admin"><label class="admin-form-label" for="eventTrainingResultsInput">🏃 今日の練習（管理者編集）</label><textarea id="eventTrainingResultsInput" class="admin-input admin-textarea" placeholder="1グループ1行で入力\n例：A 1.5km×5周 5:30/km\nB 1.5km×4周 7:15/km">${escapeHtml(results.join("\n"))}</textarea><p class="training-results-note">過去のイベントにも入力・修正できます。空欄で保存すると表示されません。</p><button class="event-small-button primary" id="saveEventTrainingResultsButton" type="button">練習実績を保存</button></div>`
    : "";

  const automaticStatusNotice=ev.status==="cancelled"
    ? "🔴 開催中止です。"
    : statusText==="開催済み"
      ? "✅ 開催済みです。"
      : "📝 いまのところ開催予定です。";

  const rawMemo=String(ev.memo||"").trim();
  const legacyStatusMemo=/^(いまの処開催予定|いまのところ開催予定|開催予定です?。?)$/.test(rawMemo)
    ? ""
    : rawMemo;

  eventDetailContent.innerHTML=`
    <div class="event-detail-card">
      <div class="event-detail-title">${statusIcon} ${typeIcon} ${escapeHtml(displayTitle)} ${statusText}</div>
      <div class="event-detail-sub">📅 ${fmt(ev.date)}<br>🕖 ${ev.time||"19:00"}<br>📍 ${ev.place||"-"}</div>
      <div class="event-detail-status-notice">${automaticStatusNotice}</div>
      ${legacyStatusMemo?`<div class="event-detail-memo">📝 ${linkifyEventMemo(legacyStatusMemo)}</div>`:""}
    </div>
    ${resultsHtml}
    ${adminEditHtml}
  `;
  const saveTrainingButton=document.getElementById("saveEventTrainingResultsButton");
  if(saveTrainingButton)saveTrainingButton.onclick=saveSelectedEventTrainingResults;
  show(eventDetailModal);
}

async function saveSelectedEventTrainingResults(){
  if(!selectedEvent||selectedEvent.type!=="run"||!isCurrentAdmin())return;
  const input=document.getElementById("eventTrainingResultsInput");
  if(!input)return;
  const trainingResults=input.value
    .split(/\r?\n/)
    .map(line=>line.trim())
    .filter(Boolean);
  try{
    await updateDoc(doc(db,"events",selectedEvent.id),{
      trainingResults,
      updatedAt:serverTimestamp()
    });
    selectedEvent={...selectedEvent,trainingResults};
    alert("練習実績を保存しました。");
    showEventDetail(selectedEvent);
  }catch(e){
    console.error(e);
    alert("練習実績の保存に失敗しました。Firestoreルールを確認してください。");
  }
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
    ${ev.type==="run"?`<label class="admin-form-label">今日の練習（1グループ1行）</label><textarea class="admin-input admin-textarea event-edit-training-results" placeholder="A 1.5km×5周 5:30/km\nB 1.5km×4周 7:15/km">${escapeHtml((ev.trainingResults||[]).join("\n"))}</textarea>`:""}
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

function isStandalonePwa(){
  return !!(
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}
function linkifyEventMemo(value){
  const escaped=escapeHtml(value||"");
  const linkTarget=isStandalonePwa()?"":' target="_blank" rel="noopener noreferrer"';
  return escaped.replace(/https?:\/\/[^\s<]+/gi,url=>{
    let href=url;
    let tail="";
    while(/[。、，．,.!?！？)）\]】」』》〉]$/.test(href)){
      tail=href.slice(-1)+tail;
      href=href.slice(0,-1);
    }
    return `<a class="event-memo-link" href="${href}"${linkTarget}>${href}</a>${tail}`;
  });
}

async function saveEventEdit(eventId,editBox){
  if(!eventId)return;
  const title=editBox.querySelector(".event-edit-title").value.trim();
  const time=editBox.querySelector(".event-edit-time").value||"19:00";
  const place=editBox.querySelector(".event-edit-place").value.trim();
  const status=editBox.querySelector(".event-edit-status").value;
  const memo=editBox.querySelector(".event-edit-memo").value.trim();
  const trainingInput=editBox.querySelector(".event-edit-training-results");
  const trainingResults=trainingInput
    ? trainingInput.value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean)
    : [];

  try{
    await updateDoc(doc(db,"events",eventId),{
      title,
      time,
      place,
      status,
      memo,
      ...(trainingInput?{trainingResults}:{}),
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
  if(!eventTitleInput.value)eventTitleInput.value="落合公園";
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

function formatLastActiveAt(value){
  if(!value)return "未記録";
  try{
    const date=typeof value.toDate==="function"?value.toDate():new Date(value);
    if(Number.isNaN(date.getTime()))return "未記録";
    const parts=new Intl.DateTimeFormat("ja-JP",{
      timeZone:"Asia/Tokyo",
      year:"numeric",month:"2-digit",day:"2-digit",
      hour:"2-digit",minute:"2-digit",hour12:false
    }).formatToParts(date);
    const get=type=>parts.find(part=>part.type===type)?.value||"";
    return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}`;
  }catch(e){
    return "未記録";
  }
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
  const actionLabel=member.inviteCode?"再発行":"発行";
  if(!confirm(`${member.name}さんの招待コードを${actionLabel}します。${member.inviteCode?"以前のコードは使えなくなります。":""}よろしいですか？`))return;

  const inviteCode=generateInviteCode();
  try{
    const ref=doc(db,"members",member.id);
    const nextInviteStatus=member.inviteStatus==="pending"?"pending":"registered";
    const updateFields={
      inviteCode,
      inviteStatus:nextInviteStatus,
      updatedAt:serverTimestamp()
    };
    // 新規招待待ちだけはregisteredAt未確定のまま維持。
    // 既存登録済みメンバーへのコード発行・再発行では登録済み状態を壊さない。
    if(nextInviteStatus==="pending")updateFields.registeredAt=null;
    await updateDoc(ref,updateFields);

    // 書込み完了後、サーバーから直接読み直して保存を確認する。
    const confirmedSnap=await getDocFromServer(ref);
    const confirmed=confirmedSnap.exists()?confirmedSnap.data()||{}:{};
    if(normalizeInviteCode(confirmed.inviteCode)!==normalizeInviteCode(inviteCode) || confirmed.inviteStatus!==nextInviteStatus){
      throw new Error("invite code verification failed");
    }

    alert(`招待コードを${actionLabel}しました。\n${inviteCode}\n\nFirestoreへの保存も確認しました。`);
  }catch(e){
    console.error(e);
    alert(`招待コードの${actionLabel}に失敗しました。Firestoreへ保存できていません。`);
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
    title.innerHTML=`😊 ${escapeHtml(m.name)}${m.kyroMember?'<span class="kyro-badge admin-kyro-badge">KYRO</span>':""}`;

    const status=document.createElement("div");
    status.className="member-admin-summary-status";
    status.textContent=invitationStatusLabel(m);

    summaryText.appendChild(title);
    summaryText.appendChild(status);

    const lastActive=document.createElement("div");
    lastActive.className="member-admin-last-active";
    lastActive.innerHTML=`<span>最終利用</span><strong>${formatLastActiveAt(m.lastActiveAt)}</strong>`;

    const chevron=document.createElement("span");
    chevron.className="member-admin-chevron";
    chevron.textContent="›";
    chevron.setAttribute("aria-hidden","true");

    summary.appendChild(summaryText);
    summary.appendChild(lastActive);
    summary.appendChild(chevron);

    const detail=document.createElement("div");
    detail.className="member-admin-detail hidden";

    const meta=document.createElement("div");
    meta.className="member-admin-meta-grid";
    meta.innerHTML=`
      <div><span>区分</span><strong>${m.admin?"管理者":"一般"}</strong></div>
      <div><span>KYRO</span><strong>${m.kyroMember?"メンバー":"未参加"}</strong></div>
      <div><span>KYROネーム</span><strong>${m.kyroUserName?escapeHtml(m.kyroUserName):"未登録"}</strong></div>
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

    const kyroLabel=document.createElement("label");
    const kyroCheck=document.createElement("input");
    kyroCheck.type="checkbox";
    kyroCheck.checked=m.kyroMember===true;
    kyroLabel.appendChild(kyroCheck);
    kyroLabel.appendChild(document.createTextNode(" KYROメンバー"));

    checks.appendChild(adminLabel);
    checks.appendChild(activeLabel);
    checks.appendChild(kyroLabel);

    const kyroNameInput=document.createElement("input");
    kyroNameInput.type="text";
    kyroNameInput.className="admin-input member-kyro-name-input";
    kyroNameInput.placeholder="KYROネーム";
    kyroNameInput.value=m.kyroUserName||"";
    kyroNameInput.classList.toggle("hidden",!kyroCheck.checked);
    kyroCheck.onchange=()=>kyroNameInput.classList.toggle("hidden",!kyroCheck.checked);

    const saveBtn=document.createElement("button");
    saveBtn.type="button";
    saveBtn.className="member-small-button primary";
    saveBtn.textContent="保存";
    saveBtn.onclick=()=>saveMemberEdit(m.id,nameInput.value,adminCheck.checked,activeCheck.checked,kyroCheck.checked,kyroNameInput.value);

    const cancelBtn=document.createElement("button");
    cancelBtn.type="button";
    cancelBtn.className="member-small-button";
    cancelBtn.textContent="キャンセル";
    cancelBtn.onclick=()=>editBox.classList.add("hidden");

    editRow.appendChild(nameInput);
    editRow.appendChild(checks);
    editRow.appendChild(kyroNameInput);
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

    const kyroBtn=document.createElement("button");
    kyroBtn.type="button";
    kyroBtn.className=`member-toggle-button ${m.kyroMember ? "on kyro-on" : ""}`;
    kyroBtn.textContent=m.kyroMember ? "KYRO ON" : "KYRO OFF";
    kyroBtn.onclick=()=>toggleMemberFlag(m.id,"kyroMember",!m.kyroMember);

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
    secondaryActions.appendChild(kyroBtn);
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

async function saveMemberEdit(memberId,name,admin,active,kyroMember,kyroUserName=""){
  const cleanName=name.trim();
  const cleanKyroName=String(kyroUserName||"").trim();
  if(kyroMember&&!cleanKyroName){alert("KYROメンバーはKYROネームを入力してください。");return;}
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
      kyroMember,
      kyroUserName:kyroMember?cleanKyroName:"",
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


if(newMemberKyroCheck)newMemberKyroCheck.onchange=()=>{newMemberKyroNameRow?.classList.toggle("hidden",!newMemberKyroCheck.checked);if(!newMemberKyroCheck.checked&&newMemberKyroNameInput)newMemberKyroNameInput.value="";};
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
      kyroMember:newMemberKyroCheck.checked,
      kyroUserName:newMemberKyroCheck.checked?newMemberKyroNameInput.value.trim():"",
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
    newMemberKyroCheck.checked=false;
    newMemberKyroNameInput.value="";
    newMemberKyroNameRow.classList.add("hidden");
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
  openAdminChildModal(adminMemberModal);
};
closeEventDetailButton.onclick=()=>hide(eventDetailModal);
eventDetailJoinButton.onclick=openSelectedEventAttendance;
adminSystemSettingsButton.onclick=()=>{
  applySystemSettingsToInputs();
  openAdminChildModal(systemSettingsModal);
};
closeSystemSettingsButton.onclick=()=>closeAdminChildModal(systemSettingsModal);
saveSystemSettingsButton.onclick=saveSystemSettings;
adminAnnouncementManageButton.onclick=()=>{renderAdminAnnouncements();openAdminChildModal(announcementManageModal);};
closeAnnouncementManageButton.onclick=()=>closeAdminChildModal(announcementManageModal);
addAnnouncementButton.onclick=addAnnouncement;
adminEventManageButton.onclick=()=>{
  // システム設定の最新値を、新規イベント入力欄へ毎回反映する
  eventTimeInput.value=systemSettings.run.time;
  eventPlaceInput.value=systemSettings.run.place;
  if(!eventTitleInput.value)eventTitleInput.value="落合公園";
  renderAdminEvents();
  openAdminChildModal(eventManageModal);
};
closeEventManageButton.onclick=()=>closeAdminChildModal(eventManageModal);
eventTypeInput.onchange=fillEventDefaults;
addEventButton.onclick=addEvent;

adminInvitePreviewButton.onclick=()=>openAdminChildModal(invitePreviewModal);
if(adminSeedMembersButton)adminSeedMembersButton.onclick=seedMembers;
closeAdminMemberButton.onclick=()=>closeAdminChildModal(adminMemberModal);
closeInvitePreviewButton.onclick=()=>closeAdminChildModal(invitePreviewModal);
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

seasonActivityCard?.addEventListener("click",openSeasonActivityDetail);
seasonDetailKyroRankCard?.addEventListener("click",openKyroDistanceList);
kyroMemberCountButton?.addEventListener("click",openKyroDistanceList);
closeKyroDistanceListButton?.addEventListener("click",closeKyroDistanceList);
kyroDistanceListModal?.addEventListener("click",event=>{if(event.target===kyroDistanceListModal)closeKyroDistanceList();});
closeSeasonActivityModalButton?.addEventListener("click",()=>hide(seasonActivityModal));
seasonActivityModal?.addEventListener("click",event=>{if(event.target===seasonActivityModal)hide(seasonActivityModal);});
seasonDetailPreviousButton?.addEventListener("click",()=>{seasonDetailOffset-=1;renderSeasonActivityDetail();});
seasonDetailNextButton?.addEventListener("click",()=>{if(seasonDetailOffset<0){seasonDetailOffset+=1;renderSeasonActivityDetail();}});

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

renderNameButtons();updateUser();renderAll();renderFitnessPointHomeSummary();requireName(false)});

/* SRC Portal Ver.1.7.0 - basic-operation multilingual display
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
      help:"ヘルプ", refreshLatest:"最新版に更新", lastUpdated:"最終更新", refreshing:"最新情報を取得中...", refreshDone:"最新情報に更新しました", refreshFailed:"更新できませんでした", currentUser:"現在のユーザー", unset:"未設定", change:"変更", menu:"メニュー", recommendations:"みんなのおすすめ", adminMenu:"管理者メニュー",
      members:"登録メンバー", monthlyRun:"今月ラン参加", monthlyGym:"今月フィットネス参加", announcements:"お知らせ",
      noAnnouncements:"現在のお知らせはありません。", nextPlan:"あなたの次回参加予定", noNextPlan:"参加予定はまだありません。",
      nextEvent:"次回イベント", noNextEvent:"今後のイベントは登録されていません。", openEvent:"このイベントを開く",
      runWalk:"ラン＆ウォーク", gym:"フィットネス", calendarBack:"カレンダーへ戻る",
      runSummary:"イベント管理で登録された開催日を表示します。", gymSummary:"😊 一緒に行ける方募集中！",
      runRuleTitle:"開催状態", runRuleValue:"管理者がイベントごとに設定", gymRuleTitle:"補助条件",
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
      reminder:"リマインダー", messageBoard:"みんなの伝言板", postAndList:"投稿・一覧", noMessages:"伝言はまだありません。", message:"伝言", postingPeriod:"掲載期間", days3:"3日間", days7:"7日間", days14:"14日間", postMessage:"伝言を投稿", messagePlaceholder:"例：日曜朝7時から小牧山を走ります。参加できる方どうぞ！", messageError:"現在のユーザーと伝言を確認してください。", messageNote:"テキストのみ・200文字まで。期限を過ぎた伝言は自動的に非表示になります。", delete:"削除", memberGeneric:"メンバー", confirmDeleteMessage:"この伝言を削除しますか？", messagePostFailed:"伝言の投稿に失敗しました。Firestoreルールを確認してください。", messageDeleteFailed:"伝言の削除に失敗しました。", eventGeneric:"イベント", reminderJoined:"明日は「{event}」です", reminderUnanswered:"明日の「{event}」への参加をまだ登録していません", reminderGymJoined:"明日はジムです", reminderGymUnanswered:"明日のジム参加をまだ登録していません", participantsPlanned:"{count}名参加予定", itemsSuffix:"件", profile:"自己紹介", openProfile:"自己紹介を開く", editProfile:"自分の自己紹介を編集", nickname:"ニックネーム", introduction:"ひとこと", department:"所属", hobbies:"趣味・好きなこと", runningHistory:"ランニング歴", bestTime:"ベストタイム", goal:"現在の目標", required:"必須", optional:"任意", save:"保存する", profileNotRegistered:"自己紹介はまだ登録されていません。", profileRequiredError:"ニックネームとひとことを入力してください。", profileSaveFailed:"自己紹介の保存に失敗しました。Firestoreルールを確認してください。",
      weekdays:["月","火","水","木","金","土","日"]
    },
    en: {
      help:"Help", refreshLatest:"Refresh latest information", lastUpdated:"Last updated", refreshing:"Getting latest information...", refreshDone:"Updated to latest information", refreshFailed:"Could not refresh", currentUser:"Current user", unset:"Not selected", change:"Change", menu:"Menu", recommendations:"Recommendations", adminMenu:"Admin menu",
      members:"Members", monthlyRun:"Run this month", monthlyGym:"Gym this month", announcements:"Announcements",
      noAnnouncements:"There are no announcements.", nextPlan:"Your next plan", noNextPlan:"You have no upcoming plans.",
      nextEvent:"Next event", noNextEvent:"There are no upcoming events.", openEvent:"Open this event",
      runWalk:"Run & Walk", gym:"Fitness", calendarBack:"Back to calendar",
      runSummary:"Shows dates registered in Event Management.", gymSummary:"😊 Looking for gym partners!",
      runRuleTitle:"Event status", runRuleValue:"Set for each event by the administrator", gymRuleTitle:"Subsidy conditions",
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
      reminder:"Reminder", messageBoard:"Message board", postAndList:"Post / View all", noMessages:"There are no messages yet.", message:"Message", postingPeriod:"Display period", days3:"3 days", days7:"7 days", days14:"14 days", postMessage:"Post message", messagePlaceholder:"Example: I will run at Komakiyama from 7:00 Sunday morning. Join me!", messageError:"Check the current user and message.", messageNote:"Text only, up to 200 characters. Expired messages are hidden automatically.", delete:"Delete", memberGeneric:"Member", confirmDeleteMessage:"Delete this message?", messagePostFailed:"Failed to post the message. Check the Firestore rules.", messageDeleteFailed:"Failed to delete the message.", eventGeneric:"Event", reminderJoined:"Tomorrow is “{event}”.", reminderUnanswered:"You have not responded to tomorrow’s “{event}” yet.", reminderGymJoined:"You are going to the gym tomorrow.", reminderGymUnanswered:"You have not registered for tomorrow’s gym yet.", participantsPlanned:"{count} planning to attend", itemsSuffix:"", profile:"Profile", openProfile:"Open profile", editProfile:"Edit my profile", nickname:"Nickname", introduction:"Message", department:"Department", hobbies:"Hobbies / interests", runningHistory:"Running experience", bestTime:"Personal best", goal:"Current goal", required:"Required", optional:"Optional", save:"Save", profileNotRegistered:"This profile has not been completed yet.", profileRequiredError:"Enter a nickname and message.", profileSaveFailed:"Failed to save the profile. Check the Firestore rules.",
      weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    },
    ko: {
      help:"도움말", refreshLatest:"최신 정보로 업데이트", lastUpdated:"마지막 업데이트", refreshing:"최신 정보를 가져오는 중...", refreshDone:"최신 정보로 업데이트했습니다", refreshFailed:"업데이트하지 못했습니다", currentUser:"현재 사용자", unset:"미설정", change:"변경", menu:"메뉴", recommendations:"모두의 추천", adminMenu:"관리자 메뉴",
      members:"등록 멤버", monthlyRun:"이번 달 러닝", monthlyGym:"이번 달 체육관", announcements:"공지사항",
      noAnnouncements:"현재 공지사항이 없습니다.", nextPlan:"다음 참가 예정", noNextPlan:"참가 예정이 없습니다.",
      nextEvent:"다음 이벤트", noNextEvent:"예정된 이벤트가 없습니다.", openEvent:"이 이벤트 열기",
      runWalk:"러닝 & 워킹", gym:"체육관", calendarBack:"달력으로 돌아가기",
      runSummary:"이벤트 관리에 등록된 개최일을 표시합니다.", gymSummary:"😊 함께 체육관에 갈 분을 모집 중!",
      runRuleTitle:"개최 상태", runRuleValue:"관리자가 이벤트별로 설정", gymRuleTitle:"지원 조건",
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
      reminder:"리마인더", messageBoard:"모두의 게시판", postAndList:"작성·목록", noMessages:"아직 전달 사항이 없습니다.", message:"전달 사항", postingPeriod:"게시 기간", days3:"3일", days7:"7일", days14:"14일", postMessage:"게시하기", messagePlaceholder:"예: 일요일 오전 7시부터 고마키산을 달립니다. 함께하실 분 환영합니다!", messageError:"현재 사용자와 내용을 확인하세요.", messageNote:"텍스트만, 최대 200자입니다. 기간이 지난 글은 자동으로 숨겨집니다.", delete:"삭제", memberGeneric:"멤버", confirmDeleteMessage:"이 글을 삭제하시겠습니까?", messagePostFailed:"게시하지 못했습니다. Firestore 규칙을 확인하세요.", messageDeleteFailed:"삭제하지 못했습니다.", eventGeneric:"이벤트", reminderJoined:"내일은 ‘{event}’입니다.", reminderUnanswered:"내일 ‘{event}’ 참가 여부를 아직 등록하지 않았습니다.", reminderGymJoined:"내일은 체육관에 갑니다.", reminderGymUnanswered:"내일 체육관 참가를 아직 등록하지 않았습니다.", participantsPlanned:"{count}명 참가 예정", itemsSuffix:"건", profile:"자기소개", openProfile:"자기소개 열기", editProfile:"내 자기소개 편집", nickname:"닉네임", introduction:"한마디", department:"소속", hobbies:"취미·좋아하는 것", runningHistory:"러닝 경력", bestTime:"최고 기록", goal:"현재 목표", required:"필수", optional:"선택", save:"저장", profileNotRegistered:"아직 자기소개가 등록되지 않았습니다.", profileRequiredError:"닉네임과 한마디를 입력하세요.", profileSaveFailed:"자기소개를 저장하지 못했습니다. Firestore 규칙을 확인하세요.",
      weekdays:["월","화","수","목","금","토","일"]
    },
    zh: {
      help:"帮助", refreshLatest:"更新最新信息", lastUpdated:"最后更新", refreshing:"正在获取最新信息...", refreshDone:"已更新为最新信息", refreshFailed:"更新失败", currentUser:"当前用户", unset:"未设置", change:"更改", menu:"菜单", recommendations:"大家的推荐", adminMenu:"管理员菜单",
      members:"注册成员", monthlyRun:"本月跑步", monthlyGym:"本月健身", announcements:"通知",
      noAnnouncements:"目前没有通知。", nextPlan:"您的下次参加计划", noNextPlan:"目前没有参加计划。",
      nextEvent:"下次活动", noNextEvent:"目前没有即将举行的活动。", openEvent:"打开此活动",
      runWalk:"跑步与健走", gym:"健身房", calendarBack:"返回日历",
      runSummary:"显示在活动管理中登记的举办日期。", gymSummary:"😊 正在招募一起去健身房的伙伴！",
      runRuleTitle:"活动状态", runRuleValue:"由管理员按活动设置", gymRuleTitle:"补助条件",
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
      reminder:"提醒", messageBoard:"大家的留言板", postAndList:"发布／查看全部", noMessages:"目前还没有留言。", message:"留言", postingPeriod:"显示期限", days3:"3天", days7:"7天", days14:"14天", postMessage:"发布留言", messagePlaceholder:"例如：周日上午7点去小牧山跑步，欢迎一起参加！", messageError:"请确认当前用户和留言内容。", messageNote:"仅限文字，最多200字。到期留言会自动隐藏。", delete:"删除", memberGeneric:"成员", confirmDeleteMessage:"要删除这条留言吗？", messagePostFailed:"留言发布失败。请检查 Firestore 规则。", messageDeleteFailed:"留言删除失败。", eventGeneric:"活动", reminderJoined:"明天是“{event}”。", reminderUnanswered:"您尚未登记是否参加明天的“{event}”。", reminderGymJoined:"明天去健身房。", reminderGymUnanswered:"您尚未登记参加明天的健身房活动。", participantsPlanned:"{count}人计划参加", itemsSuffix:"条", profile:"自我介绍", openProfile:"打开自我介绍", editProfile:"编辑我的自我介绍", nickname:"昵称", introduction:"一句话介绍", department:"所属部门", hobbies:"兴趣爱好", runningHistory:"跑步经历", bestTime:"最佳成绩", goal:"当前目标", required:"必填", optional:"选填", save:"保存", profileNotRegistered:"尚未填写自我介绍。", profileRequiredError:"请输入昵称和一句话介绍。", profileSaveFailed:"自我介绍保存失败。请检查 Firestore 规则。",
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
    setText("#currentUserLabel strong", m.unset);
    setText("#mainMenuButton", `☰ ${m.menu}`);
    setText("#mainMenuModal h2", `☰ ${m.menu}`);
    setText("#openRecommendationsButton", `⭐ ${m.recommendations}`);
    setText("#openMessageBoardFromMenuButton", `💬 ${m.messageBoard}`);
    setText("#refreshPortalFromMenuButton", `🔄 ${m.refreshLatest}`);
    setText("#refreshPortalTopButton", `🔄 ${m.refreshLatest}`);
    if(document.querySelector("#portalLastUpdated")) document.querySelector("#portalLastUpdated").textContent=`🕒 ${m.lastUpdated} --:--`;
    setText("#openAdminFromMainMenuButton", `⚙️ ${m.adminMenu}`);
    setText("#changeUserButton", m.change);
    const dashboardLabels = document.querySelectorAll("#dashboardCard .dashboard-label");
    [m.members,m.monthlyRun,m.monthlyGym,m.nextEvent].forEach((text,i)=>{ if(dashboardLabels[i]) dashboardLabels[i].textContent=text; });
    setText("#announcementCard .section-label", `📢 ${m.announcements}`);
    setText("#announcementList", m.noAnnouncements);
    setText("#messageBoardCard .section-label", `💬 ${m.messageBoard}`);
    setText("#openMessageBoardButton", m.postAndList);
    setText("#messageBoardPreview", m.noMessages);
    setText("#reminderCard .section-label", `🔔 ${m.reminder}`);
    setText("#messageBoardModal h2", `💬 ${m.messageBoard}`);
    setText("#messageBoardModal label[for='messageBoardTextInput']", m.message);
    setAttr("#messageBoardTextInput","placeholder",m.messagePlaceholder);
    setText("#messageBoardModal label[for='messageBoardExpirySelect']", m.postingPeriod);
    const expiryOptions=document.querySelectorAll("#messageBoardExpirySelect option");
    [m.days3,m.days7,m.days14].forEach((text,i)=>{if(expiryOptions[i])expiryOptions[i].textContent=text;});
    setText("#messageBoardError",m.messageError);
    setText("#postMessageBoardButton",m.postMessage);
    setText("#messageBoardModal .settings-note",m.messageNote);
    setText("#memberProfileModal h2", `👤 ${m.profile}`);
    setText("#editOwnProfileButton", m.editProfile);
    setText("#memberProfileEditModal h2", `✏️ ${m.editProfile}`);
    setText("label[for='profileNicknameInput']", `${m.nickname}（${m.required}）`);
    setText("label[for='profileIntroductionInput']", `${m.introduction}（${m.required}）`);
    setText("label[for='profileDepartmentInput']", `${m.department}（${m.optional}）`);
    setText("label[for='profileHobbiesInput']", `${m.hobbies}（${m.optional}）`);
    setText("label[for='profileRunningHistoryInput']", `${m.runningHistory}（${m.optional}）`);
    setText("label[for='profileBestTimeInput']", `${m.bestTime}（${m.optional}）`);
    setText("label[for='profileGoalInput']", `${m.goal}（${m.optional}）`);
    setText("#profileEditError",m.profileRequiredError);
    setText("#saveProfileButton",m.save);
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
    document.querySelectorAll("#setupModal button[aria-label='閉じる'], #inviteAuthModal button[aria-label='閉じる'], #sameDayStatusModal button[aria-label='閉じる'], #monthJumpModal button[aria-label='閉じる'], #messageBoardModal button[aria-label='閉じる']")
      .forEach(el=>el.setAttribute("aria-label",m.close));
  }

  function translateDynamicElement(el) {
    if (language === "ja" || !(el instanceof Element)) return;
    if (el.closest("#adminPinModal,#adminMenuModal,#adminMemberModal,#announcementManageModal,#eventManageModal,#systemSettingsModal,#invitePreviewModal,#helpModal")) return;
    const text = el.textContent.trim();
    if (!text) return;

    if (el.id === "announcementList" && text === "現在のお知らせはありません。") el.textContent=m.noAnnouncements;
    else if (el.id === "announcementHeading") {
      const hit=text.match(/お知らせ（(\d+)件）/); if(hit) el.textContent=`📢 ${m.announcements}（${hit[1]}${m.itemsSuffix}）`;
    } else if ((el.id === "messageBoardPreview" || el.classList.contains("message-board-empty")) && text === "伝言はまだありません。") el.textContent=m.noMessages;
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
      else if(text === "フィットネストレーニング") el.textContent=m.gym;
    } else if (el.id === "eventSummary") {
      if(text === "イベント管理で登録された開催日を表示します。") el.textContent=m.runSummary;
      else if(text === "好きな日を選んで参加表明" || text === "😊 一緒に行ける方募集中！") el.textContent=m.gymSummary;
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
    renderAnnouncementsPublic();
    renderMessageBoard();
    renderReminder();
    document.querySelectorAll("#homeView,#detailView,#setupModal,#inviteAuthModal,#userChangeConfirmModal,#sameDayStatusModal,#monthJumpModal,#messageBoardModal").forEach(translateDynamicElement);
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
