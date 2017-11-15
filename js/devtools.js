/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, unused:true, curly:true, browser:true, white:true,
moz:true, esnext:false, indent:2, maxerr:50, devel:true, node:true, boss:true,
globalstrict:true, nomen:false, newcap:false */

/*global $:false */

'use strict';

$(function () {
  THREE.SVGLoader = function ( manager ) {
  	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
  };

  THREE.SVGLoader.prototype = {
  	constructor: THREE.SVGLoader,
  	load: function ( url, onLoad, onProgress, onError ) {
  		var scope = this;
  		var parser = new DOMParser();
  		var loader = new THREE.FileLoader( scope.manager );
  		loader.load( url, function ( svgString ) {
  			var doc = parser.parseFromString( svgString, 'image/svg+xml' ); // application/xml
  			onLoad( doc.documentElement );
  		}, onProgress, onError );
  	}
  };

  let addNoise = (baseGeometry, geometry, noiseX, noiseY, noiseZ) => {
    var noiseX = noiseX || 0.2;
    var noiseY = noiseY || noiseX;
    var noiseZ = noiseZ || noiseY;
    for(var i = 0; i < geometry.vertices.length; i++){
      var v = geometry.vertices[i];
      const base = baseGeometry.vertices[i];
      v.x = (base.x + v.x) / 2 - noiseX / 2 + Math.random() * noiseX;
      v.y = (base.y + v.y) / 2 - noiseY / 2 + Math.random() * noiseY;
      v.z = (base.z + v.z) / 2 - noiseZ / 2 + Math.random() * noiseZ;
    }
    return geometry;
  }

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor( 0xeeeeee );

  document.getElementById('content').appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 40);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var scene = new THREE.Scene();

	var lights = [];
	lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

	lights[ 0 ].position.set( 0, 200, 0 );
	lights[ 1 ].position.set( 100, 200, 100 );
	lights[ 2 ].position.set( - 100, - 200, - 100 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
	scene.add( lights[ 2 ] );

  const baseGeometry = new THREE.SphereGeometry(16,27,31);
  let sphereGeometry = new THREE.SphereGeometry(16,27,31);

  let sphere = new THREE.Object3D();
  sphere.add(new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshPhongMaterial( {
			color: 0x156289,
			emissive: 0x072534,
			side: THREE.DoubleSide,
			flatShading: true
		} )
  ));

	sphere.add( new THREE.LineSegments(
		sphereGeometry,
		new THREE.LineBasicMaterial( {
			color: 0xffffff,
			transparent: true,
			opacity: 0.5
		} )
	) );

  addNoise(baseGeometry, sphereGeometry, 0.7);
  scene.add(sphere);

  let animate = () => {
  	requestAnimationFrame( animate );
    sphere.rotation.y -= 0.01;
  	renderer.render( scene, camera );
  }
  animate();
});
