/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

"use strict";

function draw(data) {
  var chart = d3.select('.chart');

  console.log("Length:", data.length);
  console.log("Map:", data.map((d) => d.ProductVersion));
  var xScale = d3.scale.linear()
                 .domain([0, data.length])
                 .range([0, 150]);

  var yMax = d3.max(data.map((d) => d.Total));
  var yScale = d3.scale.log()
                 .domain([1, yMax])
                 .range([90, 0]);
  yScale.tickFormat(5, 's');
  var s = d3.format('0.2s');

  chart.append('g').attr({'id': 'bars'})
    .selectAll('.bars').data(data).enter()
    // <rect x="0" y="0" width="50" height="50" fill="green" />
    .append('rect')
      .attr('class', 'bar')
      .style('fill', function (d) {
        return 'rgba(255,0,0,' + ((90 - yScale(d.Total))/90) + ')';
      }).attr({
        'x': function (d, i) {
          return xScale(i);
        },
        'y': function (d) {
          return yScale(d.Total);
        },
        'width': function () {
          return xScale(1);
        },
        'height': function (d) {
          return 90 - yScale(d.Total);
        }
      }).append("svg:title")
      .text((d) => d.ProductVersion + '/' + d.Percentage + '/' + s(d.Total));


  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickSize(1)
    .tickFormat((x) => data[x].ProductVersion)
    .ticks(10);
  chart.append("g")
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

var version;

ds.fetch().then(function (data) {
  draw(data.sort(function (rowA, rowB) {
    var aVersion = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/.exec(rowA.ProductVersion);
    if (aVersion) {
      aVersion = aVersion.slice(1).map((d) => new Number(d));
    }
    var bVersion = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/.exec(rowB.ProductVersion);
    if (bVersion) {
      bVersion = bVersion.slice(1).map((d) => new Number(d));
    }

    if (aVersion === null && bVersion !== null) {
      return 1;
    } else if (aVersion !== null && bVersion === null) {
      return -1
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
  }).toJSON());
})