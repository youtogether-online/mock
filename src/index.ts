import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { components } from "./generated/schema";
import { faker } from "@faker-js/faker";
import cors from "cors";
import cookieParser = require("cookie-parser");

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const domain = process.env.DOMAIN;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(cookieParser());
const cookieValue = "abcd";

const getSession =
  (): components["responses"]["SessionGetSuccess"]["content"]["application/json"] => {
    const Session: components["schemas"]["Me"] = {
      createTime: new Date(faker.date.anytime().toString()).toISOString(),
      email: faker.internet.email(),
      friendsIds: [12],
      isEmailVerified: faker.datatype.boolean(),
      language: "EN",
      name: "user1234",
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: "USER",
      theme: "SYSTEM",
      biography: faker.person.bio(),
    };

    return Session;
  };

app.get("/api/auth/session", (req: Request, res: Response) => {
  if (req.cookies.session_id === cookieValue) {
    res.status(200).json(getSession());
  } else {
    res.status(401).json({
      description: "Unauthorized",
    });
  }
});

app.post("/api/auth/password", (req: Request, res: Response) => {
  if (req.body.password?.length < 8) {
    res.status(400).json({
      code: "invalid_validation",
      fields: { password: "Password should contain at least 8 symbols" },
    });
  }

  if (
    req.body.email === "frkam@icloud.com" &&
    req.body.password === "12345678910"
  ) {
    res
      .status(200)
      .cookie("session_id", cookieValue, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000000,
        secure: true,
      })
      .json();
  }

  if (req.body.password !== "12345678910") {
    res
      .status(400)
      .json({ code: "invalid_password", description: "Invalid password" });
  }

  res.status(500);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
