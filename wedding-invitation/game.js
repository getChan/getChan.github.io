// 초대장 정보는 이 객체만 수정하면 전체 화면에 반영됩니다.
const WEDDING = {
  groom: "남궁찬",
  bride: "차은서",
  heroName: "남궁찬",
  introDate: "2027. 05. 08 · SATURDAY",
  dateText: "2027년 5월 8일 토요일",
  place: "인천 웨스턴팰리스",
  message:
    "서로의 가장 좋은 친구로,\n오래오래 같은 방향을 바라보며 걷겠습니다.\n귀한 걸음으로 첫 페이지를 축복해 주세요.",
  calendarStart: "20270508",
  calendarEnd: "20270509",
  calendarAllDay: true,
};

const AMORIA_BGM_ID = "hCdooZxzISo";

const QUESTS = [
  {
    x: 430,
    icon: "💗",
    npc: "헤라 & 사랑의 증표 수집가",
    label: "사랑의 증표",
    title: "네 개의 마음을 모아 주세요",
    story: "안내자 헤라를 따라 아모리아(웨딩빌리지)에 도착했어요. 약혼반지를 만들려면 네 마을에서 받은 사랑의 증표가 필요합니다. 함께 웃고, 믿고, 기다리고, 아껴 온 네 가지 마음을 꺼내 보세요.",
    task: "헤라의 안내로 입장해 추억 · 믿음 · 기다림 · 다정함의 증표 4개 모으기",
    action: "웨딩빌리지 입장 & 증표 건네기",
    toast: "사랑의 증표 4개를 모았습니다!",
  },
  {
    x: 910,
    icon: "💍",
    npc: "알레그로",
    label: "약혼반지 공방",
    title: "둘만의 약혼반지를 만들게요",
    story: "알레그로는 사랑의 증표와 반짝이는 원석을 다듬어 약혼반지를 만들어 줍니다. 반지 안쪽에는 두 사람만 아는 약속을 새겨 두었대요.",
    task: "알레그로에게 사랑의 증표를 건네고 약혼반지 제작하기",
    action: "약혼반지 받기",
    toast: "반짝이는 약혼반지를 획득했습니다!",
  },
  {
    x: 1370,
    icon: "🌹",
    npc: "프로포즈 가든",
    label: "프로포즈 가든",
    title: "평생 파티를 신청합니다",
    story: "같은 맵에 선 두 사람이 약혼반지를 마주 들었습니다. ‘앞으로의 모든 계절을 함께할래요?’ 마음을 담아 평생 파티를 신청해 주세요.",
    task: "약혼반지로 프로포즈하고 상대의 수락 받기",
    action: "프로포즈 수락 ♥",
    toast: "두 사람이 약혼했습니다!",
  },
  {
    x: 1840,
    icon: "🎟️",
    npc: "마가렛 수녀",
    label: "예식 예약소",
    title: "결혼식을 예약해 드릴게요",
    story: "웨딩 티켓과 두 사람의 위시리스트를 마가렛 수녀에게 전하면 예식이 예약됩니다. 가장 소중한 분들을 초대할 자리도 함께 마련했어요.",
    task: "웨딩 티켓과 신랑·신부의 위시리스트로 결혼식 예약하기",
    action: "예식 예약 확정",
    toast: "웨딩 티켓 예약이 완료되었습니다!",
  },
  {
    x: 2320,
    icon: "📜",
    npc: "르베르토 4세",
    label: "사랑의 서약",
    title: "사랑의 서약을 들려주세요",
    story: "르베르토 신부님께 주례를 부탁하려면 게리와 샤티마에게 사랑의 서약서를 받아야 해요. 두 사람은 기쁜 날도 서툰 날도 서로의 편이 되기로 약속했습니다.",
    task: "게리와 샤티마에게 서약서를 받아 르베르토 4세의 주례 승낙 얻기",
    action: "사랑의 서약 맺기",
    toast: "주례 승낙서를 받았습니다!",
  },
  {
    x: 2830,
    icon: "⛪",
    npc: "클라랜스 & 안나 수녀",
    label: "웨딩 대성당",
    title: "이제, 결혼식을 시작합니다",
    story: "클라랜스 수녀의 안내로 식장에 입장하고, 안나 수녀가 모두의 자리를 확인했어요. 축복 속에서 두 사람은 같은 길을 걷겠다고 대답합니다.",
    task: "하객과 함께 입장해 예식을 진행하고 기념사진 남기기",
    action: "예식 시작!",
    toast: "축복 속에 결혼식이 완성되었습니다!",
  },
  {
    x: 3370,
    icon: "💎",
    npc: "제이콥",
    label: "영원의 정원",
    title: "약혼반지를 결혼반지로",
    story: "마지막으로 제이콥이 약혼반지를 영원한 결혼반지로 바꾸어 줍니다. 두 사람의 새로운 모험이 지금부터 시작됩니다.",
    task: "제이콥에게 결혼반지를 받고 최종 초대장 열기",
    action: "결혼반지 교환",
    toast: "WEDDING QUEST COMPLETE!",
  },
];

