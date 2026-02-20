import { execFile } from "node:child_process";

/**
 * Execute a rad CLI command and return stdout.
 * Rejects if the command exits with a non-zero code.
 */
export function execRad(args) {
  return new Promise((resolve, reject) => {
    execFile("rad", args, { timeout: 30_000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`rad ${args.join(" ")} failed: ${stderr || error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
