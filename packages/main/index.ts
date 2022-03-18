import {
  app,
  BrowserWindow,
  shell,
  Menu,
  Tray,
  nativeImage,
  BrowserView,
} from "electron";
import { release } from "os";
import { join } from "path";
import "./samples/electron-store";
import "./samples/node-fetch";
import "./samples/execa";
import img from "./win.png";

import { createdBar, createEapWin, createLogin } from "./windiows/index";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    width: 1200,
    height: 700,
    webPreferences: {
      // preload: join(__dirname, '../preload/index.cjs')
    },
  });

  if (app.isPackaged || process.env["DEBUG"]) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/bar`;

    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test active push message to Renderer-process
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  // win.webContents.setWindowOpenHandler(({ url }) => {
  //   if (url.startsWith('https:')) shell.openExternal(url)
  //   return { action: 'deny' }
  // })

  createdBar({ app, win });
}

let tray: Tray | null = null;
const image = nativeImage.createFromDataURL(img);

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  tray = new Tray(image);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Item1" },
    {
      label: "Item2",
      click() {
        createEapWin();
      },
    },
    {
      label: "打开",
      click() {
        createEapWin();
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("This is my application.");

  tray.addListener("click", function () {
    // createWindow();
    createEapWin();
  });
  tray.addListener("right-click", function () {
    tray?.popUpContextMenu(contextMenu);
  });

  // createWindow();
});

app.on("window-all-closed", () => {
  win = null;
  // if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
