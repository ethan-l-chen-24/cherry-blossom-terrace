import * as THREE from 'three';

export class ParticleSystem {
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

export function addGeometry(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}