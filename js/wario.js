/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global d3:false */

'use strict';

let totalStats = {
  coins: 0,
  gains: 0,
  successes: 0,
  failures: 0,
  passes: 0
};
window.totalStats = totalStats;

function stats(coins, rest) {
  let startingCoins = coins;
  let [successes, failures, passes] = [0,0,0];
  rest.forEach(i => {
    if (i === 'xx') {
      passes++;
      return;
    }
    if (i[0] === i[1]) {
      successes++;
      coins *= 2;
    } else {
      failures++;
      coins = Math.floor(coins / 2);
    }
  });
  let gains = coins - startingCoins;
  totalStats.coins += coins;
  totalStats.gains += gains;
  totalStats.successes += successes;
  totalStats.failures += failures;
  totalStats.passes += passes;
  return `=> ${coins}¢ (${gains}¢, s:${successes}, f:${failures}, p:${passes})`;
}

function formatLine(d) {
  let [part, coins, ...rest] = d;
  let rv = `Part ${part}: ${coins}¢ `;
  if (rest[0] === '♡') {
    totalStats.coins -= rest[1];
    rv += `paid ${-rest[1]}¢ for hearts…`;
  } else {
    rv += stats(coins, rest);
  }
  return rv;
}

function draw(data) {
  window.data = data;
  var chart = d3.select('#chart');

  chart.selectAll('.line').data(data).enter()
    .append('div').attr('class', 'line')
    .classed('heart', d => d[2] === '♡')
    .text(d => formatLine(d));

  chart.append('div').attr('class', 'line total')
    .text(`Final Total: ${totalStats.coins}¢ (${totalStats.gains}¢, s:${totalStats.successes}, f:${totalStats.failures}, p:${totalStats.passes})`);
}

d3.jsonPromise('data/wario_jon.json').then(function (data) {
  data = data.filter(i => typeof(i) !== 'string');
  draw(data);
}).fail(function (error) {
  console.log('Fail', error); // eslint-disable-line no-console
});
