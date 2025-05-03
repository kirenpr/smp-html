"use strict";

var chart;
//Opening or closing side bar

const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
});

//Activating Modal-testimonial

const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    // modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    // modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector(
      "[data-testimonials-title]"
    ).innerHTML;
    // modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;

    testimonialsModalFunc();
  });
}

modalContainer.addEventListener("transitionend", function () {
  if (modalContainer.classList.contains("active")) {
    // Render or redraw chart after transition completes
    // Wait for DOM to paint modal, then render chart
    setTimeout(() => {
      JSC.fetch("data.csv")
        .then(function (response) {
          return response.text();
        })
        .then(function (text) {
          var data = JSC.csv2Json(text);
          chart = renderChart("chartDiv", makeSeries(data), makeButtons(data));

          generateThumbnail();
        });
    }, 100); // 100ms delay is usually enough
  }
});

//Activating close button in modal-testimonial

modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

//Activating Filter Select and filtering options

const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () {
  elementToggleFunc(this);
});

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue == "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue == filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

//Enabling filter button for larger screens

let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// Enabling Contact Form

const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// Enabling Page Navigation

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() == pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}

// JS

function makeSeries(data) {
  return [
    {
      name: "New Users",
      type: "column",
      points: JSC.nest().key("date").rollup("new_users").points(data),
    },
    {
      name: "Returning Users",
      type: "column",
      points: JSC.nest().key("date").rollup("returning_users").points(data),
    },
  ];
}

function renderChart(elementID, series, buttons) {
  return JSC.chart(
    elementID,
    {
      xAxis: {
        scale_type: "time",
        defaultTick_gridLine_visible: false,
        crosshair: { enabled: true },
      },
      yAxis: {
        scale_type: "stacked",
        alternateGridFill: "none",
        defaultTick_label_text: "%value",
        orientation: "opposite",
      },
      legend: {
        template: "%icon %name",
        position: "inside top right",
      },
      defaultPoint: {
        marker_type: "circle",
        label_autoHide: false,
        label_placement: "outside",
      },
      toolbar: { items: { Buttons: buttons } },
    },
    function (c) {
      c.options({ series: series });
    }
  );
}

var selectedFill = {
  angle: 90,
  stops: [
    [0, "#85a1ff"],
    [0.08, "#85a1ff"],
    [0.08, "#ffffff"],
    [1, "#ffffff"],
  ],
};

