// TASK 2 - Petal Particle Simulation Floating in Different Directions

import * as THREE from 'three';
import { addGeometry } from './geometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ParticleSystem {
    constructor(scene, particle) {
        this._material = new THREE.MeshStandardMaterial({ color: 0xff4444});
        this._scene = scene;

        this._particles = [];
        for(var i = 0; i < 10; i++) {
            var p = particle.clone();
            p.position.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
            p.rotation.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
            this._particles.push({
                particle: p,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001),
                angularVelocity: new THREE.Vector3((Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.001),
            }); 
            scene.add(p);
        }
    }

    _UpdateParticles(timeElapsed) {
        for(var p of this._particles) {
            p.particle.position.add(p.velocity.clone().multiplyScalar(timeElapsed));
            p.particle.rotation.x += (p.angularVelocity.x * timeElapsed);
            p.particle.rotation.y += (p.angularVelocity.y * timeElapsed);
            p.particle.rotation.z += (p.angularVelocity.z * timeElapsed);
        }
    }
}

async function loadModels() {

    // function to laod meshes
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
    camera.position.z = 5;

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

    // create particle system
    var particles = new ParticleSystem(scene, meshes["Petal"]);
    
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
            particles._UpdateParticles(t - previousRAF);
            
            previousRAF = t;
            
            raf();
        } );

        renderer.render( scene, camera );
        controls.update();
    }

    raf();
}

startScene();