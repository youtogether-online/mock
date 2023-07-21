import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { components } from "./generated/schema";
import { faker } from "@faker-js/faker";
import cors from "cors";
import cookieParser = require("cookie-parser");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(cookieParser());
const cookieValue = "abcd";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  maxAge: 100000000,
  secure: true,
};

const generateNameFromFullName = ({ firstName, lastName }: { firstName: string, lastName: string }) => {
  return `${firstName.slice(0, 3)}${lastName.slice(0, 3)}`.toLowerCase()
}

app.get("/api/auth/session", (req: Request, res: Response) => {
  if (req.cookies.session_id === cookieValue) {
    const Session: components["schemas"]["Me"] = {
      name: generateNameFromFullName({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }), 
      email: "f**m@icloud.com",
      isEmailVerified: true,
      role: "user",
      language: "en",
      theme: "system",
      createTime: "2023-07-01T13:03:02.883385Z",
    };

    res.status(200).json(Session);
  } else {
    res.status(401).json({
      description: "Unauthorized",
    });
  }
});

app.post("/api/email/send-code", (req: Request, res: Response) => {
  console.log("Code: 12345");
  res.status(200).json();
});

app.post("/api/auth/email", (req: Request, res: Response) => {
  if (req.body.email === "frkam@icloud.com" && req.body.code === "12345") {
    res.status(201).cookie("session_id", cookieValue, cookieOptions).json();
  } else {
    res.status(400).json({
      code: "code_invalid_or_expired",
      description: "Code invalid or expired",
    });
  }
});

app.post("/api/auth/password", (req: Request, res: Response) => {
  if (req.body.password?.length < 8) {
    res.status(422).json({
      fields: { password: "Password should contain at least 8 symbols" },
    });
  }

  if (
    req.body.email === "frkam@icloud.com" &&
    req.body.password === "12345678910"
  ) {
    res
      .status(201)
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
