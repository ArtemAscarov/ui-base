export type SliderValue = number | [number, number];

export interface SliderChangeDetail {
  value: SliderValue;
}

export function initSlider(slider: HTMLElement): void {
  const track = slider.querySelector<HTMLElement>("[data-slider-track]");
  const range = slider.querySelector<HTMLElement>("[data-slider-range]");
  const valueLabel = slider.querySelector<HTMLElement>("[data-slider-value]");
  const minLabel = slider.querySelector<HTMLElement>(
    '[data-slider-bound="min"]'
  );
  const maxLabel = slider.querySelector<HTMLElement>(
    '[data-slider-bound="max"]'
  );
  const thumbs = [
    ...slider.querySelectorAll<HTMLElement>("[data-slider-thumb]"),
  ];
  const inputs = [
    ...slider.querySelectorAll<HTMLInputElement>("[data-slider-input]"),
  ];

  const min = Number(slider.dataset.min ?? 0);
  const max = Number(slider.dataset.max ?? 100);
  const step = Number(slider.dataset.step ?? 1) || 1;

  if (!track || thumbs.length === 0 || !(max > min)) return;

  const span = max - min;
  const decimals = (String(step).split(".")[1] ?? "").length;
  const isRange = thumbs.length > 1;
  const isDisabled = slider.hasAttribute("data-disabled");

  function snap(value: number): number {
    const stepped = min + Math.round((value - min) / step) * step;
    return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
  }

  const values = thumbs.map((thumb, index) =>
    snap(Number(thumb.dataset.value ?? (index === 0 ? min : max)))
  );

  function percent(value: number): number {
    return ((value - min) / span) * 100;
  }

  function valueAt(clientX: number): number {
    const box = (track as HTMLElement).getBoundingClientRect();
    return snap(min + ((clientX - box.left) / box.width) * span);
  }

  function setValue(index: number, value: number): number {
    values[index] = value;

    if (isRange && values[0] > values[1]) {
      values.reverse();
      return index === 0 ? 1 : 0;
    }

    return index;
  }

  function nearest(value: number): number {
    if (!isRange) return 0;

    return Math.abs(value - values[1]) <= Math.abs(value - values[0]) ? 1 : 0;
  }

  function emit(type: "input" | "change"): void {
    slider.dispatchEvent(
      new CustomEvent<SliderChangeDetail>(`slider:${type}`, {
        bubbles: true,
        detail: { value: isRange ? [values[0], values[1]] : values[0] },
      })
    );
  }

  function render(): void {
    const from = isRange ? percent(values[0]) : 0;
    const to = percent(isRange ? values[1] : values[0]);

    if (range) {
      range.style.left = `${from}%`;
      range.style.width = `${to - from}%`;
    }

    thumbs.forEach((thumb, index) => {
      thumb.style.left = `${percent(values[index])}%`;
      thumb.dataset.value = String(values[index]);
      thumb.setAttribute("aria-valuenow", String(values[index]));

      if (isRange) {
        thumb.setAttribute(
          "aria-valuetext",
          `${values[index]} (${index === 0 ? "from" : "to"})`
        );
      }
    });

    inputs.forEach((input, index) => {
      if (index < values.length) input.value = String(values[index]);
    });

    if (valueLabel) {
      valueLabel.textContent = isRange
        ? `${values[0]} - ${values[1]}`
        : String(values[0]);
    }
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const element = track as HTMLElement;

    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    slider.setAttribute("data-dragging", "");

    const grabbed = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-slider-thumb]"
    );
    let index: number;

    if (grabbed) {
      index = thumbs.indexOf(grabbed);
    } else {
      const value = valueAt(event.clientX);
      index = setValue(nearest(value), value);
      render();
      emit("input");
    }

    function onMove(moveEvent: PointerEvent): void {
      index = setValue(index, valueAt(moveEvent.clientX));
      render();
      emit("input");
    }

    function onUp(): void {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);

      slider.removeAttribute("data-dragging");
      thumbs[index].focus();
      emit("change");
    }

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
  }

  function onKeyDown(event: KeyboardEvent): void {
    const index = thumbs.indexOf(event.currentTarget as HTMLElement);
    const jump = Math.max(step, span / 10);
    const moves: Record<string, number> = {
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
    thumb.setAttribute("aria-valuemin", String(min));
    thumb.setAttribute("aria-valuemax", String(max));

    if (isDisabled) {
      thumb.setAttribute("aria-disabled", "true");
      thumb.tabIndex = -1;
    } else {
      thumb.addEventListener("keydown", onKeyDown);
    }
  });

  if (!isDisabled) track.addEventListener("pointerdown", onPointerDown);

  if (minLabel) minLabel.textContent = String(min);
  if (maxLabel) maxLabel.textContent = String(max);

  render();
}

document
  .querySelectorAll<HTMLElement>("[data-slider]")
  .forEach((slider) => initSlider(slider));
