/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

"use strict";

var widgets = {
  'tile1': {'x': 19.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  'tile2': {'x': 57.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  'tile3': {'x': 95.4, 'y': 22.7, 'width': 35.3, 'height': 18.2},
  'tile4': {'x': 19.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  'tile5': {'x': 57.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  'tile6': {'x': 95.4, 'y': 43.7, 'width': 35.3, 'height': 18.2},
  'tile7': {'x': 19.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  'tile8': {'x': 57.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  'tile9': {'x': 95.4, 'y': 64.7, 'width': 35.3, 'height': 18.2},
  'tileN': {'x': 95.4, 'y': 85, 'width': 35.3, 'height': 10},
};

var ids = ['tile1', 'tile2', 'tile3', 'tile4', 'tile5', 'tile6', 'tile7', 'tile8', 'tile9', 'tileN'];
var newData = {
  'reversed': {
    'count': 25777,
    'total': [16816, 12117, 8829, 7242, 6591, 5961, 2930, 2850, 3365, 1041]
  },
  'default': {
    'count': 1217655,
    'total': [1019821, 674379, 458698, 327849, 298166, 230958, 148179, 133924, 121596, 77406]
  }
};

function parse(data) {
  var totals = data['total'];
  var sum = d3.sum(totals);
  return totals.map((v, i) => ({'id': ids[i], 'value': v/sum}));
}

var parsedData = [
  {'id': 'tile1', 'value': 31.2},
  {'id': 'tile2', 'value': 18.1},
  {'id': 'tile3', 'value': 12.3},
  {'id': 'tile4', 'value': 8.9},
  {'id': 'tile5', 'value': 8.4},
  {'id': 'tile6', 'value': 6.3},
  {'id': 'tile7', 'value': 4.8},
  {'id': 'tile8', 'value': 4.5},
  {'id': 'tile9', 'value': 4.1},
  {'id': 'tileN', 'value': 1.6}
];

var percent = d3.format('0.1%');

function draw(data) {
  var chart = d3.select('.chart');

  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': 150, 'height': 100, 'xlink:href': 'EmptyFirefox.png'
  });

  chart.selectAll('.tiles')
    .data(data)
    .enter()
    .append('rect')
      .attr({
        'class': 'bar',
        'x': function (d) {
          return widgets[d.id].x;
        },
        'y': function (d) {
          return widgets[d.id].y;
        },
        'width': function (d) {
          return widgets[d.id].width;
        },
        'height': function (d) {
          return widgets[d.id].height;
        }
      });
    chart.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr({
        'class': 'label',
        'x': function (d) {
          return widgets[d.id].x + widgets[d.id].width / 2;
        },
        'y': function (d) {
          return widgets[d.id].y + widgets[d.id].height / 2;
        },
        'dy': '0.5em',
        'width': function (d) {
          return widgets[d.id].width;
        },
        'height': function (d) {
          return widgets[d.id].height;
        }
      });
    update(data);
}

function update(data) {
  var chart = d3.select('.chart');
  chart.selectAll('.bar').data(data).transition()
    .style('fill', function (d) {
      return 'rgba(255,0,0,' + (d.value) + ')';
    }).duration(500);
  chart.selectAll('.label').data(data).transition()
    .text(function (d) {
      return percent(d.value);
    }).duration(500);
}


$(function () {
  $('#btn-default').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(parse(newData['default']));
  });

  $('#btn-reversed').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(parse(newData['reversed']));
  });
});

parsedData = parse(newData['default']);
draw(parsedData);