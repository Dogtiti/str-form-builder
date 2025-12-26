import { app as a, BrowserWindow as f, ipcMain as s, dialog as u } from "electron";
import * as l from "path";
import * as h from "fs";
import { fileURLToPath as p } from "url";
const w = p(import.meta.url), c = l.dirname(w), d = process.env.VITE_DEV_SERVER_URL;
let t = null;
function m() {
  t = new f({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: l.join(c, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    },
    title: "STR Form Editor"
  }), d ? (t.loadURL(d), t.webContents.openDevTools()) : t.loadFile(l.join(c, "../dist/index.html")), t.on("closed", () => {
    t = null;
  });
}
a.whenReady().then(() => {
  m(), a.on("activate", () => {
    f.getAllWindows().length === 0 && m();
  });
});
a.on("window-all-closed", () => {
  process.platform !== "darwin" && a.quit();
});
s.handle("dialog:openFile", async (i, e) => {
  const { canceled: r, filePaths: n } = await u.showOpenDialog({
    properties: ["openFile"],
    filters: e || [
      { name: "All Files", extensions: ["*"] },
      { name: "CSV Files", extensions: ["csv"] },
      { name: "XML Files", extensions: ["xml"] }
    ]
  });
  return r ? null : n[0];
});
s.handle("fs:readFile", async (i, e, r = "utf-8") => {
  try {
    return { success: !0, data: h.readFileSync(e, r) };
  } catch (n) {
    return {
      success: !1,
      error: n instanceof Error ? n.message : "Unknown error"
    };
  }
});
s.handle("dialog:saveFile", async (i, e, r) => {
  const { canceled: n, filePath: o } = await u.showSaveDialog({
    defaultPath: e,
    filters: r || [
      { name: "XML Files", extensions: ["xml"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  return n || !o ? null : o;
});
s.handle("fs:writeFile", async (i, e, r, n = "utf-8") => {
  try {
    return h.writeFileSync(e, r, n), { success: !0 };
  } catch (o) {
    return {
      success: !1,
      error: o instanceof Error ? o.message : "Unknown error"
    };
  }
});
s.handle("path:basename", (i, e) => l.basename(e));
