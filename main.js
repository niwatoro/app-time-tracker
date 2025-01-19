const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;
let appUsageData = {};
let currentApp = null;
let startTime = null;

// アクティブウィンドウの情報を取得する関数
function getActiveWindow() {
  return new Promise((resolve, reject) => {
    const script = `
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        return name of frontApp
      end tell
    `;

    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    alwaysOnTop: true,
    x: 50,
    y: 50,
  });

  mainWindow.loadFile("index.html");
}

// アプリケーションの使用時間を追跡
async function trackAppUsage() {
  try {
    const activeApp = await getActiveWindow();
    const now = Date.now();

    if (currentApp) {
      // 現在のアプリの使用時間を1秒加算
      appUsageData[currentApp] = (appUsageData[currentApp] || 0) + 1000; // 1秒 = 1000ミリ秒
      mainWindow.webContents.send("update-usage", appUsageData);
    }

    // アプリが切り替わった場合は現在のアプリを更新
    if (currentApp !== activeApp) {
      currentApp = activeApp;
    }
  } catch (error) {
    console.error("Error tracking app usage:", error);
  }
}

app.whenReady().then(() => {
  createWindow();

  // 1秒ごとにアクティブウィンドウをチェック
  setInterval(trackAppUsage, 1000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// レンダラープロセスからの初期データリクエストに応答
ipcMain.on("request-initial-data", () => {
  mainWindow.webContents.send("update-usage", appUsageData);
});
