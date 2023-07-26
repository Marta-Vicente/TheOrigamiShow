/*global THREE, requestAnimationFrame, console*/

var scene, camera, camera1, camera2, cameraPause, cameraStereo, camera4, renderer, cameraGroup;
const red = 0xff0000;
const green = 0x00ff00;
const blue = 0x0000ff;
const purple = 0x800080;
const white = 0xffffff;
const pink = 0xff006f;
const cyan = 0x00ffef;
const yellow = 0xffff00;
const orange = 0xff6f00;
const grey = 0xc0c0c0;
const lightspeed = 0xa8e6ff;
const sublime_red = 0x960303;
const black = 0x000000;
const darkgrey = 0xEEEEEE;

var keys_pressed = {};

var time;

var D_KEY_PRESSED, Z_KEY_PRESSED, X_KEY_PRESSED, C_KEY_PRESSED, SPACE_KEY_PRESSED, R_KEY_PRESSED;
var Q_KEY_PRESSED, W_KEY_PRESSED, E_KEY_PRESSED, R_KEY_PRESSED, T_KEY_PRESSED, Y_KEY_PRESSED;
var A_KEY_PRESSED, THREE_KEY_PRESSED, S_KEY_PRESSED, ONE_KEY_PRESSED, TWO_KEY_PRESSED, JHIN_KEY_PRESSED;

var last_state_d = false; var last_state_z = false; var last_state_x = false; var last_state_c = false;
var last_state_space = false; var last_state_r = false; var last_state_3 = false; var last_state_a = false;
var last_state_s = false;

const stageSizeX = 50;
const stageSizeY = 10;
const stageSizeZ = 80;

const floorSizeX = 400;
const floorSizeY = 1;
const floorSizeZ = 400;

const opacityLevel = 0.6;
const hLight = 0.4;
const speed = Math.PI;

var paused = false;
var phong = true;
var basic_material = false;

var camera1_ON = true;
var debug = false;


function createBall(obj, x, y, z, c, b1, b2, b3, name, nei) {

    'use strict';
    
    obj = new THREE.Object3D();
    obj.userData = { jumping: true, step: 0 };
    var material = new THREE.MeshPhongMaterial({ color: c});
    var geometry = new THREE.SphereGeometry(b1, b2, b3);
    var mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createCone(obj, x, y, z, c, radius, height, radialSegments, heightSegments, rotation, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments);
    
    var material = new THREE.MeshPhongMaterial({ color: c});
    var mesh = new THREE.Mesh(geometry, material);

    obj.position.set(x, y, z);
    obj.add(mesh);
    obj.rotation.z = rotation;
    nei.add(obj);
    return obj;
}

function createBox(obj, x, y, z, c, width, height, depth, name, nei, rotation) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.BoxGeometry(width, height, depth);
    
    var material = new THREE.MeshPhongMaterial({ color: c, wireframe: false });
    var mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
    obj.rotation.z += rotation;
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createCamera1(){

    'use strict';
    camera1 = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    camera1.position.x = 80;
    camera1.position.y = 50;
    camera1.position.z = 0;
    camera1.lookAt(scene.position);

}

function createCamera2(){

    'use strict';
    camera2 = new THREE.OrthographicCamera(
        window.innerWidth/ -16, window.innerWidth/ 16, 
        window.innerHeight / 16, window.innerHeight / -16,
        0, 100);
    camera2.position.x = 0;
    camera2.position.y = 50;
    camera2.position.z = 0;
    camera2.lookAt(0, stageSizeY, 0);
    camera2.rotation.z += (Math.PI/2);
}

function createcamera4(){

    'use strict';
    camera4 = new THREE.OrthographicCamera(
        window.innerWidth/ -32, window.innerWidth/ 32, 
        window.innerHeight / 32, window.innerHeight / -32,
        0, 100);
    camera4.position.x = 70;
    camera4.position.y = stageSizeY + 20;
    camera4.position.z = 0;
    camera4.lookAt(0, stageSizeY, 0);
}

