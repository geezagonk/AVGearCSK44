const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
app.use(express.json());
app.use(cors());

// Load SSL Certificate (Self-Signed or Let's Encrypt)
const options = {
    key: fs.readFileSync("certs/key.pem"),
    cert: fs.readFileSync("certs/cert.pem")
};

// HDMI Matrix Network Configuration
const HDMI_MATRIX_IP = "10.1.10.72"; // Replace with your HDMI switcher's IP
const HDMI_MATRIX_PORT = 4001; // TCP port

// Function to Send TCP Commands to the HDMI Switcher
function sendTcpCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect(HDMI_MATRIX_PORT, HDMI_MATRIX_IP, () => {
            console.log(`Sending command: ${command}`);
            client.write(command);
        });

        client.on("data", (data) => {
            resolve(data.toString());
            client.destroy();
        });

        client.on("error", (err) => {
            reject(err);
        });

        client.on("close", () => {
            console.log("TCP connection closed");
        });
    });
}

//  Serve the Web Interface (HTML, CSS, JS)
app.use(express.static("public"));

//  API Route: Homepage (Test if API is running)
