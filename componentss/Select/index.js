function main() {
  let selectedOption = document.getElementById("selected-option");
  let selectedBody = document.getElementById("select_body");
  let options = document.querySelectorAll(".select_body--content button");
  let globalParent = document.querySelector("html");
  let localParent = document.querySelector(".parent");
  let arrow = document.querySelector(".arrow");

  localParent.addEventListener("click", (e) => e.stopPropagation());
  globalParent.addEventListener("click", () => {
    arrow.classList.remove("rotate");
    selectedBody.classList.remove("is-open");
  });

  function toggleSelectorBody() {
    arrow.classList.toggle("rotate");
    selectedBody.classList.toggle("is-open");
  }

  selectedOption.addEventListener("click", toggleSelectorBody);

  options.forEach((element) => {
    element.addEventListener("click", function (event) {
      toggleSelectorBody();
      selectedOption.innerText = this.innerText;
    });
  });
}

main();
