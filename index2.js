const express = require("express");

const app = express();

app.use(express.json());

const isOldEnoughMiddleware = (req, res, next) => {
  const age = req.query.age;
  if (age >= 14) {
    next();
  } else {
    res.status(400).json({
      msg: "Sorry! your age is not enough for the ride",
    });
  }
};

app.use(isOldEnoughMiddleware);

app.get("/ride1", (req, res) => {
  res.status(200).json({
    msg: "This is ride1",
  });
});

app.get("/ride2", (req, res) => {
  res.status(200).json({
    msg: "This is ride2",
  });
});

app.listen(4000);
