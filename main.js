 
const path = require('path');
const url = require('url');

const payment = require('./payment');

const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const electron =  require('electron')
global['app-version'] = app.getVersion(); 

console.log( app.isPackaged )
//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
 

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}


//-------------------------------------------------------------------
 
//-------------------------------------------------------------------
let win;
// 事件分发中心
ipcMain.on('global',async function (event, arg) { 
    
    switch(arg.event) {
        case "login": payment.login(arg.data);break; 
      }  
})


function sendStatusToWindow(text) { 
  win.webContents.send('message', text);
}
function createDefaultWindow() { 
    
    var size = electron.screen.getPrimaryDisplay().workAreaSize;
    console.log(size,(3*size.width)/4)
    win = new BrowserWindow({
        //x:(2*size.width)/3,
        x:0,
        y:0,
        width: size.width/2,
        height: size.height,
        fullscreen: false,
        resizable: true,
        webPreferences: {
            javascript: true,
            plugins: true,
            nodeIntegration: true, //  Nodejs  模块 影响到 jquery
            devTools: true,
        }
    });
  global['webContents'] = win.webContents;
  
 win.webContents.openDevTools({ mode: 'detach' });  // mode: ('right' | 'bottom' | 'undocked' | 'detach');
  
  win.on('closed', () => {
    win = null;
  });
  // win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
  }))
  return win;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});
 
 
//-------------------------------------------------------------------
 
//-------------------------------------------------------------------
app.on('ready', function()  {
    setTimeout(function(){
      global['webContents'].send('replay',{
        event:'version',
        data: {
          version : app.getVersion(),
          isPackaged: app.isPackaged
        }
      }) 
    },1500)
    setTimeout(function(){
      if(app.isPackaged){
        global['webContents'].send('replay',{
          event:'version',
          data:  "UPDATE" 
        }) 
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.checkForUpdates();
      }
    },2500)
});
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();  
})
