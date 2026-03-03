/**
 * Run seed SQL via docker compose exec (for re-seeding or when init was skipped).
 */
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const seedPath = path.join(projectRoot, "docker", "postgres", "init", "02-seed.sql");

const truncateSql = "TRUNCATE TABLE items;\n";
const seedSql = fs.readFileSync(seedPath, "utf8");
const fullSql = truncateSql + seedSql;

const proc = spawn(
  "docker",
  [
    "compose",
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    process.env.POSTGRES_USER || "postgres",
    "-d",
    "million-list",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "-",
  ],
  {
    cwd: projectRoot,
    stdio: ["pipe", "inherit", "inherit"],
  }
);

proc.stdin.write(fullSql);
proc.stdin.end();

proc.on("close", (code) => {
  process.exit(code ?? 0);
});

proc.on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
