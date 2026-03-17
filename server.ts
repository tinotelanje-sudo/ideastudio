import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { queryOfflineAi, getOfflineCompletions } from "./server/offlineAi.js";
import FtpDeploy from "ftp-deploy";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Offline AI API
  app.post("/api/ai/offline", (req, res) => {
    const { prompt } = req.body;
    const result = queryOfflineAi(prompt);
    res.json(result);
  });

  app.post("/api/ai/completions", (req, res) => {
    const { prefix } = req.body;
    const completions = getOfflineCompletions(prefix);
    res.json(completions);
  });

  // FTP Deployment API
  app.post("/api/deploy", async (req, res) => {
    const ftpDeploy = new FtpDeploy();
    const config = {
      user: process.env.FTP_USER || "razif@nasadef.com.my",
      password: process.env.FTP_PASS || "Nikrazif@1",
      host: process.env.FTP_HOST || "ftp.nasadef.com.my",
      port: 21,
      localRoot: path.join(__dirname, "dist"),
      remoteRoot: process.env.FTP_REMOTE_ROOT || "/public_html",
      include: ["*", "**/*"],
      deleteRemote: false,
      forcePasv: true,
      sftp: false,
    };

    try {
      console.log("Starting FTP deployment...");
      
      const distPath = path.join(__dirname, "dist");
      if (!fs.existsSync(distPath)) {
        throw new Error("Build folder 'dist' not found. Please run 'npm run build' first.");
      }

      await ftpDeploy.deploy(config);
      console.log("Deployment finished successfully");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Deployment error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mock API for project management
  app.get("/api/projects", (req, res) => {
    res.json([
      { id: 1, name: "Blink.ino", content: "void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}" },
    ]);
  });

  // Terminal command execution (Simulated for safety in Cloud Run)
  app.post("/api/terminal/exec", (req, res) => {
    const { command } = req.body;
    let output = "";
    
    if (command.startsWith("echo")) {
      output = command.replace("echo ", "") + "\n";
    } else if (command === "ls") {
      output = "Blink.ino  README.md  src/\n";
    } else if (command === "python --version") {
      output = "Python 3.10.12\n";
    } else if (command === "node -v") {
      output = "v20.10.0\n";
    } else {
      output = `Command not found: ${command}\n`;
    }
    
    res.json({ output });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
