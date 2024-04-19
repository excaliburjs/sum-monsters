const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { copyFile, constants } = require('node:fs/promises');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createPlay = async (url, sgb) => {
  if (playWindow && sgb !== playWindowSgb) {
    playWindow.close();
    playWindow = null;
  }

  if (!playWindow) {
    // Create the browser window.
    playWindow = new BrowserWindow({
      width: sgb ? 512 : 480,
      height: sgb ? 448 : 432,
      fullscreenable: false,
      autoHideMenuBar: true,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: process.env.NODE_ENV !== "development",
      },
    });
    playWindowSgb = sgb;
  } else {
    playWindow.show();
  }

  playWindow.setMenu(null);
  playWindow.loadURL(`${url}?audio=true&sgb=${sgb ? "true" : "false"}`);

  playWindow.on("closed", () => {
    playWindow = null;
  });
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
    },
  });

  mainWindow.setIcon(path.join(__dirname, './icon.png'));

  // and load the index.html of the app.
  // building with parcel grab from dist
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Remove menu
  mainWindow.removeMenu();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
})