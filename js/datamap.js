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

var clickFormat = d3.format('0.2');
var platform = 'Darwin';
var scale = 2;
var WIDTH = 1492;
var HEIGHT = 1128;

function draw(data) {
  // Choose the elements we want to draw.
  data = data.filter(row => {
    return (
      row.sys_info === 'Darwin' &&
      row.item === 'click' &&
      widgets[row.widget]);
  });

  // Set up the image.
  var chart = d3.select('.chart');
  chart.attr('viewBox', '0 0 ' + WIDTH + ' ' + HEIGHT);
  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': WIDTH, 'height': HEIGHT,
    'xlink:href': 'images/' + platform + '/HeatmapDefaultPlus.png'
  });


  chart.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
      .attr({
        'class': 'bar',
        'fill': 'rgba(255,0,0,0)',
        'x': function (d) {
          return widgets[d.widget].x * scale;
        },
        'y': function (d) {
          return widgets[d.widget].y * scale;
        },
        'width': function (d) {
          return widgets[d.widget].width * scale;
        },
        'height': function (d) {
          return widgets[d.widget].height * scale;
        },
        'title': function (d) {
          return d.widget.replace('-button', '').replace('-', ' ') +
            ' - ' + clickFormat(d.instances_per_session) + ' clicks per session';
        }
      });
    update(data);
}

function update(data) {
  // Set up the scales.
  var maxClicks = d3.max(data, d => d.instances_per_session);
  var clickScale = d3.scale.pow()
    .domain([1, maxClicks])
    .range(['rgba(255,0,0,0.1)', 'rgba(255,0,0,0.5)']);

  var chart = d3.select('.chart');
  chart.selectAll('.bar').data(data).transition()
    .style('fill', function (d) {
      return clickScale(d.instances_per_session);
    }).duration(500);
}


$(function () {
  $('#btn-default').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(clicks);
  });

  $('#btn-reversed').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(clicks);
  });
});


var widgets = {};
var clicks = [];

$.when(d3.csvPromise('data/' + platform + '/widgets.csv'), d3.csvPromise('data/heatmap_data/0.csv'))
  .then(function (widget_data, click_data) {
    var groups = {
      'additional': [],
      'tabs-and-tools': [],
      'menu-panel': []
    }
    $.each(widget_data, (i, d) => {
      if (d.width !== 0) {
        var type = 'additional';
        if (d.y < 60) {
          type = 'tabs-and-tools';
        } else if (d.x > 450) {
          type = 'menu-panel';
        }
        widgets[d.id] = d;
        widgets[d.id].type = type;
        groups[type].push(d.id);
      }
    });
    console.log(JSON.stringify(groups));
    $.each(click_data, (i, row) => {
      var d = row;
      d.widget = d.subitem
        .replace('builtin-item-', '')
        .replace('-left', '');
      clicks.push(d);
    });
    draw(clicks);
  }).fail(function (error) {
    console.log('Fail', error);
  });
