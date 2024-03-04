// Add petals to the tree and have them fly off, and generally make the scene look nicer

import * as THREE from 'three';
import { addFloor, addProceduralTree } from './tasks5-6_geometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ParticleSystem {
    constructor(scene, particle) {
        this._material = new THREE.MeshLambertMaterial({ color: 0xff4444});
        this._scene = scene;

        // initialize some random particles
        this._particles = [];
       /* for(var i = 0; i < 3000; i++) {
            var p = particle.clone();
            p.position.set((Math.random() - 0.5) * 20 - 150, 0, (Math.random() - 0.5) * 10);
            p.rotation.set((Math.random() - 0.5) * 2 * Math.PI, (Math.random() - 0.5) * 2 * Math.PI, (Math.random() - 0.5) * 2 * Math.PI);
            var mass = Math.random() * 0.5 + 0.25;
            this._particles.push({
                particle: p,
                position: p.position,
                rotation: p.rotation,
                velocity: new THREE.Vector3(0.0, 0.0, 0.0),
                area: mass,
                mass: mass,
                angularVelocity: new THREE.Vector3(0.0, 0.0, 0.0),
                grounded: false,
                attached: false
            }); 
            scene.add(p);
        } */

        // force values/constants
        this._gravity = new THREE.Vector3(0, -9.8 * 0.0000001, 0);
        this._windVector = new THREE.Vector3(1.0, 0, 0);
        this._windMag = 0;
        this._dragCo = 0.1;

        // time to update wind
        this._time = 0;
    }

    _CreateParticle(p) {
        this._scene.add(p)

        let mass = p.scale.x * p.scale.y * p.scale.z / 3;

        this._particles.push({
            particle: p,
            position: p.position.clone(),
            rotation: p.rotation.clone(),
            velocity: new THREE.Vector3(0.0, 0.0, 0.0),
            area: mass,
            mass: mass,
            angularVelocity: new THREE.Vector3(0.0, 0.0, 0.0),
            grounded: false,
            attached: true
        }); 
    }

    _UpdateParticles(timeElapsed) {
        for(var i = 0; i < this._particles.length; i++) {
            let p = this._particles[i];

            // calculate force field
            let forces = this.calculateForces(p.mass, p.velocity, p.area);

            // update to next state
            let newPosition = new THREE.Vector3(
                p.position.x + (p.velocity.x * timeElapsed),
                p.position.y + (p.velocity.y * timeElapsed),
                p.position.z + (p.velocity.z * timeElapsed),
            )

            let newRotation = new THREE.Vector3(
                p.rotation.x + (p.angularVelocity.x * timeElapsed),
                p.rotation.y + (p.angularVelocity.y * timeElapsed),
                p.rotation.z + (p.angularVelocity.z * timeElapsed),
            )

            let newVelocity = new THREE.Vector3(
                p.velocity.x + (forces.x / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300,
                p.velocity.y + (forces.y / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300,
                p.velocity.z + (forces.z / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300
            )

            let newAngularVelocity = new THREE.Vector3(
                p.angularVelocity.x + (Math.random() - 0.5) * 0.0002,
                p.angularVelocity.y + (Math.random() - 0.5) * 0.0002,
                p.angularVelocity.z + (Math.random() - 0.5) * 0.0002,
            )

            // check if on the ground
            if(p.grounded) {
                newPosition = new THREE.Vector3(p.position.x, 0, p.position.z);
                newRotation = p.rotation.clone();
                newVelocity = new THREE.Vector3(0, 0, 0);
                newAngularVelocity = new THREE.Vector3(0, 0, 0);

                // apply an upward gust if strong enough wind, disconnecting from ground
                let windMassRatio = this._windMag / p.mass;
                if(windMassRatio > 0.00001) {
                    newPosition = new THREE.Vector3(p.position.x, 0.1, p.position.z);
                    newVelocity = new THREE.Vector3(0, windMassRatio * 100, 0);
                    newAngularVelocity = new THREE.Vector3((Math.random() - 0.5) * windMassRatio * 100, (Math.random() - 0.5) * windMassRatio * 100, (Math.random() - 0.5) * windMassRatio * 100);
                }

            } 

            // criteria for grounding a particle
            if(newPosition.y <= 0) {
                this._particles[i].grounded = true;
            } else {
                this._particles[i].grounded = false;
            }

            // check if it is attached to the tree, in which case don't move
            if(p.attached) {
                newPosition = new THREE.Vector3(p.position.x, p.position.y, p.position.z);
                newRotation = p.rotation.clone();
                newVelocity = new THREE.Vector3(0, 0, 0);
                newAngularVelocity = new THREE.Vector3(0, 0, 0);

                let windMassRatio = Math.random() * this._windMag / p.mass / 2;
                if(windMassRatio > 0.00001) {
                    this._particles[i].attached = false;
                }
            }

            this._particles[i].position = newPosition;
            this._particles[i].rotation = newRotation;
            this._particles[i].velocity = newVelocity;
            this._particles[i].angularVelocity = newAngularVelocity;
            p.particle.position.set(newPosition.x, newPosition.y, newPosition.z);
            p.particle.rotation.set(newRotation.x, newRotation.y, newRotation.z);
        }

        // change wind field
        this._time += 0.01;
        this.updateWind();
    }

    calculateForces(mass, velocity, area) {
        let gravityForce = new THREE.Vector3(
            this._gravity.x * mass,
            this._gravity.y * mass,
            this._gravity.z * mass
        )

        let windForce = new THREE.Vector3(
            this._windVector.x * this._windMag,
            this._windVector.y * this._windMag,
            this._windVector.z * this._windMag
        )

        let mag = velocity.length();

        let dragForce = new THREE.Vector3(
            -velocity.x * mag * 1/2 * this._dragCo * area,
            -velocity.y * mag * 1/2 * this._dragCo * area,
            -velocity.z * mag * 1/2 * this._dragCo * area,
        )

        // get the net forces
        let netForces = new THREE.Vector3(
            gravityForce.x + windForce.x + dragForce.x,
            gravityForce.y + windForce.y + dragForce.y,
            gravityForce.z + windForce.z + dragForce.z
        )

        return netForces;
    }

    updateWind() {
        this._windMag = 0.000005 * Math.log((this._time + 3) / 2) * Math.sin(this._time + 3) + 0.000005;

        this._windVector = new THREE.Vector3(
            Math.cos(this._time / 4),
            0,
            Math.sin(this._time / 4)
        )
    }
}

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
    meshes["Petal"].traverse(function (child) {
        if(child.isMesh) {
            child.material = new THREE.MeshLambertMaterial({color: 0xffd7e2});
        }
    })

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
    camera.position.z = 30;
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
    var dirLight = new THREE.DirectionalLight(0x404040, 80);
    dirLight.position.set(0, 20, 40);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 20);
    scene.add(ambientLight);

    scene.background = new THREE.Color(0x87ceeb);

    // create particle system
    var particles = new ParticleSystem(scene, meshes["Petal"]);

    addFloor(scene);
    let twigs = addProceduralTree(scene);

    for(let i = 0; i < twigs.length; i++) {
        var twig = twigs[i];
        let petal = meshes["Petal"].clone();

        /*
        let parent = twig;
        while (parent !== null) {
            localPosition.applyMatrix4(parent.matrix);
            parent = parent.parent;
        } */

        let worldPosition = new THREE.Vector3();
        twig.getWorldPosition(worldPosition);

        let worldQuaternion = new THREE.Quaternion();
        twig.getWorldQuaternion(worldQuaternion);

        petal.position.copy(worldPosition);
        petal.rotation.setFromQuaternion(worldQuaternion)

        petal.scale.set((Math.random() * 0.5) + 1, (Math.random() * 0.5) + 1, (Math.random() * 0.5) + 1)

        particles._CreateParticle(petal)
    }
    
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