function createPauseScreen(){

    var obj = new THREE.Object3D();
    let geometry = new THREE.BoxGeometry(1, 50, 100);
    const texture1 =  new THREE.TextureLoader().load('js/images/pause.png');
    const material = new THREE.MeshBasicMaterial( { color: white, map: texture1, transparent: true, opacity:0 });
    let mesh =  new THREE.Mesh(geometry, material);
    obj.add(mesh);
    obj.name = "Paused";
    scene.add(obj);
    obj.position.set(camera4.position.x-10, camera4.position.y , 0);
    
    var obj2 = new THREE.Object3D();
    let geometry2 = new THREE.BoxGeometry(1, 65, 130);
    const material2 = new THREE.MeshBasicMaterial( { color: white, map: texture1, transparent: true, opacity:0 });
    let mesh2 =  new THREE.Mesh(geometry2, material2);
    obj2.add(mesh2);
    obj2.name = "Paused2";
    scene.add(obj2);
    obj2.lookAt(camera1.position);
    obj2.rotation.y += Math.PI/2;
    obj2.rotation.z += Math.PI/2;
    obj2.rotation.x -= Math.PI/2;
    obj2.rotation.y += Math.PI/5.65;
    obj2.rotation.z += Math.PI/5.65;
    obj2.position.set(40, 30, 0);


}

function createPausedCamera(){
    cameraPause = new THREE.OrthographicCamera(
        window.innerWidth/ -32, window.innerWidth/ 32, 
        window.innerHeight / 32, (window.innerHeight / -32),
        0, 100);
    cameraPause.position.x = camera4.position.x;
    cameraPause.position.y = camera4.position.y;
    cameraPause.position.z = camera4.position.z;
    cameraPause.lookAt(0,stageSizeY, 0);
    createPauseScreen();
}

function createStereoCamera(){
    cameraStereo = new THREE.StereoCamera();
}


function createLight(){

    var light = new THREE.DirectionalLight(white, 1);
    light.position.set(150, 40, 0);
    light.lookAt(scene);
    light.name = "main_light";
    scene.add(light);
}


function createFloor(x, y, z, color, name, sizeX, sizeY, sizeZ, nei){

    var floor, box;
    floor = new THREE.Object3D();
    floor.position.set(x,y,z);
    floor.name = name;
    box = createBox(box, 0, 0, 0, color, sizeX, sizeY, sizeZ, "box", floor, 0);
    nei.add(floor);

}

function createStage(x, y, z, color, name, sizeX, sizeY, sizeZ, nei){

    var stage, box, step1, step2;
    stage = new THREE.Object3D();
    stage.position.set(x,y,z);
    stage.name = name;
    box = createBox(box, 0, 0, 0, color, sizeX, sizeY, sizeZ, "box", stage, 0);
    step1 = createBox(step1, sizeX/2, 0, 0, color, sizeX/5, sizeY/3, sizeZ, "step1", stage, 0);
    step2 = createBox(step2, sizeX/2, 0, 0, color, sizeX/10, (sizeY/3)*2, sizeZ, "step2", stage, 0);
    nei.add(stage);
}


function createSpotlights(x, y, z, color, nei){

    var h1, h2, h3;
    var light1, light2, light3;
    var cone1, cone2, cone3;
    var sph1, sph2, sph3;

    //For the left one
    h1 = new THREE.Object3D();
    h1.name = "h1";
    h1.position.set(x + (stageSizeX/2), y + (stageSizeY*4), z + (stageSizeZ/4));
    cone1 = createCone(cone1, -2, 0, 0, color, 3, 5, 100, 100, -Math.PI/2, h1);
    createBall(sph1, 0, 0, 0, color, 3, 100, 100, "sph", h1);
    light1 = new THREE.SpotLight(white, hLight);
    scene.add(light1.target);
    light1.target.position.set(0, 0, stageSizeZ/4);
    light1.angle = Math.PI/7;
    light1.name = "light";
    h1.add(light1);
    nei.add(h1);
    light1.updateMatrixWorld();

    //For the center one
    h2 = new THREE.Object3D();
    h2.name = "h2";
    h2.position.set(x + (stageSizeX/2), y + (stageSizeY*4), z);
    cone2 = createCone(cone2, -2, 0, 0, color, 3, 5, 100, 100, -Math.PI/2, h2);
    createBall(sph2, 0, 0, 0, color, 3, 100, 100, "sph", h2);
    light2 = new THREE.SpotLight(white, hLight);
    scene.add(light2.target);
    light2.target.position.set(0, 0, 0);
    light2.angle = Math.PI/7;
    light2.name = "light";
    h2.add(light2);
    nei.add(h2);
    light2.updateMatrixWorld();

    //For the right one
    h3 = new THREE.Object3D();
    h3.name = "h3";
    h3.position.set(x + (stageSizeX/2), y + (stageSizeY*4), z - (stageSizeZ/4));
    cone3 = createCone(cone3, -2, 0, 0, color, 3, 5, 100, 100, -Math.PI/2, h3);
    createBall(sph3, 0, 0, 0, color, 3, 100, 100, "sph", h3);
    light3 = new THREE.SpotLight(white, hLight);
    scene.add(light3.target);
    light3.target.position.set(0, 0, -stageSizeZ/4);
    light3.angle = Math.PI/7;
    light3.name = "light";
    h3.add(light3);
    nei.add(h3);
    light3.updateMatrixWorld();

    cone1.rotation.z += Math.PI/4;
    cone2.rotation.z += Math.PI/4;
    cone3.rotation.z += Math.PI/4;

}

