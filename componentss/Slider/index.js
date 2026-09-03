function main() {
  function firstSlider() {
    let sliderValue = document.getElementById("firstSliderValue");
    let sliderPainting = document.getElementById("firstSliderPainting");
    let sliderCursor = document.getElementById("firstSliderCursor");
    let sliderBg = document.getElementById("firstSliderBg");

    let sliderStartValue = document.getElementById("firstSliderStartValue");
    let sliderEndValue = document.getElementById("firstSliderSndValue");

    const min = 18;
    const max = 90;
    const step = 1;

    function update(percent) {
      const rowValue = Math.round(min + (percent / 100) * (max - min));
      const steppedValue = Math.round(rowValue / step) * step;
      const steppedPercent = ((steppedValue - min) / (max - min)) * 100;
      sliderStartValue.textContent = min;
      sliderEndValue.textContent = max;

      sliderCursor.style.left = `calc(${steppedPercent + "%"} - 8px)`;
      sliderPainting.style.width = steppedPercent + "%";
      sliderValue.textContent = steppedValue;
    }

    function percentFromEvent(e) {
      const rect = sliderBg.getBoundingClientRect();
      const position = e.clientX - rect.left;
      const percent = (position / rect.width) * 100;
      return Math.min(100, Math.max(0, percent));
    }

    sliderCursor.addEventListener("pointerdown", () => {
      // console.log("sliderCursor:pointerdown");

      function onMove(e) {
        update(percentFromEvent(e));
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    update(0);
  }

  function secondSlider() {
    let sliderValue = document.getElementById("secondSliderValue");
    let sliderPainting = document.getElementById("secondSliderPainting");
    let sliderCursorStart = document.getElementById("sliderCursorStart");
    let sliderCursorEnd = document.getElementById("sliderCursorEnd");
    let sliderBg = document.getElementById("secondSliderBg");

    let sliderStartValue = document.getElementById("secondSliderStartValue");
    let sliderEndValue = document.getElementById("secondSliderEndValue");

    const min = 0;
    const max = 7000;
    const step = 10;

    let startePercent = 0;
    let endPercent = 100;

    function render() {
      const startValue = Math.round(min + (startePercent / 100) * (max - min));
      const endValue = Math.round(min + (endPercent / 100) * (max - min));

      const steppedStartValue = Math.round(startValue / step) * step;
      const steppedEndValue = Math.round(endValue / step) * step;

      const steppedStartPercent =
        ((steppedStartValue - min) / (max - min)) * 100;
      const steppedEndPercent = ((steppedEndValue - min) / (max - min)) * 100;

      sliderStartValue.textContent = min;
      sliderEndValue.textContent = max;

      sliderPainting.style.left = steppedStartPercent + "%";
      sliderPainting.style.width =
        steppedEndPercent - steppedStartPercent + "%";
      sliderCursorStart.style.left = `calc(${steppedStartPercent + "%"} - 8px)`;
      sliderCursorEnd.style.left = `calc(${steppedEndPercent + "%"} - 8px)`;

      sliderValue.textContent = `${steppedStartValue} - ${steppedEndValue}`;
    }

    function percentFromEvent(e) {
      const rect = sliderBg.getBoundingClientRect();
      const position = e.clientX - rect.left;
      const percent = (position / rect.width) * 100;
      return Math.max(0, Math.min(100, percent));
    }

    function makeDraggable(el, isStart) {
      el.addEventListener("pointerdown", () => {
        function onMove(e) {
          const percent = percentFromEvent(e);

          if (isStart) {
            startePercent = Math.min(percent, endPercent);
          } else {
            endPercent = Math.max(percent, startePercent);
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

    makeDraggable(sliderCursorStart, true);
    makeDraggable(sliderCursorEnd, false);
    render();
  }

  firstSlider();
  secondSlider();
}

main();