function makeButtons(data) {
  var new_users = JSC.nest().key("date").rollup("new_users").points(data);
  var returning_users = JSC.nest()
    .key("date")
    .rollup("returning_users")
    .points(data);
  var users = JSC.nest()
    .key("date")
    .pointRollup(function (key, val) {
      return {
        x: new Date(parseInt(key)),
        y: val[0].new_users + val[0].returning_users,
      };
    })
    .points(data);
  var session_duration = JSC.nest()
    .key("date")
    .rollup("session_duration")
    .points(data);
  var sessions = JSC.nest().key("date").rollup("sessions").points(data);
  return {
    label_text: "",
    position: "top left",
    itemsBox: {
      layout: "horizontal",
      visible: true,
      margin_top: 5,
    },
    defaultItem: {
      type: "radio",
      position: "top",
      padding: [10, 18, 10, 0],
      outline_width: 0,
      margin: 1,
      radius: 0,
      fill: "#fefefe",
      label_style: {
        fontWeight: "normal",
        fontSize: "14px",
      },
      icon: { visible: false },
      states: {
        select: {
          fill: selectedFill,
          label_style_fontWeight: "bold",
        },
        hover_fill: "#f6f6f6",
      },
    },
    events: { change: changeChartData },
    value: "Users",
    items: {
      Users: {
        label_text:
          toKpiText("Users", getLastValues(users, 2)) +
          "<br>" +
          makeMicroChart(users),
      },
      Sessions: {
        label_text:
          toKpiText("Sessions", getLastValues(sessions, 2)) +
          "<br>" +
          makeMicroChart(sessions),
      },
      "Session Duration": {
        label_text:
          toKpiText(
            "Avg. Session Duration",
            getLastValues(session_duration, 2)
          ) +
          "<br>" +
          makeMicroChart(session_duration),
      },
    },
  };

  function getLastValues(obj, n) {
    return obj
      .map(function (a) {
        return a.y;
      })
      .slice(-n);
  }

  function makeMicroChart(data) {
    return (
      "<chart sparkline margin_top=5 colors=#424242,#616161 width=127 data=" +
      getLastValues(data, 7).join(",") +
      ">"
    );
  }

  function changeChartData(val) {
    switch (val) {
      case "Users":
        chart.chartAreas(0).legend.options({ visible: true }, false);
        chart.options({
          series: [
            {
              name: "New Users",
              points: new_users,
            },
            {
              name: "Returning Users",
              points: returning_users,
            },
          ],
          type: "column",
          defaultPoint_tooltip: "%seriesName: <b>%yValue</b>",
          yAxis_defaultTick_label_text: "%value",
        });
        break;
      case "Sessions":
        chart.chartAreas(0).legend.options({ visible: false }, false);
        chart.options({
          series: [{ name: "Sessions", points: sessions }],
          type: "line",
          defaultPoint_tooltip: "%seriesName: <b>%yValue</b>",
          yAxis_defaultTick_label_text: "%value",
        });
        break;
      case "Session Duration":
        chart.chartAreas(0).legend.options({ visible: false }, false);
        chart.options({
          series: [
            {
              name: "Avg. Session Duration",
              points: session_duration,
            },
          ],
          type: "line",
          defaultPoint_tooltip: function (point) {
            return (
              "%seriesName: <b>00:" +
              JSC.formatDate(new Date(0).setSeconds(point.y), "mm:ss") +
              "</b>"
            );
          },
          yAxis_defaultTick_label_text: function (v) {
            return "00:" + JSC.formatDate(new Date(0).setSeconds(v), "mm:ss");
          },
        });
        break;
    }
  }
}

// Generates KPI text from values.
function toKpiText(name, elements) {
  var a = elements[0],
    b = elements[1],
    delta = b / a - 1,
    color = delta >= 0 ? "green" : "red",
    lastValue = b;
  if (name.indexOf("Duration") > -1) {
    lastValue = "00:" + JSC.formatDate(new Date(0).setSeconds(b), "mm:ss");
  }
  var icon =
      "<icon verticalAlign=middle name=" +
      (delta >= 0 ? "arrow-up" : "arrow-down") +
      " size=13 color=" +
      color +
      ">",
    labelValues = [
      name + "<br>",
      lastValue,
      icon,
      Math.abs(Math.round(delta * 1000) / 10) + "%",
    ],
    labelStyles = [
      "width:170px;",
      "width:70px;font-weight:bold;font-size:14px;",
      "width:17px;align:right",
      "width:45px; color:" + color + ";font-weight:bold;font-size:14px;",
    ];

  return labelValues
    .map(function (v, i) {
      return '<span style="' + labelStyles[i] + '">' + v + "</span>";
    })
    .join("");
}

JSC.fetch("data.csv")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var data = JSC.csv2Json(text);
    chart = renderChart(
      "hiddenChartContainer",
      makeSeries(data),
      makeButtons(data)
    );
    setInterval(() => {
      generateThumbnail();
    }, 60);
  });

function generateThumbnail() {
  var svg = document.querySelector("#hiddenChartContainer svg");
  var img = document.querySelector("#tempImg");
  var canvas = document.querySelector("#tempCanvas");

  // get svg data
  var xml = new XMLSerializer().serializeToString(svg);

  // make it base64
  var svg64 = btoa(xml);
  var b64Start = "data:image/svg+xml;base64,";

  // prepend a "header"
  var image64 = b64Start + svg64;

  // set it as the source of the img element
  img.src = image64;

  // draw the image onto the canvas
  canvas.getContext("2d").drawImage(img, 0, 0);

  var thumbnail = canvas.toDataURL("image/png");
  document.querySelectorAll(".chart-thumb").forEach((thumb) => {
    thumb.setAttribute("src", thumbnail);
  });
}