function createTriangularPlane(obj, x, y, z, side, vertices, nei, paperSide) {
    'use strict';
    var geom = new THREE.BufferGeometry();
    geom.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geom.computeVertexNormals();
    let UVs = new Float32Array([
        0,0, 0,1, 1,1
    ]);
    geom.setAttribute( 'uv', new THREE.BufferAttribute( UVs, 2 ) );
    var texture =  new THREE.TextureLoader().load('js/images/ALL_WILL_BE_CONSUMED_BY_THE_BLACK_MIST.png');
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.offset.x = 0.5;
    texture.repeat.set(1,1);
    var material;
    if(side){
        if(paperSide){
            material = new THREE.MeshPhongMaterial({color: purple, side: THREE.FrontSide, map:texture}); 
        }
        else{
            material = new THREE.MeshPhongMaterial({color: white, side: THREE.FrontSide, map:texture});
        }
    }
    else{
        if(paperSide){
            material = new THREE.MeshPhongMaterial({color: purple, side: THREE.BackSide, map:texture}); 
        }
        else{
            material = new THREE.MeshPhongMaterial({color: white, side: THREE.BackSide, map:texture});
        }
    }
    
    material.needsUpdate = true;
    obj = new THREE.Mesh(geom, material);
    obj.position.set(x, y, z);
    nei.add(obj);
    return obj;
}

function createOrigami1(group, x, y, z, name, nei) {
    'use strict';
    group = new THREE.Group();
    const vertices1 = new Float32Array( [
        0, 0,  0,
        0, 15,  0,
        0,  7.5, 7.5,

    ] );

    var tri1, tri12;
    tri1 = createTriangularPlane(tri1, 0, 0, 0, true, vertices1, group, false);
    tri12 = createTriangularPlane(tri1, 0, 0, 0, false, vertices1, group, true);
    const vertices2 = new Float32Array( [
        0, 0,  0,
        0, 15,  0,
        0,  7.5, -7.5,

    ] );
    tri1.rotation.y = 0.35;
    tri12.rotation.y = 0.35;
    var tri2, tri21;
    tri2 = createTriangularPlane(tri2, 0, 0, 0, true, vertices2, group, true);
    tri21 = createTriangularPlane(tri21, 0, 0, 0, false, vertices2, group, false);
    tri2.rotation.y = -0.35;
    tri21.rotation.y = -0.35;
    group.position.set(x, y, z);
    group.name = name;
    group.rotation.y += Math.PI;
    group.rotation.z -= Math.PI/6;
    nei.add(group);
}

function createOrigami2(group, x, y, z, name, nei){

    group = new THREE.Group();

    //SET 1---------------------------------------

    const vertices1 = new Float32Array( [
        0, 0,  0,
        0, 12, 0,
        1, 10, 3,
    ] )
    var tri1, tri12;
    tri1 = createTriangularPlane(tri1, 0, 0, 0, true, vertices1, group, true);
    tri12 = createTriangularPlane(tri12, 0, 0, 0, false, vertices1, group, true);

    const vertices2 = new Float32Array( [
        0, 0,   0,
        0, 12,  0,
        -1, 10, -3,
    ] )
    var tri2, tri22;
    tri2 = createTriangularPlane(tri2, 0, 0, 0, false, vertices2, group, true);
    tri22 = createTriangularPlane(tri22, 0, 0, 0, true, vertices2, group, true);


    tri1.rotation.y += Math.PI/10;
    tri12.rotation.y += Math.PI/10;
    tri2.rotation.y -= Math.PI/10;
    tri22.rotation.y -= Math.PI/10;

    //SET 2---------------------------------------

    const vertices3 = new Float32Array( [
        -1, 13,  4,
        0, 12,  0,
        0, 10,  3,
    ] )
    var tri3, tri32;
    tri3 = createTriangularPlane(tri3, 0, 0, 0, true, vertices3, group, false);
    tri32 = createTriangularPlane(tri32, 0, 0, 0, false, vertices3, group, false);

    const vertices4 = new Float32Array( [
        -1, 13,  -4,
        0, 12,  0,
        0, 10,  -3,
    ] )
    var tri4, tri42;
    tri4 =  createTriangularPlane(tri3, 0, 0, 0, false, vertices4, group, false);
    tri42 = createTriangularPlane(tri42, 0, 0, 0, true, vertices4, group, false);

    tri3.rotation.y += Math.PI/10;
    tri32.rotation.y += Math.PI/10;
    tri4.rotation.y -= Math.PI/10;
    tri42.rotation.y -= Math.PI/10;

    //SET 3---------------------------------------

    const vertices5 = new Float32Array( [
        0, 13,  4,
        0, 12,  0,
        0, 16,  0,
    ] )
    var tri5, tri52;
    tri5 =  createTriangularPlane(tri5, 0, 0, 0, true, vertices5, group, false);
    tri52 = createTriangularPlane(tri52, 0, 0, 0, false, vertices5, group, true);

    const vertices6 = new Float32Array( [
        0, 13,  -4,
        0, 12,  0,
        0, 16,  0,
    ] )
    var tri6, tri62;
    tri6 =  createTriangularPlane(tri6, 0, 0, 0, false, vertices6, group, false);
    tri62 = createTriangularPlane(tri62, 0, 0, 0, true, vertices6, group, true);

    tri5.rotation.y += Math.PI/10;
    tri52.rotation.y += Math.PI/10;
    tri6.rotation.y -= Math.PI/10;
    tri62.rotation.y -= Math.PI/10;

    group.position.set(x, y, z);
    group.name = name;
    group.rotation.y += Math.PI;
    group.rotation.z -= Math.PI/6;
    nei.add(group);

}


