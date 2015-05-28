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
      'include_fields=id,product,assigned_to,summary,last_change_time,whiteboard,status,mentors,resolution&' +
      'status=ALL&' +
      'whiteboard=\[qx\]';
  var START_MOZILLA_URL = 'https://dl.dropboxusercontent.com/u/2301433/Twitter/startmozilla.tweets.txt';

  var TEST_DATA = '/data/sample_bugzilla.json'

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

  var products = [];

  var getProductFromURL = function() {
    var hash = window.location.hash;

    if(hash) {
      return hash.replace('#', '');
    } else {
      return false;
    }
  }
  var currentProduct = getProductFromURL();

  var filterFunc = function(d, i) {
    return currentProduct ? d.product.split(' ').join('-') == currentProduct : true;
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

  var getClass = function (status) {
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

  var highlightLinks = function() {
    var links = $('.nav a');
    var current = window.location.hash;
    links.parent().removeClass('active');
    links.each(function(){
      var hash = $(this).attr('href');
      if(hash == current) $(this).parent().addClass('active');
    })
  }

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
      {name: ['unknown'], bugs: []},
      {name: ['not_ready'], bugs: []},
      {name: ['submitted'], bugs: []},
      {name: ['assigned', 'fixed'], bugs: []},
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

    d3.select('.loading').remove();
    d3.select('.bugs').selectAll('.bug').remove();

    var bugRow = d3.select('.bugs').selectAll('.bug')
      .data(bugs.filter(filterFunc).sort(sortFunc));

    bugRow.enter().append('tr').attr('class', bug => getClass(bug.qx_status))
      .classed('bug', true)
      .classed('fixed', bug => bug.qx_status === 'fixed')
      .style({'opacity': '0'})
      .attr('title', bug => bug.qx_status);

    //product
    bugRow.append('td').classed('product', true).text(bug => bug.product)

    //icons
    //mentor
    var icons = bugRow.append('td').classed('icons', true);

    icons.append('span').classed('icon glyphicon glyphicon-user', true)
      .classed('missing', bug => !getMentor(bug))
      .attr('title', bug => getMentor(bug) || 'nobody');
    //dxr
    icons.append('span').classed('icon glyphicon glyphicon-search', true)
      .classed('missing', bug => !getDxr(bug))
      .attr('title', bug => getDxr(bug) || 'missing link');

    //spec
    icons.append('span').classed('icon glyphicon glyphicon-picture', true)
      .classed('missing', bug => !getSpec(bug))
      .attr('title', bug => getSpec(bug) || 'missing spec');

    bugRow.append('td').append('a').text(bug => bug.id).classed('bugid', true)
      .attr('href', bug => 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id);

    var summary = bugRow.append('td')
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
    category.selectAll('.name').data(category => category.name)
      .enter().append('span').classed('name', true)
      .text(name => name).classed('fixed', name => name === 'fixed');
    category.append('span').text(category => ': ' + category.bugs.length);
    category.append('span').text(category => ' (' + percent(category.percentage) + ')');
  };

  $.when(d3.jsonPromise(BUGZILLA_URL)
           , d3.csvPromise('data/qx.csv')
           , d3.htmlPromise(START_MOZILLA_URL)
           )
    .then(function (bug_list, bug_statuses, startmozilla) {
      var bug_list = bug_list.bugs;
      bug_list.forEach(function(bug){
        var product = bug.product.split(' ').join('-');
        if (products.indexOf(product) == -1) products.push(product);
      });

      var list = $('.nav');
      var li = $('<li/>').appendTo(list);
      $('<a/>').attr('href', '#').text("All").appendTo(li);
      $.each(products, function(i, product){
        var li = $('<li/>').appendTo(list);
        $('<a/>').attr('href', '#' + product).text(product.split('-').join(' ')).appendTo(li);
      })

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
        if (bug.status === 'RESOLVED' || bug.status === 'VERIFIED') {
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
      highlightLinks();
      window.onhashchange = function(){
        currentProduct = getProductFromURL();
        draw(bug_list);
        highlightLinks();
      }
    }).fail(function (error) {
      console.log('Fail', error);
    });
})();
