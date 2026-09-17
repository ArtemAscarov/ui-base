import { loadRegistry } from "./registry.js";

export function list() {
  for (const [key, value] of Object.entries(loadRegistry())) {
    console.log(key, value.description);
  }
}
