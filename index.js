// main.js
// Combined auto-restart + express server

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");
const path = require("path");

let restartCount = 0;
const maxRestarts = 5;

/**
 * Start Goat.js with auto-restart logic
 */
function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code === 2 && restartCount < maxRestarts) {
			restartCount++;
			log.info("RESTART", `Restarting Project... (${restartCount}/${maxRestarts})`);
			setTimeout(startProject, 2000);
		} else if (restartCount >= maxRestarts) {
			log.err("RESTART", "Maximum restart attempts reached. Stopping...");
			process.exit(1);
		}
	});

	child.on("error", (err) => {
		log.err("STARTUP", "Failed to start project:", err);
		process.exit(1);
	});
}

// Reset restart counter every 5 minutes
setInterval(() => {
	restartCount = 0;
}, 300000);

startProject();

/**
 * Express server setup
 */
const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Default route → index.html
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
	log.info("SERVER", `Web server running at http://0.0.0.0:${PORT}`);
});
