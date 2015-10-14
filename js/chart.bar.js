/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*global d3:false */

'use strict';

/**
* A bar chart. Required data format:
* [ { name : x-axis-bar-label, value : N }, ...]
*
*  Sample use:
*  var bargraph = d3.select('#bargraph')
*    .append('svg')
*    .chart('BarChart')
*    .yFormat(d3.format("d"))
*    .height(400)
*    .width(800)
*    .max(1.0);
*  bargraph.draw(bardata);
*/
d3.chart('BarChart', {

  initialize: function() {
    var chart = this;

    // chart margins to account for labels.
    // we may want to have setters for this.
    // not sure how necessary that is tbh.
    chart.margins = {
      top : 10,
      bottom : 15,
      left : 50,
      right : 0,
      padding : 2
    };

    // default chart ranges
    chart.x =  d3.scale.linear();
    chart.y = d3.scale.linear();

    chart.base
      .classed('Barchart', true);

    // non data driven areas (as in not to be independatly drawn)
    chart.areas = {};

    // cache for selections that are layer bases.
    chart.layers = {};

    // make sections for labels and main area
    //  _________________
    // |Y|    bars      |
    // | |              |
    // | |              |
    // | |              |
    // | |______________|
    //   |      X       |

    // -- areas
    chart.areas.ylabels = chart.base.append('g')
      .classed('ylabels', true)
      .attr('width', chart.margins.left)
      .attr('transform',
        'translate('+(chart.margins.left-1)+','+(chart.margins.top + 1)+')');

    // -- actual layers
    chart.layers.bars = chart.base.append('g')
      .classed('bars', true)
      .attr('transform',
        'translate(' + chart.margins.left + ',' + (chart.margins.top + 1)+')');

    chart.layers.xlabels = chart.base.append('g')
      .classed('xlabels', true)
      .attr('height', chart.margins.bottom);

    chart.on('change:width', function() {
      chart.x.range([0, chart.w - chart.margins.left]);
      chart.layers.bars.attr('width', chart.w - chart.margins.left);
      chart.layers.xlabels.attr('width', chart.w - chart.margins.left);
    });

    chart.on('change:height', function() {
      chart.y.range([chart.h - chart.margins.bottom - chart.margins.top, 0]);
      chart.areas.ylabels
        .attr('height', chart.h - chart.margins.bottom - chart.margins.top - 1);
      chart.layers.bars
        .attr('height', chart.h - chart.margins.bottom - chart.margins.top);
      chart.layers.xlabels
        .attr('transform', 'translate(' + chart.margins.left + ',' +
        (chart.h - chart.margins.bottom + 1) + ')');
    });

    // make actual layers
    chart.layer('bars', chart.layers.bars, {
      // data format:
      // [ { name : x-axis-bar-label, value : N }, ...]
      dataBind : function(data) {

        chart.data = data;

        // how many bars?
        chart.bars = data.length;

        // compute box size
        console.log('bar_width', chart.w, chart.margins.left, chart.margins.padding, chart.bars);
        chart.bar_width = (chart.w - chart.margins.left - ((chart.bars - 1) *
          chart.margins.padding)) / chart.bars;

        // adjust the x domain - the number of bars.
        chart.x.domain([0, chart.bars]);

        // adjust the y domain - find the max in the data.
        chart.datamax = chart.usermax ||
          d3.extent(data, function(d) { return d.value; })[1];

        chart.y.domain([0, chart.datamax]);

        // draw yaxis
        var yAxis = d3.svg.axis()
          .scale(chart.y)
          .orient('left')
          .ticks(5)
          .tickFormat(chart._yformat || d3.format('.0%'));

        chart.areas.ylabels
          .call(yAxis);

        return this.selectAll('rect')
          .data(data, function(d) { return d.name; });
      },
      insert : function() {
        return this.append('rect')
          .classed('bar', true)
          .classed('highlight', function(d) {
            return d.highlight;
          });
      },

      events: {
        exit: function() {
          this.remove();
        }
      }
    });

    // a layer for the x text labels.
    chart.layer('xlabels', chart.layers.xlabels, {
      dataBind : function(data) {
        // first append a line to the top.
        this.append('line')
          .attr('x1', 0)
          .attr('x2', chart.w - chart.margins.left)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('stroke', '#222')
          .style('stroke-width', '1')
          .style('shape-rendering', 'crispEdges');


        return this.selectAll('text')
          .data(data, function(d) { return d.name; });
      },
      insert : function() {
        return this.append('text')
          .classed('label', true)
          .attr('text-anchor', 'middle')
          .attr('x', function (d, i) {
            return chart.x(i) - 0.5 + chart.bar_width/2;
          })
          .attr('dy', function (d, i) {
            return (i % 2) ? '2em' : '1em';
          })
          .text(function(d) {
            return d.name;
          });
      },
      events: {
        exit: function() {
          this.remove();
        }
      }
    });

    // on new/update data
    // render the bars.
    var onEnter = function() {
      this.attr('x', function(d, i) {
        return chart.x(i) - 0.5;
      }).attr('y', function(d) {
        return chart.h - chart.margins.bottom -
          chart.margins.top - chart.y(chart.datamax - d.value) - 0.5;
      }).attr('val', function(d) {
        return d.value;
      }).attr('width', chart.bar_width)
      .attr('height', function(d) {
        return chart.y(chart.datamax - d.value);
      });
    };

    chart.layer('bars').on('enter', onEnter);
    chart.layer('bars').on('update', onEnter);
  },

  // return or set the max of the data. otherwise
  // it will use the data max.
  max : function(datamax) {
    if (!arguments.length) {
      return this.usermax;
    }

    this.usermax = datamax;

    if (this.data) this.draw(this.data);

    return this;
  },

  yFormat: function(format) {
    if (!arguments.length) {
      return this._yformat;
    }
    this._yformat = format;
    return this;
  },

  width : function(newWidth) {
    if (!arguments.length) {
      return this.w;
    }
    // save new width
    this.w = newWidth;

    // adjust the x scale range
    this.x =  d3.scale.linear()
      .range([this.margins.left, this.w - this.margins.right]);

    // adjust the base width
    this.base.attr('width', this.w);

    this.trigger('change:width');
    if (this.data) this.draw(this.data);

    return this;
  },

  height : function(newHeight) {
    if (!arguments.length) {
      return this.h;
    }

    // save new height
    this.h = newHeight;

    // adjust the y scale
    this.y = d3.scale.linear()
      .range([this.h - this.margins.top, this.margins.bottom]);

    // adjust the base width
    this.base.attr('height', this.h);

    this.trigger('change:height');
    if (this.data) this.draw(this.data);
    return this;
  }
});
