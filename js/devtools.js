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
  let spinfox = window.location.search.replace('?','') == 'spinfox';
  console.log(spinfox);
  let addNoise = (baseGeometry, geometry, noiseX, noiseY, noiseZ) => {
    noiseX = noiseX || 0.2;
    noiseY = noiseY || noiseX;
    noiseZ = noiseZ || noiseY;
    for (let i = 0; i < geometry.vertices.length; i++) {
      let v = geometry.vertices[i];
      const base = baseGeometry.vertices[i];
      v.x = (base.x + v.x) / 2 - noiseX / 2 + Math.random() * noiseX;
      v.y = (base.y + v.y) / 2 - noiseY / 2 + Math.random() * noiseY;
      v.z = (base.z + v.z) / 2 - noiseZ / 2 + Math.random() * noiseZ;
    }
    return geometry;
  }

  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor( 0xeeeeee );

  document.getElementById('content').appendChild(renderer.domElement);

  let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 40);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  let scene = new THREE.Scene();

  let fox = null;
  let img = document.getElementById('fox');
  img.style.display = 'none';

  if (spinfox) {
    img.onload = () => {
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      let geometry = new THREE.PlaneGeometry(30, 30);
      let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      material.map.minFilter = THREE.LinearFilter;
      material.map.needsUpdate = true;
      fox = new THREE.Mesh(geometry, material);
      fox.translateZ(16.5);
      scene.add(fox);
    };
  } else {
    img.style.display = 'inline-block';
  }
  img.setAttribute('src', 'images/devedition.svg');

	let lights = [];
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
    if (fox) {
      fox.rotation.z -= 0.02;
    }
  	renderer.render( scene, camera );
  }
  animate();
});
