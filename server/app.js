const express = require("express");
const app = express();

const PORT = 8000;

app.get("/api/greeting", (req, res) => res.send("Hello World!"));

app.use(express.static("client/build"));
app.get("*", (req, res) => res.sendFile("client/build"));

app.listen(PORT);
