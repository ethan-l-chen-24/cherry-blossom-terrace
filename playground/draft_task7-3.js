// Add petals to the tree and have them fly off, and generally make the scene look nicer

import * as THREE from 'three';
import { addFloor, addProceduralTree } from './geometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// used for water shader
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';


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
        this._dampCo = 0.01;
        this._springCo = 0.00005; 

        // time to update wind
        this._time = 0;
    }

    _CreateParticle(p) {
        this._scene.add(p)

        let mass = p.scale.x * p.scale.y * p.scale.z / 3;

        this._particles.push({
            particle: p,
            originalPosition: p.position.clone(),
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
            let forces = this.calculateForces(p);

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
                // calculate force field
                let forces = this.calculateSMD(p);

                // update to next state
                newPosition = new THREE.Vector3(
                    p.position.x + (p.velocity.x * timeElapsed),
                    p.position.y + (p.velocity.y * timeElapsed),
                    p.position.z + (p.velocity.z * timeElapsed),
                )

                newVelocity = new THREE.Vector3(
                    p.velocity.x + (forces.x / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300,
                    p.velocity.y + (forces.y / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300,
                    p.velocity.z + (forces.z / p.mass * timeElapsed) + (Math.random() - 0.5) * this._windMag * 300
                )

                newRotation = new THREE.Vector3(
                    p.rotation.x + (p.angularVelocity.x * timeElapsed),
                    p.rotation.y + (p.angularVelocity.y * timeElapsed),
                    p.rotation.z + (p.angularVelocity.z * timeElapsed),
                )

                newAngularVelocity = new THREE.Vector3(this._windMag.x, this._windMag.y, this._windMag.z);

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

    calculateForces(p) {
        let gravityForce = new THREE.Vector3(
            this._gravity.x * p.mass,
            this._gravity.y * p.mass,
            this._gravity.z * p.mass
        )

        let windForce = new THREE.Vector3(
            this._windVector.x * this._windMag,
            this._windVector.y * this._windMag,
            this._windVector.z * this._windMag
        )

        let mag = p.velocity.length();

        let dragForce = new THREE.Vector3(
            -p.velocity.x * mag * 1/2 * this._dragCo * p.area,
            -p.velocity.y * mag * 1/2 * this._dragCo * p.area,
            -p.velocity.z * mag * 1/2 * this._dragCo * p.area,
        )

        // get the net forces
        let netForces = new THREE.Vector3(
            gravityForce.x + windForce.x + dragForce.x,
            gravityForce.y + windForce.y + dragForce.y,
            gravityForce.z + windForce.z + dragForce.z
        )

        return netForces;
    }

    calculateSMD(p) {
        let windForce = new THREE.Vector3(
            this._windVector.x * this._windMag,
            this._windVector.y * this._windMag,
            this._windVector.z * this._windMag
        )

        let damperForce = new THREE.Vector3(
            - (p.velocity.x * this._dampCo),
            - (p.velocity.y * this._dampCo),
            - (p.velocity.z * this._dampCo)
        )

        let dx = new THREE.Vector3();
        dx.subVectors(p.position, p.originalPosition);

        let springForce = new THREE.Vector3(
            - (dx.x * this._springCo),
            - (dx.y * this._springCo),
            - (dx.z * this._springCo)
        )

        let netForces = new THREE.Vector3(
            springForce.x + windForce.x + damperForce.x,
            springForce.y + windForce.y + damperForce.y,
            springForce.z + windForce.z + damperForce.z,
        )
        
        return netForces;
    }

    updateWind() {
        this._windMag = 0.000005 * Math.log(this._time / 2) * Math.sin(this._time) + 0.000005;

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

    // adding rocks
    meshes["rock1"] = await loadGLB('assets/models/rock/scene.gltf');
    meshes["rock2"] = await loadGLB('assets/models/rock/scene.gltf');
    meshes["rock3"] = await loadGLB('assets/models/rock/scene.gltf');
    meshes["rock4"] = await loadGLB('assets/models/rock/scene.gltf');
    meshes["rock5"] = await loadGLB('assets/models/rock/scene.gltf');
    meshes["rock6"] = await loadGLB('assets/models/rock/scene.gltf');
    
    // all meshes associated w/ the model can cast shadows & receive shadows (recursively thru traverse function)
    // meshes["Rock"].traverse((child) => {
    //     if (child.isMesh) {
    //         child.castShadow = true;
    //         child.receiveShadow = true;
    //     }
    // })

    // adding lake
    meshes["lake"] = await loadGLB('assets/models/lake/scene.gltf');

    // adding Chinese gazebo
    meshes["gazebo"] = await loadGLB('assets/models/chinese_gazebo/scene.gltf');

    // adding Chinese gazebo
    meshes["pavilion"] = await loadGLB('assets/models/chinese_pavilion/scene.gltf');

    // adding torii arch
    meshes["torii"] = await loadGLB('assets/models/torii/scene.gltf');

    // adding mountain backgrounds
    meshes["mtn1"] = await loadGLB('assets/models/grassy_landscape_with_snow/scene.gltf'); // grassy_landscape_with_snow
    meshes["mtn2"] = await loadGLB('assets/models/grassy_landscape_with_snow/scene.gltf');
    meshes["mtn3"] = await loadGLB('assets/models/grassy_landscape_with_snow/scene.gltf');
    meshes["mtn4"] = await loadGLB('assets/models/grassy_landscape_with_snow/scene.gltf');
    meshes["mtn5"] = await loadGLB('assets/models/grassy_landscape_with_snow/scene.gltf');

    // adding mountain
    // meshes["mtn"] = await loadGLB('assets/models/mountain_and_river_scroll/scene.gltf');

    
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
    // controls.maxPolarAngle = 1.45 // preventing user from being able to rotate into ground
    controls.minDistance = 5; // min zoom distance
    // controls.maxDistance = 30; // max zoom distance


    // add light
    var dirLight = new THREE.DirectionalLight(0x404040, 20);
    dirLight.position.set(0, 100, -600);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 30);
    scene.add(ambientLight);

    scene.background = new THREE.Color(0x87ceeb);

    // create particle system
    var particles = new ParticleSystem(scene, meshes["Petal"]);

    // commenting out so no floor
    // addFloor(scene);
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
            const time = performance.now() * 0.001;

            // Update water material
            water.material.uniforms['time'].value += 1.0 / 60.0;
            
            raf();
        } );
        
   
        renderer.render( scene, camera );
        controls.update();
    }

    raf();

    // Create water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('assets/textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Create sky
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    // Set sky parameters
    const parameters = {
        turbidity: 10,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        exposure: renderer.toneMappingExposure
    };

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = parameters.turbidity;
    skyUniforms['rayleigh'].value = parameters.rayleigh;
    skyUniforms['mieCoefficient'].value = parameters.mieCoefficient;
    skyUniforms['mieDirectionalG'].value = parameters.mieDirectionalG;

    // Add sun and moon
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    const sun = new THREE.Vector3();
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    skyUniforms['sunPosition'].value.copy(sun);

    // Add the sky to the scene
    scene.add(sky);

    // Resize function
    function resizeCanvas() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resizeCanvas);

}

