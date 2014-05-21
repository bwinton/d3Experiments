// Elements.

'use strict';

var elements = ['add-ons-button', 'alltabs-button', 'back-button', 'BMB_bookmarksPopup', 'BMB_bookmarksToolbarPopup', 'BMB_unsortedBookmarksPopup', 'bookmarks-menu-button', 'copy-button', 'cut-button', 'developer-button', 'downloads-button', 'edit-controls', 'email-link-button', 'feed-button', 'find-button', 'forward-button', 'fullscreen-button', 'history-panelmenu', 'home-button', 'menubar-items', 'nav-bar', 'new-tab-button', 'new-window-button', 'open-file-button', 'PanelUI-contents', 'PanelUI-menu-button', 'paste-button', 'personal-bookmarks', 'PersonalToolbar', 'PlacesChevron', 'PlacesToolbarItems', 'preferences-button', 'print-button', 'privatebrowsing-button', 'save-page-button', 'search-container', 'searchbar', 'social-share-button', 'sync-button', 'tabbrowser-tabs', 'TabsToolbar', 'tabview-button', 'toolbar-menubar', 'urlbar-container', 'urlbar-go-button', 'urlbar-reload-button', 'urlbar-stop-button', 'webrtc-status-button', 'zoom-controls', 'zoom-in-button', 'zoom-out-button', 'zoom-reset-button'];

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

locs