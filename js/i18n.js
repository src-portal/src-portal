/* SRC Portal Ver.1.1.0a: basic fixed-text localization only. */
(() => {
  "use strict";

  const raw = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  const code = raw.toLowerCase();
  const lang = code.startsWith("ja") ? "ja" : code.startsWith("ko") ? "ko" : code.startsWith("zh") ? "zh" : "en";
  document.documentElement.lang = lang;
  if (lang === "ja") return;

  const T = {
    en: {
      help:"Help", currentUser:"Current user", unset:"Not set", change:"Change",
      members:"Members", monthlyRun:"Run this month", monthlyGym:"Gym this month", announcements:"Announcements",
      noAnnouncements:"No announcements.", nextPlan:"Your next plan", noPlan:"No upcoming plans.",
      nextEvent:"Next event", noEvent:"No upcoming events.", run:"Run & Walk", gym:"Gym",
      back:"← Back to calendar", participants:"Participants ({n})", notJoined:"You have not joined yet.",
      join:"Join", cancelJoin:"Cancel participation", chooseName:"Choose your name", chooseNameText:"Please choose your name.",
      initialChoose:"First, choose your name. It will be used automatically next time.",
      userChange:"Change user", chooseUser:"Choose the user to change to.", confirmUserChange:"Change the current user?",
      cancel:"Cancel", changeAction:"Change", today:"Today", scheduled:"Scheduled", cancelled:"Cancelled", me:"Me",
      held:"Confirmed", remaining1:"1 more", remaining2:"2 more", noParticipants:"No participants yet.",
      pastReadOnly:"Past event: participation cannot be changed.", pastJoin:"You cannot join a past date.",
      eventMissing:"No Run & Walk event is registered for this date.", cancelledJoin:"You cannot join a cancelled event.",
      joinFailed:"Could not register participation. Please check the connection.", cancelFailed:"Could not cancel participation.",
      inviteTitle:"Invite code", invitePrompt:"Enter the invite code for {name}.", inviteLabel:"Invite code",
      inviteHelp:'After 8 characters, “-” is inserted automatically.', inviteError:"The invite code is incorrect. Check the code from the administrator.",
      register:"Register", registering:"Registering...", inviteNote:"Enter the invite code sent by the administrator. You will not need it again after registration.",
      calendarMonth:"{year}/{month} ▼", weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      monthDay:"{month}/{day} ({weekday})", late:"Late", absent:"Cannot attend", leaveEarly:"Leave early", clearStatus:"Clear message",
      sameDay:"Same-day status", monthSelect:"Select month", year:"Year", month:"Month", currentMonth:"Current month", show:"Show",
      close:"Close", welcome:"Registration complete!\n\nWelcome to SRC, {name}!\nYou will not need the invite code next time."
    },
    ko: {
      help:"도움말", currentUser:"현재 사용자", unset:"미설정", change:"변경",
      members:"등록 멤버", monthlyRun:"이번 달 러닝 참가", monthlyGym:"이번 달 헬스 참가", announcements:"공지사항",
      noAnnouncements:"현재 공지사항이 없습니다.", nextPlan:"다음 참가 예정", noPlan:"참가 예정이 없습니다.",
      nextEvent:"다음 이벤트", noEvent:"예정된 이벤트가 없습니다.", run:"러닝 & 워킹", gym:"헬스",
      back:"← 캘린더로 돌아가기", participants:"참가자 ({n}명)", notJoined:"아직 참가하지 않았습니다.",
      join:"참가하기", cancelJoin:"참가 취소", chooseName:"이름 선택", chooseNameText:"본인의 이름을 선택하세요.",
      initialChoose:"처음 한 번만 본인의 이름을 선택하세요. 다음부터 자동으로 사용됩니다.",
      userChange:"사용자 변경", chooseUser:"변경할 사용자를 선택하세요.", confirmUserChange:"현재 사용자를 변경하시겠습니까?",
      cancel:"취소", changeAction:"변경", today:"오늘", scheduled:"개최 예정", cancelled:"취소", me:"나",
      held:"개최", remaining1:"1명 남음", remaining2:"2명 남음", noParticipants:"아직 참가자가 없습니다.",
      pastReadOnly:"지난 이벤트이므로 참가/취소할 수 없습니다.", pastJoin:"지난 날짜에는 참가 등록할 수 없습니다.",
      eventMissing:"이 날짜의 러닝 & 워킹 이벤트가 등록되지 않았습니다.", cancelledJoin:"취소된 이벤트에는 참가할 수 없습니다.",
      joinFailed:"참가 등록에 실패했습니다. 통신 상태를 확인하세요.", cancelFailed:"참가 취소에 실패했습니다.",
      inviteTitle:"초대 코드 확인", invitePrompt:"{name}님의 초대 코드를 입력하세요.", inviteLabel:"초대 코드",
      inviteHelp:'8자를 입력하면 “-”가 자동으로 들어갑니다.', inviteError:"초대 코드가 올바르지 않습니다. 관리자에게 받은 코드를 확인하세요.",
      register:"등록", registering:"등록 중...", inviteNote:"관리자에게 받은 초대 코드를 입력하세요. 등록 후에는 다시 입력할 필요가 없습니다.",
      calendarMonth:"{year}년 {month}월 ▼", weekdays:["월","화","수","목","금","토","일"],
      monthDay:"{month}월 {day}일 ({weekday})", late:"늦습니다", absent:"참석할 수 없습니다", leaveEarly:"먼저 갑니다", clearStatus:"연락 취소",
      sameDay:"당일 상황", monthSelect:"표시할 연월", year:"연도", month:"월", currentMonth:"이번 달", show:"표시",
      close:"닫기", welcome:"등록이 완료되었습니다!\n\nSRC에 오신 것을 환영합니다, {name}님!\n다음부터 초대 코드를 입력할 필요가 없습니다."
    },
    zh: {
      help:"帮助", currentUser:"当前用户", unset:"未设置", change:"更改",
      members:"注册成员", monthlyRun:"本月跑步参加", monthlyGym:"本月健身参加", announcements:"通知",
      noAnnouncements:"目前没有通知。", nextPlan:"下次参加计划", noPlan:"暂无参加计划。",
      nextEvent:"下次活动", noEvent:"暂无计划中的活动。", run:"跑步与步行", gym:"健身",
      back:"← 返回日历", participants:"参加者（{n}人）", notJoined:"尚未参加。",
      join:"参加", cancelJoin:"取消参加", chooseName:"选择姓名", chooseNameText:"请选择您的姓名。",
      initialChoose:"首次使用请选择您的姓名，下次将自动使用。",
      userChange:"更改用户", chooseUser:"请选择要更改的用户。", confirmUserChange:"要更改当前用户吗？",
      cancel:"取消", changeAction:"更改", today:"今天", scheduled:"计划举行", cancelled:"已取消", me:"自己",
      held:"确定举行", remaining1:"还差1人", remaining2:"还差2人", noParticipants:"目前没有参加者。",
      pastReadOnly:"过去的活动不能参加或取消。", pastJoin:"不能报名过去的日期。",
      eventMissing:"当天没有登记跑步与步行活动。", cancelledJoin:"不能参加已取消的活动。",
      joinFailed:"参加登记失败，请检查网络连接。", cancelFailed:"取消参加失败。",
      inviteTitle:"确认邀请码", invitePrompt:"请输入{name}的邀请码。", inviteLabel:"邀请码",
      inviteHelp:'输入8个字符后会自动加入“-”。', inviteError:"邀请码不正确，请确认管理员提供的代码。",
      register:"注册", registering:"注册中...", inviteNote:"请输入管理员发送的邀请码。注册后下次无需再次输入。",
      calendarMonth:"{year}年{month}月 ▼", weekdays:["一","二","三","四","五","六","日"],
      monthDay:"{month}月{day}日（{weekday}）", late:"会迟到", absent:"无法参加", leaveEarly:"提前离开", clearStatus:"取消联络",
      sameDay:"当天情况", monthSelect:"选择年月", year:"年份", month:"月份", currentMonth:"本月", show:"显示",
      close:"关闭", welcome:"注册完成！\n\n欢迎加入SRC，{name}！\n下次无需再输入邀请码。"
    }
  }[lang];

  const exact = new Map([
    ["❓ ヘルプ",`❓ ${T.help}`],["現在のユーザー",T.currentUser],["未設定",T.unset],["変更",T.change],
    ["登録メンバー",T.members],["今月ラン参加",T.monthlyRun],["今月ジム参加",T.monthlyGym],["お知らせ",T.announcements],
    ["📢 お知らせ",`📢 ${T.announcements}`],["現在のお知らせはありません。",T.noAnnouncements],
    ["次回参加予定",T.nextPlan],["参加予定はまだありません。",T.noPlan],["次回イベント",T.nextEvent],["今後のイベントは登録されていません。",T.noEvent],
    ["🏃 ラン＆ウォーク",`🏃 ${T.run}`],["🏋️ ジム",`🏋️ ${T.gym}`],["ラン＆ウォーク",T.run],["ジム",T.gym],
    ["← カレンダーへ戻る",T.back],["まだ参加していません。",T.notJoined],["参加する",T.join],["参加取消",T.cancelJoin],
    ["👤 ユーザー変更",`👤 ${T.userChange}`],["👤 お名前を選択",`👤 ${T.chooseName}`],["自分の名前を選んでください。",T.chooseNameText],
    ["初回だけ、自分の名前を選んでください。次回から自動で使用します。",T.initialChoose],
    ["変更するユーザーを選んでください。",T.chooseUser],["現在のユーザーを変更しますか？",T.confirmUserChange],
    ["キャンセル",T.cancel],["変更する",T.changeAction],["今日",T.today],["開催予定",T.scheduled],["中止",T.cancelled],["開催",T.held],["自分",T.me],
    ["まだ参加者はいません。",T.noParticipants],["過去のイベントのため、参加・取消はできません。",T.pastReadOnly],
    ["過去の日付のため、参加・取消はできません。",T.pastReadOnly],["過去の日付には参加登録できません。",T.pastJoin],
    ["この日のラン＆ウォークイベントは登録されていません。",T.eventMissing],["中止イベントには参加登録できません。",T.cancelledJoin],
    ["参加登録に失敗しました。Firestoreのルールを確認してください。",T.joinFailed],["参加取消に失敗しました。",T.cancelFailed],
    ["🔐 招待コード確認",`🔐 ${T.inviteTitle}`],["招待コード",T.inviteLabel],["8文字入力すると「-」は自動で入ります。",T.inviteHelp],
    ["招待コードが違います。管理者から案内されたコードを確認してください。",T.inviteError],["登録する",T.register],["登録中...",T.registering],
    ["招待コードは管理者から届いたものを入力してください。登録後は次回から入力不要です。",T.inviteNote],
    ["当日の状況",T.sameDay],["⏰ 遅れます",`⏰ ${T.late}`],["❌ 行けなくなりました",`❌ ${T.absent}`],["🏃 先に帰ります",`🏃 ${T.leaveEarly}`],["連絡を取り消す",T.clearStatus],
    ["表示する年月",T.monthSelect],["年",T.year],["月",T.month],["今月へ戻る",T.currentMonth],["表示",T.show]
  ]);

  function format(text){
    let m=text.match(/^参加者（(\d+)名）$/); if(m)return T.participants.replace("{n}",m[1]);
    m=text.match(/^(\d{4})年(\d{1,2})月 ▼$/); if(m)return T.calendarMonth.replace("{year}",m[1]).replace("{month}",m[2]);
    m=text.match(/^(\d{1,2})月(\d{1,2})日（([日月火水木金土])）$/);
    if(m){const idx="日月火水木金土".indexOf(m[3]);const wd=[T.weekdays[6],...T.weekdays.slice(0,6)][idx];return T.monthDay.replace("{month}",m[1]).replace("{day}",m[2]).replace("{weekday}",wd);}
    m=text.match(/^(.+) さんの招待コードを入力してください。$/); if(m)return T.invitePrompt.replace("{name}",m[1]);
    m=text.match(/^あと(1|2)$/); if(m)return m[1]==="1"?T.remaining1:T.remaining2;
    return exact.get(text) || text;
  }

  const safeRoots = ["homeView","detailView","setupModal","userChangeConfirmModal","sameDayStatusModal","monthJumpModal","inviteAuthModal"];
  function translateNode(root){
    if(!root || root.nodeType!==1)return;
    const nodes=[root,...root.querySelectorAll("button,span,div,p,h1,h2,h3,label,li")];
    nodes.forEach(el=>{
      if(el.children.length===0){const old=el.textContent.trim();const value=format(old);if(value!==old)el.textContent=value;}
      const aria=el.getAttribute&&el.getAttribute("aria-label");if(aria==="閉じる")el.setAttribute("aria-label",T.close);
    });
    root.querySelectorAll(".weekday-row span").forEach((el,i)=>{if(T.weekdays[i])el.textContent=T.weekdays[i];});
    const input=root.querySelector("#inviteAuthCodeInput");if(input)input.placeholder="ABCD-1234";
  }

  function translateAll(){safeRoots.forEach(id=>translateNode(document.getElementById(id)));}
  document.addEventListener("DOMContentLoaded",()=>{
    translateAll();
    const observer=new MutationObserver(records=>records.forEach(r=>{
      const el=r.target.nodeType===1?r.target:r.target.parentElement;
      const root=el&&el.closest&&safeRoots.map(id=>`#${id}`).join(",") && el.closest(safeRoots.map(id=>`#${id}`).join(","));
      if(root)translateNode(root);
    }));
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    const originalAlert=window.alert;
    window.alert=(message)=>{
      let text=String(message);
      text=format(text);
      let m=text.match(/^🎉 登録が完了しました！\n\nSRCへようこそ、(.+)さん！\n次回から招待コードの入力は不要です。$/);
      if(m)text=T.welcome.replace("{name}",m[1]);
      originalAlert(text);
    };
  });
})();
