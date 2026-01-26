const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function findUp(startDir, filename) {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function parseEnvFile(contents) {
  const env = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }
  return env;
}

function loadEnvFromDotEnvLocal() {
  const envPath =
    findUp(process.cwd(), ".env.local") ||
    findUp(__dirname, ".env.local") ||
    null;

  if (!envPath) return {};

  try {
    const contents = fs.readFileSync(envPath, "utf8");
    return parseEnvFile(contents);
  } catch {
    return {};
  }
}

const loadedEnv = loadEnvFromDotEnvLocal();

const args = process.argv.slice(2);
const pkg = process.env.SUBSTACK_MCP_PACKAGE || "substack-mcp@latest";
const npxArgs = ["-y", pkg, ...args];

const childEnv = { ...process.env, ...loadedEnv };

if (!childEnv.SUBSTACK_SESSION_TOKEN && childEnv.SUBSTACK_SESSION_ID) {
  childEnv.SUBSTACK_SESSION_TOKEN = childEnv.SUBSTACK_SESSION_ID;
}

if (!childEnv.SUBSTACK_USER_ID && childEnv.USER_ID) {
  childEnv.SUBSTACK_USER_ID = childEnv.USER_ID;
}

const child = spawn("npx", npxArgs, {
  stdio: "inherit",
  env: childEnv,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
