import {
	Engine,
	Scene
} from "@babylonjs/core";

// camera
import {
	ArcRotateCamera,
} from "@babylonjs/core/Cameras/arcRotateCamera";

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

const createScene = () => {
	var canvas = document.getElementById("renderCanvas"); // Get the canvas element

	var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
	var scene = new Scene(engine);

	// camera
	var camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, Vector3.Zero(), scene);
	camera.attachControl(canvas, true);

	// Light
	var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

	var water = new WaterMaterial("water", scene);
	water.bumpTexture = new Texture("textures/waterbump.png", scene);

	// Water properties
	water.windForce = -10;
	water.waveHeight = 0.5;
	water.bumpHeight = 0.1;
	water.waveLength = 0.1;
	water.waveSpeed = 50.0;
	water.colorBlendFactor = 0;
	water.windDirection = new Vector2(1, 1);
	water.colorBlendFactor = 0;

	// Skybox
	var skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
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
	groundMaterial.diffuseTexture.uScale = groundMaterial.diffuseTexture.vScale = 4;

	var ground = Mesh.CreateGround("ground", 512, 512, 32, scene, false);
	ground.position.y = -2;
	ground.material = groundMaterial;
		
	// Water
	var waterMesh = Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
	// Assign the water material
	waterMesh.material = water;

  // Sphere
  var sphereMaterial = new StandardMaterial("sphereMaterial", scene);
  sphereMaterial.diffuseTexture = new Texture("textures/wood.jpg", scene);

  var sphere = Mesh.CreateSphere("sphere", 16, 10, scene);
  sphere.position.y = 20;
  sphere.material = sphereMaterial;

	// Add skybox and ground to the reflection and refraction
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
	water.addToRenderList(sphere);

  let i = 0;
  scene.registerBeforeRender(function() {
      let time = water._lastTime / 100000;
      let x = sphere.position.x;
      let z = sphere.position.z;
      sphere.position.y = Math.abs((Math.sin(((x / 0.05) + time * water.waveSpeed)) * water.waveHeight * water.windDirection.x * 5.0) + (Math.cos(((z / 0.05) +  time * water.waveSpeed)) * water.waveHeight * water.windDirection.y * 5.0));
  });

	engine.runRenderLoop(function() {
	    scene.render();
	});
	return scene;
};

 window.addEventListener('DOMContentLoaded', function() {
	const SCENE = createScene();
 });