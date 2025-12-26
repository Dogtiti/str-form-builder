"use strict";
const electron = require("electron");
const electronAPI = {
  openFileDialog: (filters) => electron.ipcRenderer.invoke("dialog:openFile", filters),
  saveFileDialog: (defaultPath, filters) => electron.ipcRenderer.invoke("dialog:saveFile", defaultPath, filters),
  readFile: (filePath, encoding) => electron.ipcRenderer.invoke("fs:readFile", filePath, encoding),
  writeFile: (filePath, content, encoding) => electron.ipcRenderer.invoke("fs:writeFile", filePath, content, encoding),
  getBasename: (filePath) => electron.ipcRenderer.invoke("path:basename", filePath)
};
electron.contextBridge.exposeInMainWorld("electron", electronAPI);
