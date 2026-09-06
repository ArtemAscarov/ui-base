function main() {
  document.querySelectorAll("[data-indeterminate]").forEach((input) => {
    input.indeterminate = true;
  });
}

main();
