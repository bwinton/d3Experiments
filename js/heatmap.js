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

var clickFormat = d3.format('0.2');
var scale = 2;
var xOffset = 114;
var yOffset = 70;

function draw(data) {
  // Choose the elements we want to draw.
  data = data.filter(row => {
    return (
      row.sys_info === 'Darwin' &&
      row.item === 'click' &&
      widgets[row.widget]);
  });

  // Set up the image.
  var chart = d3.select('.chart');
  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': 3012, 'height': 1984, 'xlink:href': 'Heatmap.png'
  });


  chart.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
      .attr({
        'class': 'bar',
        'fill': 'rgba(255,0,0,0)',
        'x': function (d) {
          return widgets[d.widget].x * scale + xOffset;
        },
        'y': function (d) {
          return widgets[d.widget].y * scale + yOffset;
        },
        'width': function (d) {
          return widgets[d.widget].width * scale;
        },
        'height': function (d) {
          return widgets[d.widget].height * scale;
        },
        'title': function (d) {
          return d.widget.replace('-button', '').replace('-', ' ') +
            ' - ' + clickFormat(d.instances_per_session) + ' clicks per session';
        }
      });
    update(data);
}

function update(data) {
  // Set up the scales.
  var maxClicks = d3.max(data, d => d.instances_per_session);
  var clickScale = d3.scale.log()
    .domain([1, maxClicks])
    .range(['rgba(255,0,0,0.1)', 'rgba(255,0,0,0.5)']);

  var chart = d3.select('.chart');
  chart.selectAll('.bar').data(data).transition()
    .style('fill', function (d) {
      return clickScale(d.instances_per_session);
    }).duration(500);
}


$(function () {
  $('#btn-default').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(allControls);
  });

  $('#btn-reversed').click(function () {
    $('.btn.order').removeClass('btn-primary');
    $(this).addClass('btn-primary');
    update(allControls);
  });
});


var widgets = {};
var allControls = [
  // buttons people clicked in post:
  'add-ons-button',
  'alltabs-button',
  'back-button',
  'bookmarks-menu-button',
  'characterencoding-button',
  'copy-button',
  'cut-button',
  'developer-button',
  'downloads-button',
  'email-link-button',
  'feed-button',
  'find-button',
  'forward-button',
  'fullscreen-button',
  'home-button',
  'menu-button-button',
  'new-tab-button',
  'new-window-button',
  'open-file-button',
  'paste-button',
  'preferences-button',
  'print-button',
  'privatebrowsing-button',
  'save-page-button',
  'social-share-button',
  'sync-button',
  'tabsclose-button',
  'tabview-button',
  'urlbar-go-button',
  'urlbar-reload-button',
  'urlbar-stop-button',
  'webrtc-status-button',
  'zoom-in-button',
  'zoom-out-button',
  'zoom-reset-button',

  // buttons no-one's clicked on.
  'e10s-button',
  'sidebar-button',

  // Other things people click on.
  // 'BMB_bookmarksPopup',
  // 'BMB_bookmarksToolbarPopup',
  // 'BMB_unsortedBookmarksPopup',
  // 'bookmarks-bar-chevron',
  // 'bookmarks-bar-container',
  // 'bookmarks-bar-item',
  // 'bookmarks-bar-overflowed-item',
  'history-panelmenu',
  // 'menubar-items',
  // 'menubar-menu',
  // 'menubar-menuitem',
  // 'menubar-other',
  'PanelUI-menu-button',
  'personal-bookmarks',
  // 'PlacesChevron',
  // 'PlacesToolbarItems',
  'searchbar',
  // 'tabbrowser-tabs',
  // 'toolbar-menubar',

  // Containers.
  // 'edit-controls',
  // 'nav-bar',
  // 'PanelUI-contents',
  // 'PersonalToolbar',
  // 'search-container',
  // 'TabsToolbar',
  // 'urlbar-container',
  // 'zoom-controls'

];

$.when(d3.csvPromise('heatmap.csv'), d3.csvPromise('heatmap_data.csv'))
  .then(function (widget_data, click_data) {
    $.each(widget_data, (i, d) => {
      if (d.width !== 0) {
        widgets[d.id] = d;
      }
    });
    var clicks = [];
    $.each(click_data, (i, row) => {
      var d = row;
      d.widget = d.subitem
        .replace('builtin-item-', '')
        .replace('-left', '');
      clicks.push(d);
    });
    draw(clicks);
  }).fail(function (error) {
    console.log('Fail', error);
  });
