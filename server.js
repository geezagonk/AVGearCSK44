const net = require("net");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const HDMI_MATRIX_IP = "10.1.10.72"; // Update with your device IP
const HDMI_MATRIX_PORT = 4001;       // TCP port

// Function to send TCP command
function sendTcpCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(HDMI_MATRIX_PORT, HDMI_MATRIX_IP, () => {
            console.log(`Sending: ${command}`);
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
            console.log("Connection closed");
        });
    });
}

// API: Switch HDMI Input/Output
app.post("/api/switch-hdmi", async (req, res) => {
    const { input, output } = req.body;
    if (!input || !output) return res.status(400).json({ error: "Invalid request" });

    const command = `${output}B${input}.`; // Example: "1B3." (Output 1 to Input 3)
    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Switched Output ${output} to Input ${input}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Set Volume (0-100)
app.post("/api/set-volume", async (req, res) => {
    const { output, volume } = req.body;
    if (!output || volume === undefined) return res.status(400).json({ error: "Invalid request" });

    const command = `${output}V${volume}.`; // Example: "1V50."
    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Set Output ${output} Volume to ${volume}%` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Mute/Unmute Output
app.post("/api/mute", async (req, res) => {
    const { output, state } = req.body;
    if (!output || !["mute", "unmute"].includes(state)) return res.status(400).json({ error: "Invalid request" });

    const command = state === "mute" ? `${output}$.` : `${output}@.`; // Example: "1$." (mute) or "1@." (unmute)
    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Output ${output} is now ${state}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API: Get Current HDMI Matrix Status
app.get("/api/status", async (req, res) => {
    try {
        const response = await sendTcpCommand("Status."); // Command to get status
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve frontend
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
