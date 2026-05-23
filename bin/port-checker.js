#!/usr/bin/env node

const { execFile } = require("node:child_process");
const os = require("node:os");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 5000 }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

async function main() {
  const platform = os.platform();

  let stdout = "";

  if (platform === "win32") {
    stdout = await run("netstat", ["-ano", "-p", "tcp"]);
    console.log(JSON.stringify(parseWindows(stdout)));
  } else {
    stdout = await run("lsof", ["-iTCP", "-sTCP:LISTEN", "-P", "-n"]);
    console.log(JSON.stringify(parseUnix(stdout)));
  }
}

function parseUnix(text) {
  return text
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map(line => line.trim().split(/\s+/))
    .map(cols => ({
      command: cols[0],
      pid: cols[1],
      user: cols[2],
      address: cols[8],
      port: Number((cols[8] || "").split(":").pop()),
    }))
    .filter(x => Number.isFinite(x.port));
}

function parseWindows(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("TCP"))
    .map(line => line.split(/\s+/))
    .map(cols => {
      const local = cols[1] || "";
      return {
        command: "unknown",
        pid: cols[4],
        user: "",
        address: local,
        port: Number(local.split(":").pop()),
      };
    })
    .filter(x => Number.isFinite(x.port));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});