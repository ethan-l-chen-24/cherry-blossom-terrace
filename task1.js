import * as THREE from 'three';
import { addGeometry } from './geometry.js';

// setup the THREE.js scene, camera
const scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 1.0;
const far = 1000.0;
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.z = 5;

// setup the THREE.js renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

addGeometry(scene);

// automatic canvas resize based on user window
function resizeCanvas(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resizeCanvas);

// run the animation frame loop
function raf() {
	renderer.render( scene, camera );
    requestAnimationFrame( raf );
}

raf();