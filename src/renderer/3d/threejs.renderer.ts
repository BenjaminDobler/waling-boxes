import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    BoxGeometry,
    DoubleSide,
    Group,
    IcosahedronGeometry,
    ImageUtils,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    RepeatWrapping,
    Scene,
    SphereGeometry,
    SpotLight,
    TextureLoader,
    WebGLRenderer,
    Loader,
    MeshNormalMaterial,
    CylinderGeometry,
    Box3,
    Object3D
} from 'three';
import { Wall } from './objects/wall';
import { GUI } from 'dat.gui';
import { brickColors } from '../../types';
import { createBoxWithRoundedEdges } from './utils';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

let cameraMode = 'side';

let cameraLerp = 10;

export class ThreeRenderer {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    plane: Group;
    gui;
    cylinders: Object3D[] = [];

    creature: BoxCreature;

    init(canvas, width, height) {
        this.scene = new Scene();

        const axesHelper = new AxesHelper(2000);
        this.scene.add(axesHelper);

        // Camera
        this.camera = new PerspectiveCamera(80, width / height, 0.1, 2000);
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(0, 0, 0.0);

        this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(width, height);

        var geo = new PlaneBufferGeometry(800, 100, 8, 8);
        var mat = new MeshBasicMaterial({
            color: 0xebe5e7,
            side: DoubleSide
            // wireframe: true
        });
        var ground = new Mesh(geo, mat);

        ground.position.z = 0;
        ground.position.x = 0;
        ground.position.y = 0;
        ground.rotateX(MathUtils.degToRad(90));

        this.scene.add(ground);

        const controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );

        controls.enableZoom = true;
        controls.enableKeys = false;

        const amb = new AmbientLight(0x444444);
        this.scene.add(amb);

        const light = new SpotLight(0xffffff);
        light.position.set(width / 2, height / 2, 600);
        light.castShadow = false;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 2000;
        light.shadow.camera.fov = 40;
        this.scene.add(light);

        const boxGeometry: BoxBufferGeometry = new BoxBufferGeometry(2, 10, 2);
        const boxMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x00ff00
        });

        this.creature = new BoxCreature();
        this.scene.add(this.creature.group);
    }

    render() {
        this.creature.update();

        this.renderer.render(this.scene, this.camera);
    }
}

const keyMap: any = {};