function createOrigami3(group, x, y, z, name, nei){

    group = new THREE.Group();

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


    const vertices1 = new Float32Array( [
        0, 7.5,  9,
        -2, 2,  3,
        0, 4.5, -9,

    ] );

    var tri1, tri12;
    tri1 = createTriangularPlane(tri1, 0, 0, 0, true, vertices1, group, false);
    tri12 = createTriangularPlane(tri12, 0, 0, 0, false, vertices1, group, true);
    //tri1.rotation.z = Math.PI/10;

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


    const vertices2 = new Float32Array( [
        0, 7.5,  9,
        2, 2,  3,
        0,  4.5, -9,

    ] );
    var tri2, tri22;
    tri2 = createTriangularPlane(tri2, 0, 0, 0, true, vertices2, group, true);
    tri22 = createTriangularPlane(tri22, 0, 0, 0, false, vertices2, group, false);
    //tri2.rotation.z = -Math.PI/10;

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


    const vertices3 = new Float32Array( [
        -1, 6,  0,
        -3, 2,  3,
        -3, 3.15, -1,

    ] );

    var tri3, tri32;
    tri3 = createTriangularPlane(tri3, 0, 0, 0, false, vertices3, group, false);
    tri32 = createTriangularPlane(tri32, 0, 0, 0, true, vertices3, group, true);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices4 = new Float32Array( [
        1, 6,  0,
        3, 2,  3,
        3, 3.15, -1,

    ] );

    var tri4, tri42;
    tri4 = createTriangularPlane(tri4, 0, 0, 0, true, vertices4, group, true);
    tri42 = createTriangularPlane(tri42, 0, 0, 0, true, vertices4, group, false);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices5 = new Float32Array( [
        0, 4.5, -9,
        -1.5, 2, -6,
        0, 20, -8,
    ] );
    var tri5, tri52;
    tri5 = createTriangularPlane(tri5, 0, 0, 0, true, vertices5, group, true);
    tri52 = createTriangularPlane(tri52, 0, 0, 0, false, vertices5, group, true);
    
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices6 = new Float32Array( [
        0, 4.5, -9,
        1.5, 2, -6,
        0, 20, -8,
    ] );
    var tri6, tri62;
    tri6 = createTriangularPlane(tri6, 0, 0, 0, true, vertices6, group, true);
    tri62 = createTriangularPlane(tri62, 0, 0, 0, false, vertices6, group, true);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices7 = new Float32Array( [
        0, 20, -8,
        0, 19, -13,
        0.5, 19, -7.5,
    ] );
    var tri7, tri72;
    tri7 = createTriangularPlane(tri7, 0, 0, 0, false, vertices7, group, true);
    tri72 = createTriangularPlane(tri72, 0, 0, 0, true, vertices7, group, false);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices8 = new Float32Array( [
        0, 20, -8,
        0, 19, -13,
        -0.5, 19, -7.5,
    ] );
    var tri8, tri82;
    tri8 = createTriangularPlane(tri8, 0, 0, 0, true, vertices8, group, true);
    tri82 = createTriangularPlane(tri82, 0, 0, 0, false, vertices8, group, false);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices9 = new Float32Array( [
        1, 6,  0,
        3, 2,  3,
        0, 4.5, -9,
    ] );
    var tri9, tri92;
    tri9 = createTriangularPlane(tri9, 0, 0, 0, true, vertices9, group, true);
    tri92 = createTriangularPlane(tri92, 0, 0, 0, false, vertices9, group, false);

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    const vertices10 = new Float32Array( [
        -1, 6,  0,
        -3, 2,  3,
        0, 4.5, -9,
    ] );
    var tri10, tri102;
    tri10 = createTriangularPlane(tri10, 0, 0, 0, true, vertices10, group, false);
    tri102 = createTriangularPlane(tri102, 0, 0, 0, false, vertices10, group, true);

    group.position.set(x, y, z);
    group.name = name;
    nei.add(group);
}

