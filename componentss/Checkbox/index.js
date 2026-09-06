// «Частично отмечено» нельзя записать в HTML: атрибута indeterminate
// не существует. checked — это данные, которые уходят в форму,
// а indeterminate — производное состояние, живущее только в DOM.
// Поэтому его выставляют из кода.
function main() {
  document.querySelectorAll("[data-indeterminate]").forEach((input) => {
    input.indeterminate = true;
  });
}

main();
