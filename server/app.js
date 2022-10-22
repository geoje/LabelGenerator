const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

app.get("/api/greeting", (req, res) => res.send("Hello World!"));

const staticPath = path.resolve(__dirname, "../client/build");
app.use(express.static(staticPath));
app.get("*", (req, res) => res.sendFile(staticPath));

app.listen(port, () =>
  console.log("\x1b[32m%s\x1b[0m", `Server running at http://127.0.0.1:${port}`)
);
