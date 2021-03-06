/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global d3:false, $:false, _:false, Miso:false */

'use strict';

function popularityComparator(rowA, rowB) {
  if (rowA.Total > rowB.Total) {
    return -1;
  }
  if (rowA.Total < rowB.Total) {
    return 1;
  }
  return 0;
}

function versionComparator(rowA, rowB) {
  var aVersion = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/.exec(rowA.ProductVersion);
  if (aVersion) {
    aVersion = aVersion.slice(1).map((d) => +d);
  }
  var bVersion = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/.exec(rowB.ProductVersion);
  if (bVersion) {
    bVersion = bVersion.slice(1).map((d) => +d);
  }

  if (aVersion === null && bVersion !== null) {
    return 1;
  } else if (aVersion !== null && bVersion === null) {
    return -1;
  }

  if (aVersion[0] > bVersion[0]) {
    return -1;
  }
  if (aVersion[0] < bVersion[0]) {
    return 1;
  }
  if (aVersion[1] > bVersion[1]) {
    return -1;
  }
  if (aVersion[1] < bVersion[1]) {
    return 1;
  }
  if (aVersion[2] > bVersion[2]) {
    return -1;
  }
  if (aVersion[2] < bVersion[2]) {
    return 1;
  }
  return 0;
}


var xOrder = 'VersionOrder';
var xScale;
var yScales = {};
var yScale;

function updateHeights () {
  var chart = d3.select('.chart');
  chart.selectAll('.bar').transition().attr({
    'y': d => yScale(d.Total),
    'height': d => 90 - yScale(d.Total)
  }).duration(500)
  .delay(d => 5 * d[xOrder]);
}

function updateXes () {
  var chart = d3.select('.chart');
  chart.selectAll('.bar').transition().attr({
    'x': d => xScale(d[xOrder])
  }).duration(500)
  .delay(d => 5 * d[xOrder]);
}
function draw(data) {
  var chart = d3.select('.chart');

  xScale = d3.scale.linear()
    .domain([0, data.length])
    .range([0, 150]);

  var yMax = d3.max(data.map((d) => d.Total));

  yScales.yLog = d3.scale.log()
    .domain([1, yMax])
    .range([90, 0]);
  yScales.yLog.tickFormat(5, 's');

  yScales.yLinear = d3.scale.linear()
    .domain([1, yMax])
    .range([90, 0]);
  yScales.yLinear.tickFormat(5, 's');

  yScale = yScales.yLog;

  var s = d3.format('0.2s');

  chart.append('g').attr({'id': 'bars'})
    .selectAll('.bar').data(data).enter()
    .append('rect')
    .attr('class', 'bar')
    .style('fill', function (d) {
      return 'rgba(255,0,0,' + ((90 - yScale(d.Total))/90) + ')';
    }).attr({
      'x': function (d) {
        return xScale(d[xOrder]);
      },
      'y': function () {
        return 90;
      },
      'width': function () {
        return xScale(1);
      },
      'height': function () {
        return 0;
      }
    }).append('svg:title')
    .text((d) => d.ProductVersion + '/' + d.Percentage + '/' + s(d.Total));

  setTimeout(updateHeights, 500);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickSize(1)
    .tickFormat((x) => data[x].ProductVersion)
    .ticks(10);
  chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,90)')
    .call(xAxis);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .tickSize(1)
    .ticks(4, 's');
  chart.append('g')
    .attr('class', 'y axis')
    .call(yAxis);
}

var ds = new Miso.Dataset({
  url: 'releases.csv',
  delimiter: ','
});

ds.fetch().then(function (data) {

  data.sort(popularityComparator);
  data.addColumn({
    type: 'number',
    name: 'PopularityOrder',
    data: _.range(data.length)
  });

  data.sort(versionComparator);
  data.addColumn({
    type: 'number',
    name: 'VersionOrder',
    data: _.range(data.length)
  });

  draw(data.toJSON());
});

$(function () {
  $('#btn-linear').click(function () {
    $('.btn.scale').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    yScale = yScales.yLinear;
    updateHeights();
  });

  $('#btn-log').click(function () {
    $('.btn.scale').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    yScale = yScales.yLog;
    updateHeights();
  });

  $('#btn-version').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    xOrder = 'VersionOrder';
    updateXes();
  });

  $('#btn-popularity').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    xOrder = 'PopularityOrder';
    updateXes();
  });
});