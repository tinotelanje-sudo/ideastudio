import FtpDeploy from "ftp-deploy";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log("🚀 Starting Deployment to NASADEF...");

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ Deployment Finished Successfully!"))
    .catch((err) => console.error("❌ Deployment Error:", err));
