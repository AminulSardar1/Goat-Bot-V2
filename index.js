// main.js
// Auto-restart + Express server for Goat.js

"use strict";

const { spawn } = require("child_process");
const express = require("express");
const path = require("path");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public/index.html
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
	log.info("SERVER", `Web server running on port ${PORT}`);
});

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

			log.info(
				"RESTART",
				`Restarting Project... (${restartCount}/${maxRestarts})`
			);

			setTimeout(startProject, 2000);
		} else if (restartCount >= maxRestarts) {
			log.err(
				"RESTART",
				"Maximum restart attempts reached. Keeping web server running..."
			);
		} else if (code !== 0) {
			log.err(
				"PROCESS",
				`Goat.js exited with code ${code}. Keeping web server running.`
			);
		}
	});

	child.on("error", (err) => {
		log.err(
			"STARTUP",
			`Failed to start project: ${err.message}`
		);
	});
}

// Reset restart counter every 5 minutes
setInterval(() => {
	restartCount = 0;
}, 300000);

// Start Goat.js process
startProject();
