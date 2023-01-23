import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import * as dat from "dat.gui";
import stars from '../img/cosmos.webp'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)
const xAxis = new THREE.Vector3(1, 0, 0);
let tempModelVector = new THREE.Vector3();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()
let clock = new THREE.Clock();
camera.position.set(-10, 30, 30);


const BoxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const box = new THREE.Mesh(BoxGeometry, boxMaterial)
scene.add(box)

const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -0.5 * Math.PI;
scene.add(plane)
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper)

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: true,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.castShadow = true;
scene.add(sphere)
sphere.position.set(-10, 10, 0)

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.9)
scene.add(directionalLight)
directionalLight.castShadow = true;
directionalLight.position.set(-3, 20, -50)
directionalLight.shadow.camera.bottom = -15
directionalLight.shadow.camera.top = 25
directionalLight.shadow.camera.near = 5;
// directionalLight.shadow.camera.far = 5 ;
// directionalLight.shadow.camera.far = 15;

scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

const spotlight = new THREE.SpotLight(0xFFFFFF)
scene.add(spotlight);
spotlight.position.set(0, 8, 4);
spotlight.intensity = 10;
spotlight.angle = 0.45
spotlight.penumbra = 0.3
spotlight.castShadow = true;
spotlight.shadow.mapSize.width = 1023;
spotlight.shadow.mapSize.height = 1023;
spotlight.shadow.camera.near = 5;
spotlight.shadow.camera.far = 10;
spotlight.shadow.focus = 1;

// scene.fog - new THREE.Fog(0xFFFFFF,0, 200);
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01)
const gui = new dat.GUI();
const options = {
    sphereColor: "#ffea00",
    wireframe: false,
    speed: 0.01,

}
gui.addColor(options, 'sphereColor').onChange(function (e) {
    sphere.material.color.set(e)
})
gui.add(options, 'wireframe').onChange(function (e) {
    sphere.material.wireframe = e
})
gui.add(options, 'speed', 0, 0.1);
let step = 0;
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(stars)

let monk;
const loader = new GLTFLoader();
// Load a glTF resource
loader.load(
    // resource URL
    '../models/monk_character.glb',
    // called when the resource is loaded
    function (gltf) {
        monk = gltf.scene
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });

        gltf.scene.position.set(12, 0, 3)
        gltf.scene.scale.set(3, 3, 3)
        scene.add(gltf.scene);
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
        console.log(error);

    }
);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize);
let mixer;
const gltfLoader = new GLTFLoader();
gltfLoader.load('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', function (gltf) {
    let obj = gltf.scene;
    scene.add(obj);
});

gltfLoader.load('../models/max_zombie.glb', function (gltf) {
    let model = gltf.scene;
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
        }
    });

    model.name = "model";
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });
    scene.add(model);
});

// load fbx model and texture
let ModelAnimationArray = [];
let girlAnimationMixer;
FBXloader = new FBXLoader();
let girlM;
FBXloader.load('../models/girl/girl.fbx', (girlModel) => {
    girlM = girlModel
    girlModel.scale.set(0.02, 0.02, 0.02)
    girlModel.traverse(c => {
        c.castShadow = true;
    });
    //animate character
    const anim = new FBXLoader();
    girlAnimationMixer = new THREE.AnimationMixer(girlModel);
    anim.setPath('../models/girl/');
    anim.load('jump.fbx', (anim) => {
        //creates animation action
        const jump = girlAnimationMixer.clipAction(anim.animations[0]);
        ModelAnimationArray.push({
            name: "jump",
            action: jump,
        });
    });

    anim.load('idle.fbx', (anim) => {
        //creates animation action
        const idle = girlAnimationMixer.clipAction(anim.animations[0]);
        ModelAnimationArray.push({
            name: "idle",
            action: idle,
        });
        idle.play();
    });
    anim.load('running.fbx', (anim) => {
        //creates animation action
        const run = girlAnimationMixer.clipAction(anim.animations[0]);
        ModelAnimationArray.push({
            name: "run",
            action: run,
        });
    });
    anim.load('left turn.fbx', (anim) => {
        //creates animation action
        const leftTurn = girlAnimationMixer.clipAction(anim.animations[0]);
        ModelAnimationArray.push({
            name: "Left Turn",
            action: leftTurn,
        });
    });
    scene.add(girlModel);
});


