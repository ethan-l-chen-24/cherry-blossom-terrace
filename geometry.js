import * as THREE from 'three';

export function addGeometry(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

export function addFloor(scene) {
    let geometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
    let material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    let ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = 0;

    // Add the ground to the scene
    scene.add(ground);
}

export function addProceduralTree(scene) {

    let branchRadius1 = 2;
    let branchRadius2 = 5;
    let branchLength = 40;

    let baseGeo = new THREE.CylinderGeometry(branchRadius1, branchRadius2, branchLength);
    let baseMaterial = new THREE.MeshBasicMaterial({ color: 0x964B00 });

    const base = new THREE.Mesh(baseGeo, baseMaterial);
    base.position.set(0, branchLength / 2, 0);

    // create branches
    generateBranches(base, 6, branchRadius1 / 2, branchRadius2 / 2, branchLength / 2)

    scene.add(base);
}

function generateBranches(parent, depth, branchRadius1, branchRadius2, branchLength) {
    if(depth == 0) {
        return;
    }

    let branchGeo = new THREE.CylinderGeometry(branchRadius1, branchRadius2, branchLength);
    let branchMaterial = new THREE.MeshBasicMaterial({ color: 0x964B00 });

    const branch1 = new THREE.Mesh(branchGeo, branchMaterial);
    const startPoint = new THREE.Vector3(0, (Math.random() - 0.3) * branchLength / 3, 0);
    const endPoint = new THREE.Vector3(0, 1000, 1000);
    branch1.position.copy(startPoint);
    branch1.lookAt(endPoint);
    branch1.translateY(branchLength / 2)

    const branch2 = new THREE.Mesh(branchGeo, branchMaterial);
    const startPoint2 = new THREE.Vector3(0, (Math.random() - 0.3) * branchLength / 3, 0);
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

    parent.add(branch1);
    parent.add(branch2);
    parent.add(branch3);

    generateBranches(branch1, depth - 1, branchRadius1 / 2.5, branchRadius2 / 2.5, branchLength / 1.7);
    generateBranches(branch2, depth - 1, branchRadius1 / 2.5, branchRadius2 / 2.5, branchLength / 1.7);
    generateBranches(branch3, depth - 1, branchRadius1 / 2.5, branchRadius2 / 2.5, branchLength / 1.7);
}

function rotateAboutPoint(model, point, rotation) {
    // Step 1: Translate the model so that the point becomes the origin
    const translation = new THREE.Matrix4().makeTranslation(-point.x, -point.y, -point.z);
    model.applyMatrix4(translation);

    // Step 2: Apply the desired rotation
    model.rotation.x += rotation.x;
    model.rotation.y += rotation.y;
    model.rotation.z += rotation.z;

    // Step 3: Translate the model back to its original position
    const inverseTranslation = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
    model.applyMatrix4(inverseTranslation);
}