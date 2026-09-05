function initSelect(select) {
  const trigger = select.querySelector(".ui-select__trigger");
  const options = select.querySelectorAll(".ui-select__option");

  function toggle() {
    select.classList.toggle("ui-select--open");
  }

  function close() {
    select.classList.remove("ui-select--open");
  }

  select.addEventListener("click", (event) => event.stopPropagation());
  document.documentElement.addEventListener("click", close);
  trigger.addEventListener("click", toggle);

  options.forEach((option) => {
    option.addEventListener("click", () => {
      trigger.innerText = option.innerText;
      close();
    });
  });
}

function main() {
  document.querySelectorAll("[data-ui-select]").forEach(initSelect);
}

main();
