/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

"use strict";

var tiles = [
  {'x': 19.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  {'x': 57.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  {'x': 95.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  {'x': 19.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  {'x': 57.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  {'x': 95.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  {'x': 19.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  {'x': 57.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  {'x': 95.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  {'x': 95.4, 'y': 85, 'width': 35.3, 'height': 10},
];



function draw(data) {
  var chart = d3.select('.chart');

  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': 150, 'height': 100, 'xlink:href': 'EmptyFirefox.png'
  });

  chart.selectAll('.tiles')
    .data(data)
    .enter()
    // <rect x="0" y="0" width="50" height="50" fill="green" />
    .append('rect')
      .attr('class', 'bar')
      .style('fill', function (d) {
        return 'rgba(255,0,0,' + (d/100) + ')';
      }).attr({
        'x': function (d, i) {
          return tiles[i].x;
        },
        'y': function (d, i) {
          return tiles[i].y;
        },
        'width': function (d, i) {
          return tiles[i].width;
        },
        'height': function (d, i) {
          return tiles[i].height;
        }
      });
    chart.selectAll('label')
      .data(data)
      .enter()
      .append('text')
      .attr({
        'x': function (d, i) {
          return tiles[i].x + tiles[i].width / 2;
        },
        'y': function (d, i) {
          return tiles[i].y + tiles[i].height / 2;
        },
        'dy': '0.5em',
        'width': function (d, i) {
          return tiles[i].width;
        },
        'height': function (d, i) {
          return tiles[i].height;
        },
        'class': 'label'
      }).text(function (d) {
        return d + '%';
      });
}

var data = [31.2, 18.1, 12.3, 8.9, 8.4, 6.3, 4.8, 4.5, 4.1, 1.6];
draw(data);