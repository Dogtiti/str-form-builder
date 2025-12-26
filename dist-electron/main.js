import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: "STR Form Editor"
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
ipcMain.handle("dialog:openFile", async (_, filters) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: filters || [
      { name: "All Files", extensions: ["*"] },
      { name: "CSV Files", extensions: ["csv"] },
      { name: "XML Files", extensions: ["xml"] }
    ]
  });
  if (canceled) {
    return null;
  }
  return filePaths[0];
});
ipcMain.handle("fs:readFile", async (_, filePath, encoding = "utf-8") => {
  try {
    const content = fs.readFileSync(filePath, encoding);
    return { success: true, data: content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("dialog:saveFile", async (_, defaultPath, filters) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath,
    filters: filters || [
      { name: "XML Files", extensions: ["xml"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (canceled || !filePath) {
    return null;
  }
  return filePath;
});
ipcMain.handle("fs:writeFile", async (_, filePath, content, encoding = "utf-8") => {
  try {
    fs.writeFileSync(filePath, content, encoding);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});
ipcMain.handle("path:basename", (_, filePath) => {
  return path.basename(filePath);
});