function createScene() {

    'use strict';
    
    scene = new THREE.Scene();
    //scene.add(new THREE.AxisHelper(50));
    var or1, or2, or3;

    createFloor(0, 0, 0, sublime_red, "floor", floorSizeX, floorSizeY, floorSizeZ, scene);
    createStage(0, 1, 0, white, "stage", stageSizeX, stageSizeY, stageSizeZ, scene);

    createLight();
    createSpotlights(0, 0, 0, grey, scene);
    createOrigami1(or1, 0, 10, (stageSizeZ/4) - 1, "or1", scene);
    createOrigami2(or2, 0, 10, 0, "or2", scene);
    createOrigami3(or3, 0, 10, -(stageSizeZ/4) + 1, "or3", scene);

}

function resetScene(){

    'use strict';

    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    createScene();
    createPauseScreen();
    if(camera1_ON){
        scene.getObjectByName("Paused2").children[0].material.opacity = opacityLevel;
    }
    else{
        scene.getObjectByName("Paused").children[0].material.opacity = opacityLevel;
    }


}

function changeMaterialToLambert(){

    'use strict';
    
    scene.getObjectByName('floor').children[0].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('floor').children[0].children[0].material.color});

    scene.getObjectByName('stage').children[0].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('stage').children[0].children[0].material.color});
    scene.getObjectByName('stage').children[1].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('stage').children[1].children[0].material.color});
    scene.getObjectByName('stage').children[2].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('stage').children[2].children[0].material.color});

    scene.getObjectByName('h1').children[0].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h1').children[0].children[0].material.color});
    scene.getObjectByName('h1').children[1].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h1').children[1].children[0].material.color});
    
    scene.getObjectByName('h2').children[0].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h2').children[0].children[0].material.color});
    scene.getObjectByName('h2').children[1].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h2').children[1].children[0].material.color});

    scene.getObjectByName('h3').children[0].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h3').children[0].children[0].material.color});
    scene.getObjectByName('h3').children[1].children[0].material =
     new THREE.MeshLambertMaterial({ color:  scene.getObjectByName('h3').children[1].children[0].material.color});

    for(let i = 0; i < scene.getObjectByName('or1').children.length; i ++){
        scene.getObjectByName('or1').children[i].material =
            new THREE.MeshLambertMaterial({ color: scene.getObjectByName('or1').children[i].material.color,
                                        side: scene.getObjectByName('or1').children[i].material.side,
                                        map: scene.getObjectByName('or1').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or2').children.length; i ++){
        scene.getObjectByName('or2').children[i].material =
            new THREE.MeshLambertMaterial({ color: scene.getObjectByName('or2').children[i].material.color,
                                        side: scene.getObjectByName('or2').children[i].material.side,
                                        map: scene.getObjectByName('or2').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or3').children.length; i ++){
        scene.getObjectByName('or3').children[i].material =
            new THREE.MeshLambertMaterial({ color: scene.getObjectByName('or3').children[i].material.color,
                                        side: scene.getObjectByName('or3').children[i].material.side,
                                        map: scene.getObjectByName('or3').children[i].material.map});
    }
    
}

function changeMaterialToPhong(){

    'use strict';
    
    scene.getObjectByName('floor').children[0].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('floor').children[0].children[0].material.color});

    scene.getObjectByName('stage').children[0].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('stage').children[0].children[0].material.color});
    scene.getObjectByName('stage').children[1].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('stage').children[1].children[0].material.color});
    scene.getObjectByName('stage').children[2].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('stage').children[2].children[0].material.color});

    scene.getObjectByName('h1').children[0].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h1').children[0].children[0].material.color});
    scene.getObjectByName('h1').children[1].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h1').children[1].children[0].material.color});
    
    scene.getObjectByName('h2').children[0].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h2').children[0].children[0].material.color});
    scene.getObjectByName('h2').children[1].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h2').children[1].children[0].material.color});

    scene.getObjectByName('h3').children[0].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h3').children[0].children[0].material.color});
    scene.getObjectByName('h3').children[1].children[0].material =
     new THREE.MeshPhongMaterial({ color:  scene.getObjectByName('h3').children[1].children[0].material.color});

    for(let i = 0; i < scene.getObjectByName('or1').children.length; i ++){
        scene.getObjectByName('or1').children[i].material =
            new THREE.MeshPhongMaterial({ color: scene.getObjectByName('or1').children[i].material.color,
                                        side: scene.getObjectByName('or1').children[i].material.side,
                                        map: scene.getObjectByName('or1').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or2').children.length; i ++){
        scene.getObjectByName('or2').children[i].material =
            new THREE.MeshPhongMaterial({ color: scene.getObjectByName('or2').children[i].material.color,
                                        side: scene.getObjectByName('or2').children[i].material.side,
                                        map: scene.getObjectByName('or2').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or3').children.length; i ++){
        scene.getObjectByName('or3').children[i].material =
            new THREE.MeshPhongMaterial({ color: scene.getObjectByName('or3').children[i].material.color,
                                        side: scene.getObjectByName('or3').children[i].material.side,
                                        map: scene.getObjectByName('or3').children[i].material.map});
    }
}

function changeToBasicMaterial(){

    'use strict';
    
    scene.getObjectByName('floor').children[0].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('floor').children[0].children[0].material.color});

    scene.getObjectByName('stage').children[0].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('stage').children[0].children[0].material.color});
    scene.getObjectByName('stage').children[1].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('stage').children[1].children[0].material.color});
    scene.getObjectByName('stage').children[2].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('stage').children[2].children[0].material.color});

    scene.getObjectByName('h1').children[0].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h1').children[0].children[0].material.color});
    scene.getObjectByName('h1').children[1].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h1').children[1].children[0].material.color});
    
    scene.getObjectByName('h2').children[0].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h2').children[0].children[0].material.color});
    scene.getObjectByName('h2').children[1].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h2').children[1].children[0].material.color});

    scene.getObjectByName('h3').children[0].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h3').children[0].children[0].material.color});
    scene.getObjectByName('h3').children[1].children[0].material =
     new THREE.MeshBasicMaterial({ color:  scene.getObjectByName('h3').children[1].children[0].material.color});

    for(let i = 0; i < scene.getObjectByName('or1').children.length; i ++){
        scene.getObjectByName('or1').children[i].material =
            new THREE.MeshBasicMaterial({ color: scene.getObjectByName('or1').children[i].material.color,
                                        side: scene.getObjectByName('or1').children[i].material.side,
                                        map: scene.getObjectByName('or1').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or2').children.length; i ++){
        scene.getObjectByName('or2').children[i].material =
            new THREE.MeshBasicMaterial({ color: scene.getObjectByName('or2').children[i].material.color,
                                        side: scene.getObjectByName('or2').children[i].material.side,
                                        map: scene.getObjectByName('or2').children[i].material.map});
    }
    for(let i = 0; i < scene.getObjectByName('or3').children.length; i ++){
        scene.getObjectByName('or3').children[i].material =
            new THREE.MeshBasicMaterial({ color: scene.getObjectByName('or3').children[i].material.color,
                                        side: scene.getObjectByName('or3').children[i].material.side,
                                        map: scene.getObjectByName('or3').children[i].material.map});
    }
}

function onKeyDown() {

    'use strict';

    if(keys_pressed["1"] === true){
        ONE_KEY_PRESSED = true;
    }
    if(keys_pressed["2"] === true){
        TWO_KEY_PRESSED = true;
    }
    if(keys_pressed["4"] === true){
        JHIN_KEY_PRESSED = true;
    }
    if(keys_pressed["q"] === true){
        Q_KEY_PRESSED = true;
    }
    if(keys_pressed["w"] === true){
        W_KEY_PRESSED = true;
    }
    if(keys_pressed["e"] === true){
        E_KEY_PRESSED = true;
    }
    if(keys_pressed["r"] === true){
        R_KEY_PRESSED = true;
    }
    if(keys_pressed["t"] === true){
        T_KEY_PRESSED = true;
    }
    if(keys_pressed["y"] === true){
        Y_KEY_PRESSED = true;
    }
    if(keys_pressed["d"] === true && last_state_d === false){
        D_KEY_PRESSED = true;
        last_state_d = true;
    }
    if(keys_pressed["d"] === false && last_state_d === true){
        last_state_d = false;
    }
    if(keys_pressed["z"] === true && last_state_z === false){
        Z_KEY_PRESSED = true;
        last_state_z = true;
    }
    if(keys_pressed["z"] === false && last_state_z === true){
        last_state_z = false;
    }
    if(keys_pressed["x"] === true && last_state_x === false){
        X_KEY_PRESSED = true;
        last_state_x = true;
    }
    if(keys_pressed["x"] === false && last_state_x === true){
        last_state_x = false;
    }
    if(keys_pressed["c"] === true && last_state_c === false){
        C_KEY_PRESSED = true;
        last_state_c = true;
    }
    if(keys_pressed["c"] === false && last_state_c === true){
        last_state_c = false;
    }
    if(keys_pressed[" "] === true && last_state_space === false){
        SPACE_KEY_PRESSED = true;
        last_state_space = true;
    }
    if(keys_pressed[" "] === false && last_state_space === true){
        last_state_space = false;
    }
    if(keys_pressed["3"] === true && last_state_3 === false){
        THREE_KEY_PRESSED = true;
        last_state_3 = true;
    }
    if(keys_pressed["3"] === false && last_state_3 === true){
        last_state_3 = false;
    }
    if(keys_pressed["a"] === true && last_state_a === false){
        A_KEY_PRESSED = true;
        last_state_a = true;
    }
    if(keys_pressed["a"] === false && last_state_a === true){
        last_state_a = false;
    }
    if(keys_pressed["s"] === true && last_state_s === false){
        S_KEY_PRESSED = true;
        last_state_s = true;
    }
    if(keys_pressed["s"] === false && last_state_s === true){
        last_state_s = false;
    }

}

function placeKeyInList(e){
    keys_pressed[e.key.toLowerCase()] = e.type === "keydown";
}

function render() {

    'use strict';
    renderer.render(scene, camera);
}

function onResize() {

    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        
        camera1.aspect = window.innerWidth / window.innerHeight;
        camera1.updateProjectionMatrix();

        camera2.left = window.innerWidth/ -16;
        camera2.right = window.innerWidth/ 16;
        camera2.top = window.innerHeight / 16;
        camera2.bottom = window.innerHeight / -16;
        camera2.near = 10;
        camera2.far = 100;
        camera2.updateProjectionMatrix();
        
        cameraPause.left = window.innerWidth/ -32;
        cameraPause.right = window.innerWidth/ 32;
        cameraPause.top = window.innerHeight / 32;
        cameraPause.bottom = window.innerHeight / -32 + 5;
        cameraPause.near = 0;
        cameraPause.far = 100;
        cameraPause.updateProjectionMatrix();

        camera4.left = window.innerWidth/ -32;
        camera4.right = window.innerWidth/ 32;
        camera4.top = window.innerHeight / 32;
        camera4.bottom = window.innerHeight / -32;
        camera4.near = 10;
        camera4.far = 100;
        camera4.updateProjectionMatrix();
    }

}

