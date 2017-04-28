/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

$(function () {
  let display = $('.display');
  display.click(() => {
    // Slowly move the fog down.
    let fog = $('.fog').toggleClass('final');
    let buildingCount = 20;
    let delay = 15000/buildingCount;
    let width = display.width();
    let height = display.height() / buildingCount;
    if (fog.hasClass('final')) {
      // Add some buildings, rising up.
      for (let i = 0; i < buildingCount; i++) {
        let building = $(`<div class="building"></div>`);
        building.appendTo(display);
        building.css({'left': Math.random() * width});
        let top = i*height + Math.random()*height - height/2;
        building.delay(i*delay).animate({'top': top}, Math.random()*1000 + 1000);
      }
    } else {
      $('.building').remove();
    }
  })
});
