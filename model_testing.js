import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // allows camera to orbit around a target

// setup the THREE.js renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio); // making sure scene renders correctly on diff devices

// shadows
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // high quality shadows at cost of performance

document.body.appendChild(renderer.domElement); // add renderer to HTML document

const scene = new THREE.Scene();

// setting up camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    1, 1000);
camera.position.set(4, 20, 11); // camera set far enough away to see model (it defaults to origin otherwise)
// camera.lookAt(0, 0, 0); // to set camera to look at origin, can comment out when we use OrbitControls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth rotation
controls.enablePan = false; // object will always stay centered in view
controls.minDistance = 5; // min zoom distance
controls.maxDistance = 20; // max zoom distance
controls.minPolarAngle = 0.5; // how low user can tilt the camera
controls.maxPolarAngle = 1.5; // how high user can tilt the camera
controls.autoRotate = false; // can't autorotate
controls.target = new THREE.Vector3(0, 1, 0); // set target location of camera
controls.update(); // applies all changes we made to the OrbitControls object

// need to add a plane to scene
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2); // rotate plane by 90 degrees so flat on ground
// create new material to apply to geometry (gray color, and renders both sides of plane since default only renders 1)
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false; // no need to cast shadows if ground
groundMesh.receiveShadow = true; // can receive shadows

scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff, 300, 250, 0.2, 0.5); // white light, intensity, distance it shines, how spotlight attenuates near edges
spotLight.position.set(0, 25, 0); // y position of 25, directly overhead model
spotLight.castShadow = true; // set so light will actually cast shadow
spotLight.shadow.bias = -0.0001; // if artifacting occurs, adjust as needed

scene.add(spotLight);


const loader = new GLTFLoader().setPath('assets/models/our_moon/');
// callback function that is called when model is finished loading
loader.load('scene.gltf', (gltf) => {
    const mesh = gltf.scene;
    // all meshes associated w/ the model can cast shadows & receive shadows (recursively thru traverse function)
    mesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })

    mesh.position.set(0, 1, -1);
    scene.add(mesh);
})

function animate(){
    requestAnimationFrame(animate);
    controls.update(); // remember to update controls
    renderer.render(scene, camera); // render scene w/ camera we created
}

// have to call animate to render loop
animate();