function initializeVR() {
    document.body.appendChild( VRButton.createButton( renderer) );
}

function init() {

    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.xr.enabled = true;

    createScene();
    createCamera1();
    createCamera2();
    createcamera4();
    createPausedCamera();
    createStereoCamera();
    initializeVR();

    cameraGroup = new THREE.Group();
    cameraGroup.position.set(stageSizeX, stageSizeY+20, 0);
    cameraGroup.rotation.y = Math.PI/2;
    //createStereoCamera();
    camera = camera1;
    
    window.addEventListener("keydown", placeKeyInList);
    window.addEventListener("keyup", placeKeyInList);   
    window.addEventListener("resize", onResize);

    time = new THREE.Clock(true);

    renderer.setAnimationLoop(mainLoop);

    //When user turn on the VR mode.
    renderer.xr.addEventListener('sessionstart', function () {
        scene.add(cameraGroup);
        cameraGroup.add(camera);
    });
    //When user turn off the VR mode.
    renderer.xr.addEventListener('sessionend', function () {
        scene.remove(cameraGroup);
        cameraGroup.remove(camera);
    });
}

function mainLoop() {
    update();
    display();
}

function update(){

    //Update
    onKeyDown();
    
    delta = time.getDelta();

    if(paused){
        delta = 0;
    }
    if(ONE_KEY_PRESSED){
        camera = camera1;
        if(paused){
            scene.getObjectByName("Paused2").children[0].material.opacity = opacityLevel;
            scene.getObjectByName("Paused").children[0].material.opacity = 0;
        }
        ONE_KEY_PRESSED = false;
        camera1_ON = true;
    }
    if(TWO_KEY_PRESSED){
        camera = camera4;
        if(paused){
            scene.getObjectByName("Paused").children[0].material.opacity = opacityLevel;
            scene.getObjectByName("Paused2").children[0].material.opacity = 0;
        }
        TWO_KEY_PRESSED = false;
        camera1_ON = false;
    }
    if(JHIN_KEY_PRESSED){
        if(debug){
            camera = camera2;
            if(paused){
                scene.getObjectByName("Paused").children[0].material.opacity = 0;
                scene.getObjectByName("Paused2").children[0].material.opacity = 0;
            }
        }
        JHIN_KEY_PRESSED = false;
    }
    if(Q_KEY_PRESSED){
        scene.getObjectByName("or1").rotation.y += speed*delta;
        Q_KEY_PRESSED = !Q_KEY_PRESSED;
    }
    if(W_KEY_PRESSED){
        scene.getObjectByName("or1").rotation.y -= speed*delta;
        W_KEY_PRESSED = !W_KEY_PRESSED;
    }
    if(E_KEY_PRESSED){
        scene.getObjectByName("or2").rotation.y += speed*delta;
        E_KEY_PRESSED = !E_KEY_PRESSED;
    }
    if(R_KEY_PRESSED){
        scene.getObjectByName("or2").rotation.y -= speed*delta;
        R_KEY_PRESSED = !R_KEY_PRESSED;
    }
    if(T_KEY_PRESSED){
        scene.getObjectByName("or3").rotation.y += speed*delta;
        T_KEY_PRESSED = !T_KEY_PRESSED;
    }
    if(Y_KEY_PRESSED){
        scene.getObjectByName("or3").rotation.y -= speed*delta;
        Y_KEY_PRESSED = !Y_KEY_PRESSED;
    }
    if(D_KEY_PRESSED){
        scene.getObjectByName("main_light").visible = !scene.getObjectByName("main_light").visible;
        D_KEY_PRESSED = !D_KEY_PRESSED;
    }
    if(Z_KEY_PRESSED){
        scene.getObjectByName("h1").getObjectByName("light").visible = 
            !scene.getObjectByName("h1").getObjectByName("light").visible;
        Z_KEY_PRESSED = !Z_KEY_PRESSED;
    }
    if(X_KEY_PRESSED){
        scene.getObjectByName("h2").getObjectByName("light").visible = 
            !scene.getObjectByName("h2").getObjectByName("light").visible;
        X_KEY_PRESSED = !X_KEY_PRESSED;
    }
    if(C_KEY_PRESSED){
        scene.getObjectByName("h3").getObjectByName("light").visible = 
            !scene.getObjectByName("h3").getObjectByName("light").visible;
        C_KEY_PRESSED = !C_KEY_PRESSED;
    }
    if(SPACE_KEY_PRESSED && !paused){
        paused = true;
        SPACE_KEY_PRESSED = !SPACE_KEY_PRESSED;
        if(camera1_ON){
            scene.getObjectByName("Paused2").children[0].material.opacity = opacityLevel;
        }
        else{
            scene.getObjectByName("Paused").children[0].material.opacity = opacityLevel;
        }
    }
    else if(SPACE_KEY_PRESSED && paused){
        paused = false;
        SPACE_KEY_PRESSED = !SPACE_KEY_PRESSED;
        scene.getObjectByName("Paused").children[0].material.opacity = 0;
        scene.getObjectByName("Paused2").children[0].material.opacity = 0;
    }
    if(THREE_KEY_PRESSED && paused){
        resetScene();
        THREE_KEY_PRESSED = !THREE_KEY_PRESSED;
    }
    if(A_KEY_PRESSED){
        if(!basic_material){
            if(phong){
            changeMaterialToLambert();
            }
            else{
                changeMaterialToPhong();
            }
        }
        phong = !phong;
        A_KEY_PRESSED = !A_KEY_PRESSED;
    }
    if(S_KEY_PRESSED){
        if(!basic_material){
            changeToBasicMaterial();
        }
        else{
            if(phong){
                changeMaterialToLambert();
            }
            else{
                changeMaterialToPhong();
            }
        }
        phong = !phong;
        basic_material = !basic_material;
        S_KEY_PRESSED = !S_KEY_PRESSED;
    }

    //Display
    display();

    //requestAnimationFrame(update);
}



function display(){
    render();
}



//USED -> https://math.hws.edu/graphicsbook/c5/s2.html