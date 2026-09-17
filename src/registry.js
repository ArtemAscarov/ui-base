import fs from "node:fs";
import path from "node:path";

export const registryRoot = (...paths) =>
  path.join(import.meta.dirname, "..", ...paths);

export function loadRegistry() {
  const raw = fs.readFileSync(registryRoot("registry.json"), "utf-8");
  return JSON.parse(raw);
}
