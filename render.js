const { ipcRenderer } = require("electron");

// ミリ秒を時間:分:秒の形式に変換
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// アプリケーション使用時間の表示を更新
// アプリケーション名に基づいてアイコンを取得
function getAppIcon(appName) {
  const appNameLower = appName.toLowerCase();

  // 一般的なアプリケーションのアイコンマッピング
  const iconMap = {
    chrome: "fa-brands fa-chrome",
    firefox: "fa-brands fa-firefox-browser",
    safari: "fa-brands fa-safari",
    code: "fa-solid fa-code",
    terminal: "fa-solid fa-terminal",
    finder: "fa-solid fa-folder",
    slack: "fa-brands fa-slack",
    discord: "fa-brands fa-discord",
    spotify: "fa-brands fa-spotify",
    "microsoft teams": "fa-brands fa-microsoft",
    "visual studio code": "fa-solid fa-code",
    notes: "fa-solid fa-note-sticky",
    preview: "fa-solid fa-file-pdf",
    mail: "fa-solid fa-envelope",
    messages: "fa-solid fa-message",
    calendar: "fa-solid fa-calendar",
    photos: "fa-solid fa-image",
    music: "fa-solid fa-music",
    "app store": "fa-brands fa-app-store",
  };

  // アプリケーション名に基づいてアイコンを検索
  for (const [key, icon] of Object.entries(iconMap)) {
    if (appNameLower.includes(key)) {
      return icon;
    }
  }

  // デフォルトアイコン
  return "fa-solid fa-window-maximize";
}

function updateAppList(data) {
  const appList = document.getElementById("appList");
  appList.innerHTML = "";

  Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .forEach(([appName, duration]) => {
      const displayName = appName.slice(0, appName.lastIndexOf("."));
      const icon = getAppIcon(displayName);

      const li = document.createElement("li");
      li.className = "app-item";
      li.innerHTML = `
      <span class="${icon} app-icon"></span>
      <span class="app-name">
        ${displayName}
      </span>
      <span class="app-time">${formatDuration(duration)}</span>
    `;
      appList.appendChild(li);
    });
}

// メインプロセスからの更新を受信
ipcRenderer.on("update-usage", (event, data) => {
  updateAppList(data);
});

// 初期データをリクエスト
ipcRenderer.send("request-initial-data");
