/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global d3:false, $:false, _:false, Miso:false */

'use strict';

// var percent = d3.format('0.1%');
var scale = 2;
var xOffset = 114;
var yOffset = 70;

function draw(data) {
  data = _.filter(data, d => _.has(widgets, d));
  var chart = d3.select('.chart');

  var image = d3.select('.chart').append('image');
  image.attr({
    'x': 0, 'y': 0, 'width': 3012, 'height': 1984, 'xlink:href': 'Heatmap.png'
  });

  chart.selectAll('.tiles')
    .data(data)
    .enter()
    .append('rect')
      .attr({
        'class': 'bar',
        'fill':'rgba(255,0,0,0)',
        'x': function (d) {
          return widgets[d].x * scale + xOffset;
        },
        'y': function (d) {
          return widgets[d].y * scale + yOffset;
        },
        'width': function (d) {
          return widgets[d].width * scale;
        },
        'height': function (d) {
          return widgets[d].height * scale;
        }
      });
    chart.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr({
        'class': 'label',
        'x': function (d) {
          return widgets[d].x + widgets[d].width / 2;
        },
        'y': function (d) {
          return widgets[d].y + widgets[d].height / 2;
        },
        'dy': '0.5em',
        'width': function (d) {
          return widgets[d].width;
        },
        'height': function (d) {
          return widgets[d].height;
        }
      });
    update(data);
}

function update(data) {
  var chart = d3.select('.chart');
  chart.selectAll('.bar').data(data).transition()
    .style('fill', function () {
      return 'rgba(255,0,0,0.5)';
    }).duration(500);
  chart.selectAll('.label').data(data).transition()
    .text(function (d) {
      // return d;
      return '';
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

var ds = new Miso.Dataset({
  url: 'heatmap.csv',
  delimiter: ','
});

var widgets = {};
var allControls = [
  'add-ons-button',
  'alltabs-button',
  'back-button',
  'BMB_bookmarksPopup',
  'BMB_bookmarksToolbarPopup',
  'BMB_unsortedBookmarksPopup',
  'bookmarks-menu-button',
  'copy-button',
  'cut-button',
  'developer-button',
  'downloads-button',
  // 'edit-controls',
  'email-link-button',
  'feed-button',
  'find-button',
  // 'forward-button',
  'fullscreen-button',
  'history-panelmenu',
  'home-button',
  // 'menubar-items',
  'nav-bar',
  'new-tab-button',
  'new-window-button',
  'open-file-button',
  // 'PanelUI-contents',
  'PanelUI-menu-button',
  'paste-button',
  'personal-bookmarks',
  // 'PersonalToolbar',
  'PlacesChevron',
  'PlacesToolbarItems',
  'preferences-button',
  'print-button',
  'privatebrowsing-button',
  'save-page-button',
  'search-container',
  'searchbar',
  'social-share-button',
  'sync-button',
  // 'tabbrowser-tabs',
  // 'TabsToolbar',
  'tabview-button',
  'toolbar-menubar',
  'urlbar-container',
  'urlbar-go-button',
  'urlbar-reload-button',
  'urlbar-stop-button',
  'webrtc-status-button',
  'zoom-controls',
  'zoom-in-button',
  'zoom-out-button',
  'zoom-reset-button'
];
// var allControls = ['add-ons-button', 'alltabs-button', 'back-button', 'email-link-button'];
ds.fetch().then(function (data) {
  data.remove(d => {
    return d.width === 0;
  });
  data.each(d => {
    widgets[d.id] = d;
  });
  draw(allControls);
});
