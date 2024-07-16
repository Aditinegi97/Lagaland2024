const express = require("express");
const collection = require('./mongo');
const cors = require("cors");

const app = express();

// Middleware to sanitize input JSON
function sanitizeJson(req, res, buf, encoding) {
    try {
        const sanitizedStr = buf.toString().replace(/\u00A0/g, ' '); // Replace non-breaking spaces
        req.body = JSON.parse(sanitizedStr);
    } catch (e) {
        res.status(400).send('Invalid JSON');
    }
}

// Apply the body-parser with custom verification
app.use(express.json({ verify: sanitizeJson }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", cors(), (req, res) => {
    res.end("Hello World");
});

app.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await collection.findOne({ email: email });
        if (user) {
            if (user.password === password) {
                res.json("exist");
            } else {
                res.json("nopassword");
            }
        } else {
            res.json("nouser");
        }
    } catch (e) {
        res.json(e);
    }
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    const data = {
        email: email,
        password: password
    };

    try {
        const check = await collection.findOne({ email: email });
        if (check) {
            res.json("exist");
        } else {
            await collection.insertMany([data]);
            res.json("notexist");
        }
    } catch (e) {
        res.json(e);
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