const WORLD_WIDTH = 3600;
const PLAYER_WIDTH = 172;
const MOVE_SPEED = 335;
const JUMP_SPEED = 760;
const GRAVITY = 2050;
const INTERACT_DISTANCE = 120;

const dom = {
  preloader: document.querySelector("#preloader"),
  intro: document.querySelector("#intro"),
  start: document.querySelector("#start-button"),
  shell: document.querySelector("#game-shell"),
  viewport: document.querySelector("#game-viewport"),
  world: document.querySelector("#world"),
  portals: document.querySelector("#portals"),
  player: document.querySelector("#player"),
  sprite: document.querySelector("#hero-sprite"),
  shadow: document.querySelector("#player-shadow"),
  location: document.querySelector("#location-label"),
  questLabel: document.querySelector("#quest-label"),
  progressCount: document.querySelector("#progress-count"),
  progressPips: document.querySelector("#progress-pips"),
  prompt: document.querySelector("#portal-prompt"),
  toast: document.querySelector("#toast"),
  soundButton: document.querySelector("#sound-button"),
  guideButton: document.querySelector("#guide-button"),
  shareButton: document.querySelector("#share-button"),
  guideDialog: document.querySelector("#guide-dialog"),
  questDialog: document.querySelector("#quest-dialog"),
  invitationDialog: document.querySelector("#invitation-dialog"),
  invitationClose: document.querySelector("#invitation-close"),
  questIcon: document.querySelector("#quest-icon"),
  questStep: document.querySelector("#quest-step"),
  questNpc: document.querySelector("#quest-npc"),
  questTitle: document.querySelector("#quest-title"),
  questStory: document.querySelector("#quest-story"),
  questTask: document.querySelector("#quest-task"),
  questAction: document.querySelector("#quest-action"),
  resetButton: document.querySelector("#reset-button"),
  replayButton: document.querySelector("#replay-button"),
  calendarButton: document.querySelector("#calendar-button"),
  finalShareButton: document.querySelector("#final-share-button"),
  confetti: document.querySelector("#confetti"),
  bgmPlayer: document.querySelector("#bgm-player"),
};

const state = {
  started: false,
  progress: Number(sessionStorage.getItem("weddingQuestProgress") || 0),
  x: 145,
  y: 0,
  velocityY: 0,
  cameraX: 0,
  facing: 1,
  currentQuest: 0,
  nearbyQuest: -1,
  celebratingUntil: 0,
  lastTime: performance.now(),
  keys: { left: false, right: false },
  soundOn: false,
  audio: null,
  bgmFrame: null,
  toastTimer: null,
};

function applyWeddingContent() {
  const text = {
    "#intro-groom": WEDDING.groom,
    "#intro-bride": WEDDING.bride,
    "#intro-date": WEDDING.introDate,
    "#invite-groom": WEDDING.groom,
    "#invite-bride": WEDDING.bride,
    "#invite-date": WEDDING.dateText,
    "#invite-place": WEDDING.place,
    "#invite-message": WEDDING.message,
    "#player-name": WEDDING.heroName,
  };

  Object.entries(text).forEach(([selector, value]) => {
    document.querySelector(selector).textContent = value;
  });

  document.title = `${WEDDING.groom} ♥ ${WEDDING.bride} · Wedding Quest`;
}

function createPortals() {
  dom.portals.innerHTML = QUESTS.map(
    (quest, index) => `
      <div class="portal" data-step="${index}" style="left:${quest.x}px">
        <div class="portal__label">${quest.label}</div>
        <div class="portal__gate"></div>
      </div>`,
  ).join("");

  dom.progressPips.innerHTML = QUESTS.map(() => "<span></span>").join("");
}

