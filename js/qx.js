/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-env browser */
/* global d3:false, $:false */
/* eslint no-console:0 */

'use strict';

(function () {
  var TRANSITION_DURATION = 500;
  var WHITEBOARD = /\[qx(?::[^\]]*)*\]/;
  var BUGZILLA_URL = 'https://bugzilla.mozilla.org/rest/bug?' +
      'include_fields=id,product,assigned_to,summary,last_change_time,whiteboard,status,mentors,resolution,priority&' +
      'status=ALL&' +
      'whiteboard=\[qx';
  var START_MOZILLA_URL = 'https://dl.dropboxusercontent.com/u/2301433/Twitter/startmozilla.tweets.txt';

  // var TEST_DATA = '/data/sample_bugzilla.json'

  // uncomment next line to use test data
  // BUGZILLA_URL = TEST_DATA

  var orderedStatuses = new Map([
    ['unknown', 0],
    ['not_ready', 1],
    ['submitted', 2],
    ['assigned', 3],
    ['fixed', 4]
  ]);

  var percent = d3.format('0.1%');

  var products = [];

  var getProductFromURL = () => {
    var hash = window.location.hash;

    if(hash) {
      return hash.replace('#', '').replace('<', '').replace('%3C', '');
    } else {
      return '';
    }
  };
  var currentProduct = getProductFromURL();

  var isURLSorted = () => {
    var hash = window.location.hash;
    return hash && (hash.indexOf('<') !== -1 || hash.indexOf('%3C') !== -1);
  };

  var getSortFromURL = () => {
    if (isURLSorted()) {
      return (a, b) => {
        // console.log('Boom!', a, b);
        console.log(a.id + ':' + a.priority, b.id + ':' + b.priority);
        var aPrio = a.priority === '--' ? 'P9' : a.priority;
        var bPrio = b.priority === '--' ? 'P9' : b.priority;
        if (aPrio !== bPrio) {
          console.log('    prio:', aPrio.localeCompare(bPrio));
          return aPrio.localeCompare(bPrio);
        }

        console.log('    id:', a.id - b.id);
        return a.id - b.id;
      };
    }

    return (a, b) => {
      var aStatus = a.qx_status;
      var bStatus = b.qx_status;

      if (!aStatus) {
        if (!bStatus) {
          return a.id - b.id;
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

      return a.id - b.id;
    };

  };
  var currentSort = getSortFromURL();

  var filterFunc = (d) => {
    return currentProduct ? d.product.split(' ').join('-') == currentProduct : true;
  };

  var getColour = (status) => {
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

  var getClass = (status) => {
    switch (status) {
    case 'not_ready':
      return '';
    case 'submitted':
      return 'success';
    case 'assigned':
    case 'fixed':
      return 'info';
    default:
      return 'danger';
    }
  };

  var highlightLinks = () => {
    var links = $('.nav a');
    var current = window.location.hash;
    links.parent().removeClass('active');
    links.each(() => {
      var hash = $(this).attr('href');
      if(hash == current) $(this).parent().addClass('active');
    });
  };

  var getAssignee = (bug) => {
    if (bug.assigned_to) {
      return bug.assigned_to;
    }
    return 'nobody';
  };

  var getMentor = (bug) => {
    if (bug.mentors && bug.mentors.length) {
      return bug.mentors.join(', ');
    }
    return false;
  };

  var getLink = (bug) => {
    if (bug.link && bug.link !== 'no') {
      return 'has link';
    }
    return false;
  };

  var getSpec = (bug) => {
    if (bug.spec && bug.spec !== 'no') {
      return 'has spec';
    }
    return false;
  };

  var getPriority = (bug) => {
    if (bug.priority && bug.priority !== '--') {
      return bug.priority;
    }
    return '';
  };

  var summarize = (bugs) => {
    var summary = [
      {name: ['unknown'], bugs: []},
      {name: ['not_ready'], bugs: []},
      {name: ['submitted'], bugs: []},
      {name: ['assigned', 'fixed'], bugs: []}
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
  };

  var draw = (bugs) => {

    d3.select('.loading').remove();
    d3.select('.bugs').selectAll('.bug').remove();

    var bugRow = d3.select('.bugs').selectAll('.bug')
      .data(bugs.filter(filterFunc).sort(currentSort));

    bugRow.enter().append('tr').attr('class', bug => getClass(bug.qx_status))
      .classed('bug', true)
      .classed('fixed', bug => bug.qx_status === 'fixed')
      .style({'opacity': '0'})
      .attr('title', bug => bug.qx_status);

    //product
    bugRow.append('td').classed('product', true).text(bug => bug.product);

    //icons
    //mentor
    var icons = bugRow.append('td').classed('icons', true);

    icons.append('span').classed('icon glyphicon glyphicon-user', true)
      .classed('missing', bug => !getMentor(bug))
      .attr('title', bug => getMentor(bug) || 'nobody');
    //link
    icons.append('span').classed('icon glyphicon glyphicon-search', true)
      .classed('missing', bug => !getLink(bug))
      .attr('title', bug => getLink(bug) || 'missing link');

    //spec
    icons.append('span').classed('icon glyphicon glyphicon-picture', true)
      .classed('missing', bug => !getSpec(bug))
      .attr('title', bug => getSpec(bug) || 'missing spec');

    bugRow.append('td').append('a').text(bug => bug.id).classed('bugid', true)
      .attr('href', bug => 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id);

    bugRow.append('td').append('span')
      .text(bug => getPriority(bug)).classed('priority', true);

    var summary = bugRow.append('td');
    summary.append('span').classed('assignee', true)
      .text(bug => getAssignee(bug));
    summary.append('span').classed('summary', true)
      .text(bug => bug.summary);

    bugRow.append('td').append('a').classed('twitter', true)
      .attr('href', bug => bug.twitter)
      .classed('missing', bug => !bug.twitter);

    bugRow.transition().duration(TRANSITION_DURATION)
      .delay((d, i) => i*20)
      .style({'opacity': '1'});

    bugRow.exit()
      .transition().duration(TRANSITION_DURATION)
      .style({'height': '0px', 'opacity': '0'})
      .remove();

    d3.select('.summaries').selectAll('.category').remove();
    var category = d3.select('.summaries').selectAll('.category')
      .data(summarize(bugs.filter(filterFunc)));

    category.enter().append('div').classed('category', true)
      .style({
        'flex': category => category.bugs.length,
        'background-color': category => getColour(category.name[0])
      });
    category.append('span').classed('names', true)
      .selectAll('.name').data(category => category.name)
      .enter().append('span').classed('name', true)
      .text(name => name).classed('fixed', name => name === 'fixed');
    category.append('span').text(category => ': ' + category.bugs.length);
    category.append('span').text(category => ' (' + percent(category.percentage) + ')');

    var priority = $('#priority');
    priority.attr('href', '#' + getProductFromURL() + (isURLSorted() ? '' : '<'));
  };

  $.when(d3.jsonPromise(BUGZILLA_URL), d3.htmlPromise(START_MOZILLA_URL))
    .then((bug_list, startmozilla) => {
      bug_list = bug_list.bugs;
      bug_list.forEach((bug) => {
        var product = bug.product.split(' ').join('-');
        if (products.indexOf(product) == -1) products.push(product);
      });

      var list = $('ul.nav');
      var li = $('<li/>').appendTo(list);
      $('<a/>').attr('href', '#').text('All').appendTo(li);
      $.each(products, (i, product) => {
        var li = $('<li/>').appendTo(list);
        $('<a/>').attr('href', '#' + product).text(product.split('-').join(' ')).appendTo(li);
      });

      var posts = [];

      if(startmozilla) {
        var lines = startmozilla.textContent.split('\n');
        lines = lines.forEach(line => {
          if (line.startsWith('bug ')) {
            line = line.split(' - ');
            posts.push({id: line[0].slice(4), 'twitter': line[1]});
          } else if (line) {
            // console.log('Error processing "' + line + '".');
          }
        });
      }

      bug_list.forEach(bug => {
        var whiteboard = WHITEBOARD.exec(bug.whiteboard)[0].slice(4, -1).split(':');
        whiteboard.forEach(key => {
          if (key) {
            if (key !== 'link' && key !== 'spec') {
              console.log('!!!!!!!', bug.id, key);
            }
            bug[key] = true;
          }
        });

        if (bug.status === 'RESOLVED' || bug.status === 'VERIFIED') {
          bug.qx_status = 'fixed';
        } else if (getAssignee(bug) !== 'nobody@mozilla.org') {
          bug.qx_status = 'assigned';
        } else if (getMentor(bug) && bug.link && bug.spec) {
          bug.qx_status = 'submitted';
        } else {
          bug.qx_status = 'not_ready';
        }
      });

      $.each(bug_list, (i, bug) => {
        $.extend(bug, posts.find(test => +test.id === +bug.id));
      });
      draw(bug_list);
      highlightLinks();
      window.onhashchange = () => {
        currentProduct = getProductFromURL();
        currentSort = getSortFromURL();
        draw(bug_list);
        highlightLinks();
      };
    }).fail((error) => {
      console.log('Fail', error);
    });
})();
