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

//
const pdfFiles = ["file1.pdf", "file2.pdf"];

const viewer = document.getElementById("pdfViewer");
const modal = document.getElementById("pdfModal");

const openPdf = (file) => {
  viewer.src = "uploads/" + file;
  modal.classList.add("active");
};

window.closeModal = () => {
  viewer.src = "";
  modal.classList.remove("active");
};

async function renderThumbnail(fileName) {
  const url = "uploads/" + fileName;
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const viewport = page.getViewport({ scale: 0.5 });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL();
}

(async function renderList() {
  for (let file of pdfFiles) {
    const thumb = await renderThumbnail(file);

    const li = document.createElement("li");
    li.className = "project-item active";
    li.setAttribute("data-filter-item", "");
    li.setAttribute("data-category", "web development");

    li.innerHTML = `
          <a href="javascript:void(0);" onclick="openPdf('${file}')">
            <figure class="project-img">
              <div class="project-item-icon-box">
                <ion-icon name="eye-outline"></ion-icon>
              </div>
              <img src="${thumb}" alt="${file}" loading="lazy" />
            </figure>
            <h3 class="project-title">${file}</h3>
            <p class="project-category">Web Development</p>
          </a>
        `;

    document.getElementById("project-list").appendChild(li);
  }
})();

/* WIDGET DEFINITION */

/* Default Widget Options */
var tableWidgetDefaults = {
  title: "",
  data: [
    { name: { first: "Reiss", last: "Hughes" }, value1: 5, value2: [9, 10] },
    { name: { first: "Louis", last: "Vasquez" }, value1: 3, value2: [3, 4] },
    { name: { first: "Donnie", last: "Bates" }, value1: 2, value2: [4, 1] },
    { name: { first: "Nelson", last: "Conrad" }, value1: 6, value2: [6, 5] },
    { name: { first: "Hira", last: "Glass" }, value1: 7, value2: [7, 2] },
  ],
  /* Columns headers and formatting */
  columns: [
    { header: "First Name", value: "%name.first" },
    { header: "Last Name", value: "%name.last" },
    { header: "Value One", value: "%value1", align: "right" },
    { header: "Value Two", value: "%value2.0 and %value2.1", align: "center" },
    { header: "Sum", value: "{%value1+%value2.0+%value2.1}", align: "right" },
  ],
  headerCol: true,
  headerRow: true,
};

/* Widget Constructor */
function TableWidget(div, options) {
  /* Config refers to JSC options, options refers to widget options. */
  this.currentConfig = this.normalizeOptions(
    JSC.merge({}, tableWidgetDefaults, options)
  );
  this.chart = new JSC.Grid(
    div,
    JSC.merge({ cssFile: "tableDashWidget.css" }, this.currentConfig)
  );
}

/**
 * Returns chart configuration only for specified options.
 * @param options - Widget options.
 * @returns {{}} - Chart configuration.
 */
TableWidget.prototype.normalizeOptions = function (options) {
  var result = {};
  if (options.title) {
    result.title = options.title;
  }
  if (options.data) {
    result.data = options.data;
  }
  if (options.columns) {
    result.columns = options.columns;
  }
  result.headerCol = options.headerCol || false;
  result.headerRow = options.headerRow || false;
  return result;
};

/**
 * Updates the chart based on provided options.
 * @param options - Widget options
 * @param updateOptions - Update options such as animation duration.
 */
TableWidget.prototype.options = function (options, updateOptions) {
  var newConfig = this.normalizeOptions(options);
  /* Maintain chart configuration. */
  JSC.merge(this.currentConfig, newConfig);
  /* Update the chart. */
  this.chart.options(newConfig, updateOptions);
};

new TableWidget("gridDiv1", {});

//blog page 2nd card
var grid = undefined,
  chart = undefined;
var nest,
  stepData,
  year = 2017,
  calcFn = "sum",
  groupingBy = "month",
  dateFormatters = {
    month: "date MMM",
    week: "date d",
    day: "date d",
    weekday: "n",
  },
  maxValues = {
    month: 200000,
    week: 100000,
    day: 20000,
    weekday: 350000,
  },
  firstColHeaders = {
    month: "Month",
    week: "Week",
    day: "Day",
    weekday: "Weekday",
  },
  secondColHeaders = {
    sum: "Sum",
    min: "Min",
    max: "Max",
    mean: "Mean",
  };

const weekdays =
  "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");

function defaultChartConfig() {
  return {
    xAxis_label_text: "Date",
    yAxis_label_text: "Steps",
    xAxis_scale_interval: { unit: "month" },
    legend_visible: false,
    defaultPoint_marker_type: "none",
  };
}

function viewToOptions(view, calc) {
  var max = calc === "sum" ? maxValues[view] : 20000;
  return {
    columns: [
      {
        header: firstColHeaders[view],
        value: "{%xValue:" + dateFormatters[view] + "}",
      },
      {
        header: secondColHeaders[calc],
        value: "{%yValue:n0}",
      },
      {
        header: "<chart scale data=0," + max + "K color=white>",
        value: "<chart bar colors=#0277bd,,#ddd data=%yValue max=" + max + ">",
        align: "center",
      },
      {
        header: "Daily",
        value: "<chart sparkline data=%list>",
        align: "center",
      },
    ],
  };
}

JSC.fetch("stepData17-18.csv")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    setCsv(text);
    setDataView(groupingBy);
    selectCategory();
    var chartOptions = defaultChartConfig();

    chartOptions.series = nest.series(stepData);
    chart = new JSC.Chart("chartDataGrid", chartOptions, function (c) {
      c.toGrid("container", viewToOptions(groupingBy, "sum")).then(function (
        g
      ) {
        grid = g;
      });
    });
  });

function setCsv(text) {
  stepData = JSC.csv2Json(text);
}

function setDataView(groupBy, calculation) {
  groupingBy = groupBy;
  calcFn = calculation || calcFn;
  nest = JSC.nest()
    .key({
      key: "Date",
      pattern: groupBy,
      range: ["1/1/2017", "12/31/2017"],
    })
    .rollup("Actual")
    .pointRollup(rollupFn);

  function rollupFn(key, values) {
    if (groupingBy === "weekday") {
      return {
        x: weekdays[key],
        y: JSC[calcFn](values),
        attributes: { list: values.join(",") },
      };
    }
    return {
      x: key,
      y: JSC[calcFn](values),
      attributes: { list: values.join(",") },
    };
  }
}
function selectCategory() {
  var tabs = document.getElementsByClassName("categoryTab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
}
function redraw(groupBy) {
  var calEl = document.getElementById("calculationDD");
  var calc = calEl.options[calEl.selectedIndex].text;
  setDataView(groupBy, calc);

  grid && grid.options(viewToOptions(groupBy, calc), false);
  chart.series(0).options({ points: nest.points(stepData) });
}

(function attachEvents() {
  document.getElementById("dayBtn").addEventListener("click", function () {
    redraw("day");
  });
  document.getElementById("weekBtn").addEventListener("click", function () {
    redraw("week");
  });
  document.getElementById("monthBtn").addEventListener("click", function () {
    redraw("month");
  });
  document.getElementById("weekdayBtn").addEventListener("click", function () {
    redraw("weekday");
  });
  document
    .getElementById("calculationDD")
    .addEventListener("change", function () {
      redraw(groupingBy);
    });
})();
