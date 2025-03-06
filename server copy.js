const net = require("net");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (your HTML, CSS, and JS)
app.use(express.static(path.join(__dirname, "public")));

const HDMI_MATRIX_IP = "10.1.10.72"; // HDMI matrix IP
const HDMI_MATRIX_PORT = 4001;       // TCP control port

// Function to send TCP command
function sendTcpCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(HDMI_MATRIX_PORT, HDMI_MATRIX_IP, () => {
            console.log(`Connected to HDMI Matrix: Sending ${command}`);
            client.write(command); // Send command without CR/LF
        });

        client.on("data", (data) => {
            console.log("Response:", data.toString());
            resolve(data.toString());
            client.destroy(); // Close connection
        });

        client.on("error", (err) => {
            console.error("TCP Error:", err.message);
            reject(err);
        });

        client.on("close", () => {
            console.log("Connection closed");
        });
    });
}

// API Route: Switch HDMI Input/Output
app.post("/api/switch-hdmi", async (req, res) => {
    const { input, output } = req.body;
    if (!input || !output) return res.status(400).json({ error: "Invalid request" });

    const command = `${output}B${input}.`; // Example: "2B3."

    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Switched Output ${output} to Input ${input}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Route: Set HDMI Volume
app.post("/api/set-volume", async (req, res) => {
    const { output, volume } = req.body;
    if (!output || volume === undefined) return res.status(400).json({ error: "Invalid request" });

    // Construct the volume command (e.g., "1V50.")
    const command = `${output}V${volume}.`;

    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Set Output ${output} Volume to ${volume}%` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// API Route: Set HDMI Volume (0-100)
app.post("/api/set-volume", async (req, res) => {
    const { output, volume } = req.body;
    if (!output || volume === undefined) return res.status(400).json({ error: "Invalid request" });

    const command = `${output}V${volume}.`; // e.g., "1V50."

    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Set Output ${output} Volume to ${volume}%` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Route: Mute/Unmute HDMI Output
app.post("/api/mute", async (req, res) => {
    const { output, state } = req.body;
    if (!output || !["mute", "unmute"].includes(state)) return res.status(400).json({ error: "Invalid request" });

    const command = state === "mute" ? `${output}$.` : `${output}@.`; // e.g., "1$." (mute) or "1@." (unmute)

    try {
        await sendTcpCommand(command);
        res.json({ success: true, message: `Output ${output} is now ${state}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Route: Fetch Current Volume & Status
app.get("/api/status", async (req, res) => {
    try {
        const response = await sendTcpCommand("Status.");
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Serve frontend (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});