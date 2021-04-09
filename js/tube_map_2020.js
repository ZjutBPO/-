//naive way of assuming mobile
var width = $("#tube_map_2020").width();
var height = $("#tube_map_2020").height();

var container = d3.select('#tube_map_2020');
var focusStations;
var station_position = []

// Helper to concatenate strings without the plus sign
function concat() {
  concatenated = "";
  for (var i = 0; i < arguments.length; i++) {
    concatenated += arguments[i];
  }
  return concatenated;
}

function removeHighlight() {
  var fs = window.focusStations;

  if (fs) {
    d3.selectAll('.station.'.concat(fs.name))
      .attr('fill', 'white')
      .attr('current', 'false')
  }
}

function addHighlight(station) {
  removeHighlight();

  // highlight current station
  d3
    .selectAll('.station.'.concat(station.name))
    .attr('fill', 'black')
    .attr('current', true)

  window.focusStations = station;
}

function StationClick(data) {
  addHighlight(data);
}

var map = d3
  .tubeMap()
  .width(width)
  .height(height)
  .on('click', function (data) {
    StationClick(data);
  });

d3.json('./json/subway.json').then(function (data) {
  container.datum(data).call(map);
  var _data = map.data();
  map.drawAll(Cookies.get());

  var svg = container.select('svg');

  zoom = d3
    .zoom()
    .scaleExtent([0.6, 10])
    .on('zoom', zoomed);

  var zoomContainer = svg.call(zoom);
  var initialScale = 1;
  var initialTranslate = [-width * 0.07, 30];

  zoom.scaleTo(zoomContainer, initialScale);
  zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );

  function zoomed() {
    svg.select('g').attr('transform', d3.event.transform.toString());
  }

  for (let key in data["stations"]) {
    let item = data["stations"][key];
    station_position.push({
      "name": item["name"],
      "x": item["x"],
      "y": item["y"],
      "num": Math.floor(Math.random() * 50)
    });
  }

  heatmap(station_position);
});

var colors = ["#008200", "#00CFCD", "#FF0000", "#008280", "#FEFF00", "#FF6600", "#080080", "#993367"]

const renderUpdate = function (data) {
  const g = d3.select('#TubeMap');

  let circleupdates = g.selectAll('circle').data(data, d => d['name']);

  let circleenter = circleupdates.enter().append('circle')
    .attr('cx', d => d['x'])
    .attr('cy', d => d['y'])
    .attr('r', d => d["num"])
    .attr('fill', '#ff0000')
    .attr('opacity', 0.8)

  circleupdates.merge(circleenter)
    .transition().ease(d3.easeLinear).duration(1000)
    .attr('cx', d => d['x'])
    .attr('cy', d => d['y'])
    .attr('r', d => d["num"])
}

function heatmap(station_position) {

  const g = d3.select('#TubeMap');
  g.append('g')
    .selectAll('circle')
    .data(station_position)
    .enter()
    .append('circle')
    .attr("class", "heatmap_circle")
    .attr('cx', d => xScale(d['x']))
    .attr('cy', d => yScale(d['y']))
    .attr('r', d => d["num"])
    .attr('fill', 'red')
    .attr('opacity', 0.4)
  // renderUpdate(station_position);
}

function ChangeHeatMap(res) {
  let circle_size = getComputedStyle(document.documentElement).getPropertyValue('--circle_size');
  let maxnum = -1, minnum = 2147483647;
  for (let item in res) {
    maxnum = Math.max(res[item]["num"], maxnum)
    minnum = Math.min(res[item]["num"], minnum)
  }
  for (let item1 in station_position) {
    for (let item in res) {
      if (station_position[item1]["name"] == res[item]["name"]) {
        station_position[item1]["num"] = (res[item]["num"] - minnum) / (maxnum - minnum) * circle_size
      }
    }
  }
  const g = d3.select('#TubeMap');
  g.selectAll('circle')
    .data(station_position)
    .transition()
    .duration(1000)
    .attr("class", "heatmap_circle")
    .attr('cx', d => xScale(d['x']))
    .attr('cy', d => yScale(d['y']))
    .attr('r', d => d["num"])
    .attr('fill', 'red')
    .attr('opacity', 0.4)
  console.log(1);
}