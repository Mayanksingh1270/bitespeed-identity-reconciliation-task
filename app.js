const express = require("express");
const identifyRoute = require("./routes/identifyRoutes");

const app = express();

app.use(express.json());

app.use("/identify", identifyRoute);

app.get("/", (req, res) => {
  res.send("Bitespeed Service Running ");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});