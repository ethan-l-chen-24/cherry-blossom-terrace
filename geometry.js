import * as THREE from 'three';

export function addGeometry(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

export function addFloor(scene) {
    var geometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    var ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = 0;

    // Add the ground to the scene
    scene.add(ground);
}