"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const faker_1 = require("@faker-js/faker");
const cors_1 = __importDefault(require("cors"));
const cookieParser = require("cookie-parser");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const domain = process.env.DOMAIN;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.text());
app.use(cookieParser());
const cookieValue = "abcd";
const getSession = () => {
    const Session = {
        createTime: new Date(faker_1.faker.date.anytime().toString()).toISOString(),
        email: faker_1.faker.internet.email(),
        friendsIds: [12],
        isEmailVerified: faker_1.faker.datatype.boolean(),
        language: "EN",
        name: "user1234",
        firstName: faker_1.faker.person.firstName(),
        lastName: faker_1.faker.person.lastName(),
        role: "USER",
        theme: "SYSTEM",
        biography: faker_1.faker.person.bio(),
    };
    return Session;
};
app.get("/api/auth/session", (req, res) => {
    if (req.cookies.session_id === cookieValue) {
        res.status(200).json(getSession());
    }
    else {
        res.status(401).json({
            description: "Unauthorized",
        });
    }
});
app.post("/api/auth/password", (req, res) => {
    var _a;
    if (((_a = req.body.password) === null || _a === void 0 ? void 0 : _a.length) < 8) {
        res.status(400).json({
            code: "invalid_validation",
            fields: { password: "Password should contain at least 8 symbols" },
        });
    }
    if (req.body.email === "frkam@icloud.com" &&
        req.body.password === "12345678910") {
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
