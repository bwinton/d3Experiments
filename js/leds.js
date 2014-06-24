/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global d3:false */

'use strict';

function draw(data) {
  var chart = d3.select('.display');

  // var s = d3.format('0.2s');
  var HEIGHT = 80;
  var WIDTH = 80;
  var PADDING = 11;

  chart.append('g').attr({'id': 'display'})
    .selectAll('g.line').data(data).enter()
    .append('g').classed('line', true)
      .attr('transform', (d,i) => 'translate(0, ' + (PADDING + i * (HEIGHT + PADDING)) + ')')
      .selectAll('rect.pixel').data(d => d).enter()
      .append('rect').classed('pixel', true)
        .attr({
          'data': d => d,
          'x': 0,
          'y': 0,
          'width': WIDTH,
          'height': HEIGHT,
          'mask': 'url(#mask)',
          'fill': 'black',
          'transform': (d,i) => 'translate(' + (PADDING + i * (WIDTH + PADDING)) + ', 0)'
        });
  update(data);
}

function update(data) {
  var chart = d3.select('.display');
  chart.selectAll('g.line').data(data)
    .selectAll('rect.pixel').data(d => d)
      .transition()
      .attr('fill', d => d);
}

var colours = d3.scale.category20().domain(d3.range(20));
function getColours () {
  var data = d3.range(8).map(
    () => d3.range(32).map(
      () => 'black'
    )
  );
  return data;
}

function updateColours (data) {
  d3.range(8).map(
    (d, i) => {
      data[i].shift();
      var colour = 'black';
      if (currentShape) {
        var shapeData = shapes.get(currentShape);
        if (currentIndex >= 0 && currentIndex < shapeData[i].length) {
          colour = shapeData[i][currentIndex];
        }
        if (currentIndex > shapeData[i].length + 1) {
          currentShape = null;
          currentIndex = 0;
        }
      } else {
        var x = Math.floor(Math.random() * 40);
        if (x < 20) {
          colour = colours(x);
        }
        if (currentIndex > 20 && Math.random() > 0.7) {
          // Pick a new shape.
          var shapeKeys = shapes.keys();
          currentShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
          currentIndex = -3;
        }
      }
      data[i].push(colour);
    }
  );
  currentIndex++;
  return data;
}

var data = getColours();
var currentShape = null;
var currentIndex = -32;
draw(data);
setInterval(function () {
  data = updateColours(data);
  update(data);
}, 750);

var shapes = d3.map({
  'mail': [
    ['red',   'red', 'white', 'white', 'white', 'white',   'red', 'red'],
    ['red',   'red',   'red', 'white', 'white',   'red',   'red', 'red'],
    ['red', 'white',   'red',   'red',   'red',   'red', 'white', 'red'],
    ['red', 'white', 'white',   'red',   'red', 'white', 'white', 'red'],
    ['red', 'white', 'white', 'white', 'white', 'white', 'white', 'red'],
    ['red', 'white', 'white', 'white', 'white', 'white', 'white', 'red'],
    ['red', 'white', 'white', 'white', 'white', 'white', 'white', 'red'],
    ['red', 'white', 'white', 'white', 'white', 'white', 'white', 'red']
  ],
  'graph': [
    ['black', 'black',  'black',  'black', 'black', 'black', 'green', 'green'],
    ['black', 'black',  'black',  'black', 'black', 'black', 'green', 'green'],
    ['black', 'black',  'black',  'black',   'red',   'red', 'green', 'green'],
    ['black', 'black',  'black',  'black',   'red',   'red', 'green', 'green'],
    ['black', 'black', 'yellow', 'yellow',   'red',   'red', 'green', 'green'],
    [ 'blue',  'blue', 'yellow', 'yellow',   'red',   'red', 'green', 'green'],
    [ 'blue',  'blue', 'yellow', 'yellow',   'red',   'red', 'green', 'green'],
    [ 'blue',  'blue', 'yellow', 'yellow',   'red',   'red', 'green', 'green']
  ],
  'cloudsun': [
    [ 'black',  'black',  'white',  'black',  'black',  'white', 'black',  'black'],
    [ 'black',  'black',  'black',  'black',  'black',  'black', 'black',  'black'],
    ['yellow',  'black', 'yellow', 'yellow', 'yellow', 'yellow', 'black', 'yellow'],
    [ 'black', 'yellow', 'yellow', 'yellow', 'yellow',  'white', 'white',  'black'],
    [ 'black',  'white',  'white', 'yellow',  'white',  'white', 'white',  'white'],
    [ 'white',  'white',  'white', 'yellow',  'white',  'white', 'white',  'white'],
    [ 'white',  'white',  'white',  'white',  'white',  'white', 'white',  'white'],
    [ 'black',  'white',  'white',  'white',  'white',  'white', 'white',  'black']
  ],
  'sun': [
    ['blue',   'blue',   'blue',   'blue',   'blue',   'blue',   'blue', 'blue', ],
    ['blue',   'blue',   'blue', 'yellow', 'yellow',   'blue',   'blue', 'blue', ],
    ['blue',   'blue', 'yellow', 'yellow', 'yellow', 'yellow',   'blue', 'blue', ],
    ['blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'blue', ],
    ['blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'blue', ],
    ['blue',   'blue', 'yellow', 'yellow', 'yellow', 'yellow',   'blue', 'blue', ],
    ['blue',   'blue',   'blue', 'yellow', 'yellow',   'blue',   'blue', 'blue', ],
    ['blue',   'blue',   'blue',   'blue',   'blue',   'blue',   'blue', 'blue', ]
  ],
  'empty': [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ],
});
