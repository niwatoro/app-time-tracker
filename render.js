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
function updateAppList(data) {
  const appList = document.getElementById("appList");
  appList.innerHTML = "";

  Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .forEach(([appName, duration]) => {
      const li = document.createElement("li");
      li.className = "app-item";
      li.innerHTML = `
      <span class="app-name">
        <i class="fa-solid fa-window-maximize app-icon"></i>
        ${appName}
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
