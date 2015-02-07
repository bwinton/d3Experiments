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
      'include_fields=id,assigned_to,summary,last_change_time,whiteboard,status,mentors,resolution&' +
      'status=ALL&' +
      'whiteboard=\[qx\]';
  var START_MOZILLA_URL = 'https://dl.dropboxusercontent.com/u/2301433/Twitter/startmozilla.tweets.txt';

  var orderedStatuses = new Map([
    ['unknown', 0],
    ['not_ready', 1],
    ['submitted', 2],
    ['assigned', 3],
    ['fixed', 4]
  ]);

  var percent = d3.format('0.1%');

  var sortFunc = function (a, b) {
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

    aStatus = orderedStatuses.get(aStatus) || 0;
    bStatus = orderedStatuses.get(bStatus) || 0;
    if (aStatus != bStatus) {
      return aStatus - bStatus;
    }

    return a.id - b.id
  }

  var getColour = function (status) {
    switch (status) {
      case 'not_ready':
        return 'rgb(255,255,255)';
      case 'submitted':
        return 'rgb(127,255,127)';
      case 'assigned':
      case 'fixed':
        return 'rgb(192,214,255)';
      default:
        return 'rgb(255,127,127)';
    }
  };

  var getAssignee = function (bug) {
    if (bug.assigned_to) {
      return bug.assigned_to;
    }
    return 'nobody';
  }

  var getMentor = function (bug) {
    if (bug.mentors && bug.mentors.length) {
      return bug.mentors.join(', ');
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

  var summarize = function (bugs) {

    var summary = [
      {name: 'unknown', bugs: []},
      {name: 'not_ready', bugs: []},
      {name: 'submitted', bugs: []},
      {name: 'assigned', bugs: []},
    ];
    bugs.forEach(bug => {
      var status = orderedStatuses.get(bug.qx_status) || 0;
      // Lump fixed in with assigned.
      if (status === 4) {
        status = 3;
      }
      summary[status].bugs.push(bug);
      summary[status].percentage = summary[status].bugs.length / bugs.length;
    });
    return summary.filter(category => category.bugs.length);
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
    bugRow.append('a').classed('twitter', true)
      .attr('href', bug => bug.twitter)
      .classed('missing', bug => !bug.twitter);

    bugRow.transition().duration(TRANSITION_DURATION)
      .delay((d, i) => i*20)
      .style({'opacity': '1'});

    bugRow.exit()
      .transition().duration(TRANSITION_DURATION)
      .style({'height': '0px', 'opacity': '0'})
      .remove();

    d3.select('.summaries').selectAll('.category')
      .data(summarize(bugs))
      .enter().append('div').classed('category', true)
      .style({
        'flex': category => category.bugs.length,
        'background-color': category => getColour(category.name)
      }).text(category => category.name + ': ' + category.bugs.length +
        ' (' + percent(category.percentage) + ')');
  };

  $.when(d3.jsonPromise(BUGZILLA_URL),
           d3.csvPromise('data/qx.csv'),
           d3.htmlPromise(START_MOZILLA_URL))
    .then(function (bug_list, bug_statuses, startmozilla) {
      var bug_list = bug_list.bugs;

      var lines = startmozilla.textContent.split('\n');
      var posts = [];
      lines = lines.forEach(line => {
        if (line.startsWith('bug ')) {
          line = line.split(' - ');
          posts.push({id: line[0].slice(4), 'twitter': line[1]});
        } else if (line) {
          console.log('Error processing "' + line + '".');
        }
      });

      bug_list.forEach(bug => {
        if (bug.status === 'RESOLVED') {
          bug.qx_status = 'fixed';
        } else if (getAssignee(bug) !== 'nobody@mozilla.org') {
          bug.qx_status = 'assigned';
        }
      });

      $.each(bug_list, (i, bug) => {
        var bug_status = bug.qx_status ? {qx_status: bug.qx_status} : {};
        $.extend(bug,
          bug_statuses.find(test => +test.id === +bug.id),
          posts.find(test => +test.id === +bug.id),
          bug_status);
      });
      draw(bug_list);
    }).fail(function (error) {
      console.log('Fail', error);
    });
})();