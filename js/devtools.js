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
  let img = document.getElementById('fox');
  let canvas = document.getElementById('globe');
  let gl = canvas.getContext('webgl', {
    failIfMajorPerformanceCaveat: true
  });

  if (!gl && !spinfox) {
    img.setAttribute('src', 'images/devedition-original.svg');
    return;
  }

  let renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor( 0xeeeeee );

  document.getElementById('content').appendChild(renderer.domElement);

  let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 40);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  let scene = new THREE.Scene();

  let fox = null;
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
      fox.scale.set(0.8, 0.8, 0.8);
      fox.translateX(2);
      fox.translateY(2);
      fox.translateZ(18);
      scene.add(fox);
    };
  } else {
    img.style.display = 'inline-block';
  }
  img.setAttribute('src', 'images/devedition.svg');

	let lights = [];
	lights[ 0 ] = new THREE.PointLight( 0xffffff, .5, 0 );
	lights[ 1 ] = new THREE.PointLight( 0xffffff, .5, 0 );
	lights[ 2 ] = new THREE.PointLight( 0xffffff, .5, 0 );

	lights[ 0 ].position.set( 0, 200, 0 );
	lights[ 1 ].position.set( 100, 200, 100 );
	lights[ 2 ].position.set( - 100, - 200, - 100 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
	scene.add( lights[ 2 ] );

  let sphere = new THREE.Object3D();
  scene.add(sphere);

  var loader = new THREE.VRMLLoader();
  loader.load('images/devedition-globe-vrml/globe-hires.wrl', globe => {
    const MESH_SCALE = 0.0156;

    let globeGeometry = globe.children[0].children[0].geometry;
    globeGeometry.scale(MESH_SCALE, MESH_SCALE, MESH_SCALE);
    globeGeometry.translate(0, -18, 0);

    sphere.add(new THREE.Mesh(
      globeGeometry,
      new THREE.MeshPhongMaterial( {
        color: 0x2053cf,
        emissive: 0x000000,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1,
  			// flatShading: true
  		} )
    ));

    let edgesGeometry = new THREE.EdgesGeometry(globeGeometry);
    // edgesGeometry.scale(1.1, 1.1, 1.1);
  	sphere.add( new THREE.LineSegments(
  		edgesGeometry,
  		new THREE.LineBasicMaterial( {
  			color: 0x58c1ff,
  			transparent: true,
  			opacity: 0.3
  		} )
  	) );
  });

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
