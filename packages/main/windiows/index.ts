import { BrowserView, BrowserWindow, App, app, ipcMain } from "electron";
import { join } from "path";
import cookieParser from "cookie";
import Store from 'electron-store'

const store = new Store();

const leftViewWidth = 0;

const Cookie = ` .WxEAP.Session=CfDJ8AZPTDVYhSdOpTn%2FRTHV3kF52ebRlgHNzb1ZG1o81c2tIM4XzNTokGPLSN43jYblDsC1DAqRaA4JEduBm1uvoIq2cWSFCLx2NABm93s8MhRfXgbg4clU%2FOi3OB0ku7RMe0s4bqKluPoADSb9IcCuPVSaIn5aSmzp8YyrFy1UqsG%2F; .AspNetCore.Antiforgery.9TtSrW0hzOs=CfDJ8AZPTDVYhSdOpTn_RTHV3kFOqELyIXabIkIthhP3Exf-HH0LsmE_fo_b5QXdIiNWkI5kQewlR4wTB9kQFpKyeV1E-TEiG556sReYbCh7BP-IXW7ltMX9iqP3CSe4bT4vrMGXoaLLab4axotMMLuoGYA; .AspNetCore.WxEAP.UserIdentity=CfDJ8AZPTDVYhSdOpTn_RTHV3kHA3vtH7Mt57tQC1vnSi6VT05gWuPhAG-43nvzeXqrj1RFifnJE5rZSOLWuRY6DN3tfihcFro3h5TTwTI8jdd1b4b4CWW_rZU9tG7iQwo1u-yeErGaz2s7mvarN1sVDEklc0xzBBQv8Gh-kC0rYOCDqK5CNw5c-lNIU9q6iQ9w0h2UQ-tfxt3lZYOpIX8shfJMkmmFFc4gF6PSIjqrLyTFKDWEqR4n3cBV6BMKX4UKHqiqTHCISPAWrgmaws0EWv4eHbqn0G9TqX73PhR1R_ztFz16saFO2k24hqr4AOSTcS_pSnbVYd-ysk65A03L_SoDuDFK-VUr5yeddWS-DcWzOP2RwhuyH4kFF2phn-iTDcbAPXcQfUgzk9JknSbS2aF4oCi5dMSM1iQUXNChIh9epwfMX7FRLhhRQWQEru_82InzOeQSTDvDai-IzKGjmzm4x02a0UOmefxm7SFiYpD0y`;

// const eapUrl = "https://demo.govpm.cn/WxEAP/";

