function initSlider(slider) {
  const track = slider.querySelector(".ui-slider__track");
  const range = slider.querySelector(".ui-slider__range");
  const valueLabel = slider.querySelector(".ui-slider__value");
  const minLabel = slider.querySelector(".ui-slider__bound--min");
  const maxLabel = slider.querySelector(".ui-slider__bound--max");
  const thumbs = [...slider.querySelectorAll(".ui-slider__thumb")];

  // Дорожка и хотя бы одна ручка обязательны, подписи — нет.
  if (!track || thumbs.length === 0) return;

  // Настройки живут в data-* на контейнере, а не в id:
  // так на одной странице может стоять сколько угодно слайдеров.
  const min = Number(slider.dataset.min ?? 0);
  const max = Number(slider.dataset.max ?? 100);
  const step = Number(slider.dataset.step ?? 1);
  const decimals = (String(step).split(".")[1] ?? "").length;

  const isRange = thumbs.length > 1;

  // Сетка шага отсчитывается от min, а не от нуля: при min = 18 и
  // step = 5 допустимы 18, 23, 28..., а не 20, 25, 30.
  // toFixed убирает мусор плавающей точки вида 0.30000000000000004.
  function snap(value) {
    const stepped = min + Math.round((value - min) / step) * step;
    const clamped = Math.min(max, Math.max(min, stepped));
    return Number(clamped.toFixed(decimals));
  }

  function toPercent(value) {
    return ((value - min) / (max - min)) * 100;
  }

  function valueFromClientX(clientX) {
    const rect = track.getBoundingClientRect();
    return snap(min + ((clientX - rect.left) / rect.width) * (max - min));
  }

  const values = thumbs.map((thumb, index) =>
    snap(Number(thumb.dataset.value ?? (index === 0 ? min : max)))
  );

  // Ручки диапазона могут «перепрыгнуть» друг друга. Тогда меняем
  // значения местами и возвращаем новый индекс той, что тащат.
  function setValue(index, value) {
    values[index] = value;

    if (isRange && values[0] > values[1]) {
      values.reverse();
      return index === 0 ? 1 : 0;
    }

    return index;
  }

  function nearestIndex(value) {
    if (!isRange) return 0;

    const toStart = Math.abs(value - values[0]);
    const toEnd = Math.abs(value - values[1]);

    return toEnd <= toStart ? 1 : 0;
  }

  function render() {
    const start = isRange ? toPercent(values[0]) : 0;
    const end = isRange ? toPercent(values[1]) : toPercent(values[0]);

    if (range) {
      range.style.left = start + "%";
      range.style.width = end - start + "%";
    }

    thumbs.forEach((thumb, index) => {
      thumb.style.left = toPercent(values[index]) + "%";
      thumb.setAttribute("aria-valuenow", values[index]);
    });

    if (valueLabel) {
      valueLabel.textContent = isRange
        ? `${values[0]} - ${values[1]}`
        : values[0];
    }
  }

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    // preventDefault гасит действие браузера по умолчанию
    // (перетаскивание, выделение), setPointerCapture привязывает
    // все последующие pointer-события к дорожке — курсор может
    // уехать хоть за пределы окна, ручка не «залипнет».
    event.preventDefault();
    track.setPointerCapture(event.pointerId);

    const grabbedThumb = event.target.closest(".ui-slider__thumb");
    let index;

    if (grabbedThumb) {
      index = thumbs.indexOf(grabbedThumb);
    } else {
      const value = valueFromClientX(event.clientX);
      index = setValue(nearestIndex(value), value);
      render();
    }

    function onMove(moveEvent) {
      index = setValue(index, valueFromClientX(moveEvent.clientX));
      render();
    }

    function onUp() {
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      thumbs[index].focus();
    }

    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
  });

  function onKeyDown(event) {
    const index = thumbs.indexOf(event.currentTarget);
    const bigStep = Math.max(step, (max - min) / 10);
    let next;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = values[index] + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = values[index] - step;
        break;
      case "PageUp":
        next = values[index] + bigStep;
        break;
      case "PageDown":
        next = values[index] - bigStep;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      // Любая другая клавиша — не наша: выходим ДО preventDefault,
      // иначе Tab перестанет уводить фокус и получится ловушка.
      default:
        return;
    }

    event.preventDefault();

    const nextIndex = setValue(index, snap(next));
    render();
    thumbs[nextIndex].focus();
  }

  thumbs.forEach((thumb) => {
    thumb.setAttribute("aria-valuemin", min);
    thumb.setAttribute("aria-valuemax", max);
    thumb.addEventListener("keydown", onKeyDown);
  });

  if (minLabel) minLabel.textContent = min;
  if (maxLabel) maxLabel.textContent = max;

  render();
}

function main() {
  document.querySelectorAll("[data-ui-slider]").forEach(initSlider);
}

main();
