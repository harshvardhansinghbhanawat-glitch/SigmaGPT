// Test Runner: Launches server, runs tests, and shuts down cleanly
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = spawn("node", ["server.js"], {
  cwd: __dirname,
  stdio: "inherit",
  env: { ...process.env, PORT: "8080" },
});

const cleanup = () => {
  if (server.pid) {
    try {
      server.kill();
    } catch {}
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit();
});

// Run tests
const testProcess = spawn("node", ["test-api.js"], {
  cwd: __dirname,
  stdio: "inherit",
  env: process.env,
});

testProcess.on("exit", (code) => {
  cleanup();
  setTimeout(() => {
    process.exit(code || 0);
  }, 1000);
});
