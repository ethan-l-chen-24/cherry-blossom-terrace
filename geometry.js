import * as THREE from 'three';

export function addGeometry(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}