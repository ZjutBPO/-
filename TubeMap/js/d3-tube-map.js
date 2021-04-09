// This file is a modfied version of John Valley's d3-tube-map
// https://github.com/johnwalley/d3-tube-map

var HIGHLIGHT = true;

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (global = global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, (function (exports, d3) { 'use strict';

  function trainStop(lineWidth) {
    return d3.arc()
      .innerRadius(0)
      .outerRadius(5 * lineWidth)
      .startAngle(0)
      .endAngle(2 * Math.PI);
  }

  function normalizeStationName(stationName) {
    return stationName.replace(/[0-9]/g, '').trim()
  }

  function line(data, xScale, yScale) {
    var path = '';

    var lineNodes = data.nodes;

    var unitLength = Math.abs(
      xScale(1) - xScale(0) !== 0 ? xScale(1) - xScale(0) : yScale(1) - yScale(0)
    );

    var nextNode, currNode;
    var points = [xScale(lineNodes[0].coords[0]),yScale(lineNodes[0].coords[1]),];

    path += 'M' + points[0] + ',' + points[1];

    for (var lineNode = 1; lineNode < lineNodes.length; lineNode++) {
      points = [xScale(lineNodes[lineNode].coords[0]),yScale(lineNodes[lineNode].coords[1]),];
      path += 'L' + points[0] + ',' + points[1];
    }
    // console.log(path);
    return path;
  }

  function Lines(lines) {
    this.lines = lines;
  }

  function lineList(lines) {
    return new Lines(lines);
  }

  function Stations(stations) {
    this.stations = stations;
  }

  Lines.prototype.normalizedLines = function() {
    var filteredLines = this.lines
      .filter(line => line.dashed == false)
      .map(function(line) {
        return {
          name: line.name,
          stations: line.stations.map(station => normalizeStationName(station))
        }
      })

    return filteredLines
      .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
  }

  Stations.prototype.toArray = function() {
    var stations = [];

    for (var name in this.stations) {
      if (this.stations.hasOwnProperty(name)) {
        var station = this.stations[name];
        station.name = name;
        stations.push(station);
      }
    }

    return stations;
  };

  Stations.prototype.labeledStations = function() {
    var doubles = this.toArray();

    return doubles.filter(function(station) {
      return station.lineLabel === true
    });
  };

  Stations.prototype.longStations = function() {
    var doubles = this.toArray();

    return doubles.filter(function(station) {
      return station.stationSymbol !== 'single' && station.stationSymbol;
    });
  };

  Stations.prototype.normalStations = function() {
    var singles = this.toArray();

    return singles.filter(function(station) {
      return station.stationSymbol === 'single';
    });
  };

  function stationList(stations) {
    return new Stations(stations);
  }

  function map() {
    var margin = { top: 80, right: 80, bottom: 20, left: 80 };
    var width = 760;
    var height = 640;
    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();
    var lineWidth;
    var lineWidthMultiplier = 0.7;
    var lineWidthTickRatio = 1;
    var svg;
    var _data;
    var gMap;

    var listeners = d3.dispatch('click');

    function map(selection) {
      selection.each(function(data) {
        _data = transformData(data);

        var minX =
          d3.min(_data.raw, function(line) {
            return d3.min(line.nodes, function(node) {
              return node.coords[0];
            });
          }) - 1;

        var maxX =
          d3.max(_data.raw, function(line) {
            return d3.max(line.nodes, function(node) {
              return node.coords[0];
            });
          }) + 1;

        var minY =
          d3.min(_data.raw, function(line) {
            return d3.min(line.nodes, function(node) {
              return node.coords[1];
            });
          }) - 1;

        var maxY =
          d3.max(_data.raw, function(line) {
            return d3.max(line.nodes, function(node) {
              return node.coords[1];
            });
          }) + 1;
        // console.log("minX = " + minX);
        // console.log("maxX = " + maxX);
        // console.log("minY = " + minY);
        // console.log("maxY = " + maxY);
        
        var desiredAspectRatio = (maxX - minX) / (maxY - minY);
        var actualAspectRatio =
          (width - margin.left - margin.right) /
          (height - margin.top - margin.bottom);

        var ratioRatio = actualAspectRatio / desiredAspectRatio;
        var maxXRange;
        var maxYRange;

        // Note that we flip the sense of the y-axis here
        if (desiredAspectRatio > actualAspectRatio) {
          maxXRange = width - margin.left - margin.right;
          maxYRange = (height - margin.top - margin.bottom) * ratioRatio;
        } else {
          maxXRange = (width - margin.left - margin.right) / ratioRatio;
          maxYRange = height - margin.top - margin.bottom;
        }

        // console.log("xScale from [" + minX + "," + maxX + "] to [" + margin.left + "," + (margin.left + maxXRange).toString() + "]");
        // console.log("yScale from [" + minY + "," + maxY + "] to [" + (margin.top + maxYRange).toString() + "," + margin.top + "]");
        xScale.domain([minX, maxX]).range([margin.left, margin.left + maxXRange]);
        yScale.domain([minY, maxY]).range([margin.top + maxYRange, margin.top]);

        var unitLength = Math.abs(
          xScale(1) - xScale(0) !== 0
            ? xScale(1) - xScale(0)
            : yScale(1) - yScale(0)
        );

        lineWidth = lineWidthMultiplier * unitLength;

        svg = selection
          .append('svg')
          .style('width', '100%')
          .style('height', '100%');

        gMap = svg.append('g');
      });
    }

    map.width = function(w) {
      if (!arguments.length) return width;
      width = w;
      return map;
    };

    map.height = function(h) {
      if (!arguments.length) return height;
      height = h;
      return map;
    };

    map.margin = function(m) {
      if (!arguments.length) return margin;
      margin = m;
      return map;
    };

    map.data = function() {
      return {
        lines: _data.lines.normalizedLines(),
        stations: _data.stations.stations
      }
    }

    map.drawAll = function(options) {
      drawLines();
      drawLineLabels();
      drawStations();
      drawLongStations();
      if (options && options['show-sbahn'] === 'true') {
        drawLabels(true);
      } else {
        drawLabels(false)
      }
    }

    map.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? map : value;
    };

    function drawLines() {
      gMap
        .append('g')
        .attr('class', 'lines')
        .selectAll('path')
        .data(_data.lines.lines)
        .enter()
        .append('path')
        .attr('d', function(d) {
          return line(d, xScale, yScale);
        })
        .attr('id', function(d) {
          return d.name;
        })
        .attr('stroke', function(d) {
          return d.color;
        })
        .attr('fill', 'none')
        .attr('stroke-width', lineWidth * 5)
        .style("stroke-linecap", "round")
        .classed('line', true);
    }

    function drawLongStations() {
      var fgColor = '#000000';
      var bgColor = '#ffffff';
      // console.log("drawLongStations");
      // console.log(_data.stations.longStations());

      gMap
        .append('g')
        .selectAll('path')
        .data(_data.stations.longStations())
        .enter()
        .append('g')
        .append('rect')
        .attr("rx", lineWidth)
        .attr("ry", lineWidth)
        .attr('width', lineWidth * 2.4)
        .attr('height', function(d) {
          var multiplier = d.stationSymbol === 'double' ? 5 : 8
          return lineWidth * multiplier
        })
        .attr('stroke-width', lineWidth / 4)
        .attr('id', function(d) {
          return d.name;
        })
        .attr('transform', function(d) {
          var offset = 0.8
          return (
            'translate(' +
            xScale(d.x + d.shiftX * lineWidthMultiplier - offset) +
            ',' +
            yScale(d.y + d.shiftY * lineWidthMultiplier + offset) +
            ')'
          );
        })
        .attr('fill', function(d) {
          return d.visited ? fgColor : bgColor;
        })
        .on('click', function(d) {
          listeners.call('click', this, d)
        })
        .on('mouseover', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .on('mouseout', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .attr('stroke', function(d) {
          return d.visited ? bgColor : fgColor;
        })
        .attr('class', function(d) {
          return 'station ' + d.name
        })
        .style('cursor', 'pointer');
    }

    function drawStations() {
      var fgColor = '#000000';
      var bgColor = '#ffffff';
      // console.log("drawStations");
      // console.log(_data.stations.normalStations());

      gMap
        .append('g')
        .selectAll('path')
        .data(_data.stations.normalStations())
        .enter()
        .append('g')
        .attr('id', function(d) {
          return d.name;
        })
        .on('click', function(d) {
          listeners.call('click', this, d)
        })
        .append('path')
        .attr('d', trainStop(lineWidth))
        .attr('transform', function(d) {
          return (
            'translate(' +
            xScale(d.x + d.shiftX * lineWidthMultiplier) +
            ',' +
            yScale(d.y + d.shiftY * lineWidthMultiplier) +
            ')'
          );
        })
        .attr('stroke-width', lineWidth / 4)
        .attr('fill', function(d) {
          return d.visited ? fgColor : bgColor;
        })
        .attr('stroke', function(d) {
          return d.visited ? bgColor : fgColor;
        })
        .on('mouseover', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .on('mouseout', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .attr('class', function(d) {
          return 'station ' + d.name
        })
        .style('cursor', 'pointer');
    }

    function drawLineLabels() {
      gMap
        .selectAll('image')
        .data(_data.stations.labeledStations())
        .enter()
        .append('g')
        .attr('id', function(d) {
          return d.name;
        })
        .append('image')
        .attr('xlink:href', function(d) {
          return d.lineLabelPath;
        })
        .attr('width', lineWidth * 35)
        .attr('height', lineWidth * 35 / 85 * 47)
        .attr('dy', 0)
        .attr('x', function(d) {
          return xScale(d.x + d.lineLabelShiftX) + lineLabelPos(d).pos[0];
        })
        .attr('y', function(d) {
          return yScale(d.y + d.lineLabelShiftY) - lineLabelPos(d).pos[1];
        })
    }

    function drawLabels(drawSbahn) {
      // console.log("lineWidth = " + lineWidth);
      gMap
        .append('g')
        .selectAll('text')
        .data(_data.stations.toArray())
        .enter()
        .append('g')
        .attr('id', function(d) {
          return d.name;
        })
        .classed('label', true)
        .on('click', function(d) {
          listeners.call('click', this, d)
        })
        .append('text')
        .text(function(d) {
          return d.label;
        })
        .attr('fill', function(d) {
          return d.inactive ? 'grey' : 'black'
        })
        .style('font-size', 13 * lineWidth + 'px')
        .style('font-weight', function(d) {
          return d.labelBold ? '700' : '400'
        })
        .on('mouseover', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .on('mouseout', function (d) {
          toggleHighlight(d, lineWidth)
        })
        .attr('dy', 0)
        .attr('x', function(d) {
          return xScale(d.x + d.labelShiftX) + textPos(d).pos[0];
        })
        .attr('y', function(d) {
          return yScale(d.y + d.labelShiftY) - textPos(d).pos[1];
        })
        .attr('text-anchor', function(d) {
          return textPos(d).textAnchor;
        })
        .attr('transform', function(d) {
          var _x = xScale(d.x + d.labelShiftX) + textPos(d).pos[0];
          var _y = yScale(d.y + d.labelShiftY) - textPos(d).pos[1];
          return "rotate(" + d.labelAngle + "," + _x + "," + _y + ")"
        })
        .attr('class', function(d) {
          var boldLabel = d.labelBold ? "bold-label" : ""
          return 'label ' + boldLabel + ' ' + d.name
        })
        .style('display', function(d) {
          return d.hide !== true ? 'block' : 'none';
        })
        .style('text-decoration', function(d) {
          return d.closed ? 'line-through' : 'none';
        })
        .style('-webkit-user-select', 'none')
        .classed('highlighted', function(d) {
          return d.visited;
        })
        .call(wrap, function(d) {
          return textPos(d).alignmentBaseline;
        })
        .append('tspan')
        .classed('sbahn', true)
        .style('fill', 'green')
        .text(function(d) {
          if (drawSbahn === true) {
            var spacingBefore = d.sBahnLabelNoBeforeSpace ? '' : ' ';
            var spacingAfter = d.sBahnLabelAfterSpace ? ' ' : '';
            return d.sBahn ? concat(spacingBefore, 'S', spacingAfter) : ''
          }
        })
        .attr('dy', 0)
        .style('font-weight', 400)
        .call(wrap, function(d) {
          return textPos(d).alignmentBaseline;
        })
    }

    function transformData(data) {
      return {
        raw: data.lines,
        stations: extractStations(data),
        lines: extractLines(data.lines),
      };
    }

    function extractStations(data) {
      data.lines.forEach(function(line) {
        for (var node = 0; node < line.nodes.length; node++) {
          var d = line.nodes[node];

          if (!d.hasOwnProperty('name')) continue;

          if (!data.stations.hasOwnProperty(d.name))
            throw new Error('Cannot find station with key: ' + d.name);

          var station = data.stations[d.name];

          station.x = d.coords[0];
          station.y = d.coords[1];
          station.labelAngle = d.hasOwnProperty('labelAngle') ? d.labelAngle : 0;
          station.sBahn = d.sBahn === true ? true : false;
          station.sBahnLabelNoBeforeSpace = d.sBahnLabelNoBeforeSpace === true ? true : false;
          station.sBahnLabelAfterSpace = d.sBahnLabelNoBeforeSpace === true ? true : false;
          station.labelBold = d.hasOwnProperty('labelBold') ? d.labelBold : false
          station.inactive = d.hasOwnProperty('inactive') && d.inactive ? true : false
          station.stationSymbol = d.hasOwnProperty('stationSymbol') ? d.stationSymbol : 'single'

          if (d.lineLabel === true) {
            station.lineLabel = true
            station.lineLabelPos = d.lineLabelPos
            station.lineLabelPath = d.lineLabelPath
            station.lineLabelShiftX = d.lineLabelShiftX || 0
            station.lineLabelShiftY = d.lineLabelShiftY || 0
          } else {
            station.lineLabel = false
          }

          if (station.labelPos === undefined) {
            station.labelPos = d.labelPos;
            station.labelShiftX = d.hasOwnProperty('labelShiftCoords')
              ? d.labelShiftCoords[0]
              : d.hasOwnProperty('shiftCoords')
              ? d.shiftCoords[0]
              : line.shiftCoords[0];
            station.labelShiftY = d.hasOwnProperty('labelShiftCoords')
              ? d.labelShiftCoords[1]
              : d.hasOwnProperty('shiftCoords')
              ? d.shiftCoords[1]
              : line.shiftCoords[1];
          }

          station.label = data.stations[d.name].label;
          station.closed = data.stations[d.name].hasOwnProperty('closed')
            ? data.stations[d.name].closed
            : false;
          station.visited = false;

          if (!d.hide) {
            station.shiftX = d.hasOwnProperty('shiftCoords')
                ? d.shiftCoords[0]
                : line.shiftCoords[0]
            station.shiftY = d.hasOwnProperty('shiftCoords')
                ? d.shiftCoords[1]
                : line.shiftCoords[1]
          }
        }
      });

      return stationList(data.stations);
    }

    function extractLines(data) {
      var lines = [];

      data.forEach(function(line) {
        var lineObj = {
          name: line.name,
          title: line.label,
          dashed: line.hasOwnProperty("dashed") && line.dashed ? true : false,
          stations: [],
          color: line.color,
          shiftCoords: line.shiftCoords,
          nodes: line.nodes,
          highlighted: false,
        };

        lines.push(lineObj);

        for (var node = 0; node < line.nodes.length; node++) {
          var data = line.nodes[node];

          if (!data.hasOwnProperty('name')) continue;

          lineObj.stations.push(data.name);
        }
      });

      return lineList(lines);
    }

    function textPos(data) {
      return itemPos(data, "labelPos")
    }

    function lineLabelPos(data) {
      return itemPos(data, "lineLabelPos")
    }

    function itemPos(data, item) {
      // console.log(data);
      var pos;
      var textAnchor;
      var alignmentBaseline;
      var offset = lineWidth * 1.8;

      var numLines = data.label.split(/\n/).length;

      var sqrt2 = Math.sqrt(2);

      switch (data[item].toLowerCase()) {
        case 'n':
          pos = [0, 2.1 * lineWidth * (numLines - 0.5) + offset];
          textAnchor = 'middle';
          alignmentBaseline = 'baseline';
          break;
        case 'ne':
          pos = [offset / sqrt2, (lineWidth * (numLines - 1) + offset) / sqrt2];
          textAnchor = 'start';
          alignmentBaseline = 'baseline';
          break;
        case 'e':
          pos = [offset, -2];
          textAnchor = 'start';
          alignmentBaseline = 'baseline';
          break;
        case 'se':
          pos = [offset / sqrt2, -offset / sqrt2];
          textAnchor = 'start';
          alignmentBaseline = 'hanging';
          break;
        case 's':
          pos = [0, -lineWidthMultiplier * offset];
          textAnchor = 'middle';
          alignmentBaseline = 'hanging';
          break;
        case 'sw':
          pos = [-offset / sqrt2, -offset / sqrt2];
          textAnchor = 'end';
          alignmentBaseline = 'hanging';
          break;
        case 'w':
          pos = [-offset, -2];
          textAnchor = 'end';
          alignmentBaseline = 'baseline';
          break;
        case 'nw':
          pos = [
            -(lineWidth * (numLines - 1) + offset) / sqrt2,
            (lineWidth * (numLines - 1) + offset) / sqrt2,
          ];
          textAnchor = 'end';
          alignmentBaseline = 'baseline';
          break;
      }

      return {
        pos: pos,
        textAnchor: textAnchor,
        alignmentBaseline: alignmentBaseline,
      };
    }

    function toggleHighlight(d, lineWidth) {
      if (HIGHLIGHT !== true) {
        return;
      }

      var station = d3.selectAll('.station.'.concat(d.name));
      var label = d3.selectAll('.label.'.concat(d.name));
      // console.log(station);
      // console.log(label);

      if (station.attr('highlighted') === 'true') {
        station
          .attr('highlighted', 'false')
          .attr('fill', station.attr('current') === 'true' ? 'black': 'white')
          .attr('stroke-width', lineWidth / 4)
        label
          .attr('highlighted', 'false')
          .style('text-decoration', 'none')
      } else {
        station
          .attr('highlighted', 'true')
          .attr('stroke-width', lineWidth / 2)
        label
          .attr('highlighted', 'false')
          .style('text-decoration', 'underline')
      }
    }

    // Render line breaks for svg text
    function wrap(text, baseline) {
      text.each(function() {
        var text = d3.select(this);
        var lines = text.text().split(/\n/);

        var y = text.attr('y');
        var x = text.attr('x');
        var dy = parseFloat(text.attr('dy'));

        text
          .text(null)
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', dy + 'em')
          .attr('dominant-baseline', baseline)
          .text(lines[0]);

        for (var lineNum = 1; lineNum < lines.length; lineNum++) {
          text
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', lineNum * 1.1 + dy + 'em')
            .attr('dominant-baseline', baseline)
            .text(lines[lineNum]);
        }
      });
    }

    return map;
  }

  exports.tubeMap = map;

  Object.defineProperty(exports, '__esModule', { value: true });

})));