function updateProgressUI() {
  const completed = Math.min(state.progress, QUESTS.length);
  dom.progressCount.textContent = String(Math.min(completed, 7));

  document.querySelectorAll(".portal").forEach((portal, index) => {
    portal.classList.toggle("is-done", index < completed);
    portal.classList.toggle("is-active", index === completed);
    portal.classList.toggle("is-locked", index > completed);
  });

  [...dom.progressPips.children].forEach((pip, index) => {
    pip.classList.toggle("is-done", index < Math.min(completed, 7));
    pip.classList.toggle("is-active", index === completed && index < 7);
  });

  if (completed >= QUESTS.length) {
    dom.questLabel.textContent = "모든 웨딩 퀘스트를 완료했어요!";
  } else {
    dom.questLabel.textContent = `${completed + 1}. ${QUESTS[completed].task}`;
  }
}

function showToast(message, duration = 1900) {
  clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-showing");
  state.toastTimer = setTimeout(() => dom.toast.classList.remove("is-showing"), duration);
}

function getNearestQuest() {
  let nearest = -1;
  let nearestDistance = Infinity;

  QUESTS.forEach((quest, index) => {
    const distance = Math.abs(state.x + PLAYER_WIDTH / 2 - quest.x);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });

  return nearestDistance <= INTERACT_DISTANCE ? nearest : -1;
}

function setSpritePose(pose) {
  dom.sprite.className = `sprite sprite--${pose}`;
}

function jump() {
  if (!state.started || state.y > 1 || anyDialogOpen()) return;
  state.velocityY = JUMP_SPEED;
  state.y = 1;
  dom.player.classList.add("is-jumping");
  playEffect(520, 0.08, "square", 0.025);
}

function interact() {
  if (!state.started || anyDialogOpen()) return;
  const questIndex = getNearestQuest();

  if (questIndex < 0) {
    showToast("빛나는 포탈 가까이에서 ↑ 버튼을 눌러주세요");
    return;
  }

  if (questIndex > state.progress) {
    showToast("앞의 웨딩 퀘스트를 먼저 완료해 주세요 🔒");
    return;
  }

  openQuest(questIndex);
}

function openQuest(index) {
  const quest = QUESTS[index];
  const isDone = index < state.progress;
  state.currentQuest = index;
  releaseControls();
  dom.questIcon.textContent = quest.icon;
  dom.questStep.textContent = `WEDDING QUEST ${index + 1}`;
  dom.questNpc.textContent = quest.npc;
  dom.questTitle.textContent = quest.title;
  dom.questStory.textContent = quest.story;
  dom.questTask.textContent = quest.task;
  dom.questAction.textContent = isDone ? "완료한 이야기 다시 보기 ✓" : quest.action;
  dom.questAction.dataset.done = isDone ? "true" : "false";
  dom.questDialog.showModal();
}

function completeCurrentQuest() {
  if (dom.questAction.dataset.done === "true") {
    dom.questDialog.close();
    return;
  }

  const quest = QUESTS[state.currentQuest];
  if (state.currentQuest === state.progress) {
    state.progress += 1;
    sessionStorage.setItem("weddingQuestProgress", String(state.progress));
  }

  dom.questDialog.close();
  updateProgressUI();
  showToast(quest.toast, 2300);
  celebrate();
  playSuccessSound();

  if (state.progress >= QUESTS.length) {
    setTimeout(openInvitation, 950);
  }
}

function celebrate() {
  state.celebratingUntil = performance.now() + 850;
  setSpritePose("celebrate");
  burstConfetti(28);
}

function openInvitation() {
  releaseControls();
  if (!dom.invitationDialog.open) dom.invitationDialog.showModal();
  burstConfetti(80);
}

function burstConfetti(count = 50) {
  const colors = ["#ff79a4", "#63d7ed", "#ffda63", "#7ed680", "#a994f5", "#ffffff"];
  dom.confetti.innerHTML = "";

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--duration", `${2.8 + Math.random() * 2.2}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.7}s`);
    piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    dom.confetti.appendChild(piece);
  }

  setTimeout(() => (dom.confetti.innerHTML = ""), 6000);
}

function updateLocation() {
  let location = QUESTS[0].label;
  for (const quest of QUESTS) {
    if (state.x + PLAYER_WIDTH / 2 >= quest.x - 190) location = quest.label;
  }
  dom.location.textContent = location;
}

function updateGame(time) {
  const delta = Math.min((time - state.lastTime) / 1000, 0.035);
  state.lastTime = time;

  if (state.started && !anyDialogOpen()) {
    const move = Number(state.keys.right) - Number(state.keys.left);
    if (move !== 0) {
      state.facing = move;
      state.x += move * MOVE_SPEED * delta;
      state.x = Math.max(18, Math.min(WORLD_WIDTH - PLAYER_WIDTH - 12, state.x));
    }

    if (state.y > 0 || state.velocityY !== 0) {
      state.y += state.velocityY * delta;
      state.velocityY -= GRAVITY * delta;
      if (state.y <= 0) {
        state.y = 0;
        state.velocityY = 0;
        dom.player.classList.remove("is-jumping");
      }
    }

    const viewportWidth = dom.viewport.clientWidth;
    const targetCamera = Math.max(0, Math.min(WORLD_WIDTH - viewportWidth, state.x - viewportWidth * 0.4));
    state.cameraX += (targetCamera - state.cameraX) * Math.min(1, delta * 7.5);

    dom.world.style.transform = `translate3d(${-state.cameraX}px, 0, 0)`;
    dom.player.style.transform = `translate3d(${state.x}px, ${-state.y}px, 0)`;
    dom.shadow.style.transform = `translate3d(${state.x + 53}px, 0, 0) scale(${1 - Math.min(state.y / 720, 0.42)})`;
    dom.shadow.style.opacity = String(1 - Math.min(state.y / 520, 0.68));
    dom.player.classList.toggle("is-facing-left", state.facing < 0);
    dom.player.classList.toggle("is-moving", move !== 0);

    if (time < state.celebratingUntil) {
      setSpritePose("celebrate");
    } else if (state.y > 0) {
      setSpritePose("jump");
    } else if (move !== 0) {
      setSpritePose("walk");
    } else {
      setSpritePose("idle");
    }

    const nearby = getNearestQuest();
    if (nearby !== state.nearbyQuest) {
      state.nearbyQuest = nearby;
      dom.prompt.classList.toggle("is-visible", nearby >= 0);
      if (nearby >= 0) {
        const locked = nearby > state.progress;
        dom.prompt.querySelector("span").textContent = locked ? "아직 잠긴 포탈" : "포탈 타기";
      }
    }

    updateLocation();
  }

  requestAnimationFrame(updateGame);
}

function anyDialogOpen() {
  return dom.questDialog.open || dom.guideDialog.open || dom.invitationDialog.open;
}

function releaseControls() {
  state.keys.left = false;
  state.keys.right = false;
  document.querySelectorAll(".control-button").forEach((button) => button.classList.remove("is-pressed"));
}

function startGame() {
  state.started = true;
  dom.intro.classList.add("is-hidden");
  dom.shell.classList.remove("is-hidden");

  if (state.progress > 0 && state.progress < QUESTS.length) {
    state.x = Math.max(145, QUESTS[state.progress - 1].x + 90);
  } else if (state.progress >= QUESTS.length) {
    state.x = QUESTS.at(-1).x - 80;
  }

  state.lastTime = performance.now();
  updateProgressUI();
  showToast("← → 로 이동하고, 포탈 앞에서 ↑ 를 눌러주세요", 2600);
  toggleSound(true);
}

async function shareInvitation() {
  const data = {
    title: `${WEDDING.groom} ♥ ${WEDDING.bride}의 모바일 청첩장`,
    text: `${WEDDING.dateText}\n${WEDDING.place}\n웨딩 퀘스트에 초대합니다!`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast("초대장 링크를 복사했습니다!");
  } catch (error) {
    if (error.name !== "AbortError") showToast("주소창의 링크를 복사해 공유해 주세요");
  }
}

function saveCalendar() {
  const safeTitle = `${WEDDING.groom} ♥ ${WEDDING.bride} 결혼식`;
  const startLine = WEDDING.calendarAllDay
    ? `DTSTART;VALUE=DATE:${WEDDING.calendarStart}`
    : `DTSTART:${WEDDING.calendarStart}`;
  const endLine = WEDDING.calendarAllDay
    ? `DTEND;VALUE=DATE:${WEDDING.calendarEnd}`
    : `DTEND:${WEDDING.calendarEnd}`;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Quest//KR",
    "BEGIN:VEVENT",
    `UID:wedding-quest-${WEDDING.calendarStart}@invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    startLine,
    endLine,
    `SUMMARY:${safeTitle}`,
    `LOCATION:${WEDDING.place}`,
    `DESCRIPTION:${WEDDING.message.replaceAll("\n", "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wedding-invitation.ics";
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetGame() {
  sessionStorage.removeItem("weddingQuestProgress");
  state.progress = 0;
  state.x = 145;
  state.y = 0;
  state.velocityY = 0;
  state.cameraX = 0;
  releaseControls();
  if (dom.guideDialog.open) dom.guideDialog.close();
  if (dom.invitationDialog.open) dom.invitationDialog.close();
  updateProgressUI();
  showToast("첫 번째 퀘스트부터 다시 시작합니다!");
}

function createAudioEngine() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0.035;
  gain.connect(context.destination);
  return { context, gain };
}

function sendBgmCommand(command) {
  state.bgmFrame?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func: command, args: [] }),
    "*",
  );
}

