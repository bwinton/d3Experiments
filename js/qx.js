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

(function () {
  var TRANSITION_DURATION = 500;
  var BUGZILLA_URL = 'https://api-dev.bugzilla.mozilla.org/latest/bug?' +
      'include_fields=id,assigned_to,summary,last_change_time,whiteboard,status,resolution&' +
      'status=ALL&' +
      'whiteboard=\[qx\]';


  var getColour = function (status) {
    switch (status) {
      case 'unknown':
        return 'rgb(255,255,255)';
      case 'submitted':
      case 'posted':
        return 'rgb(127,255,127)';
      case 'assigned':
      case 'fixed':
        return 'rgb(192,214,255)';
      default:
        return 'rgb(255,127,127)';
    }
  };

  var getAssignee = function (bug) {
    if (bug.assigned_to && bug.assigned_to.name) {
      return bug.assigned_to.name;
    }
    return 'nobody';
  }

  var draw = function (all_bugs, bug_statuses) {
    d3.select('.bugs').select('.loading').remove()

    var bugRow = d3.select('.bugs').selectAll('.bug')
      .data(all_bugs);

    bugRow.enter().append('div').classed('bug', true)
      .style({'opacity': '0', 'background-color': bug => getColour(bug_statuses[bug.id])})
      .text(bug => bug.id + ' - ' + bug.summary + ' (' + getAssignee(bug) + ')')
      .attr('title', bug => bug_statuses[bug.id])
      .transition().duration(TRANSITION_DURATION)
      .delay((d, i) => i*20)
      .style({'opacity': '1'});

    bugRow.exit()
      .transition().duration(TRANSITION_DURATION)
      .style({'height': '0px', 'opacity': '0'})
      .remove();
  };

  $.when(d3.csvPromise('data/qx.csv'), d3.jsonPromise(BUGZILLA_URL))
    .then(function (bug_data, more_bug_data) {
      var all_bugs = more_bug_data.bugs;
      var bug_statuses = {};
      $.each(bug_data, (i, bug) => {
        bug_statuses[+bug.bugId] = bug.status;
      });
      draw(all_bugs, bug_statuses);
    }).fail(function (error) {
      console.log('Fail', error);
    });
})();