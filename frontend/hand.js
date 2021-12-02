/* 2021-12-01 Antonio F. G. Sevilla <afgs@ucm.es>
 * Licensed under the Open Software License version 3.0
 *
 * 3D hand module for showing hand configuration and orientation.
 * Part of the VisSE project: https://www.ucm.es/visse
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const HAND_SCALE = 0.5;
const CAMERA_DISTANCE = 4;

let model = null;

export function init_scene(canvas) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 1, 1000);
    camera.position.z = CAMERA_DISTANCE;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-1, 1, 1);
    camera.add(directionalLight);
    scene.add(camera);
    const controls = MyOrbitControls(camera, canvas);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(canvas.width, canvas.height);
    renderer.setClearColor(0xffffff, 1);

    model = new THREE.Object3D();
    scene.add(model);

    const loader = new GLTFLoader();
    loader.load('img/mano.glb', gltf => {
        const hand = gltf.scene;
        hand.scale.set(HAND_SCALE, HAND_SCALE, HAND_SCALE);
        hand.rotation.y = -Math.PI/2;
        hand.position.set(0, -HAND_SCALE, 0);
        model.add(hand);
    });
    
    requestAnimationFrame(function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    });

}


const BOUNCE_BACK_SPEED = 0.3;
const CAMERA_ROLL_AMOUNT = 18;

function MyOrbitControls (camera, canvas) {

    let bounce_back = true;
    let startx = 0;
    let starty = 0;

    function normalize_camera() {
        const x = camera.position.x * camera.position.x;
        const y = camera.position.y * camera.position.y;
        const d_z = Math.sqrt(CAMERA_DISTANCE * CAMERA_DISTANCE - x - y);
        camera.position.z = d_z > 0 ? d_z : 0;
        camera.lookAt(0, 0, 0);
    }

    function mouse_move(event) {
        const ex = event.clientX || event.touches[0].clientX;
        const ey = event.clientY || event.touches[0].clientY;
        const x = -CAMERA_ROLL_AMOUNT * (ex - startx) / canvas.width;
        const y = CAMERA_ROLL_AMOUNT * (ey - starty) / canvas.height;
        camera.position.x = x > 0 ? Math.sqrt(x) : -Math.sqrt(-x);
        camera.position.y = y > 0 ? Math.sqrt(y) : -Math.sqrt(-y);
        normalize_camera();
    }

    function update() {
        if (!bounce_back) return;
        camera.position.x += (0 - camera.position.x) * BOUNCE_BACK_SPEED;
        camera.position.y += (0 - camera.position.y) * BOUNCE_BACK_SPEED;
        normalize_camera();
    }

    function cancel_drag() {
        bounce_back = true;
        canvas.removeEventListener('mousemove', mouse_move);
    }

    canvas.addEventListener('mousedown', e => {
        bounce_back = false;
        startx = e.clientX;
        starty = e.clientY;
        canvas.addEventListener('mousemove', mouse_move);
    });
    canvas.addEventListener('touchstart', e => {
        bounce_back = false;
        startx = e.touches[0].clientX;
        starty = e.touches[0].clientY;
        canvas.addEventListener('touchmove', mouse_move);
    });

    canvas.addEventListener('mouseup', cancel_drag);
    canvas.addEventListener('mouseleave', cancel_drag);
    canvas.addEventListener('touchend', cancel_drag);
    canvas.addEventListener('touchcancel', cancel_drag);

    return { update }
}

export function set_hand({ ori, rot, ref, left = false }) {
    model.scale.set(left?-1:1, 1, 1);
    set_hand_orientation(ori, rot, ref, left);
    set_hand_shape();
}

function set_hand_orientation(ori, rot, ref) {
    model.rotation.set(0, 0, 0);
    let rot_axis;
    if (ori == 'w') {
        rot_axis = new THREE.Vector3(0, 0, 1);
    } else if (ori == 'b') {
        model.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        rot_axis = new THREE.Vector3(0, 0, 1);
    } else if (ori == 'h' && ref) {
        model.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.5*Math.PI);
        rot_axis = new THREE.Vector3(0, 0, 1);
    } else if (ori == 'h') {
        model.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -0.5*Math.PI);
        rot_axis = new THREE.Vector3(0, 0, 1);
    } else if (ori == 'hw') {
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -0.5*Math.PI);
        rot_axis = new THREE.Vector3(0, 1, 0);
    } else if (ori == 'hb') {
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), 0.5*Math.PI);
        model.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        rot_axis = new THREE.Vector3(0, 1, 0);
    } else if (ref) { // hh ref
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -0.5*Math.PI);
        model.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -0.5*Math.PI);
        rot_axis = new THREE.Vector3(0, 1, 0);
    } else { // hh
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -0.5*Math.PI);
        model.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.5*Math.PI);
        rot_axis = new THREE.Vector3(0, 1, 0);
    }
    model.rotateOnWorldAxis(rot_axis, -rot*0.25*Math.PI);
}

function set_hand_shape() {
    //const finger = hand.getObjectByName('M1');
    //finger.setRotationFromAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI/2);
}