function animate() {
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    let delta = clock.getDelta();
    let speed = 5
    var moveDistance = 10 * delta
    let rotateAngle = (Math.PI / 2 * delta)*speed ; // Speed rotate Model
    if (girlAnimationMixer !== undefined) {
        girlAnimationMixer.update(delta);
    }
    if (mixer !== undefined) mixer.update(delta);
    step += options.speed
    sphere.position.y = 10 * Math.abs(Math.sin(step))
    let relativeCameraOffset = new THREE.Vector3(0,250,-600);


    function CameraOnTarget(vector) {
        let cameraOffset;
        cameraOffset = vector.applyMatrix4(girlM.matrixWorld);
        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        orbit.target.copy( girlM.position );
        camera.lookAt(girlM.position);
    }
    document.onkeyup = function (e) {
        if(e.keyCode === 87||e.keyCode===38) {
            ModelAnimationArray[2].action.loop = THREE.LoopOnce
            ModelAnimationArray[2].action.reset().fadeIn(0.5);
        }
    }
    document.onkeydown = function (e) {
        if (e.keyCode === 32) { // space jump
            ModelAnimationArray[0].action.reset().fadeIn(0.5).play();
            ModelAnimationArray[0].action.loop = THREE.LoopOnce

        }
        else if (e.keyCode === 87 || e.keyCode === 38)
        {
            if (!ModelAnimationArray[2].action.isRunning()) {
               let walk = true;
                ModelAnimationArray[2].action.reset().play();
                ModelAnimationArray[2].action.loop = THREE.LoopRepeat

                // const target = new THREE.Vector3(0, 0, -distanceFromCamera);
                // girlM.position.lerp(target,moveDistance);
                // girlM.translateZ(moveDistance) //model step foward

            }
            relativeCameraOffset = new THREE.Vector3(0,250,-400)
            CameraOnTarget(relativeCameraOffset)
            girlM.translateZ(moveDistance) //model step foward

        }
        else if (e.keyCode === 83 || e.keyCode === 40) {

            if (!ModelAnimationArray[2].action.isRunning()) {
                let walk = true;
                ModelAnimationArray[2].action.reset().fadeIn(0.5).play();
                girlM.translateZ(-moveDistance) //model step go back
                ModelAnimationArray[2].action.loop = THREE.LoopOnce
                relativeCameraOffset = new THREE.Vector3(0,250,-500)
                CameraOnTarget(relativeCameraOffset)
            }

        }
        else if (e.keyCode === 65 || e.keyCode === 37) {
            // ModelAnimationArray[3].action.reset().fadeIn(0.5).play()
            girlM.rotateOnAxis(new THREE.Vector3(0,1,0), rotateAngle);
            relativeCameraOffset = new THREE.Vector3(0,250,-400);
                CameraOnTarget(relativeCameraOffset)

            // ModelAnimationArray[3].action.loop = THREE.LoopOnce
        }
        else if (e.keyCode === 68 || e.keyCode === 39) {
            // ModelAnimationArray[3].action.reset().fadeIn(0.5).play()
            girlM.rotateOnAxis(new THREE.Vector3(0,1,0), -rotateAngle);
            relativeCameraOffset = new THREE.Vector3(0,250,-400);
            CameraOnTarget(relativeCameraOffset)

            // ModelAnimationArray[3].action.loop = THREE.LoopOnce
        }
    }


    // if(girlM) {
    // let relativeCameraOffset = new THREE.Vector3(0,250,-600);
    // let cameraOffset = relativeCameraOffset.applyMatrix4(girlM.matrixWorld);
    //
    // //
    // camera.position.x = cameraOffset.x;
    // camera.position.y = cameraOffset.y;
    // camera.position.z = cameraOffset.z;
    // orbit.target.set( girlM.position);
    // camera.lookAt(girlM.position);
    //
    // }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate)