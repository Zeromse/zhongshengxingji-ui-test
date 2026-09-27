const video = document.querySelector("#referenceVideo");
const appShell = document.querySelector("#appShell");
const interactionLayer = document.querySelector("#interactionLayer");
const detailPanel = document.querySelector("#detailPanel");
const panelContent = document.querySelector("#panelContent");
const panelEyebrow = document.querySelector("#panelEyebrow");
const sceneCode = document.querySelector("#sceneCode");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneSubtitle = document.querySelector("#sceneSubtitle");
const sceneHint = document.querySelector("#sceneHint");
const readoutTitle = document.querySelector("#readoutTitle");
const progressRange = document.querySelector("#progressRange");
const timeOutput = document.querySelector("#timeOutput");
const dockCopy = document.querySelector("#dockCopy");
const playToggle = document.querySelector("#playToggle");
const muteToggle = document.querySelector("#muteToggle");
const toast = document.querySelector("#toast");
const sceneTabs = [...document.querySelectorAll(".scene-tab")];

const scenes = {
  hub: {
    code: "HUB / 01",
    title: "众生行记",
    subtitle: "在余烬与回声之间，选择一条仍然亮着的路。",
    hint: "点击右侧节点，进入活动分区",
    readout: "回到起点",
    time: 128,
  },
  map: {
    code: "OPERATIONS / 02",
    title: "关卡地图",
    subtitle: "沿着被标记的路径前进，逐段确认仍然可抵达的坐标。",
    hint: "选择一个关卡节点，查看阶段数据",
    readout: "逐段推进",
    time: 53,
  },
  orders: {
    code: "ORDERS / 03",
    title: "甜梦会堂",
    subtitle: "订单已经送达。每一次交付，都会把下一段路照亮。",
    hint: "选择一份订单，查看奖励与进度",
    readout: "订单已同步",
    time: 155,
  },
  notebook: {
    code: "ARCHIVE / 04",
    title: "记事簿",
    subtitle: "被保存下来的，不只是故事，还有仍未结束的注视。",
    hint: "选择一则记录，打开事件档案",
    readout: "文档已解锁",
    time: 209,
  },
};

const mapNodes = [
  { id: "MT-5", label: "初始节点", position: "mt5", state: "已解锁", score: "3 / 3" },
  { id: "MT-6", label: "回声峡谷", position: "mt6", state: "已解锁", score: "2 / 3" },
  { id: "MT-7", label: "观测站", position: "mt7", state: "进行中", score: "1 / 3" },
  { id: "MT-8", label: "静默边界", position: "mt8", state: "已解锁", score: "0 / 3" },
  { id: "MT-9", label: "夜航灯塔", position: "mt9", state: "待确认", score: "0 / 3" },
  { id: "MT-10", label: "终点坐标", position: "mt10", state: "未解锁", score: "—" },
  { id: "MT-ST-3", label: "支线叙事", position: "mtst3", state: "已解锁", score: "1 / 1" },
  { id: "MT-EX-1", label: "实验入口", position: "mtex1", state: "隐藏", score: "—" },
];

const orders = [
  {
    id: "0号订单",
    title: "帕特里奇奇昂的订单",
    status: "可处理",
    reward: "聚合剂 × 1",
    detail: "给它上一层亮闪闪的喷漆，等配得上上锐骑的盛甲才行。",
  },
  {
    id: "1号订单",
    title: "夜巡补给申请",
    status: "已完成",
    reward: "龙门币 × 1800",
    detail: "将物资送到边缘坐标。信号很弱，但收件人仍在等待。",
  },
  {
    id: "2号订单",
    title: "空白处的回信",
    status: "待解锁",
    reward: "家具零件 × 20",
    detail: "订单没有留下署名，只有一枚被反复擦拭过的印记。",
  },
];

const stories = [
  {
    id: "broken-glasses",
    title: "破碎的眼镜片",
    status: "ACTIVE",
    copy: "锈械制作完成，连日的工作结束，你蜷缩在沙发，闭上双眼进入梦乡。\n\n你梦到小时候，那条来至城外的路。母亲抱着你走了很久很久。\n\n从母亲怀中抬起头，转过一百八十度，你看到一顶光环下，一支长长的铳械正在冒烟。",
  },
  {
    id: "empty-shell",
    title: "空弹壳",
    status: "NEW",
    copy: "风从空旷的回廊穿过，带走了没有说完的句子。\n\n有人把一枚弹壳放在窗台上，像给下一位来访者留下的坐标。",
  },
  {
    id: "empty-frame",
    title: "空相框",
    status: "NEW",
    copy: "画面被擦去之后，墙面上仍然留下四个钉孔。\n\n有些人不需要被画下来，也会被记住。",
  },
  {
    id: "workshop-key",
    title: "工坊钥匙",
    status: "NEW",
    copy: "钥匙在掌心发热。门后没有新的答案，只有一盏还没有熄灭的灯。\n\n你把它转动了一格。",
  },
];

const claimedOrders = new Set();
let activeScene = "hub";
let toastTimer = 0;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function hidePanel() {
  detailPanel.classList.remove("is-visible");
  panelContent.innerHTML = "";
}

function setPlayingState(isPlaying) {
  appShell.classList.toggle("is-playing", isPlaying);
  playToggle.setAttribute("aria-label", isPlaying ? "暂停录屏" : "播放录屏");
  playToggle.setAttribute("title", isPlaying ? "暂停录屏" : "播放录屏");
  dockCopy.textContent = isPlaying ? "PLAYING / REFERENCE TIMELINE" : "PAUSED / CLICK TO PREVIEW";
}

function updateTimeline() {
  const current = video.currentTime || 0;
  const duration = video.duration || 269;
  progressRange.max = duration;
  progressRange.value = current;
  timeOutput.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
}

function syncSceneTabs(sceneName) {
  sceneTabs.forEach((tab) => {
    const selected = tab.dataset.scene === sceneName;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
}

function renderHub() {
  interactionLayer.innerHTML = `
    <button class="hotspot hotspot-map" type="button" data-scene="map">
      <span class="hotspot-icon">01</span>
      <span><strong>瞭望圣堂</strong><small>AN ANCIENT SHRINE</small></span>
    </button>
    <button class="hotspot hotspot-orders" type="button" data-scene="orders">
      <span class="hotspot-icon">02</span>
      <span><strong>甜梦会堂</strong><small>DREAM HALL</small></span>
    </button>
    <button class="hotspot hotspot-story" type="button" data-scene="map">
      <span class="hotspot-icon">03</span>
      <span><strong>制镜师之夜</strong><small>THE MIRRORMAKER</small></span>
    </button>
    <button class="hotspot hotspot-notebook" type="button" data-scene="notebook">
      <span class="hotspot-icon">04</span>
      <span><strong>记事簿</strong><small>FIELD NOTES</small></span>
    </button>
  `;
}

function renderMap() {
  interactionLayer.innerHTML = mapNodes
    .map(
      (node) => `
        <button class="map-node ${node.position}" type="button" data-node="${node.id}">
          <span><strong>${node.id}</strong><small>${node.state}</small></span>
        </button>
      `,
    )
    .join("");
}

function renderOrders() {
  interactionLayer.innerHTML = `
    <div class="order-stack" aria-label="订单列表">
      ${orders
        .map(
          (order, index) => `
            <button class="order-card ${index === 0 ? "is-selected" : ""}" type="button" data-order-id="${order.id}" data-order="${index + 1}">
              <span><strong>${order.title}</strong><small>${order.status}</small></span>
              <span class="order-state">${claimedOrders.has(order.id) ? "已领取" : "查看"}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderNotebook() {
  interactionLayer.innerHTML = `
    <div class="story-stack" aria-label="记事簿条目">
      ${stories
        .map(
          (story, index) => `
            <button class="story-entry ${index === 0 ? "is-selected" : ""}" type="button" data-story-id="${story.id}">
              <span class="entry-line" aria-hidden="true"></span>
              <strong>${story.title}</strong>
              <small>${story.status}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderInteraction(sceneName) {
  if (sceneName === "map") {
    renderMap();
    return;
  }
  if (sceneName === "orders") {
    renderOrders();
    return;
  }
  if (sceneName === "notebook") {
    renderNotebook();
    return;
  }
  renderHub();
}

function selectScene(sceneName, options = {}) {
  const scene = scenes[sceneName];
  if (!scene) return;

  activeScene = sceneName;
  appShell.dataset.scene = sceneName;
  sceneCode.textContent = scene.code;
  sceneTitle.textContent = scene.title;
  sceneSubtitle.textContent = scene.subtitle;
  sceneHint.textContent = scene.hint;
  readoutTitle.textContent = scene.readout;
  syncSceneTabs(sceneName);
  renderInteraction(sceneName);
  hidePanel();

  if (options.seek !== false && Number.isFinite(scene.time)) {
    video.pause();
    video.currentTime = scene.time;
    setPlayingState(false);
  }

  if (options.notify !== false) {
    showToast(`已切换至 ${scene.title}`);
  }
}

function openMapPanel(nodeId) {
  const node = mapNodes.find((item) => item.id === nodeId);
  if (!node) return;

  interactionLayer.querySelectorAll(".map-node").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.node === nodeId);
  });
  panelEyebrow.textContent = `OPERATION / ${node.id}`;
  panelContent.innerHTML = `
    <h2 class="panel-title">${node.id}</h2>
    <p class="panel-subtitle">${node.label}已被纳入当前路径。进入演示后，可以继续查看这一区段的节点关系。</p>
    <div class="panel-rule"></div>
    <div class="panel-stats">
      <div class="stat-cell"><small>状态</small><strong>${node.state}</strong></div>
      <div class="stat-cell"><small>评级</small><strong>${node.score}</strong></div>
    </div>
    <button class="panel-action" type="button" data-panel-action="stage">
      <span>定位到关卡</span><span aria-hidden="true">↗</span>
    </button>
  `;
  detailPanel.classList.add("is-visible");
}

function openOrderPanel(orderId) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;

  interactionLayer.querySelectorAll(".order-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.orderId === orderId);
  });
  const claimed = claimedOrders.has(order.id);
  panelEyebrow.textContent = `ORDER / ${order.id}`;
  panelContent.innerHTML = `
    <h2 class="panel-title">${order.title}</h2>
    <p class="panel-subtitle">${order.detail}</p>
    <div class="panel-rule"></div>
    <div class="panel-stats">
      <div class="stat-cell"><small>阶段</small><strong>${order.status}</strong></div>
      <div class="stat-cell"><small>奖励</small><strong>${order.reward}</strong></div>
    </div>
    <button class="panel-action ${claimed ? "is-done" : ""}" type="button" data-panel-action="claim-order" data-order-id="${order.id}">
      <span>${claimed ? "奖励已领取" : "领取阶段奖励"}</span><span aria-hidden="true">${claimed ? "✓" : "↗"}</span>
    </button>
  `;
  detailPanel.classList.add("is-visible");
}

