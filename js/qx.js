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
  var BUGZILLA_URL = 'https://bugzilla.mozilla.org/rest/bug?' +
      'include_fields=id,assigned_to,summary,last_change_time,whiteboard,status,mentor,resolution&' +
      'status=ALL&' +
      'whiteboard=\[qx\]';

  var sortFunc = function (a, b) {
    var orderedStatuses = {
      // 'unknown': 0,
      'not_ready': 1, 'needinfo': 1,
      'submitted': 2, 'posted': 2,
      'assigned': 3, 'fixed': 3
    };
    var aStatus = a.qx_status;
    var bStatus = b.qx_status;

    if (!aStatus) {
      if (!bStatus) {
        return a.id - b.id
      }
      return -1;
    }
    if (!bStatus) {
      return 1;
    }

    aStatus = orderedStatuses[aStatus] || 0;
    bStatus = orderedStatuses[bStatus] || 0;
    if (aStatus != bStatus) {
      return aStatus - bStatus;
    }

    return a.id - b.id
  }

  var getColour = function (status) {
    switch (status) {
      case 'not_ready':
      case 'needinfo':
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

  var getMentor = function (bug) {
    if (bug.mentor && bug.mentor.content) {
      return bug.mentor.content;
    }
    return false;
  }

  var getDxr = function (bug) {
    if (bug.dxr && bug.dxr !== 'no') {
      return 'has link';
    }
    return false;
  }

  var getSpec = function (bug) {
    if (bug.spec && bug.spec !== 'no') {
      return 'has spec';
    }
    return false;
  }

  var draw = function (bugs) {
    d3.select('.bugs').select('.loading').remove()

    var bugRow = d3.select('.bugs').selectAll('.bug')
      .data(bugs.sort(sortFunc));

    bugRow.enter().append('div').classed('bug', true)
      .classed('fixed', bug => bug.qx_status === 'fixed')
      .style({'opacity': '0', 'background-color': bug => getColour(bug.qx_status)})
      .attr('title', bug => bug.qx_status);

    bugRow.append('span').classed('icon glyphicon glyphicon-user', true)
      .classed('missing', bug => !getMentor(bug))
      .attr('title', bug => getMentor(bug) || 'nobody');
    bugRow.append('span').classed('icon glyphicon glyphicon-search', true)
      .classed('missing', bug => !getDxr(bug))
      .attr('title', bug => getDxr(bug) || 'missing link');
    bugRow.append('span').classed('icon glyphicon glyphicon-picture', true)
      .classed('missing', bug => !getSpec(bug))
      .attr('title', bug => getSpec(bug) || 'missing spec');

    bugRow.append('a').text(bug => bug.id).classed('bugid', true)
      .attr('href', bug => 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id);
    bugRow.append('span').classed('summary', true)
      .text(bug => ' - ' + bug.summary + ' (' + getAssignee(bug) + ')');

    bugRow.transition().duration(TRANSITION_DURATION)
      .delay((d, i) => i*20)
      .style({'opacity': '1'});

    bugRow.exit()
      .transition().duration(TRANSITION_DURATION)
      .style({'height': '0px', 'opacity': '0'})
      .remove();
  };

  $.when(d3.jsonPromise(BUGZILLA_URL), d3.csvPromise('data/qx.csv'))
    .then(function (bug_list, bug_statuses) {
      var bug_list = bug_list.bugs;
      $.each(bug_list, (i, bug) => {
        $.extend(bug, bug_statuses.find(test => +test.id === +bug.id));
      });
      draw(bug_list);
    }).fail(function (error) {
      console.log('Fail', error);
    });
})();