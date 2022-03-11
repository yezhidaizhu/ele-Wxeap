import { BrowserView, BrowserWindow, App } from "electron";
import { join } from 'path'

// 创建等高固定宽度 BrowserView
export function createdBar(props: { win: BrowserWindow, app: App }) {
  const { win, app } = props;

  const viewWidth = 600;
  const query = `bar`;


  const leftView = new BrowserView();

  win.setBrowserView(leftView);

  leftView.setBounds({ x: 0, y: 0, width: viewWidth, height: win.getBounds().height })


  if (app.isPackaged || process.env['DEBUG']) {
    leftView.webContents.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { to: 'bar' }
    })
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin

    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}/${query}`
    leftView.webContents.loadURL(url)
    leftView.webContents.openDevTools()
  }



  leftView.webContents.addListener("dom-ready", () => {
    leftView.webContents.insertCSS(`
      html,body{
        width: ${viewWidth}px !important;
        overflow: hidden;
      }
  `)
  })

}