startScene();



    // // adding lake
    // meshes["lake"].scale.set(120, 50, 80);
    // meshes["lake"].position.set(-20, 1.2, 25);
    // scene.add(meshes["lake"]);

    // // adding Chinese gazebo
    // meshes["gazebo"].scale.set(2, 2, 2);
    // meshes["gazebo"].position.set(15, 5.3, -10);
    // scene.add(meshes["gazebo"]);

    // // adding Chinese pavilion
    // meshes["pavilion"].scale.set(1, 2, 1);
    // meshes["pavilion"].position.set(25, 1.3, 35);
    // scene.add(meshes["pavilion"]);

    // // adding torii arch
    // meshes["torii"].scale.set(1.5, 1.5, 1.5);
    // meshes["torii"].position.set(-10, 1, 15);
    // meshes["torii"].rotation.y -= 0.5
    // scene.add(meshes["torii"]);

    // // adding mountains to background

    // meshes["mtn1"].scale.set(50, 100, 100);
    // meshes["mtn1"].position.set(300, -10, 10);
    // meshes["mtn1"].rotation.y -= 0.5
    // scene.add(meshes["mtn1"]);

    // meshes["mtn2"].scale.set(50, 100, 100);
    // meshes["mtn2"].position.set(-300, -20, 300);
    // meshes["mtn2"].rotation.y -= 0.5
    // scene.add(meshes["mtn2"]);

    // meshes["mtn3"].scale.set(100, 100, 100);
    // meshes["mtn3"].position.set(-300, -20, 300);
    // meshes["mtn3"].rotation.y -= 0.5
    // scene.add(meshes["mtn3"]);

    // meshes["mtn4"].scale.set(100, 200, 100);
    // meshes["mtn4"].position.set(300, -50, -100);
    // meshes["mtn4"].rotation.y -= 0.5
    // scene.add(meshes["mtn4"]);

    // meshes["mtn5"].scale.set(100, 700, 100);
    // meshes["mtn5"].position.set(-300, -50, -100);
    // // meshes["mtn4"].rotation.y -= 0.5
    // // scene.add(meshes["mtn5"]);

    // // meshes["mtn1"].scale.set(50, 100, 100);
    // // meshes["mtn1"].position.set(300, -10, 10);
    // // meshes["mtn1"].rotation.y -= 0.5
    // // scene.add(meshes["mtn1"]);

    // // meshes["mtn1"].scale.set(50, 100, 100);
    // // meshes["mtn1"].position.set(300, -10, 10);
    // // meshes["mtn1"].rotation.y -= 0.5
    // // scene.add(meshes["mtn1"]);


    // // // adding mountain
    // // meshes["mtn"].scale.set(120, 50, 80);
    // // meshes["mtn"].position.set(-20, 1.2, 25);
    // // scene.add(meshes["mtn"]);


    // // adding rocks

    // meshes["rock1"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock1"].position.set(3, 0.5, -1);
    // meshes["rock1"].rotation.x += 0.4
    // meshes["rock1"].rotation.z += 0.4
    // scene.add(meshes["rock1"]);

    // meshes["rock2"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock2"].position.set(3, 0.2, 2.5);
    // meshes["rock2"].rotation.y += 0.3
    // scene.add(meshes["rock2"]);

    // meshes["rock3"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock3"].position.set(0, 0.7, 4);
    // meshes["rock3"].rotation.x -= 1
    // scene.add(meshes["rock3"]);

    // meshes["rock4"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock4"].position.set(-3, 0.5, 2);
    // meshes["rock4"].rotation.z -= 0.2
    // scene.add(meshes["rock4"]);

    // meshes["rock5"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock5"].position.set(-3, 0.5, -1);
    // meshes["rock5"].rotation.x -= 1
    // meshes["rock5"].rotation.y -= 0.2
    // scene.add(meshes["rock5"]);

    // meshes["rock6"].scale.set(0.3, 0.3, 0.3);
    // meshes["rock6"].position.set(0, 0.5, -3);
    // meshes["rock6"].rotation.y -= 0.6
    // scene.add(meshes["rock6"]);
