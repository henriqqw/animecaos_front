import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error("Usage: npm run auth:hash -- \"your-strong-password\"");
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;

const toBase64Url = (value) =>
  value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, {
  N,
  r,
  p,
  maxmem: 64 * 1024 * 1024
});

const raw = `scrypt$${N}$${r}$${p}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
const escapedForEnv = raw.replaceAll("$", "\\$");

console.log(raw);
console.error(`Use in .env/.env.local: ${escapedForEnv}`);
