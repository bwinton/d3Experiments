/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*global d3:false */

'use strict';

var SUGGESTIONS_DATA = 'data/suggestions.json';

var margin = {top: 20, right: 120, bottom: 30, left: 60};
var width = 550 - margin.left - margin.right;
var height = 350 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

var percent = d3.format('.0%');
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickFormat(percent);

var svg = d3.select('.charts').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.json(SUGGESTIONS_DATA, function(error, raw) {
  if (error) {
    d3.select('#log').classed('hide', true);
    d3.select('.chart').classed('hide', true);
    d3.select('#error').classed('hide', false)
      .text(SUGGESTIONS_DATA + ' ' + error.statusText);
    return;
  }
  d3.select('#log').classed('hide', false);
  d3.select('.chart').classed('hide', false);
  d3.select('#error').classed('hide', true);

  raw = raw.filter((d) => d[0][0] !== 'default');

  var log = d3.select('#log');
  log.selectAll('.section').data(raw).enter()
    .append('div').classed('section', true)
    .text((d) => d[0])
    .selectAll('.values').data((d) => d[1]).enter()
      .append('div').classed('values', true)
      .text((d) => d[0] + '(suggestionsEnabled)/' + d[1] + '(userChoice) => '+ d[2]);

  // munge the data!

  var data = [];
  var keys = {};

  raw.forEach((item) => {
    var newData = { 'Channel': item[0].join('/') };
    var total = 0;
    item[1].forEach((key) => {
      var strKey = key[0] + '-' + key[1];
      keys[strKey] = true;
      newData[strKey] = key[2];
      total += key[2];
    });
    newData.total = total;
    data.push(newData);
  });

  color.domain(d3.keys(keys));

  data.forEach(function(d) {
    var y0 = 0;
    d.ages = color.domain().map(function(name) {
      return {name: name, y0: y0, y1: y0 += (d[name] || 0) / d.total};
    });
    // d.total = d.ages[d.ages.length - 1].y1;
  });

  data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.Channel; }));
  y.domain([0, 1]);

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end');

  var channel = svg.selectAll('.channel')
      .data(data)
    .enter().append('g')
      .attr('class', 'g')
      .attr('transform', function(d) { return 'translate(' + x(d.Channel) + ',0)'; });

  channel.selectAll('rect')
      .data(function(d) { return d.ages; })
    .enter().append('rect')
      .attr('width', x.rangeBand())
      .attr('y', function(d) { return y(d.y1); })
      .attr('height', function(d) { return y(d.y0) - y(d.y1); })
      .style('fill', function(d) { return color(d.name); })
      .attr('title', (d) => d.name + ' ' + percent(d.y1 - d.y0));

  var legend = svg.selectAll('.legend')
      .data(color.domain().slice().reverse())
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) { return 'translate(100,' + i * 20 + ')'; });

  legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

  legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function(d) { return d; });

});
