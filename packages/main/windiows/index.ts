import { BrowserView, BrowserWindow, App } from "electron";
import { join } from 'path'

const leftViewWidth = 60;

// 创建等高固定宽度 BrowserView
export function createdBar(props: { win: BrowserWindow, app: App }) {
  const { win, app } = props;

  const query = `bar`;


  const leftView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
    }
  });

  win.setBrowserView(leftView);

  leftView.setBounds({ x: leftViewWidth, y: 0, width: win.getContentBounds().width - leftViewWidth, height: win.getContentBounds().height })

  win.on("resized", () => {
    leftView.setBounds({ x: leftViewWidth, y: 0, width: win.getBounds().width - leftViewWidth, height: win.getContentBounds().height })
  })

  // leftView.setAutoResize({ width: true, height: true, vertical: true })


  if (app.isPackaged || process.env['DEBUG']) {
    leftView.webContents.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { to: 'bar' }
    })
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin

    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}/${query}`
    leftView.webContents.loadURL('https://baidu.com')
    // leftView.webContents.openDevTools()
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
