#!/usr/bin/env node

import { parseArgs } from "node:util";
import { add } from "../src/add.js";
import { list } from "../src/list.js";

try {
  const args = process.argv.slice(2);
  const { values, positionals } = parseArgs({
    args,
    options: {
      vanilla: { type: "boolean" },
      react: { type: "boolean" },
      next: { type: "boolean" },
      ts: { type: "boolean" },
      tw: { type: "boolean" },
      overwrite: { type: "boolean" },
      "dry-run": { type: "boolean" },
    },
    allowPositionals: true,
  });

  switch (positionals[0]) {
    case "list":
      list();
      break;
    case "add":
      add(positionals.slice(1), values);
      break;
    default:
      console.log("Usage: ui-base <list|add>");
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
