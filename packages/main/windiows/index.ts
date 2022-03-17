import { BrowserView, BrowserWindow, App, app, ipcMain } from "electron";
import { join } from "path";
import cookieParser from "cookie";

const leftViewWidth = 0;

// 创建等高固定宽度 BrowserView
export function createdBar(props: { win: BrowserWindow; app: App }) {
  const { win, app } = props;

  // const query = `bar`;
  // const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/${query}`;
  const url = "https://oa.wxsoft.cn";
  const leftView = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      javascript: true,
      nativeWindowOpen: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
      nodeIntegrationInSubFrames: false,
      // enableWebSQL: false,
    },
  });

  win.setBrowserView(leftView);

  leftView.setBounds({
    x: leftViewWidth,
    y: 1,
    width: win.getContentBounds().width - leftViewWidth,
    height: win.getContentBounds().height,
  });

  win.on("resized", () => {
    leftView.setBounds({
      x: leftViewWidth,
      y: 1,
      width: win.getBounds().width - leftViewWidth,
      height: win.getContentBounds().height,
    });
  });

  const cks = cookieParser.parse(Cookie);
  const ckArr = Object.keys(cks)?.map((key) => {
    const value = cks[key];
    const ck = {
      url,
      name: key,
      value: value,
    };
    leftView.webContents.session.cookies.set(ck);

    return ck;
  });

  // leftView.setAutoResize({ width: true, height: true, vertical: true })

  if (app.isPackaged || process.env["DEBUG"]) {
    leftView.webContents.loadFile(join(__dirname, "../renderer/index.html"), {
      query: { to: "bar" },
    });
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    setTimeout(() => {
      leftView.webContents.loadURL(url, {
        // userAgent:
        //   "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
      });
      leftView.webContents.openDevTools();
    });

    // leftView.webContents.session.
  }

  // leftView.webContents.addListener("dom-ready", () => {
  //   leftView.webContents.insertCSS(`
  //     html,body{
  //       width: ${leftViewWidth}px !important;
  //       overflow: hidden;
  //     }
  // `)
  // })
}

const Cookie = ` .WxEAP.Session=CfDJ8AZPTDVYhSdOpTn%2FRTHV3kF52ebRlgHNzb1ZG1o81c2tIM4XzNTokGPLSN43jYblDsC1DAqRaA4JEduBm1uvoIq2cWSFCLx2NABm93s8MhRfXgbg4clU%2FOi3OB0ku7RMe0s4bqKluPoADSb9IcCuPVSaIn5aSmzp8YyrFy1UqsG%2F; .AspNetCore.Antiforgery.9TtSrW0hzOs=CfDJ8AZPTDVYhSdOpTn_RTHV3kFOqELyIXabIkIthhP3Exf-HH0LsmE_fo_b5QXdIiNWkI5kQewlR4wTB9kQFpKyeV1E-TEiG556sReYbCh7BP-IXW7ltMX9iqP3CSe4bT4vrMGXoaLLab4axotMMLuoGYA; .AspNetCore.WxEAP.UserIdentity=CfDJ8AZPTDVYhSdOpTn_RTHV3kHA3vtH7Mt57tQC1vnSi6VT05gWuPhAG-43nvzeXqrj1RFifnJE5rZSOLWuRY6DN3tfihcFro3h5TTwTI8jdd1b4b4CWW_rZU9tG7iQwo1u-yeErGaz2s7mvarN1sVDEklc0xzBBQv8Gh-kC0rYOCDqK5CNw5c-lNIU9q6iQ9w0h2UQ-tfxt3lZYOpIX8shfJMkmmFFc4gF6PSIjqrLyTFKDWEqR4n3cBV6BMKX4UKHqiqTHCISPAWrgmaws0EWv4eHbqn0G9TqX73PhR1R_ztFz16saFO2k24hqr4AOSTcS_pSnbVYd-ysk65A03L_SoDuDFK-VUr5yeddWS-DcWzOP2RwhuyH4kFF2phn-iTDcbAPXcQfUgzk9JknSbS2aF4oCi5dMSM1iQUXNChIh9epwfMX7FRLhhRQWQEru_82InzOeQSTDvDai-IzKGjmzm4x02a0UOmefxm7SFiYpD0y`;

// 保持一个登录窗口
let loginWin: BrowserWindow | null = null;
export function createLogin() {
  if (loginWin && !loginWin?.isDestroyed()) {
    loginWin?.show();
    return;
  }
  // // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
  const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/login`;

  loginWin = new BrowserWindow({
    title: "login",
    // width: 380,
    width: 600,
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

  ipcMain.on("login-msg", (event, name, passwd) => {
    console.log("login msg", name, passwd);
    event.sender.send("login-reply", 1);

    createLoginView();
  });

  function createLoginView() {
    const url = "http://192.168.0.71/eap-dev/";
    const bView = new BrowserView({
      webPreferences: {
        // contextIsolation: true,
        // javascript: true,
        // nativeWindowOpen: true,
        // nodeIntegration: false,
        // sandbox: true,
        // webviewTag: true,
        // nodeIntegrationInSubFrames: false,
        // enableWebSQL: false,
        // preload: join(__dirname, "../preload/index.cjs"),
      },
    });

    loginWin?.setBrowserView(bView);

    if (!loginWin) return;
    bView.setBounds({
      x: 0,
      y: 0,
      width: 400,
      height: 600,
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
                    name.value = "xxx";
                    passwd.value = "Su123456";
                    
                    btn && btn.click();
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
          const url = bView.webContents.getURL();
          console.log(url);
        });
    });

    // console.log(
    //   bView.webContents.once("dom-ready", () => {
    //     console.log(document);
    //   })
    // );

    // bView.webContents.on("dom-ready", (e) => {
    //   console.log(e);

    //   // const nameDom: any = document?.getElementById("#EmpNo");
    //   // if (nameDom) {
    //   //   nameDom.value = 15768620102;
    //   // }
    // });
  }
}
