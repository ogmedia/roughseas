import {
    Engine,
    Scene
} from "@babylonjs/core";

// camera
import {
    ArcRotateCamera,
} from "@babylonjs/core/Cameras/arcRotateCamera";
import {
    UniversalCamera
} from "@babylonjs/core/Cameras/universalCamera";
import {
    FollowCamera
} from "@babylonjs/core/Cameras/followCamera";
import {
    FreeCamera
} from "@babylonjs/core/Cameras/freeCamera";
// light
import {
    HemisphericLight
} from "@babylonjs/core/Lights/hemisphericLight";

// some math libs
import {
    Vector2,
    Vector3,
    Color3,
} from "@babylonjs/core/Maths/math";

// mesh
import {
    Mesh
} from "@babylonjs/core/Meshes/mesh";
import {
    BoxBuilder
} from "@babylonjs/core/Meshes/Builders/boxBuilder";

// to use meshbuilder
import "@babylonjs/core/Meshes/meshBuilder";

// Textures
import {
    Texture
} from "@babylonjs/core/Materials/Textures/texture";
import {
    CubeTexture,
} from "@babylonjs/core/Materials/Textures/cubeTexture";

// Materials
import {
    StandardMaterial
} from "@babylonjs/core/Materials/standardMaterial";
// water material
import {
    WaterMaterial,
} from "@babylonjs/materials";

import "@babylonjs/loaders/OBJ"

const setupXRSession = (_scene) => {
    return checkXRSupport()
        .then(([vrOn, arOn]) => {
            if (vrOn || arOn) {
                return _scene.createDefaultXRExperienceAsync()
                    .then( xrHelper => xrHelper, err => {
                        alert(err);
                    });
            }
            else {
                console.log("no ar or vr detected");
                return null;
            }
        });
};

// first see what kind of session we can support
const checkXRSupport = () => {
    return Promise.all([
        navigator.xr.isSessionSupported('immersive-vr'),
        navigator.xr.isSessionSupported('immersive-ar'),
    ]);
}

const createScene = () => {
    var canvas = document.getElementById("renderCanvas"); // Get the canvas element

    var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

    var scene = new Scene(engine);
    scene.fogMode = Scene.FOGMODE_EXP;
    scene.fogDensity = 0.0003;
    scene.fogColor = new Color3(0.8,.8,.8);
    scene.gravity = new Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;

    // camera
    var camera = new FreeCamera("Camera", new Vector3(0,80,0), scene);
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(10,30,10);
    camera.setTarget(new Vector3(300,30,300));
    camera.attachControl(canvas, true);

    // camera.heightOffset = 50;
    let xrH = null;
    setupXRSession(scene)
        .then(xrHelper => {
            if (xrHelper.baseExperience) {
                xrH = xrHelper.baseExperience;

                xrH.onStateChangedObservable.add((state) => {
                    if (state === 2) {
                        xrH.camera.position.x = 0;
                        xrH.camera.position.y = 45;
                        xrH.camera.position.z = 0;
                    }
                });
            }
        });

    // Light
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = .45;
    var water = new WaterMaterial("water", scene);
    water.bumpTexture = new Texture("textures/waterbump.png", scene);

    // Water properties
    water.windForce = -10;
    water.waveHeight = 1.2;
    water.bumpHeight = .3;
    water.waveLength = 0.4;
    water.waveSpeed = 40.0;
    water.waterColor = new Color3(0.3, 0.3, 1);
    water.colorBlendFactor = 0.2;
    water.windDirection = new Vector2(1, 1);

    // Skybox
    var skybox = Mesh.CreateBox("skyBox", 8000.0, scene);
    var skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
        
    // Ground
    var groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new Texture("textures/ground.jpg", scene);
    groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 20;
    var ground = Mesh.CreateGround("ground", 4096, 4096, 32, scene, false);
    ground.position.y = -300;
    ground.material = groundMaterial;
    ground.checkCollisions = true;

    // Water
    var waterMesh = Mesh.CreateGround("waterMesh", 4096, 4096, 32, scene, false);
    // Assign the water material
    waterMesh.material = water;

    var box = BoxBuilder.CreateBox("box1", { height: 60, width: 160, depth: 160 }, scene);
    var boxMaterial = new StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseTexture = new Texture("textures/wood.jpg", scene);
    boxMaterial.diffuseTexture.uScale = boxMaterial.diffuseTexture.vScale = 3;
    box.material = boxMaterial;
    box.position.x = 0;
    box.checkCollisions = true;
    // var player = BoxBuilder.CreateBox("player", { height: 50, width: 15, depth: 15}, scene);
    // camera.lockedTarget = box;

    // Add skybox and ground to the reflection and refraction
    water.addToRenderList(skybox);
    water.addToRenderList(ground);
    // water.addToRenderList(sphere);
    water.addToRenderList(box);


    let i = 0;
    scene.registerBeforeRender(function() {
        let time = water._lastTime / 100000;

        let boxX = box.position.x;
        let boxZ = box.position.z;

        box.position.y = Math.abs((Math.sin(((boxX / 0.05) + time * water.waveSpeed)) * water.waveHeight * water.windDirection.x * 5.0) + (Math.cos(((boxZ / 0.05) +  time * water.waveSpeed)) * water.waveHeight * water.windDirection.y * 5.0));
    });

    engine.runRenderLoop(function() {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
          engine.resize();
    });
    return scene;
};

 window.addEventListener('DOMContentLoaded', function() {
    const SCENE = createScene();
 });