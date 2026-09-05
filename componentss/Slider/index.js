function main() {
  singleSlider();
  rangeSlider();
}

function singleSlider() {
  const valueLabel = document.getElementById("firstSliderValue");
  const minLabel = document.getElementById("firstSliderMin");
  const maxLabel = document.getElementById("firstSliderMax");
  const track = document.getElementById("firstSliderTrack");
  const range = document.getElementById("firstSliderRange");
  const thumb = document.getElementById("firstSliderThumb");

  const min = 18;
  const max = 90;
  const step = 1;

  function percentFromEvent(event) {
    const rect = track.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, percent));
  }

  function update(percent) {
    const rawValue = min + (percent / 100) * (max - min);
    const value = Math.round(rawValue / step) * step;
    const valuePercent = ((value - min) / (max - min)) * 100;

    thumb.style.left = valuePercent + "%";
    range.style.width = valuePercent + "%";
    valueLabel.textContent = value;
  }

  thumb.addEventListener("pointerdown", () => {
    function onMove(event) {
      update(percentFromEvent(event));
    }

    function onUp() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  });

  minLabel.textContent = min;
  maxLabel.textContent = max;
  update(0);
}

function rangeSlider() {
  const valueLabel = document.getElementById("secondSliderValue");
  const minLabel = document.getElementById("secondSliderMin");
  const maxLabel = document.getElementById("secondSliderMax");
  const track = document.getElementById("secondSliderTrack");
  const range = document.getElementById("secondSliderRange");
  const startThumb = document.getElementById("secondSliderStartThumb");
  const endThumb = document.getElementById("secondSliderEndThumb");

  const min = 0;
  const max = 7000;
  const step = 10;

  let startPercent = 0;
  let endPercent = 100;

  function toValue(percent) {
    const rawValue = min + (percent / 100) * (max - min);
    return Math.round(rawValue / step) * step;
  }

  function toPercent(value) {
    return ((value - min) / (max - min)) * 100;
  }

  function percentFromEvent(event) {
    const rect = track.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, percent));
  }

  function render() {
    const startValue = toValue(startPercent);
    const endValue = toValue(endPercent);
    const start = toPercent(startValue);
    const end = toPercent(endValue);

    range.style.left = start + "%";
    range.style.width = end - start + "%";
    startThumb.style.left = start + "%";
    endThumb.style.left = end + "%";
    valueLabel.textContent = `${startValue} - ${endValue}`;
  }

  function makeDraggable(thumb, isStart) {
    thumb.addEventListener("pointerdown", () => {
      function onMove(event) {
        const percent = percentFromEvent(event);

        if (isStart) {
          startPercent = Math.min(percent, endPercent);
        } else {
          endPercent = Math.max(percent, startPercent);
        }

        render();
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }

  makeDraggable(startThumb, true);
  makeDraggable(endThumb, false);

  minLabel.textContent = min;
  maxLabel.textContent = max;
  render();
}

main();
