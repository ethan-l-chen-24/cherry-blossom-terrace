// TASK 5 - Add Procedurally Generated Tree

import * as THREE from 'three';
import { addFloor, addProceduralTree } from './geometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

async function loadModels() {

    // function to load meshes
    function loadGLB(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                url,
                (gltf) => resolve(gltf.scene),
                undefined,
                (error) => reject(error)
            );
        })
    }

    const meshes = {};
    meshes["Petal"] = await loadGLB('assets/SakuraHanaBira/SakuraHanaBira.glb');

    return meshes;
}

async function startScene() {
    // load in models
    const meshes = await loadModels();

    // setup the THREE.js scene, camera
    const scene = new THREE.Scene();
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 100;
    camera.position.y = 5;

    // setup the THREE.js renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // add up orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // add light
    var light = new THREE.AmbientLight(0x404040, 1000);
    scene.add(light);

    addFloor(scene);
    addProceduralTree(scene);
    
    // automatic canvas resize based on user window
    function resizeCanvas(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resizeCanvas);

    // run the animation frame loop
    var previousRAF = null;
    function raf() {

        requestAnimationFrame( (t) => {
            if(previousRAF == null) {
                previousRAF = t;
            }
            
            previousRAF = t;
            
            raf();
        } );

        renderer.render( scene, camera );
        controls.update();
    }

    raf();
}

startScene();