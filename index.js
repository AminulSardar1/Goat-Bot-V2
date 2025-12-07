// main.js
// Auto-restart + Express server for Goat.js

"use strict";

const { spawn } = require("child_process");
const express = require("express");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 3000;

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
		} else if (code !== 0) {
			log.err("PROCESS", `Goat.js exited with code ${code}. No restart triggered.`);
		}
	});

	child.on("error", (err) => {
		log.err("STARTUP", `Failed to start project: ${err.message}`);
		process.exit(1);
	});
}

// Reset restart counter every 5 minutes
setInterval(() => {
	restartCount = 0;
}, 300000);

// Health check endpoint
// Start Goat.js process
startProject();
