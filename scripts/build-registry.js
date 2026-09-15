import path from "node:path";
import { readdirSync, writeFileSync } from "node:fs";

const meta = {
  Carousel: "Sliding carousel with dot navigation and optional autoplay",
  Checkbox: "Checkbox with indeterminate state over a native input",
  Marquee: "Looping ticker with adjustable speed and pause on hover",
  Radio: "Radio button over a native input, grouped by name",
  Select: "Custom dropdown to replace the native select element",
  Slider: "Single-value or range slider with configurable step",
};

const registry = {};

const root = path.join(import.meta.dirname, "../components");
const components = readdirSync(root);

const getLocalFiles = (...extraPath) => {
  return readdirSync(path.join(root, ...extraPath)).sort();
};

const getType = (localFile) => {
  const lastIndex = localFile.lastIndexOf(".");
  const extension = localFile.slice(lastIndex);

  const types = {
    ".html": "markup",
    ".css": "style",
    ".js": "script",
    ".ts": "script",
    ".tsx": "component",
    ".jsx": "component",
  };

  if (types[extension]) {
    return types[extension];
  }

  throw new Error(`Неизвестный тип файла: ${localFile}`);
};

components.forEach((component) => {
  const localVariants = getLocalFiles(component);

  const variants = {};

  localVariants.forEach((variant) => {
    const localFlavors = getLocalFiles(component, variant);
    const flavors = {};

    localFlavors.forEach((flavor) => {
      const localFlavorOptions = getLocalFiles(component, variant, flavor);

      const flavorOptions = [];

      localFlavorOptions.forEach((localFile) => {
        flavorOptions.push({
          from: path.posix.join(
            "components",
            component,
            variant,
            flavor,
            localFile,
          ),
          name: localFile,
          type: getType(localFile),
        });
      });

      flavors[flavor.toLowerCase()] = flavorOptions;
    });

    variants[variant.toLowerCase()] = {
      dependencies: variant.toLowerCase() === "react" ? ["react"] : [],
      flavors,
    };
  });

  variants.next = structuredClone(variants.react);
  Object.values(variants.next.flavors)
    .flat()
    .forEach((file) => {
      if (file.type === "component") file.modifiers = ["use-client"];
    });

  registry[component.toLowerCase()] = {
    name: component,
    description: meta[component] || '',
    variants,
  };
});

writeFileSync(
  path.join(import.meta.dirname, "../registry.json"),
  JSON.stringify(registry, null, 2) + "\n",
);
