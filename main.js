const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

let mainWindow;
let appUsageData = {};
let currentApp = null;
let startTime = null;

// アクティブウィンドウとURLの情報を取得する関数
async function getActiveWindowInfo() {
  const getBrowserUrl = async (browser) => {
    const scriptMap = {
      "Google Chrome": `
        tell application "Google Chrome"
          get URL of active tab of front window
        end tell
      `,
      Safari: `
        tell application "Safari"
          get URL of current tab of front window
        end tell
      `,
      Firefox: `
        tell application "System Events"
          tell process "Firefox"
            get name of front window
          end tell
        end tell
        `,
    };

    if (scriptMap[browser]) {
      try {
        const url = await new Promise((resolve, reject) => {
          exec(`osascript -e '${scriptMap[browser]}'`, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(stdout.trim());
          });
        });
        return url;
      } catch (error) {
        console.error(`Error getting URL from ${browser}:`, error);
        return null;
      }
    }
    return null;
  };

  return new Promise((resolve, reject) => {
    const script = `
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        return name of application file of frontApp
      end tell
    `;

    exec(`osascript -e '${script}'`, async (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const appName = stdout.trim();
      const browserMap = {
        "Google Chrome.app": "Google Chrome",
        "Safari.app": "Safari",
        "Firefox.app": "Firefox",
      };

      const browserName = browserMap[appName];
      if (browserName) {
        const url = await getBrowserUrl(browserName);
        if (url) {
          try {
            const domain = new URL(url).hostname;
            resolve({ app: appName, domain });
          } catch (error) {
            const splitted = url
              .split(" - ")
              .flatMap((part) => part.split(" | "))
              .flatMap((part) => part.split(" / "));
            resolve({ app: appName, domain: splitted[splitted.length - 1].split("(")[0].trim() });
          }
          return;
        }
      }
      resolve({ app: appName });
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 100,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    alwaysOnTop: true,
  });

  mainWindow.loadFile("index.html");

  // デスクトップの右下に配置
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  mainWindow.setPosition(width - 300, height - 100);
}

// アプリケーションの使用時間を追跡
async function trackAppUsage() {
  try {
    const { app: activeApp, domain } = await getActiveWindowInfo();
    const now = Date.now();

    if (currentApp) {
      if (domain) {
        // ブラウザの場合、ドメインごとに時間を記録
        if (!appUsageData[activeApp]) {
          appUsageData[activeApp] = { total: 0, domains: {} };
        }
        appUsageData[activeApp].total += 1000;
        appUsageData[activeApp].domains[domain] = (appUsageData[activeApp].domains[domain] || 0) + 1000;
      } else {
        // 通常のアプリの場合
        if (typeof appUsageData[currentApp] === "object") {
          appUsageData[currentApp].total += 1000;
        } else {
          appUsageData[currentApp] = (appUsageData[currentApp] || 0) + 1000;
        }
      }
      mainWindow.webContents.send("update-usage", {
        usageData: appUsageData,
        activeApp: activeApp,
        activeDomain: domain,
      });
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
  mainWindow.webContents.send("update-usage", {
    usageData: appUsageData,
    activeApp: currentApp,
  });
});
