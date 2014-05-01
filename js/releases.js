/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

"use strict";

var savedData;
var savedChart;

function draw(data) {
  console.log("Got data!", data);
  var chart = d3.select('.chart')
    .chart('BarChart', {
      transform: function(data) {
        console.log("data", data);
        return data.map(function(d) {
          return { name : d.ProductVersion, value : d.Total };
        });
      }
    }).yFormat(d3.format("s"))
    .height(100)
    .width(150);

  savedChart = chart;

  // render it with some data
  chart.draw(data);
}

var ds = new Miso.Dataset({
  url : "../releases.csv",
  delimiter : ","
});

ds.fetch().then(function (data) {
  savedData = data;
  console.log(data.columnNames());
  console.log(data.length);
  draw(data.toJSON().slice(0, 10));
})

