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

var clickFormat = d3.format('0.3r');
function formatClicks(clicks, length) {
  if (length === 0) {
    return "No sessions.";
  }
  return clickFormat(clicks / length) + ' clicks per active session.'
}

function gatherClicks(d) {
  var rv = {
    'menu': d.menu,
    'item': d.item,
    'clicks': 0,
    'length': 0,
  };
  if (custom.withoutcustom) {
    rv.clicks += d.count;
    rv.length += d.length;
  }
  if (custom.withcustom) {
    rv.clicks += d.customcount;
    rv.length += d.customlength;
  }
  return rv;
}

function draw(clicks) {
  var data = [];
  for (var [key, menu] of clicks) {
    data.push({'title': key, 'items': menu.map(gatherClicks)});
  }

  var menu = d3.select('.menus').selectAll('.menu')
    .data(data);
  menu.enter().append('div').classed('menu col-sm-4', true)
    .append('h3')
    .text(function (d) {
      return d.title;
    });

  var item = menu.selectAll('.item')
    .data(d => d.items);
  item.enter().append('div').classed('item', true)
    .text(d => d.item + ' (' + d.clicks + ' clicks)')
    .attr('title', d => formatClicks(d.clicks, d.length))
    .style({
      'height': '18px',
      'opacity': '1',
      'background-color': 'rgba(255,0,0,0)'
    });

  update(clicks);
  console.log("Total sessions: " + total_sessions);
}

function update(clicks) {
  var data = [];
  for (var [key, menu] of clicks) {
    data.push({'title': key, 'items': menu.map(gatherClicks)});
  }

  var menu = d3.select('.menus').selectAll('.menu')
    .data(data);
  menu.enter().append('div').classed('menu col-sm-4', true)
    .append('h3')
    .text(function (d) {
      return d.title;
    });
  menu.exit().remove();

  var item = menu.selectAll('.item')
    .data(d => d.items);
  item.enter().append('div').classed('item', true)
    .style({'height': '0px', 'opacity': '0'})
    .transition().duration(TRANSITION_DURATION)
    .style({'height': '18px', 'opacity': '1'});

  item.text(d => d.item + ' (' + d.clicks + ')')
    .attr('title', d => formatClicks(d.clicks, d.length))
    .transition().duration(TRANSITION_DURATION)
    .style({'background-color': d => 'rgba(255,0,0,' +
      clickFormat(d.clicks / total_sessions) + ')'
  });

  item.exit()
    .transition().duration(TRANSITION_DURATION)
    .style({'height': '0px', 'opacity': '0'})
    .remove();
}


$(function () {
  $("#withcustom").add("#withoutcustom").click(function () {
    var id = $(this).attr('id');
    custom[id] = !custom[id];
    $(this).parent().toggleClass('active');
    update(clicks);
  });
});


var custom = {
  'withcustom' : true,
  'withoutcustom' : true,
};
var clicks = new Map();
var total_sessions = 0;

$.when(d3.csvPromise('data/context_menu.csv'))
  .then(function (click_data) {
    $.each(click_data, (i, row) => {
      row.count = +row.count;
      row.length = +row.length;
      row.customcount = +row.customcount;
      row.customlength = +row.customlength;
      if (row.menu === 'session') {
        total_sessions = row.count
        return;
      }
      if (!clicks.has(row.menu)) {
        clicks.set(row.menu, []);
      }
      clicks.get(row.menu).push(row);
    });
    draw(clicks);
  }).fail(function (error) {
    console.log('Fail', error);
  });
