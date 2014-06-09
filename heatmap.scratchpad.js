/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global gNavToolbox:false, console:false */

'use strict';

var elements = [
  'add-ons-button',
  'alltabs-button',
  'back-button',
  'BMB_bookmarksPopup',
  'BMB_bookmarksToolbarPopup',
  'BMB_unsortedBookmarksPopup',
  'bookmarks-bar-chevron',
  'bookmarks-bar-container',
  'bookmarks-bar-item',
  'bookmarks-bar-overflowed-item',
  'bookmarks-menu-button',
  'characterencoding-button',
  'copy-button',
  'cut-button',
  'developer-button',
  'downloads-button',
  'e10s-button',
  'edit-controls',
  'email-link-button',
  'feed-button',
  'find-button',
  'forward-button',
  'fullscreen-button',
  'history-panelmenu',
  'home-button',
  'menu-button-button',
  'menubar-items',
  'menubar-menu',
  'menubar-menuitem',
  'menubar-other',
  'nav-bar',
  'new-tab-button',
  'new-window-button',
  'open-file-button',
  'PanelUI-contents',
  'PanelUI-menu-button',
  'paste-button',
  'personal-bookmarks',
  'PersonalToolbar',
  'PlacesChevron',
  'PlacesToolbarItems',
  'preferences-button',
  'print-button',
  'privatebrowsing-button',
  'save-page-button',
  'search-container',
  'searchbar',
  'sidebar-button',
  'social-share-button',
  'sync-button',
  'tabbrowser-tabs',
  'tabsclose-button',
  'TabsToolbar',
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

var translations = {
  'menu-button-button': 'PanelUI-menu-button'
};

// Get the browser into the right mode.
gNavToolbox.addEventListener('customizationready', function UI_loaded() {
  document.getElementById('forward-button').disabled = false;
  
  setTimeout(function () {
    var locs = 'id,x,y,width,height\n';

    elements.forEach(i => {
      let element = document.getElementById(translations[i] || i);
      if (element) {
        let bounds = element.getBoundingClientRect();
        locs += i + ',' + bounds.x + ',' + bounds.y + ',' + bounds.width + ',' + bounds.height + '\n';
      } else {
        locs += i + ',-1,-1,0,0\n';
      }
    });
    console.log(locs);
  }, 1000);
  gNavToolbox.removeEventListener('customizationready', UI_loaded);
});

window.content.location = 'about:customizing';