// 保持一个登录窗口
let loginWin: BrowserWindow | null = null;
export function createLogin() {
  if (loginWin && !loginWin?.isDestroyed()) {
    loginWin?.show();
    return;
  }

  // 清除eap cookie;
  rmCookie();

  console.log("to login");

  // // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
  const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/login`;

  loginWin = new BrowserWindow({
    title: "login",
    width: 380,
    // width: 600,
    height: 660,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (app.isPackaged || process.env["DEBUG"]) {
    loginWin.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    loginWin.loadURL(url);
    // loginWin.webContents.openDevTools();
  }

  const setLoginConfig = (event: any, userInfo: any) => {
    console.log("login msg", userInfo);
    // event.sender.send("login-reply", 1);
    const { name = "", passwd = "", keep = false } = userInfo || {};
    // 回复状态
    const send = (status = 1) => event.sender.send("login-reply", status);
    keep && saveUserInfo(userInfo);
    createLoginView({ send, name, passwd });
  };

  ipcMain.on("login-msg", setLoginConfig);
  loginWin?.on("closed", () => ipcMain.removeListener("login-msg", setLoginConfig));

  const setSettingConfig = async (event: any, config: any) => {
    const send = (status = 1) => event.sender.send("setting-reply", status);
    if (typeof config === 'object') {
      await saveEapConfig(config);
      send(1);
    } else {
      send(0);
    }
  };
  ipcMain.on("setting-msg", setSettingConfig);
  loginWin?.on("closed", () => ipcMain.removeListener("setting-msg", setSettingConfig));
}

// 创建exp win
export async function createEapWin(opts?: { path?: string, onLoaded?: Function }) {
  const { eapUrl = "" } = await getEapConfig();
  const { path = "", onLoaded } = opts ?? {};
  const url = eapUrl + path;
  console.log("start creat eap win");

  const win = new BrowserWindow({
    title: "Main window",
    width: 1200,
    height: 700,
    show: false,
    webPreferences: {
      // preload: join(__dirname, '../preload/index.cjs')
    },
  });

  // 注入cookie
  const innsertCookie = async () => {
    const cks = await getCookies();
    cks?.map((ck: any) => {
      const _ck = {
        url: eapUrl,
        name: ck.name,
        value: ck.value,
      };
      win.webContents.session.cookies.set(_ck);
    });
  }

  await innsertCookie();

  setTimeout(() => {
    win.loadURL(url).then(() => {
      onLoaded?.(win); // 创建之后执行
    });
  })


  win.webContents.on("did-finish-load", async () => {
    if (isLoginPage(win.webContents.getURL())) {
      createLogin();
      win.destroy();
    } else {
      win.show();
    }
  });
}

// 设置
let SettingWin: BrowserWindow | null = null;
export function createSettingWin() {// 保持一个登录窗口
  if (SettingWin && !SettingWin?.isDestroyed()) {
    SettingWin?.show();
    return;
  }

  // // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
  const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/setting`;

  SettingWin = new BrowserWindow({
    title: "setting",
    width: 380,
    // width: 600,
    height: 660,
    // resizable: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (app.isPackaged || process.env["DEBUG"]) {
    SettingWin?.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    SettingWin?.loadURL(url);
    // SettingWin?.webContents.openDevTools();
  }

  const setConfig = async (event: any, config: any) => {
    const send = (status = 1) => event.sender.send("setting-reply", status);
    if (typeof config === 'object') {
      await saveEapConfig(config);
      send(1);
    } else {
      send(0);
    }
  };

  ipcMain.on("setting-msg", setConfig);
  SettingWin?.on("closed", () => ipcMain.removeListener("setting-msg", setConfig))

  const setLoginConfig = (event: any, userInfo: any) => {
    console.log("login msg", userInfo);
    // event.sender.send("login-reply", 1);
    const { name = "", passwd = "", keep = false } = userInfo || {};
    // 回复状态
    const send = (status = 1) => event.sender.send("login-reply", status);
    keep && saveUserInfo(userInfo);
    createLoginView({ send, name, passwd });
  };

  ipcMain.on("login-msg", setLoginConfig);
  SettingWin?.on("closed", () => ipcMain.removeListener("login-msg", setLoginConfig));
}


// 创建一个隐藏的窗口进行模拟登陆
async function createLoginView(opts: {
  send: Function;
  name: string;
  passwd: string;
  onSuccess?: Function;
}) {
  const { eapUrl = "" } = await getEapConfig();
  if (!eapUrl) return;

  const { name = "", passwd = "", send = () => { }, onSuccess = () => { } } = opts;
  const url = eapUrl;
  const bView = new BrowserView({
    webPreferences: {},
  });

  loginWin?.setBrowserView(bView);

  if (!loginWin) return;
  bView.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  bView.webContents.loadURL(url);
  // bView.webContents.openDevTools();

  bView.webContents.on("did-finish-load", async () => {
    bView.webContents
      .executeJavaScript(
        `new Promise(function (resolve, reject) {
            setTimeout(function(){
              try {
                var name = document.getElementById("EmpNo");
                var passwd = document.getElementById("EmpPassWord");
                
                var btn = document.getElementById("btnLogin");

                if(name && passwd && btn){
                  name.value = "${name}";
                  passwd.value = "${passwd}";
                  
                  btn.click();
                  // 返回1，说明正常点击了一次登录
                  // 并未确认是否已经登录完成
                  resolve(1);
                }else{
                  resolve(0);
                }
              } catch (error) {
                resolve(0);
              }
            },100)
        })`,
        true
      )
      .then((res) => {
        console.log("start login ...");

        bView.webContents.on("did-finish-load", () => {
          const url = bView.webContents.getURL();
          console.log(res, url);

          if (loginWin && !isLoginPage(url)) {
            loginWin?.destroy();
            loginWin = null;
            bView?.webContents?.removeAllListeners?.();

            // 成功登陆 todo
            createEapWin({
              onLoaded(win: BrowserWindow) {
                saveCookie(win);
                onSuccess?.();
              }
            });

            console.log("==> login sussesss");
          }
        });
      })
      .finally(() => {
        send(1); // 回复
      });
  });
}


// 判断是否为登录界面
function isLoginPage(url: string) {
  return url.toLocaleLowerCase().includes("wxlogin");
}


// 保存eap cookie
async function saveCookie(win: BrowserWindow) {
  const { eapUrl = "" } = await getEapConfig();
  if (!eapUrl) return;

  const url = eapUrl;
  win.webContents.session.cookies.get({ url }).then((cookies) => {
    store.set("cookies", cookies);
  }).catch((error) => {
    console.log(error)
  })
}

// 获取cookie
async function getCookies() {
  const cookies: any = await store.get("cookies") || [];
  return cookies || [];
}

// 清除
function rmCookie() {
  return store.set("cookies", []);
}

// 保存用户信息
function saveUserInfo(info: { name: string, passwd: string }) {
  const { name = "", passwd = "" } = info || {};
  store.set("userInfo", { name, passwd });
}

// 保存设置信息
const eapConfigKey = "eapConfig";
async function saveEapConfig(config: { [x: string]: any }) {
  config = config || {};
  const eapConfig: any = await store.get(eapConfigKey) || {};
  await store.set(eapConfigKey, { ...eapConfig, ...config });
}

export async function getEapConfig() {
  return (await store.get(eapConfigKey)) as any || { eapUrl: "" };
}
