import path from "node:path";
import { loadRegistry, registryRoot } from "./registry.js";
import fs from "node:fs";

export function add(components, options) {
  const flavor = (options.ts ? "ts" : "js") + (options.tw ? "-tw" : "");
  let stack = ["next", "react", "vanilla"].filter((i) => options[i]);
  const registry = loadRegistry();

  if (stack.length > 1) throw new Error("You can't choose more than 1 stack");
  stack = stack[0] ?? "vanilla";

  if (components.length < 1)
    throw new Error("Specify at least one component \n Try npx ui-base list");

  for (const name of components) {
    const currentComponent = registry[name];

    if (!currentComponent)
      throw new Error("Component not found \n Try npx ui-base list");

    const currentVariant = currentComponent.variants[stack];
    const currentFlavor = currentVariant.flavors[flavor];

    if (!currentFlavor)
      throw new Error("Component's flavor not found \n Try npx ui-base list");

    currentFlavor.forEach((item) => {
      let content = fs.readFileSync(registryRoot(item.from), "utf8");

      if (item.type === "markup") {
        console.log(`\n${item.name} is a markup fragment, copy it into your page:\n`);
        console.log(content);
        return;
      }

      if (item.modifiers?.includes("use-client")) {
        content = '"use client";\n\n' + content;
      }

      const targetDir = path.join(
        process.cwd(),
        "components/ui",
        currentComponent.name,
      );
      const target = path.join(targetDir, item.name);

      if (options["dry-run"]) {
        console.log("will write", target);
        return;
      }

      if (fs.existsSync(target) && !options.overwrite) {
        console.log("skipped (exists)", item.name);
        return;
      }

      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(target, content);

      console.log("added", item.name);
    });
  }
}
