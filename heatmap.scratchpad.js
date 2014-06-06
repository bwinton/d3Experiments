// Elements.

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

// Get the browser into the right mode.
gNavToolbox.addEventListener("customizationready", function UI_loaded() {
  document.getElementById('forward-button').disabled = false;
  
  setTimeout(function () {
    var locs = 'id,x,y,width,height\n';

    elements.forEach(i => {
      let element = document.getElementById(i);
      if (element) {
        let bounds = element.getBoundingClientRect();
        locs += i + ',' + bounds.x + ',' + bounds.y + ',' + bounds.width + ',' + bounds.height + '\n';
      } else {
        locs += i + ',-1,-1,0,0\n';
      }
    });
    console.log(locs);
  }, 1000);
  gNavToolbox.removeEventListener("customizationready", UI_loaded);
});

window.content.location = 'about:customizing';