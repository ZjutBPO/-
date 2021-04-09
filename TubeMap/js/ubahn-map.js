//naive way of assuming mobile
var isMobile = window.screen.width < window.screen.height ? true : false
var width = isMobile ?
  window.devicePixelRatio * window.screen.width :
  screen.width;
var height = isMobile ?
  window.devicePixelRatio * window.screen.height :
  screen.height;

var container = d3.select('#ubahn-map');
var focusStations;


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

var map = d3
  .tubeMap()
  .width(width)
  .height(height)
  .on('click', function (data) {
    addHighlight(data);
  });

// d3.json('./json/berlin-ubahn.json').then(function (data) {
d3.json('./json/subway.json').then(function (data) {
  // console.log(data);
  container.datum(data).call(map);
  var _data = map.data();
  // console.log(_data);
  // console.log(Cookies.get());
  map.drawAll(Cookies.get());

  var svg = container.select('svg');

  zoom = d3
    .zoom()
    .scaleExtent([0.6, 10])
    .on('zoom', zoomed);

  var zoomContainer = svg.call(zoom);
  var initialScale = 1.1;
  var initialTranslate = [-width/15, height / 25];

  zoom.scaleTo(zoomContainer, initialScale);
  zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );

  function zoomed() {
    svg.select('g').attr('transform', d3.event.transform.toString());
  }

});