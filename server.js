require("dotenv").config();
const nodemailer = require("nodemailer");

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post("/contact", (req, res) => {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }

    const sql =
        "INSERT INTO contacts (name,email,message) VALUES (?,?,?)";

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "New Portfolio Contact",
        html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email Error:", error);
        } else {
            console.log("Email Sent:", info.response);
        }
    });

    db.query(
        sql,
        [name, email, message],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Error saving message"
                });
            }

            res.status(200).json({
                message: "Message Saved Successfully"
            });
        }
    );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});