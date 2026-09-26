const { spawn } = require("child_process");
const logger = require("./utils/log");

const child = spawn(process.execPath, ["--trace-warnings", "mirai.js"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: false
});

child.on("error", (error) => {
  logger(`Process error: ${error.message}`, "error");
});

child.on("close", (code, signal) => {
  if (signal) logger(`Bot stopped by signal ${signal}`, "[ STOP ]");
  else logger(`Bot process exited with code ${code}`, code === 0 ? "[ STOP ]" : "error");
});
