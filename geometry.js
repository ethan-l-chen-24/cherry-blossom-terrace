import * as THREE from 'three';

export function addGeometry(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

export function addFloor(scene) {
    let geometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
    let material = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide });
    let ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = 0;

    // Add the ground to the scene
    scene.add(ground);
}

export function addProceduralTree(scene) {

    let branchRadius1 = 0.3;
    let branchRadius2 = 0.7;
    let branchLength = 10;

    let baseGeo = new THREE.CylinderGeometry(branchRadius1, branchRadius2, branchLength);
    let baseMaterial = new THREE.MeshLambertMaterial({ color: 0x36261b });

    const base = new THREE.Mesh(baseGeo, baseMaterial);
    base.position.set(0, branchLength / 2, 0);

    // create branches down to 6 layers (3^6 lowest level branches)
    let lowestLevelBranches = [];
    generateBranches(base, 7, branchRadius1 / 2, branchRadius2 / 2, branchLength / 2, lowestLevelBranches)

    // draw the tree
    scene.add(base);

    return lowestLevelBranches;
}

// recursively generate branches given a parent
function generateBranches(parent, depth, branchRadius1, branchRadius2, branchLength, lowestLevelBranches) {
    if(depth == 0) {
        return;
    }

    let branchGeo = new THREE.CylinderGeometry(branchRadius1, branchRadius2, branchLength);
    let branchMaterial = new THREE.MeshLambertMaterial({ color: 0x36261b });

    // create 3 with random positioned starting location
    const branch1 = new THREE.Mesh(branchGeo, branchMaterial);
    const startPoint = new THREE.Vector3(0, (Math.random() - 0.1) * branchLength / 3, 0);
    const endPoint = new THREE.Vector3(0, 1000, 1000);
    branch1.position.copy(startPoint);
    branch1.lookAt(endPoint);
    branch1.translateY(branchLength / 2)

    const branch2 = new THREE.Mesh(branchGeo, branchMaterial);
    const startPoint2 = new THREE.Vector3(0, (Math.random() - 0.1) * branchLength / 3, 0);
    const endPoint2 = new THREE.Vector3(1000, 1000, 0);
    branch2.position.copy(startPoint2);
    branch2.lookAt(endPoint2);
    branch2.translateY(branchLength / 2)

    const branch3 = new THREE.Mesh(branchGeo, branchMaterial);
    const startPoint3 = new THREE.Vector3(0, (Math.random() - 0.3) * branchLength / 3, 0);
    const endPoint3 = new THREE.Vector3(1000, -1000, 1000);
    branch3.position.copy(startPoint3);
    branch3.lookAt(endPoint3);
    branch3.translateY(branchLength / 2)

    // add the branches to the parent
    parent.add(branch1);
    parent.add(branch2);
    parent.add(branch3);

    // generate child branches
    generateBranches(branch1, depth - 1, branchRadius1 / (2.3 + Math.random() * 0.3), branchRadius2 / (2.3 + Math.random() * 0.3), branchLength / (1.4 + Math.random() * 0.4), lowestLevelBranches);
    generateBranches(branch2, depth - 1, branchRadius1 / (2.3 + Math.random() * 0.3), branchRadius2 / (2.3 + Math.random() * 0.3), branchLength / (1.4 + Math.random() * 0.4), lowestLevelBranches);
    generateBranches(branch3, depth - 1, branchRadius1 / (2.3 + Math.random() * 0.3), branchRadius2 / (2.3 + Math.random() * 0.3), branchLength / (1.4 + Math.random() * 0.4), lowestLevelBranches);

    // accumulate the leaf branches in the array
    if(depth <= 3) {
        lowestLevelBranches.push(branch1);
        lowestLevelBranches.push(branch2);
        lowestLevelBranches.push(branch2);
    }
}