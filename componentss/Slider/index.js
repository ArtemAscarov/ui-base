function initSlider(slider) {
  const track = slider.querySelector(".ui-slider__track");
  const range = slider.querySelector(".ui-slider__range");
  const valueLabel = slider.querySelector(".ui-slider__value");
  const minLabel = slider.querySelector(".ui-slider__bound--min");
  const maxLabel = slider.querySelector(".ui-slider__bound--max");
  const thumbs = [...slider.querySelectorAll(".ui-slider__thumb")];
  const inputs = [...slider.querySelectorAll(".ui-slider__input")];

  const min = Number(slider.dataset.min ?? 0);
  const max = Number(slider.dataset.max ?? 100);
  const step = Number(slider.dataset.step ?? 1) || 1;

  if (!track || thumbs.length === 0 || !(max > min)) return;

  const span = max - min;
  const decimals = (String(step).split(".")[1] ?? "").length;
  const isRange = thumbs.length > 1;
  const isDisabled = slider.hasAttribute("data-disabled");

  const values = thumbs.map((thumb, index) =>
    snap(Number(thumb.dataset.value ?? (index === 0 ? min : max)))
  );

  function snap(value) {
    const stepped = min + Math.round((value - min) / step) * step;
    return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
  }

  function percent(value) {
    return ((value - min) / span) * 100;
  }

  function valueAt(clientX) {
    const box = track.getBoundingClientRect();
    return snap(min + ((clientX - box.left) / box.width) * span);
  }

  function setValue(index, value) {
    values[index] = value;

    if (isRange && values[0] > values[1]) {
      values.reverse();
      return index === 0 ? 1 : 0;
    }

    return index;
  }

  function nearest(value) {
    if (!isRange) return 0;

    return Math.abs(value - values[1]) <= Math.abs(value - values[0]) ? 1 : 0;
  }

  function emit(type) {
    slider.dispatchEvent(
      new CustomEvent(`ui-slider:${type}`, {
        bubbles: true,
        detail: { value: isRange ? [...values] : values[0] },
      })
    );
  }

  function render() {
    const from = isRange ? percent(values[0]) : 0;
    const to = percent(isRange ? values[1] : values[0]);

    if (range) {
      range.style.left = `${from}%`;
      range.style.width = `${to - from}%`;
    }

    thumbs.forEach((thumb, index) => {
      thumb.style.left = `${percent(values[index])}%`;
      thumb.dataset.value = values[index];
      thumb.setAttribute("aria-valuenow", values[index]);

      if (isRange) {
        thumb.setAttribute(
          "aria-valuetext",
          `${values[index]} (${index === 0 ? "from" : "to"})`
        );
      }
    });

    inputs.forEach((input, index) => {
      if (index < values.length) input.value = values[index];
    });

    if (valueLabel) {
      valueLabel.textContent = isRange
        ? `${values[0]} - ${values[1]}`
        : values[0];
    }
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    slider.classList.add("ui-slider--dragging");

    const grabbed = event.target.closest(".ui-slider__thumb");
    let index;

    if (grabbed) {
      index = thumbs.indexOf(grabbed);
    } else {
      const value = valueAt(event.clientX);
      index = setValue(nearest(value), value);
      render();
      emit("input");
    }

    function onMove(moveEvent) {
      index = setValue(index, valueAt(moveEvent.clientX));
      render();
      emit("input");
    }

    function onUp() {
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);

      slider.classList.remove("ui-slider--dragging");
      thumbs[index].focus();
      emit("change");
    }

    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
  }

  function onKeyDown(event) {
    const index = thumbs.indexOf(event.currentTarget);
    const jump = Math.max(step, span / 10);
    const moves = {
      ArrowRight: values[index] + step,
      ArrowUp: values[index] + step,
      ArrowLeft: values[index] - step,
      ArrowDown: values[index] - step,
      PageUp: values[index] + jump,
      PageDown: values[index] - jump,
      Home: min,
      End: max,
    };

    if (!(event.key in moves)) return;

    event.preventDefault();
    const next = setValue(index, snap(moves[event.key]));
    render();
    thumbs[next].focus();
    emit("input");
    emit("change");
  }

  thumbs.forEach((thumb) => {
    thumb.setAttribute("aria-valuemin", min);
    thumb.setAttribute("aria-valuemax", max);

    if (isDisabled) {
      thumb.setAttribute("aria-disabled", "true");
      thumb.tabIndex = -1;
    } else {
      thumb.addEventListener("keydown", onKeyDown);
    }
  });

  if (!isDisabled) track.addEventListener("pointerdown", onPointerDown);

  slider.classList.toggle("ui-slider--disabled", isDisabled);

  if (minLabel) minLabel.textContent = min;
  if (maxLabel) maxLabel.textContent = max;

  render();
}

document.querySelectorAll("[data-ui-slider]").forEach(initSlider);
