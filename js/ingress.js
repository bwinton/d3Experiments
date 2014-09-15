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

/* To get the timestamp, use:
now = datetime.datetime.now(); sec_since_epoch = int(time.mktime(now.timetuple()) + now.microsecond/1000000.0)*1000; sec_since_epoch
*/

var date = d3.time.format('%c');
var percent = d3.format('0.1%');
var number = function (d) {
  if (d > 99) {
    d = d3.format('01,.3s')(d)
  }
  return '' + d;
}

var colours = d3.scale.category20();


function addScales(metadata) {
  var scales = {};
  var top = metadata.levels[metadata.levels.length - 1];
  $.each(metadata.badges, (key, value) => {
    scales[key] = d3.scale.linear().domain([0, value[top]]);
  });

  var ap = $.map(metadata.ap, (v,k) => v);
  scales.ap = d3.scale.linear().domain([0, d3.max(ap)]);
  metadata.scales = scales;
}

function getBadges(metadata, agent) {
  var rv = metadata.badgeList.map(badgeId => {
    var badge = metadata.badges[badgeId];
    var current = +agent[badgeId];
    var levels = metadata.levels;
    var title;
    if (badgeId === 'ap') {
      badge = metadata.ap;
      levels = Object.keys(metadata.ap);
      title = 'AP';
    } else {
      title = badge.title;
    }
    for (var i in levels) {
      var level = levels[i];
      var target = badge[level];
      if (target > current) {
        break;
      }
    };
    var rv = {
      'id': badgeId,
      'value': current,
      'title': title
    };
    if (current < target) {
      rv.next = level;
      rv.target = target;
    }
    return rv;
  });
  return rv
}

function getBackground (d) {
  var stop = percent(d.value / d.target);
  var colour = colours(d.id);
  var background = '#eee';
  var rv = 'linear-gradient( 90deg, ' +
    colour + ', ' + colour + ' ' + stop +
    ', ' + background + ' ' + stop + ', ' + background + ' )';
  return rv;
}

function formatBadge(d) {
  return d.next + ' ' + d.title + ': ' +
    number(d.target - d.value) + '/' + number(d.target) + ' to go.  (' + percent(d.value / d.target) + ')';
}

function showLatest(metadata, agents) {
  var latest = d3.select('#latest');
  var agentElems = latest.selectAll('div.agent').data(agents).enter()
    .append('div').classed('agent', true);
  agentElems.append('div').classed('name', true)
    .text((d) => d.name + ':');
  agentElems.selectAll('div.badges').data((d) => d.data.slice(-1)).enter()
    .append('div').classed('badges', true)
    .text((d) => date(new Date(+d.date)))
    .selectAll('div.iBadge').data((d) => getBadges(metadata, d)).enter()
      .append('div').classed('iBadge', true)
        .style('background', (d) => getBackground(d))
        .style('border', (d) => '1px solid ' + colours(d.id))
        .text((d) => formatBadge(d));
}

function ingress() {
  var margin = {top: 20, right: 20, bottom: 20, left: 50};
  var width = 650;
  var height = 120;
  var xValue = function(d) { return d[0]; };
  var yValue = function(d) { return d[1]; };
  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();
  var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
    .ticks(4).tickSize(6, 0);
  var yAxis = d3.svg.axis().scale(yScale).orient('left')
    .ticks(4).tickSize(6, 0).tickFormat(number);
  var area = d3.svg.area().x(X).y1(Y);
  var line = d3.svg.line().x(X).y(Y);
  var fill = '#000000';
  var breakpoints = [];

  function chart(selection) {
    selection.each(function(data) {
      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      var yExtent = d3.extent(data, d => d[1]);
      var yRange = (yExtent[1] - yExtent[0]) || (yExtent[0] / 3);
      var yPrevious = breakpoints.filter(d => d < yExtent[0]);
      var yNext = breakpoints.filter(d => d > yExtent[1]);
      // console.log(yExtent, yPrevious, yNext);
      yPrevious = (yPrevious[yPrevious.length - 1] || 0) - yRange / 3;
      yNext = (yNext[0] || 0) + yRange / 3;
      console.log(yExtent, yPrevious, yNext);

      yScale
          // .domain([d3.max([0, yExtent[0] - yRange/3]), yExtent[1]])
          // .domain([yPrevious, yNext])
          .domain([0, yNext])
          .range([height - margin.top - margin.bottom, 0]);

      if (yExtent[0] === 0 && yExtent[1] === 0) {
        console.log(yRange, [d3.max([0, yExtent[0] - yRange/3]), yExtent[1]]);
        return;
      }

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll('svg').data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append('svg').append('g');
      gEnter.append('g').attr('class', 'breakpoints').selectAll('line')
        .data(breakpoints.filter(y => y >= yScale.domain()[0] && y <= yScale.domain()[1]))
        .enter().append('line')
          .attr('fill', '#eee')
          .attr('stroke-width', 2)
          .attr('x1', 0).attr('y1', yScale)
          .attr('x2', width).attr('y2', yScale)
      gEnter.append('path').attr('class', 'area')
        .attr('fill', fill);
      gEnter.append('path').attr('class', 'line')
        .attr('fill', 'rgba(127, 127, 127, 0)')
        .attr('stroke', d3.rgb(fill).darker(1))
        .attr('stroke-width', 2);
      gEnter.append('g').attr('class', 'x axis');
      gEnter.append('g').attr('class', 'y axis');

      // Update the outer dimensions.
      svg.attr('width', width)
        .attr('height', height);

      // Update the inner dimensions.
      var g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the area path.
      g.select('.area')
        .attr('d', area.y0(yScale.range()[0]));

      // Update the line path.
      g.select('.line')
        .attr('d', line);

      // Update the line path.
      g.select('.breakpoints')
        .attr('d', line);

      // Update the x-axis.
      g.select('.x.axis')
        .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
        .call(xAxis);

      // Update the y-axis.
      g.select('.y.axis')
        .call(yAxis);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.fill = function(_) {
    if (!arguments.length) return fill;
    fill = _;
    return chart;
  };

  chart.breakpoints = function(_) {
    if (!arguments.length) return breakpoints;
    breakpoints = _;
    return chart;
  };

  return chart;
}

function draw(metadata, agents) {

  charts = $('#charts > div');

  charts.each((i,e) => {

    var badgeId = $(e).attr('class');
    var badge = metadata.badges[badgeId];
    var levels = metadata.levels
    if (!badge) {
      badge = metadata.ap;
      levels = d3.range(1, 16).map(x => "Level " + x);
    }
    levels = levels.map(d => badge[d]);
    window.data = {levels: levels, badgeId: badgeId, badge: badge};

    var chart = ingress()
      .x(d => +d.date)
      .y(d => +d[badgeId])
      .fill(colours(badgeId))
      .breakpoints(levels);

    d3.select(e)
      .datum(agents[0].data)
      .call(chart)
      .append('span').text(d => badge ? badge.title : 'AP');
  });

  addScales(metadata);
  showLatest(metadata, agents);
}

$.when(d3.jsonPromise('data/ingress/metadata.json'), d3.csvPromise('data/ingress/bw1.csv'))
  .then(function (metadata, bw1) {
    draw(metadata, [
      {'name':'bw1', 'data':bw1}
    ]);
  }).fail(function (error) {
    console.log('Fail', error);
  });
