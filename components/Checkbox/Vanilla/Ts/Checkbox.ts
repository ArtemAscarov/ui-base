document
  .querySelectorAll<HTMLInputElement>(
    "[data-checkbox-input][data-indeterminate]"
  )
  .forEach((input) => {
    input.indeterminate = true;
  });