function openStoryPanel(storyId) {
  const story = stories.find((item) => item.id === storyId);
  if (!story) return;

  interactionLayer.querySelectorAll(".story-entry").forEach((entry) => {
    entry.classList.toggle("is-selected", entry.dataset.storyId === storyId);
  });
  panelEyebrow.textContent = `NOTEBOOK / ${story.status}`;
  panelContent.innerHTML = `
    <h2 class="panel-title">${story.title}</h2>
    <p class="article-copy">${story.copy}</p>
    <button class="panel-action" type="button" data-panel-action="archive">
      <span>标记为已读</span><span aria-hidden="true">↗</span>
    </button>
  `;
  detailPanel.classList.add("is-visible");
}

function handleInteractionClick(event) {
  const hotspot = event.target.closest("[data-scene]");
  if (hotspot) {
    selectScene(hotspot.dataset.scene);
    return;
  }

  const mapNode = event.target.closest("[data-node]");
  if (mapNode) {
    openMapPanel(mapNode.dataset.node);
    return;
  }

  const orderCard = event.target.closest("[data-order-id]");
  if (orderCard) {
    openOrderPanel(orderCard.dataset.orderId);
    return;
  }

  const storyEntry = event.target.closest("[data-story-id]");
  if (storyEntry) {
    openStoryPanel(storyEntry.dataset.storyId);
  }
}

function handlePanelAction(event) {
  const actionButton = event.target.closest("[data-panel-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.panelAction;
  if (action === "claim-order") {
    const orderId = actionButton.dataset.orderId;
    const alreadyClaimed = claimedOrders.has(orderId);
    if (alreadyClaimed) {
      showToast("这份奖励已经领取过了");
      return;
    }
    claimedOrders.add(orderId);
    renderOrders();
    openOrderPanel(orderId);
    showToast("奖励已收纳进活动记录");
    return;
  }

  if (action === "stage") {
    showToast("演示模式：关卡入口已定位");
    return;
  }

  if (action === "archive") {
    actionButton.classList.add("is-done");
    actionButton.querySelector("span").textContent = "已标记为已读";
    actionButton.querySelectorAll("span")[1].textContent = "✓";
    showToast("这条记录已加入已读索引");
  }
}

sceneTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectScene(tab.dataset.scene));
});

interactionLayer.addEventListener("click", handleInteractionClick);
panelContent.addEventListener("click", handlePanelAction);

document.querySelector("#panelClose").addEventListener("click", hidePanel);
document.querySelector("#homeButton").addEventListener("click", () => selectScene("hub"));
document.querySelector("#backButton").addEventListener("click", () => selectScene("hub"));

playToggle.addEventListener("click", async () => {
  if (video.paused) {
    try {
      await video.play();
    } catch {
      showToast("录屏需要先点击一次播放");
    }
  } else {
    video.pause();
  }
});

muteToggle.addEventListener("click", () => {
  video.muted = !video.muted;
  appShell.classList.toggle("is-muted", video.muted);
  muteToggle.setAttribute("aria-label", video.muted ? "打开声音" : "关闭声音");
  muteToggle.setAttribute("title", video.muted ? "打开声音" : "关闭声音");
  showToast(video.muted ? "声音已静音" : "声音已打开");
});

document.querySelector("#resetButton").addEventListener("click", () => {
  selectScene("hub", { notify: false });
  video.pause();
  video.currentTime = scenes.hub.time;
  updateTimeline();
  setPlayingState(false);
  showToast("展示已重置");
});

progressRange.addEventListener("input", () => {
  video.currentTime = Number(progressRange.value);
  updateTimeline();
});

video.addEventListener("loadedmetadata", () => {
  progressRange.max = video.duration;
  video.currentTime = scenes.hub.time;
  updateTimeline();
});

video.addEventListener("timeupdate", updateTimeline);
video.addEventListener("play", () => setPlayingState(true));
video.addEventListener("pause", () => setPlayingState(false));
video.addEventListener("error", () => showToast("录屏素材暂时无法加载，仍可浏览交互层"));

renderInteraction("hub");
appShell.dataset.scene = "hub";
appShell.classList.add("is-muted");
setPlayingState(false);
updateTimeline();
