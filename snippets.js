(function () {
  "use strict";

  var PACKAGE = "@artem_ascarov/ui-base";
  var STACKS = [
    { id: "vanilla", label: "Vanilla" },
    { id: "react", label: "React" },
    { id: "next", label: "Next" },
  ];
  var LANGS = [
    { id: "js", label: "JS" },
    { id: "ts", label: "TS" },
  ];

  var cache = new Map();
  var pickers = [...document.querySelectorAll("[data-picker]")];

  if (pickers.length) {
    fetch("./registry.json")
      .then(function (response) {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(function (registry) {
        pickers.forEach(function (root) {
          setup(root, registry[root.dataset.picker]);
        });
      })
      .catch(function () {
        pickers.forEach(function (root) {
          fail(root.querySelector("[data-picker-code]"));
        });
      });
  }

  function setup(root, component) {
    if (!component) return fail(root.querySelector("[data-picker-code]"));

    var state = { stack: "vanilla", lang: "js", tw: false, file: null };

    var stackRow = root.querySelector("[data-picker-stacks]");
    var flavorRow = root.querySelector("[data-picker-flavors]");
    var fileRow = root.querySelector("[data-picker-files]");
    var command = root.querySelector("[data-picker-command]");
    var code = root.querySelector("[data-picker-code]");
    var note = root.querySelector("[data-picker-note], .get__note");

    STACKS.forEach(function (stack) {
      stackRow.append(
        chip(stack.label, function () {
          state.stack = stack.id;
          state.file = null;
          render();
        })
      );
    });

    LANGS.forEach(function (lang) {
      flavorRow.append(
        chip(lang.label, function () {
          state.lang = lang.id;
          state.file = null;
          render();
        })
      );
    });

    flavorRow.append(
      chip("Tailwind", function () {
        state.tw = !state.tw;
        state.file = null;
        render();
      })
    );

    render();

    function render() {
      var flavor = state.lang + (state.tw ? "-tw" : "");
      var files = component.variants[state.stack].flavors[flavor] || [];

      if (state.file === null || state.file >= files.length) {
        state.file = main(files);
      }

      mark(stackRow, function (index) {
        return STACKS[index].id === state.stack;
      });

      mark(flavorRow, function (index) {
        return index < LANGS.length
          ? LANGS[index].id === state.lang
          : state.tw;
      });

      command.textContent =
        "npx " +
        PACKAGE +
        " add " +
        root.dataset.picker +
        " --" +
        state.stack +
        (state.lang === "ts" ? " --ts" : "") +
        (state.tw ? " --tw" : "");

      fileRow.replaceChildren();

      files.forEach(function (file, index) {
        fileRow.append(
          chip(file.name, function () {
            state.file = index;
            render();
          })
        );
      });

      mark(fileRow, function (index) {
        return index === state.file;
      });

      var current = files[state.file];

      if (!current) return fail(code);

      note.hidden = current.type !== "markup";
      show(code, current);
    }
  }

  function main(files) {
    var order = ["component", "markup", "script", "style"];

    for (var i = 0; i < order.length; i += 1) {
      var found = files.findIndex(function (file) {
        return file.type === order[i];
      });

      if (found !== -1) return found;
    }

    return 0;
  }

  function show(code, file) {
    var prefix = (file.modifiers || []).includes("use-client")
      ? '"use client";\n\n'
      : "";

    if (cache.has(file.from)) {
      code.textContent = prefix + cache.get(file.from);
      return;
    }

    code.textContent = "…";

    fetch("./" + file.from)
      .then(function (response) {
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then(function (text) {
        var trimmed = text.replace(/\s+$/, "");

        cache.set(file.from, trimmed);
        code.textContent = prefix + trimmed;
      })
      .catch(function () {
        fail(code);
      });
  }

  function fail(code) {
    if (code) {
      code.textContent =
        "Source unavailable — open this page over http, not from the file system.";
    }
  }

  function chip(label, onClick) {
    var button = document.createElement("button");

    button.type = "button";
    button.className = "chip";
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", onClick);

    return button;
  }

  function mark(row, isActive) {
    [...row.children].forEach(function (button, index) {
      button.setAttribute("aria-pressed", String(isActive(index)));
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", copy);
  });

  function copy(event) {
    var button = event.currentTarget;
    var code = button.parentElement.querySelector("code");

    if (!code || !navigator.clipboard) return;

    navigator.clipboard
      .writeText(code.textContent)
      .then(function () {
        var original = button.textContent;

        button.textContent = button.dataset.copiedLabel || "Copied";
        button.dataset.copied = "true";

        setTimeout(function () {
          button.textContent = original;
          button.removeAttribute("data-copied");
        }, 1400);
      })
      .catch(function () {
        var range = document.createRange();
        var selection = window.getSelection();

        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      });
  }
})();
