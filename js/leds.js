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
      () => {
        var x = Math.floor(Math.random() * 40);
        if (x >= 20) {
          return 'black';
        } else {
          return colours(x);
        }
      }
    )
  );
  return data;
}

function updateColours (data) {
  d3.range(8).map(
    (d, i) => {
      data[i].shift();
      var x = Math.floor(Math.random() * 40);
      var colour = 'black';
      if (x < 20) {
        colour = colours(x);
      }
      data[i].push(colour);
    }
  );
  return data;
}

var data = getColours();
draw(data);
setInterval(function () {
  data = updateColours(data);
  update(data);
}, 750);
