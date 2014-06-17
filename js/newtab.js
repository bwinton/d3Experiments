/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global d3:false, $:false */

'use strict';

var widgets = {
  'tile1': {'x': 298, 'y': 350, 'width': 547, 'height': 283},
  'tile2': {'x': 885, 'y': 350, 'width': 547, 'height': 283},
  'tile3': {'x': 1471, 'y': 350, 'width': 547, 'height': 283},
  'tile4': {'x': 298, 'y': 674, 'width': 547, 'height': 283},
  'tile5': {'x': 885, 'y': 674, 'width': 547, 'height': 283},
  'tile6': {'x': 1471, 'y': 674, 'width': 547, 'height': 283},
  'tile7': {'x': 298, 'y': 997, 'width': 547, 'height': 283},
  'tile8': {'x': 885, 'y': 997, 'width': 547, 'height': 283},
  'tile9': {'x': 1471, 'y': 997, 'width': 547, 'height': 283},
  'tileN': {'x': 1471, 'y': 1320, 'width': 547, 'height': 141},
};

var ids = ['tile1', 'tile2', 'tile3', 'tile4', 'tile5', 'tile6', 'tile7', 'tile8', 'tile9', 'tileN'];
var newData = {
  'previous': {
    'count': 1000,
    'total': [ 312, 181, 123, 89, 84, 63, 48, 45, 41, 16]
  },
  'default': {
    'count': 1217655,
    'total': [1019821, 674379, 458698, 327849, 298166, 230958, 148179, 133924, 121596, 77406]
  },
  'reversed': {
    'count': 25777,
    'total': [16816, 12117, 8829, 7242, 6591, 5961, 2930, 2850, 3365, 1041]
  }
};

function parse(data) {
  var totals = data.total;
  var sum = d3.sum(totals);
  return totals.map((v, i) => ({'id': ids[i], 'value': v/sum}));
}

var percent = d3.format('0.1%');

function draw(data) {
  var chart = d3.select('.chart');

  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': 2316, 'height': 1544, 'xlink:href': 'images/EmptyFirefox.png'
  });

  chart.selectAll('.tiles')
    .data(data)
    .enter()
    .append('rect')
      .attr({
        'class': 'bar',
        'fill':'rgba(255,0,0,0)',
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
  chart.selectAll('.label').data(data)
    .classed('increasing', function (d) {
      var currentValue = this.textContent.slice(0,-1);
      currentValue = +currentValue / 100;
      return d.value >= currentValue;
    }).classed('decreasing', function (d) {
      var currentValue = this.textContent.slice(0,-1);
      currentValue = +currentValue / 100;
      return d.value < currentValue;
    }).transition().tween('text', function (d) {
      var currentValue = this.textContent.slice(0,-1);
      currentValue = +currentValue / 100;
      var interpolator = d3.interpolateNumber(currentValue, d.value);
      return function( t ) {
        this.textContent = percent(interpolator(t));
      };
    }).duration(500).each('end', function () {
      d3.select(this).classed('increasing decreasing', false);
    });
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
    update(parse(newData.reversed));
  });
});

draw(parse(newData['default']));