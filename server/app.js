const express = require("express");
const path = require("path");
const app = express();

process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == "development"
    ? "development"
    : "production";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
});
const port = process.env.PORT || 5000;

const staticPath = path.resolve(__dirname, "../client/build");
app.use(express.static(staticPath));
app.get("*", (req, res) => res.sendFile(staticPath));

app.listen(port, () => {
  // console.log("\x1b[32m%s\x1b[0m", `Server running at http://127.0.0.1:${port}`)
});
