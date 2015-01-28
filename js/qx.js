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

var TRANSITION_DURATION = 500;

var getColour = function (bug) {
  switch (bug.status) {
    case 'submitted':
    case 'posted':
      return 'rgb(127,255,127)';
    case 'unknown':
      return 'rgb(255,255,255)';
    default:
      return 'rgb(255,127,127)';
  }
};

var draw = function (bugs) {
  console.log(d3.select('.bugs').selectAll('.bug')[0].length)
  var bugRow = d3.select('.bugs').selectAll('.bug')
    .data(bugs);
  console.log(d3.select('.bugs').selectAll('.bug')[0].length)

  bugRow.enter().append('div').classed('bug', true)
    .style({'opacity': '0', 'background-color': bug => getColour(bug)})
    .text(bug => bug.bugId + ' (' + bug.status + ')')
    .transition().duration(TRANSITION_DURATION)
    .delay((d, i) => i*20)
    .style({'opacity': '1'});
  console.log(d3.select('.bugs').selectAll('.bug')[0].length)

  bugRow.exit()
    .transition().duration(TRANSITION_DURATION)
    .style({'height': '0px', 'opacity': '0'})
    .remove();
  console.log(d3.select('.bugs').selectAll('.bug')[0].length)
};

$.when(d3.csvPromise('data/qx.csv'))
  .then(function (bug_data) {
    $.each(bug_data, (i, bug) => {
      // console.log(bug.bugId,bug.status)
    });
    draw(bug_data);
  }).fail(function (error) {
    console.log('Fail', error);
  });