document.addEventListener('keydown', (e) => {
    if (e.key === 'c') {
        if (cameraMode === 'side') {
            cameraMode = 'behind';
        } else {
            cameraMode = 'side';
        }
    } else {
        keyMap[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    keyMap[e.key] = false;
    // if (e.key === "ArrowUp") {
    //     upSpeed += 0.1;

    // }
    // if (e.key === "ArrowDown") {
    //     upSpeed -= 0.1;

    // }

    // if (e.key === "ArrowRight") {
    //     speed += 0.1;

    // }
});

class BoxCreature {
    isWalking = false;
    body: Mesh;
    group: Group;
    leftFeet: Mesh;
    rightFeet: Mesh;
    head: Group;

    armLeft: Mesh;
    armRight: Mesh;

    tick = 0;
    speed = 0;
    rotation = 0;



    constructor() {
        this.init();
    }

    init() {
        this.group = new Group();
        const boxGeometry: BoxBufferGeometry = new BoxBufferGeometry(1, 2.5, 1);
        const boxMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0xad3525
        });
        this.body = new Mesh(boxGeometry, boxMaterial);
        this.body.position.y = 2.75;
        this.group.add(this.body);

        this.head = new Group();
        const headGeometry: BoxBufferGeometry = new BoxBufferGeometry(2, 2, 2);
        const headMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0xfdd276
        });
        const headMesh = new Mesh(headGeometry, headMaterial);
        // headMesh.position.y = 4.6;

        const eyeGeometry: BoxBufferGeometry = new BoxBufferGeometry(
            0.5,
            0.5,
            0.1
        );
        const eyeMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0xffffff
        });
        const eyeMesh = new Mesh(eyeGeometry, eyeMaterial);
        eyeMesh.position.z = 1;
        eyeMesh.position.x = -0.3;
        eyeMesh.position.y = 0.3;

        const eyeRightMesh = new Mesh(eyeGeometry, eyeMaterial);
        eyeRightMesh.position.z = 1;
        eyeRightMesh.position.x = 0.3;
        eyeRightMesh.position.y = 0.3;


        const pupilGeometry = new BoxBufferGeometry(
            0.2,
            0.2,
            0.2
        );

        const pupilMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x000000
        });
        const pupilLeft = new Mesh(pupilGeometry, pupilMaterial);
        pupilLeft.position.z = 1;
        pupilLeft.position.x = -0.2;
        pupilLeft.position.y = 0.2;

        this.head.add(pupilLeft);


        const pupilRight = new Mesh(pupilGeometry, pupilMaterial);
        pupilRight.position.z = 1;
        pupilRight.position.x = 0.2;
        pupilRight.position.y = 0.2;

        this.head.add(pupilRight);



        this.head.add(eyeRightMesh);
        this.head.add(eyeMesh);
        this.head.position.y = 4.6;


        const mouthGeometry = new BoxBufferGeometry(
            0.2,
            0.2,
            0.2
        );

        const mouthMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x000000
        });
        const mouth = new Mesh(mouthGeometry, mouthMaterial);
        mouth.position.z = 1;
        mouth.position.x = 0;
        mouth.position.y = -0.4;

        this.head.add(mouth);






        this.head.add(headMesh);

        this.group.add(this.head);





        const armGeometry: BoxBufferGeometry = new BoxBufferGeometry(
            0.5,
            1.4,
            0.5
        );
        const armMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0xfdd276
        });

        armGeometry.translate(0, -0.7, 0);
        this.armLeft = new Mesh(armGeometry, armMaterial);
        this.armLeft.position.y = 2.8;
        this.armLeft.position.x = -0.8;
        this.group.add(this.armLeft);

        this.armRight = new Mesh(armGeometry, armMaterial);
        this.armRight.position.y = 2.8;
        this.armRight.position.x = 0.8;
        this.group.add(this.armRight);

        const feetGeometry: BoxBufferGeometry = new BoxBufferGeometry(
            0.5,
            0.5,
            1.5
        );
        const feetMaterial: MeshLambertMaterial = new MeshLambertMaterial({
            color: 0x000000
        });

        this.leftFeet = new Mesh(feetGeometry.clone(), feetMaterial);
        this.group.add(this.leftFeet);

        this.rightFeet = new Mesh(feetGeometry.clone(), feetMaterial);
        this.group.add(this.leftFeet);
        this.group.add(this.rightFeet);

        this.leftFeet.position.x = -1;
        this.rightFeet.position.x = 1;
    }

    update() {
        this.tick += 0.2;

        this.isWalking = false;
        
        if (keyMap['ArrowUp']) {
            this.speed = 0.1;
            this.isWalking = true;
        } else if (keyMap['ArrowDown']) {
            this.speed = -0.1;
            this.isWalking = true;
        } else {
            this.speed = 0;
        }

        if (keyMap['ArrowLeft']) {
            // this.xSpeed = -0.1;
            this.rotation --;
            this.isWalking = true;

        } else if (keyMap['ArrowRight']) {
            //this.xSpeed = 0.1;
            this.rotation ++;
            this.isWalking = true;

        }


        //const angle = Math.atan2(this.ySpeed, this.xSpeed);
        // console.log('angle ', MathUtils.radToDeg(angle));
        this.group.rotation.y = -MathUtils.degToRad(this.rotation);

        this.group.position.x += Math.cos(MathUtils.degToRad(this.rotation + 90)) * this.speed;
        this.group.position.z += Math.sin(MathUtils.degToRad(this.rotation + 90)) * this.speed;


        // this.isWalking = this.xSpeed !==0 || this.ySpeed !==0; 

        // this.group.position.x = this.group.position.x + this.xSpeed;
        // this.group.position.z = this.group.position.z + this.ySpeed;


        if (this.isWalking) {
            this.leftFeet.position.z = Math.cos(-this.tick) * 0.4;
            this.leftFeet.position.y = 0.6 + Math.sin(-this.tick) * 0.4;
            this.rightFeet.position.z = Math.cos(-this.tick - Math.PI) * 0.4;
            this.rightFeet.position.y =
                0.6 + Math.sin(-this.tick - Math.PI) * 0.4;
            this.armLeft.rotation.x = MathUtils.degToRad(
                Math.sin(this.tick) * 20
            );
            this.armRight.rotation.x = MathUtils.degToRad(
                Math.cos(this.tick) * 20
            );

            this.head.rotation.z = MathUtils.degToRad(Math.sin(this.tick) * 4);
            this.body.position.y = 2.2 - Math.sin(this.tick) * 0.1;
        } else {
            this.leftFeet.position.y = 0.25;
            this.rightFeet.position.y = 0.25;
            this.leftFeet.position.z = 0;
            this.rightFeet.position.z = 0;

            this.body.position.y = 2.2;
            this.head.rotation.z = MathUtils.degToRad(0);

        }
    }
}



document.addEventListener('keydown', (e) => {
    keyMap[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyMap[e.key] = false;
});
