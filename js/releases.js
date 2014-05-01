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
  console.log("Got data!", data);
  var chart = d3.select('.chart');

  var xScale = d3.scale.linear()
                 .domain([0, data.length])
                 .range([0, 150]);

  var yScale = d3.scale.log()
                 .domain([1, d3.max(data)])
                 .range([0, 100]);

  console.log("x,y", data.length, d3.max(data));


  chart.selectAll('.tiles')
    .data(data)
    .enter()
    // <rect x="0" y="0" width="50" height="50" fill="green" />
    .append('rect')
      .attr('class', 'bar')
      .style('fill', function (d) {
        return 'rgba(255,0,0,' + (yScale(d)/100) + ')';
        // return 'rgb(255,0,0)';
      }).attr({
        'x': function (d, i) {
          return xScale(i);
        },
        'y': function (d) {
          return 100 - yScale(d);
        },
        'width': function () {
          return xScale(1);
        },
        'height': function (d) {
          console.log("y:", d, yScale(d));
          return yScale(d);
        }
      });
}

var ds = new Miso.Dataset({
  url : "../releases.csv",
  delimiter : ","
});

var savedData;

ds.fetch().then(function (data) {
  savedData = data.column('Total').data;
  console.log(data.columnNames());
  console.log(data.length);
  draw(data.column('Total').data);
})
draw(ds);