function startAmoriaBgm() {
  if (state.bgmFrame) {
    sendBgmCommand("playVideo");
    return;
  }

  const frame = document.createElement("iframe");
  const origin = encodeURIComponent(window.location.origin);
  frame.title = "MapleStory Amoria BGM";
  frame.allow = "autoplay; encrypted-media";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.src = `https://www.youtube-nocookie.com/embed/${AMORIA_BGM_ID}?autoplay=1&loop=1&playlist=${AMORIA_BGM_ID}&controls=0&disablekb=1&fs=0&playsinline=1&enablejsapi=1&origin=${origin}`;
  frame.addEventListener("load", () => {
    if (state.soundOn) sendBgmCommand("playVideo");
  });
  dom.bgmPlayer.appendChild(frame);
  state.bgmFrame = frame;
}

function toggleSound(forceOn) {
  const next = typeof forceOn === "boolean" ? forceOn : !state.soundOn;
  if (!state.audio) state.audio = createAudioEngine();
  state.soundOn = next;
  if (next) {
    state.audio?.context.resume();
    startAmoriaBgm();
  } else {
    state.audio?.context.suspend();
    sendBgmCommand("pauseVideo");
  }
  dom.soundButton.classList.toggle("is-on", state.soundOn);
  dom.soundButton.textContent = state.soundOn ? "♫" : "♪";
  dom.soundButton.setAttribute("aria-label", state.soundOn ? "배경음 끄기" : "배경음 켜기");
}

function playEffect(frequency, duration, type = "sine", volume = 0.02) {
  if (!state.soundOn || !state.audio) return;
  const { context } = state.audio;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function playSuccessSound() {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    setTimeout(() => playEffect(frequency, 0.2, "triangle", 0.035), index * 95);
  });
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    const isJumpKey = ["Space", "KeyZ", "AltLeft", "AltRight"].includes(event.code);
    if (["ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.key) || isJumpKey) event.preventDefault();
    if (event.key === "ArrowLeft") state.keys.left = true;
    if (event.key === "ArrowRight") state.keys.right = true;
    if (isJumpKey && !event.repeat) jump();
    if (event.key === "ArrowUp" && !event.repeat) interact();
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") state.keys.left = false;
    if (event.key === "ArrowRight") state.keys.right = false;
  });

  window.addEventListener("blur", releaseControls);

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;
    const press = (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-pressed");
      if (control === "left" || control === "right") state.keys[control] = true;
      if (control === "jump") jump();
      if (control === "up") interact();
    };
    const release = (event) => {
      event.preventDefault();
      button.classList.remove("is-pressed");
      if (control === "left" || control === "right") state.keys[control] = false;
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });
}

function bindUI() {
  dom.start.addEventListener("click", startGame);
  dom.questAction.addEventListener("click", completeCurrentQuest);
  dom.soundButton.addEventListener("click", () => toggleSound());
  dom.guideButton.addEventListener("click", () => {
    releaseControls();
    dom.guideDialog.showModal();
  });
  dom.shareButton.addEventListener("click", shareInvitation);
  dom.finalShareButton.addEventListener("click", shareInvitation);
  dom.calendarButton.addEventListener("click", saveCalendar);
  dom.resetButton.addEventListener("click", resetGame);
  dom.replayButton.addEventListener("click", () => {
    dom.invitationDialog.close();
    resetGame();
  });
  dom.invitationClose.addEventListener("click", () => dom.invitationDialog.close());

  [dom.questDialog, dom.guideDialog, dom.invitationDialog].forEach((dialog) => {
    dialog.addEventListener("close", releaseControls);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && dialog !== dom.invitationDialog) dialog.close();
    });
  });
}

function init() {
  applyWeddingContent();
  createPortals();
  updateProgressUI();
  bindControls();
  bindUI();
  requestAnimationFrame(updateGame);

  Promise.all([
    new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = "assets/amoria-background-v2.jpg";
    }),
    new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = "assets/groom-sprite.png";
    }),
  ]).finally(() => setTimeout(() => dom.preloader.classList.add("is-ready"), 350));
}

init();
