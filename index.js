const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { z } = require("zod");

const { UserModel, TodoModel } = require("./db");

mongoose.connect(
  ""
);

const app = express();

app.use(express.json());

const JWT_SECRET = "tanuj12979384";

//route handler
app.post("/signup", async (req, res) => {
  //check that password has 1 uppercase , 1 lower case  and a special character
  const reqBody = z.object({
    email: z.string().min(3).max(100),
    password: z.string().min(5),
    name: z.string(),
  });

  //There is a difference between parse and safeparse

  const { success } = z.safeParse(reqBody, req.body);

  if (!success) {
    res.json({
      message: "Incorrect email and password format",
    });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  const hashedpassword = await bcrypt.hash(password, 2);

  try {
  await UserModel.create({
    email: email,
      password: hashedpassword,
    name: name,
  });
  } catch (error) {
    return res.json({
      message: "Duplicate Keys exists",
    });
  }
  return res.status(200).json({
    msg: "Signed up successfully",
  });
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    res.status(403).json({
      message: "user does not exist in the db",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
  } else {
    res.json({
      msg: "Incorrect Credentials",
    });
  }
});

const AuthMiddleware = (req, res, next) => {
  const token = req.headers.token;
  const decodedData = jwt.verify(token, JWT_SECRET);
  if (decodedData) {
    req.userid = decodedData.id;
    next();
  } else {
    res.json({
      msg: "Authorization failed",
    });
  }
};

// app.use(AuthMiddleware);

app.post("/todo", AuthMiddleware, async (req, res) => {
  const todoTitle = req.body.title;
  const done = req.body.done;
  const todoModel = await TodoModel.create({
    title: todoTitle,
    done: done,
  });

  res.json({
    msg: "Todo created" + todoModel.toString(),
  });
});

app.get("/todos", AuthMiddleware, async (req, res) => {
  const userid = req.userid;
  const userTodo = await TodoModel.find({
    userid: userid,
  });

  res.json({
    userTodo,
  });
});

// app.get("/get-todo", (req, res) => {
//   const todoId = req?.query?.id;
//   if (todoId == "") {
//     res.status(400).json({
//       msg: "Please pass the id as query parameter",
//     });
//   }

//   todo.filter((t) => {
//     if (t.id == todoId) {
//       res.send(t.description);
//     }
//   });
// });

// app.post("/post-todo", (req, res) => {
//   const todoId = req?.body?.id;
//   const todoDesc = req?.body?.description;

//   todo.push({
//     id: todoId,
//     description: todoDesc,
//   });

//   res.status(201).json({
//     message: "Todo Created successfully",
//   });
// });

// app.delete("/delete-todo", (req, res) => {
//   res.send("Todo deleted");
// });

app.listen(3000);
