import * as THREE from '../plugins/Three/build/three.module.js';
import { OrbitControls } from '../plugins/Three/module/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../plugins/Three/module/jsm/loaders/GLTFLoader.js';
import { VRButton } from '../plugins/Three/module/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from '../plugins/Three/module/jsm/webxr/XRControllerModelFactory.js';
import { createText } from '../plugins/Three/module/jsm/webxr/Text2D.js';
import { RGBELoader } from '../plugins/Three/module/jsm/loaders/RGBELoader.js';
/*import { FontLoader } from '../plugins/Three/module/jsm/loaders/FontLoader.js';
import { Flow } from '../plugins/Three/module/jsm/modifiers/CurveModifier.js';
import { TextGeometry } from '../plugins/Three/module/jsm/geometries/TextGeometry.js';*/

var container;
var camera, scene, renderer;
var controller1, controller2;
var controllerGrip1, controllerGrip2;

var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();

var controls, group;
var boyMixer,robotMixer

var sky
var box,enterPageButton,enterVideoButton;

var clock = new THREE.Clock();

var videoDom = document.getElementById( 'video' );
var videoMesh

var callVideoDom = document.getElementById( 'callloading' );
var callVideoMesh

/*后台所需的参数*/
var parameter,bussiness, phoneNum='';
var numInput, numInputText;

/*四个欢迎语-全局*/
var welTip, wel1Button, wel2Button, wel3Button, wel4Button, gop2Button, prevButton

/*查询的业务*/
var businessTip, business1Button, business2Button, business3Button, business4Button, business5Button, gop1Button, gop3Button;

/*数字键盘*/
var oneButton, twoButton, threeButton, fourButton, fiveButton, sixButton, sevenButton, eightButton, nineButton, asteriskButton, zeroButton, hashButton, callButton, resetButton,callTip,backp2Button;

/*模型中需要旋转的物体组*/
var rotateList = [];

init();
animate();

function init() {

    container = document.getElementById('container');

    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x808080);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(5, 2, 30);
    //camera.layers.enable( 0 ); //参考全景视频案例中添加，layers：当摄像机的视点被渲染的时候，物体必须和当前被看到的摄像机共享至少一个层

    controls = new OrbitControls(camera, container);
    //controls.target.set(0, 1.6, 0);
    //controls.target.set(camera.position);
    controls.update();

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

    var light = new THREE.DirectionalLight(0x1a69ec,0.5);
    light.position.set(0, 1, 0);
    light.castShadow = true;
    /*light.shadow.camera.top = 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = -2;
    light.shadow.mapSize.set(4096, 4096);*/
    scene.add(light);

    var point = new THREE.PointLight(0xffffff, 1, 100);
    point.position.set(0, 0, 0);
    //scene.add(point);

    /*可点击群组*/
    group = new THREE.Group();
    scene.add(group);

    // 加载场景、模型
    addSky()
    initEnterPage()
    initPageOne()
    initPageTwo()
    initPageThree()

    loadModel()
    loadingCallAnimate()
    /*旋转文字*/
    //initRotateText()

    //loadAnimate()
    //loadVideo()

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    // controllers

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

    var line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    window.addEventListener('resize', onWindowResize, false);

}

function addSky() {
    /*sky = new THREE.CubeTextureLoader()
        .setPath('../images/sky/')
        .load([
            'right.jpg', //右(-1,0,0)
            'left.jpg', //左(1,0,0)
            'up.jpg', //上(0,1,0)
            'down.jpg', //下(0,-1,0)
            'front.jpg', //前(0,0,1)
            'back.jpg' //后(0,0,-1)
        ]);
    scene.background = sky*/

    var geom = new THREE.SphereBufferGeometry(200, 200, 200)//创建球体
    //var geom = new THREE.SphereBufferGeometry(200, 200, 200)//创建球体

    var texture = new RGBELoader().load('../images/sky/scenery2.hdr')//加载hdr资源
    texture.encoding = THREE.RGBEEncoding;//设置编码属性的值，注：加载jpg时需要去掉这行
    texture.minFilter = THREE.NearestFilter;//当一个纹素覆盖小于一个像素时，贴图将如何采样
    texture.magFilter = THREE.NearestFilter;//当一个纹素覆盖大于一个像素时，贴图将如何采样
    texture.flipY = true;//翻转图像的Y轴以匹配WebGL纹理坐标空间

    //var texture = new THREE.TextureLoader().load('../images/sky/garden.jpg')//加载jpg资源方式

    var mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    var mesh = new THREE.Mesh(geom, mat)
    scene.add(mesh)

}

function initWelcome() {
    /*box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 0.5, 0.6),
        new THREE.MeshStandardMaterial({  //物理材质
            color: 0x000000,
        })
    );
    box.name = 'welcome'
    box.position.set(-6,2,-1);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box)*/

    box = makeButtonMesh( 5, 1, 0.01, 0xffffff, 0.5 );
    const boxButtonText = createText( '欢迎体验科大国创VR智能客服', 0.3 );
    boxButtonText.position.set( 0, 0, 0.01 );
    box.add( boxButtonText );
    box.position.set( -7.41, 0.5, -0.1 );
    box.name = "welcome"
    box.rotateY(Math.PI / 2)
    group.add(box);

}

function initVideo(){
    //video.style.visibility ="hidden";
    //video.play();

    var texture = new THREE.Texture( videoDom );
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.format = THREE.RGBFormat;

    setInterval( function () {
        if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
            texture.needsUpdate = true;
        }
    }, 1000 / 24 );

    // left
    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    // 反转x轴上的几何图形，使所有面都指向内部
    geometry.scale( - 1, 1, 1 );

    var uvs = geometry.attributes.uv.array;
    for ( var i = 0; i < uvs.length; i += 2 ) {
        uvs[ i ] *= 0.5;
    }

    var material = new THREE.MeshBasicMaterial( { map: texture } );

    videoMesh = new THREE.Mesh( geometry, material );
    videoMesh.rotation.y = - Math.PI / 2;
    videoMesh.layers.set( 1 ); // display in left eye only
    videoMesh.visible = false
    scene.add( videoMesh );

    // right
    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    geometry.scale( - 1, 1, 1 );

    var uvs = geometry.attributes.uv.array;

    for ( var i = 0; i < uvs.length; i += 2 ) {
        uvs[ i ] *= 0.5;
        uvs[ i ] += 0.5;
    }

    var material = new THREE.MeshBasicMaterial( { map: texture } );

    videoMesh = new THREE.Mesh( geometry, material );
    videoMesh.rotation.y = - Math.PI / 2;
    videoMesh.layers.set( 2 ); // display in right eye only
    videoMesh.visible = false
    scene.add( videoMesh );
}

function initEnterPage(){
    /*视频*/
    var video = document.getElementById('video');
    var VideoTexture = new THREE.VideoTexture(video);
    VideoTexture.minFilter = THREE.LinearFilter;
    VideoTexture.magFilter = THREE.LinearFilter;
    VideoTexture.format = THREE.RGBFormat;


    var planeGeometry = new THREE.PlaneGeometry(32, 24);
    planeGeometry.rotateY(Math.PI/24)
    var material = new THREE.MeshPhongMaterial({
        map: VideoTexture
    });

    material.side = THREE.DoubleSide;

    videoMesh = new THREE.Mesh(planeGeometry, material);
    videoMesh.position.set(0, 9, -30)
    //videoMesh.rotateY(-Math.PI/1.03)
    //videoMesh.visible = false
    scene.add(videoMesh)
    /*videoDom.play();
    videoDom.muted = false;*/


    /*播放视频*/
    var enterVideoTexture = new THREE.TextureLoader().load("../images/enter_video.png");
    var enterVideoGeometry = new THREE.PlaneBufferGeometry(10.6, 2)
    var enterVideoMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: enterVideoTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    enterVideoButton = new THREE.Mesh( enterVideoGeometry,enterVideoMaterial )
    enterVideoButton.position.set( -8, -5, -30 );
    enterVideoButton.name = "enterVideo"
    group.add(enterVideoButton);

    /*立即体验*/
    var enterPageTexture = new THREE.TextureLoader().load("../images/enter_page.png");
    var enterPageGeometry = new THREE.PlaneBufferGeometry(10.6, 2)
    var enterPageMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: enterPageTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    enterPageButton = new THREE.Mesh( enterPageGeometry,enterPageMaterial )
    enterPageButton.position.set( 8, -5, -30 );
    enterPageButton.name = "enterPage"
    group.add(enterPageButton);

    //精灵对象Sprite,VR中无法使用
    /*var texture = new THREE.TextureLoader().load("../images/textures/test.png");
    var spriteMaterial = new THREE.SpriteMaterial({
        color:0xffffff,//设置精灵矩形区域颜色
        //rotation:Math.PI/4,//旋转精灵对象45度，弧度值
        map: texture,//设置精灵纹理贴图
        transparent:true,
    });
    var sprite = new THREE.Sprite(spriteMaterial); //精灵图
    sprite.scale.set(2, 2, 2);
    sprite.position.set(6, 5, 1);
    group.add(sprite);*/

    /*var texture = new THREE.TextureLoader().load("../images/textures/button.png");
    let cubeGeometry = new THREE.PlaneBufferGeometry(1, 1)
    let cubMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture,//设置纹理贴图
        depthWrite: false,
        alphaTest: 0.1
    })
    let cube = new THREE.Mesh( cubeGeometry,cubMaterial )
    cube.position.set( 0, -3, -10);
    group.add(cube)*/
}

/********欢迎语*******/
function initPageOne(){
    /*var fontLoader = new THREE.FontLoader();

    const fontMaterials = [
        new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
    ];

    fontLoader.load( '../plugins/Three/module/fonts/FZYaoTi_Regular.json', function ( font ) {
        const geometry1 = new THREE.TextGeometry( 'A：你好，欢迎致电客服小优！', {
            font: font,
            size: 0.1,
            height: 0.01, //字体深度
            /!*curveSegments: 12, //曲线控制点数
            bevelEnabled: true, //斜角
            bevelThickness: 10, //斜角的深度
            bevelSize: 8,  //斜角的大小
            bevelSegments: 5  //斜角段数 *!/
        });
        textMesh1 = new THREE.Mesh( geometry1, fontMaterials );
        textMesh1.position.set( 0, 2, 0.6 );
        textMesh1.rotateY(Math.PI / 2)
        textMesh1.name = "欢迎语一"
        textMesh1.visible = false
        group.add(textMesh1);

        /!*欢迎语二*!/
        const geometry2 = new THREE.TextGeometry( 'B：你好，欢迎致电客服小翼！', {
            font: font,
            size: 0.1,
            height: 0.01,
        });
        textMesh2 = new THREE.Mesh( geometry2, fontMaterials );
        textMesh2.position.set( 0, 1.7, 0.6 );
        textMesh2.rotateY(Math.PI / 2)
        textMesh2.name = "欢迎语二"
        textMesh2.visible = false
        group.add(textMesh2);

        /!*欢迎语三*!/
        const geometry3 = new THREE.TextGeometry( 'C：你好，欢迎致电客服小希！', {
            font: font,
            size: 0.1,
            height: 0.01,
        });
        textMesh3 = new THREE.Mesh( geometry3, fontMaterials );
        textMesh3.position.set( 0, 1.4, 0.6 );
        textMesh3.rotateY(Math.PI / 2)
        textMesh3.name = "欢迎语三"
        textMesh3.visible = false
        group.add(textMesh3);

        /!*欢迎语四*!/
        const geometry4 = new THREE.TextGeometry( 'D：你好，欢迎致电客服小创！', {
            font: font,
            size: 0.1,
            height: 0.01,
        });
        textMesh4 = new THREE.Mesh( geometry4, fontMaterials );
        textMesh4.position.set( 0, 1.1, 0.6 );
        textMesh4.rotateY(Math.PI / 2)
        textMesh4.name = "欢迎语四"
        textMesh4.visible = false
        group.add(textMesh4);

    })*/

    /*var texture = new THREE.TextureLoader().load("../images/textures/button.png");
    let cubeGeometry = new THREE.PlaneBufferGeometry(1, 1)
    let cubMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture,//设置纹理贴图
        depthWrite: false,
        alphaTest: 0.1
    })
    let cube = new THREE.Mesh( cubeGeometry,cubMaterial )
    cube.position.set( 0, -3, -10);
    group.add(cube)*/

    var welTexture = new THREE.TextureLoader().load("../images/wel_tips.png");
    var welGeometry = new THREE.PlaneBufferGeometry(24.4, 2)
    var welMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: welTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    welTip = new THREE.Mesh( welGeometry,welMaterial )
    welTip.position.set( 3, 16, -1000  );
    scene.add(welTip);

    var wel1Texture = new THREE.TextureLoader().load("../images/bg_wel.png");
    var cube1Geometry = new THREE.PlaneBufferGeometry(18, 1.8)
    var cub1Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: wel1Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    wel1Button = new THREE.Mesh( cube1Geometry,cub1Material )
    const wel1ButtonText = createText( 'A：你好，欢迎致电客服小优！', 1 );
    wel1ButtonText.position.set( 0, 0, 0.01 );
    wel1Button.add( wel1ButtonText );
    wel1Button.position.set( 0, 13, -1000 );
    wel1Button.name = "欢迎语一"
    console.log(wel1Button);
    group.add(wel1Button);

    var wel2Texture = new THREE.TextureLoader().load("../images/bg_wel.png");
    var cube2Geometry = new THREE.PlaneBufferGeometry(18, 1.8)
    var cub2Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: wel2Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    wel2Button = new THREE.Mesh( cube2Geometry,cub2Material )
    const wel2ButtonText = createText( 'B：你好，欢迎致电客服小翼！', 1 );
    wel2ButtonText.position.set( 0, 0, 0.01 );
    wel2Button.add( wel2ButtonText );
    wel2Button.position.set( 0, 10, -1000 );
    wel2Button.name = "欢迎语二"
    group.add(wel2Button);

    var wel3Texture = new THREE.TextureLoader().load("../images/bg_wel.png");
    var cube3Geometry = new THREE.PlaneBufferGeometry(18, 1.8)
    var cub3Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: wel3Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    wel3Button = new THREE.Mesh( cube3Geometry,cub3Material )
    const wel3ButtonText = createText( 'C：你好，欢迎致电客服小希！', 1 );
    wel3ButtonText.position.set( 0, 0, 0.01 );
    wel3Button.add( wel3ButtonText );
    wel3Button.position.set( 0, 7, -1000 );
    wel3Button.name = "欢迎语三"
    group.add(wel3Button);

    var wel4Texture = new THREE.TextureLoader().load("../images/bg_wel.png");
    var cube4Geometry = new THREE.PlaneBufferGeometry(18, 1.8)
    var cub4Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: wel4Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    wel4Button = new THREE.Mesh( cube4Geometry,cub4Material )
    const wel4ButtonText = createText( 'D：你好，欢迎致电客服小创！', 1 );
    wel4ButtonText.position.set( 0, 0, 0.01 );
    wel4Button.add( wel4ButtonText );
    wel4Button.position.set( 0, 4, -1000 );
    wel4Button.name = "欢迎语四"
    group.add(wel4Button);

    /*上一步按钮*/
    var prevTexture = new THREE.TextureLoader().load("../images/prev.png");
    var prevGeometry = new THREE.PlaneBufferGeometry(8, 1.8)
    var prevMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: prevTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    prevButton = new THREE.Mesh( prevGeometry,prevMaterial )
    prevButton.position.set( -5, 0, -1000 );
    prevButton.name = "govideo"
    group.add(prevButton);

    /*下一步按钮*/
    var gop2Texture = new THREE.TextureLoader().load("../images/next.png");
    var gop2Geometry = new THREE.PlaneBufferGeometry(8, 1.8)
    var gop2Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: gop2Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    gop2Button = new THREE.Mesh( gop2Geometry,gop2Material )
    gop2Button.position.set( 5, 0, -1000 );
    gop2Button.name = "gop2"
    group.add(gop2Button);

}

/*业务选择*/
function initPageTwo(){
    var businessTexture = new THREE.TextureLoader().load("../images/business_tips.png");
    var businessGeometry = new THREE.PlaneBufferGeometry(24.4, 2)
    var businessMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: businessTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    businessTip = new THREE.Mesh( businessGeometry,businessMaterial );
    businessTip.position.set( -2, 16, -1000  );
    scene.add(businessTip);

    var texture1 = new THREE.TextureLoader().load("../images/business1.png");
    var geometry1 = new THREE.PlaneBufferGeometry(8.825,5)
    var material1 = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture1,
        depthWrite: false,
        alphaTest: 0.1
    })
    business1Button = new THREE.Mesh( geometry1, material1 );
    business1Button.position.set( -10, 12, -1000 );
    business1Button.name = "业务一"
    group.add(business1Button);

    var texture2 = new THREE.TextureLoader().load("../images/business2.png");
    var geometry2 = new THREE.PlaneBufferGeometry(8.825,5)
    var material2 = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture2,
        depthWrite: false,
        alphaTest: 0.1
    })
    business2Button = new THREE.Mesh( geometry2, material2 );
    business2Button.position.set( 0, 12, -1000 );
    business2Button.name = "业务二"
    group.add(business2Button);

    var texture3 = new THREE.TextureLoader().load("../images/business3.png");
    var geometry3 = new THREE.PlaneBufferGeometry(8.825,5)
    var material3 = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture3,
        depthWrite: false,
        alphaTest: 0.1
    })
    business3Button = new THREE.Mesh( geometry3, material3 );
    business3Button.position.set( 10, 12, -1000 );
    business3Button.name = "业务三"
    group.add(business3Button);

    var texture4 = new THREE.TextureLoader().load("../images/business4.png");
    var geometry4 = new THREE.PlaneBufferGeometry(13.5, 5)
    var material4 = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture4,
        depthWrite: false,
        alphaTest: 0.1
    })
    business4Button = new THREE.Mesh( geometry4, material4 );
    business4Button.position.set( -7.5, 6, -1000 );
    business4Button.name = "业务四"
    group.add(business4Button);

    var texture5 = new THREE.TextureLoader().load("../images/business5.png");
    var geometry5 = new THREE.PlaneBufferGeometry(13.5, 5)
    var material5 = new THREE.MeshBasicMaterial({
        transparent:true,
        map: texture5,
        depthWrite: false,
        alphaTest: 0.1
    })
    business5Button = new THREE.Mesh( geometry5, material5 );
    business5Button.position.set( 7.5, 6, -1000 );
    business5Button.name = "业务五"
    group.add(business5Button);

    /*上一步按钮*/
    var gop1Texture = new THREE.TextureLoader().load("../images/prev.png");
    var gop1Geometry = new THREE.PlaneBufferGeometry(13.25, 2.5)
    var gop1Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: gop1Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    gop1Button = new THREE.Mesh( gop1Geometry,gop1Material )
    gop1Button.position.set( -7.5, 1, -1000 );
    gop1Button.name = "gop1"
    group.add(gop1Button);

    /*下一步按钮*/
    var gop3Texture = new THREE.TextureLoader().load("../images/next.png");
    var gop3Geometry = new THREE.PlaneBufferGeometry(13.25, 2.5)
    var gop3Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: gop3Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    gop3Button = new THREE.Mesh( gop3Geometry,gop3Material )
    gop3Button.position.set( 7.5, 1, -1000 );
    gop3Button.name = "gop3"
    group.add(gop3Button);
}

/*数字键盘*/
function initPageThree(){
    var callTexture = new THREE.TextureLoader().load("../images/call_tips.png");
    var callGeometry = new THREE.PlaneBufferGeometry(24.4, 2)
    var callMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: callTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    callTip = new THREE.Mesh( callGeometry,callMaterial );
    callTip.position.set( 2, 19, -1000  );
    scene.add(callTip);

    /*号码显示框*/
    var numTexture = new THREE.TextureLoader().load("../images/input.png");
    var numGeometry = new THREE.PlaneBufferGeometry(21, 2)
    var numMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: numTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    numInput = new THREE.Mesh( numGeometry,numMaterial );
    /*numInputText = createText( ' 123', 0.1 );
    numInputText.position.set( 0, 0, 0.01 );
    numInput.add( numInputText );*/
    numInput.position.set( 0, 16, -1000 );
    numInput.name = "手机号码"
    scene.add(numInput);

    var oneTexture = new THREE.TextureLoader().load("../images/num.png");
    var oneGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var oneMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: oneTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    oneButton = new THREE.Mesh( oneGeometry,oneMaterial );
    const oneButtonText = createText( '1', 2.6 );
    oneButtonText.position.set( 0, -0.2, 0.01 );
    oneButton.add( oneButtonText );
    oneButton.position.set( -5, 12.9, -1000 );
    oneButton.name = "1"
    group.add(oneButton);

    var twoTexture = new THREE.TextureLoader().load("../images/num.png");
    var twoGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var twoMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: twoTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    twoButton = new THREE.Mesh( twoGeometry,twoMaterial );
    const twoButtonText = createText( '2', 2.6 );
    twoButtonText.position.set( 0, -0.2, 0.01 );
    twoButton.add( twoButtonText );
    twoButton.position.set( 0, 12.9, -1000 );
    twoButton.name = "2"
    group.add(twoButton);

    var threeTexture = new THREE.TextureLoader().load("../images/num.png");
    var threeGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var threeMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: threeTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    threeButton = new THREE.Mesh( threeGeometry,threeMaterial );
    const threeButtonText = createText( '3', 2.6 );
    threeButtonText.position.set( 0, -0.2, 0.01 );
    threeButton.add( threeButtonText );
    threeButton.position.set( 5, 12.9, -1000 );
    threeButton.name = "3"
    group.add(threeButton);

    var fourTexture = new THREE.TextureLoader().load("../images/num.png");
    var fourGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var fourMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: fourTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    fourButton = new THREE.Mesh( fourGeometry,fourMaterial );
    const fourButtonText = createText( '4', 2.6 );
    fourButtonText.position.set( 0, -0.2, 0.01 );
    fourButton.add( fourButtonText );
    fourButton.position.set( -5, 9.2,-1000 );
    fourButton.name = "4"
    group.add(fourButton);

    var fiveTexture = new THREE.TextureLoader().load("../images/num.png");
    var fiveGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var fiveMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: fiveTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    fiveButton = new THREE.Mesh( fiveGeometry,fiveMaterial );
    const fiveButtonText = createText( '5', 2.6 );
    fiveButtonText.position.set( 0, -0.2, 0.01 );
    fiveButton.add( fiveButtonText );
    fiveButton.position.set( 0, 9.2, -1000 );
    fiveButton.name = "5"
    group.add(fiveButton);

    var sixTexture = new THREE.TextureLoader().load("../images/num.png");
    var sixGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var sixMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: sixTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    sixButton = new THREE.Mesh( sixGeometry,sixMaterial );
    const sixButtonText = createText( '6', 2.6 );
    sixButtonText.position.set( 0, -0.2, 0.01 );
    sixButton.add( sixButtonText );
    sixButton.position.set( 5, 9.2, -1000 );
    sixButton.name = "6"
    group.add(sixButton);

    var sevenTexture = new THREE.TextureLoader().load("../images/num.png");
    var sevenGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var sevenMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: sevenTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    sevenButton = new THREE.Mesh( sevenGeometry,sevenMaterial );
    const sevenButtonText = createText( '7', 2.6 );
    sevenButtonText.position.set( 0, -0.2, 0.01 );
    sevenButton.add( sevenButtonText );
    sevenButton.position.set( -5, 5.5, -1000 );
    sevenButton.name = "7"
    group.add(sevenButton);

    var eightTexture = new THREE.TextureLoader().load("../images/num.png");
    var eightGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var eightMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: eightTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    eightButton = new THREE.Mesh( eightGeometry,eightMaterial );
    const eightButtonText = createText( '8', 2.6 );
    eightButtonText.position.set( 0, -0.2, 0.01 );
    eightButton.add( eightButtonText );
    eightButton.position.set( 0, 5.5, -1000 );
    eightButton.name = "8"
    group.add(eightButton);

    var nineTexture = new THREE.TextureLoader().load("../images/num.png");
    var nineGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var nineMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: nineTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    nineButton = new THREE.Mesh( nineGeometry,nineMaterial );
    const nineButtonText = createText( '9', 2.6 );
    nineButtonText.position.set( 0, -0.2, 0.01 );
    nineButton.add( nineButtonText );
    nineButton.position.set( 5, 5.5, -1000 );
    nineButton.name = "9"
    group.add(nineButton);

    var asteriskTexture = new THREE.TextureLoader().load("../images/num.png");
    var asteriskGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var asteriskMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: asteriskTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    asteriskButton = new THREE.Mesh( asteriskGeometry,asteriskMaterial );
    const asteriskButtonText = createText( '*', 2.6 );
    asteriskButtonText.position.set( 0, -0.8, 0.02 );
    asteriskButton.add( asteriskButtonText );
    asteriskButton.position.set( -5, 1.8, -1000 );
    asteriskButton.name = "*"
    scene.add(asteriskButton);

    var zeroTexture = new THREE.TextureLoader().load("../images/num.png");
    var zeroGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var zeroMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: zeroTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    zeroButton = new THREE.Mesh( zeroGeometry,zeroMaterial );
    const zeroButtonText = createText( '0', 2.6 );
    zeroButtonText.position.set( 0, -0.2, 0.01 );
    zeroButton.add( zeroButtonText );
    zeroButton.position.set( 0, 1.8, -1000 );
    zeroButton.name = "0"
    group.add(zeroButton);

    var hashTexture = new THREE.TextureLoader().load("../images/num.png");
    var hashGeometry = new THREE.PlaneBufferGeometry(3, 3)
    var hashMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: hashTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    hashButton = new THREE.Mesh( hashGeometry,hashMaterial );
    const hashButtonText = createText( '#', 2.6 );
    hashButtonText.position.set( 0, -0.2, 0.01 );
    hashButton.add( hashButtonText );
    hashButton.position.set( 5, 1.8, -1000 );
    hashButton.name = "#"
    scene.add(hashButton);

    /*重置按钮*/
    var resetTexture = new THREE.TextureLoader().load("../images/reset.png");
    var resetGeometry = new THREE.PlaneBufferGeometry( 2 , 2 )
    var resetMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: resetTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    resetButton = new THREE.Mesh( resetGeometry,resetMaterial );
    resetButton.position.set(9, 16, -1000 );
    resetButton.name = "reset"
    group.add(resetButton);

    /*上一步*/
    var backp2Texture = new THREE.TextureLoader().load("../images/prev.png");
    var backp2Geometry = new THREE.PlaneBufferGeometry(11.66, 2.2)
    var backp2Material = new THREE.MeshBasicMaterial({
        transparent:true,
        map: backp2Texture,
        depthWrite: false,
        alphaTest: 0.1
    })
    backp2Button = new THREE.Mesh( backp2Geometry,backp2Material )
    backp2Button.position.set( -6.5, -2, -1000 );
    backp2Button.name = "backp2"
    group.add(backp2Button);


    /*立即呼叫*/
    var callTexture = new THREE.TextureLoader().load("../images/call.png");
    var callGeometry = new THREE.PlaneBufferGeometry(11.66, 2.2)
    var callMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map: callTexture,
        depthWrite: false,
        alphaTest: 0.1
    })
    callButton = new THREE.Mesh( callGeometry,callMaterial )
    callButton.position.set( 6.5, -2, -1000 );
    callButton.name = "call"
    group.add(callButton);
}

/*拨号动画*/
function loadingCallAnimate(){
    /*视频*/
    var video = document.getElementById('callloading');
    var VideoTexture = new THREE.VideoTexture(video);
    VideoTexture.minFilter = THREE.LinearFilter;
    VideoTexture.magFilter = THREE.LinearFilter;
    VideoTexture.format = THREE.RGBFormat;

    var planeGeometry = new THREE.PlaneGeometry(32, 24);
    planeGeometry.rotateY(Math.PI/24)
    var material = new THREE.MeshPhongMaterial({
        map: VideoTexture
    });
    material.side = THREE.DoubleSide;

    callVideoMesh = new THREE.Mesh(planeGeometry, material);
    callVideoMesh.position.set(0, 9, -1000)
    scene.add(callVideoMesh)
    callVideoDom.pause();
}

function makeButtonMesh( x, y, z, color, opacity ) {
    const geometry = new THREE.BoxBufferGeometry( x, y, z );
    //const material = new THREE.MeshStandardMaterial( { color: color, opacity:opacity, transparent:true } );
    const material = new THREE.MeshBasicMaterial( { color: color, opacity:opacity, transparent:true } );
    const buttonMesh = new THREE.Mesh( geometry, material );
    buttonMesh.castShadow = true;
    buttonMesh.receiveShadow = true;
    return buttonMesh;
}

function loadModel() {

    /*房屋*/
    var houseLoader = new GLTFLoader().setPath('../models/house/');
    houseLoader.load('scene.gltf', function (gltf) {
        const obj = gltf.scene
        console.log(obj);
        obj.position.set(0, -10, 0)
        obj.scale.set(0.18, 0.18, 0.18)
        obj.traverse(e => {
            if( e.name === "Podium_Cube027" ){
                e.visible = false
            }
        })
        scene.add(obj);
    });

    /*/!*主场景*!/
    loader.load('world-main.glb', function (gltf) {
        const obj = gltf.scene
        obj.position.set(0, -5, 0)
        obj.scale.set(1, 1, 1)
        //console.log(obj);
        obj.children.forEach(e => {
            if( e.name.includes('holo-ring') ){
                /!*e.material.transparent = true
                e.material.opacity = 0.5*!/
                rotateList.push( e )
            }
        })
        scene.add(obj);
    });

    /!*BOY*!/
    var boyLoader = new GLTFLoader().setPath('../models/boy/');
    boyLoader.load('scene.gltf', function (gltf) {
        const obj = gltf.scene
        obj.position.set(-25, -5, 0)
        obj.scale.set(2, 2, 2)
        obj.rotateY(Math.PI/1.2)
        scene.add(obj);

        var animations = gltf.animations;
        boyMixer = new THREE.AnimationMixer(obj);
        boyMixer.clipAction(animations[0]).play();
    });

    /!*robot*!/
    var robotLoader = new GLTFLoader().setPath('../models/robot/');
    robotLoader.load('scene.gltf', function (gltf) {
        const obj = gltf.scene
        obj.position.set(-20, -4, -14)
        obj.scale.set(2, 2, 2)
        scene.add(obj);

        var animations = gltf.animations;
        robotMixer = new THREE.AnimationMixer(obj);
        robotMixer.clipAction(animations[0]).play();
    });*/

}


/*旋转文字*/
var flow
function initRotateText(){
    const loader = new FontLoader();
    loader.load( '../plugins/Three/module/fonts/helvetiker_regular.typeface.json', function ( font ) {

        const curve = new THREE.CatmullRomCurve3(   //自定义路径曲线
            [
                //起点
                new THREE.Vector3(-10, 0, 10),
                //中间节点
                new THREE.Vector3(-5,10,-10),
                new THREE.Vector3(2, 5, -5),
                //终点
                new THREE.Vector3(10, 0, 10)
            ],
            true
        );
        curve.curveType = 'centripetal';

        const geometry = new TextGeometry('Hello three.js!', {
            font: font,
            size: 1,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        geometry.rotateX(Math.PI);

        const material = new THREE.MeshStandardMaterial( {
            color: 0x99ffff
        } );

        const objectToCurve = new THREE.Mesh( geometry, material );

        flow = new Flow( objectToCurve );
        flow.updateCurve( 0, curve );
        scene.add( flow.object3D );




    })
}

function loadAnimate() {
    var loader = new GLTFLoader();
    loader.load('../models/animate/scene.gltf', function (gltf) {

        var animations = gltf.animations;
        var obj = gltf.scene;

        obj.scale.set(0.8, 0.8, 0.8)
        obj.position.set(-6, 0.4, -2.8)
        obj.rotateY(Math.PI / 2)

        mixer = new THREE.AnimationMixer(obj);
        mixer.clipAction(animations[0]).play();

        scene.add(obj);
    });
}

function loadVideo() {
    var video = document.getElementById('video');
    var VideoTexture = new THREE.VideoTexture(video);
    VideoTexture.minFilter = THREE.LinearFilter;
    VideoTexture.magFilter = THREE.LinearFilter;
    VideoTexture.format = THREE.RGBFormat;

    var planeGeometry = new THREE.PlaneGeometry(6.4, 4);
    var material = new THREE.MeshPhongMaterial({
        map: VideoTexture
    });

    material.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(planeGeometry, material);
    mesh.position.set(-7.41, 3.1, -0.1)
    mesh.rotateY(Math.PI/2)
    scene.add(mesh)
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onSelectStart(event) {

    var controller = event.target;

    var intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        var intersection = intersections[ 0 ];

        //tempMatrix.getInverse( controller.matrixWorld );

        var object = intersection.object;
        /*object.matrix.premultiply( tempMatrix );
        object.matrix.decompose( object.position, object.quaternion, object.scale );*/


        if( object.name === '欢迎语一' ||  object.name === '欢迎语二' ||  object.name === '欢迎语三' ||  object.name === '欢迎语四'){

            wel1Button.material.map = new THREE.TextureLoader().load("../images/bg_wel.png");
            wel1Button.material.needsUpdate = true;

            wel2Button.material.map = new THREE.TextureLoader().load("../images/bg_wel.png");
            wel2Button.material.needsUpdate = true;

            wel3Button.material.map = new THREE.TextureLoader().load("../images/bg_wel.png");
            wel3Button.material.needsUpdate = true;

            wel4Button.material.map = new THREE.TextureLoader().load("../images/bg_wel.png");
            wel4Button.material.needsUpdate = true;
        }
        if( object.name === '业务一' ||  object.name === '业务二' ||  object.name === '业务三' ||  object.name === '业务四' ||  object.name === '业务五'){
            business1Button.material.map = new THREE.TextureLoader().load("../images/business1.png");
            business1Button.material.needsUpdate = true;

            business2Button.material.map = new THREE.TextureLoader().load("../images/business2.png");
            business2Button.material.needsUpdate = true;

            business3Button.material.map = new THREE.TextureLoader().load("../images/business3.png");
            business3Button.material.needsUpdate = true;

            business4Button.material.map = new THREE.TextureLoader().load("../images/business4.png");
            business4Button.material.needsUpdate = true;

            business5Button.material.map = new THREE.TextureLoader().load("../images/business5.png");
            business5Button.material.needsUpdate = true;

        }
        if( object.name === '1'|| object.name === '2' || object.name === '3' || object.name === '4' || object.name === '5' || object.name === '6' || object.name === '7' || object.name === '8' || object.name === '9' || object.name === '0' ){
            oneButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            oneButton.material.needsUpdate = true;

            twoButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            twoButton.material.needsUpdate = true;

            threeButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            threeButton.material.needsUpdate = true;

            fourButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            fourButton.material.needsUpdate = true;

            fiveButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            fiveButton.material.needsUpdate = true;

            sixButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            sixButton.material.needsUpdate = true;

            sevenButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            sevenButton.material.needsUpdate = true;

            eightButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            eightButton.material.needsUpdate = true;

            nineButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            nineButton.material.needsUpdate = true;

            zeroButton.material.map = new THREE.TextureLoader().load("../images/num.png");
            zeroButton.material.needsUpdate = true;
        }
        //if( object.material && object.material.emissive ){ object.material.emissive.b = 1; }
        //controller.add( object );

        controller.userData.selected = object;

    }

}

function onSelectEnd(event) {

    var controller = event.target;

    if ( controller.userData.selected !== undefined ) {

        var object = controller.userData.selected;
        /*object.matrix.premultiply( controller.matrixWorld );
        object.matrix.decompose( object.position, object.quaternion, object.scale );*/
        //if( object.material && object.material.emissive ){ object.material.emissive.b = 0; }
        //group.add( object );

        /*if( object.name === 'welcome' ){
            box.visible = false

            videoMesh.visible = true
            videoDom.play();
            enterPageButton.visible = true
        }else*/
        if( object.name === 'enterVideo' ){
            videoDom.play();
            videoDom.muted = false;
        }else if( object.name === 'enterPage' ){
            videoDom.pause();
            videoMesh.visible = false
            enterPageButton.visible = false
            enterVideoButton.visible = false

            /*p1*/
            welTip.position.z = -30
            wel1Button.position.z = -30
            wel2Button.position.z = -30
            wel3Button.position.z = -30
            wel4Button.position.z = -30
            gop2Button.position.z = -30
            prevButton.position.z = -30
        }else if( object.name === '欢迎语一' ){
            parameter = '欢迎语：您好，欢迎致电客服小优！'
            wel1Button.material.map = new THREE.TextureLoader().load("../images/bg_wel_on.png");
            wel1Button.material.needsUpdate = true;
        }else if( object.name === '欢迎语二' ){
            parameter = '欢迎语：您好，欢迎致电客服小翼！'
            wel2Button.material.map = new THREE.TextureLoader().load("../images/bg_wel_on.png");
            wel2Button.material.needsUpdate = true;
        }else if( object.name === '欢迎语三' ){
            parameter = '欢迎语：您好，欢迎致电客服小希！'
            object.material.map = new THREE.TextureLoader().load("../images/bg_wel_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === '欢迎语四' ){
            parameter = '欢迎语：您好，欢迎致电客服小创！'
            object.material.map = new THREE.TextureLoader().load("../images/bg_wel_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === 'govideo' ){
            videoMesh.visible = true
            videoDom.play();
            enterPageButton.visible = true
            enterVideoButton.visible = true

            /*p1*/
            welTip.position.z = -1000
            wel1Button.position.z = -1000
            wel2Button.position.z = -1000
            wel3Button.position.z = -1000
            wel4Button.position.z = -1000
            gop2Button.position.z = -1000
            prevButton.position.z = -1000
        }else if( object.name === 'gop2' ){
            /*p1*/
            welTip.position.z = -1000
            wel1Button.position.z = -1000
            wel2Button.position.z = -1000
            wel3Button.position.z = -1000
            wel4Button.position.z = -1000
            gop2Button.position.z = -1000
            prevButton.position.z = -1000

            /*p2*/
            businessTip.position.z = -30
            business1Button.position.z = -30
            business2Button.position.z = -30
            business3Button.position.z = -30
            business4Button.position.z = -30
            business5Button.position.z = -30
            gop1Button.position.z = -30
            gop3Button.position.z = -30
        }else if(object.name === '业务一'){
            bussiness = 1
            object.material.map = new THREE.TextureLoader().load("../images/business1_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === '业务二' ){
            bussiness = 2
            object.material.map = new THREE.TextureLoader().load("../images/business2_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === '业务三' ){
            bussiness = 3
            object.material.map = new THREE.TextureLoader().load("../images/business3_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === '业务四' ){
            bussiness = 4
            object.material.map = new THREE.TextureLoader().load("../images/business4_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === '业务五' ){
            bussiness = 5
            object.material.map = new THREE.TextureLoader().load("../images/business5_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === 'gop1' ){
            /*p2*/
            businessTip.position.z = -1000
            business1Button.position.z = -1000
            business2Button.position.z = -1000
            business3Button.position.z = -1000
            business4Button.position.z = -1000
            business5Button.position.z = -1000
            gop1Button.position.z = -1000
            gop3Button.position.z = -1000

            /*p1*/
            welTip.position.z = -30
            wel1Button.position.z = -30
            wel2Button.position.z = -30
            wel3Button.position.z = -30
            wel4Button.position.z = -30
            gop2Button.position.z = -30
            prevButton.position.z = -30
        }else if( object.name === 'gop3' ){
            /*p2*/
            businessTip.position.z = -1000
            business1Button.position.z = -1000
            business2Button.position.z = -1000
            business3Button.position.z = -1000
            business4Button.position.z = -1000
            business5Button.position.z = -1000
            gop1Button.position.z = -1000
            gop3Button.position.z = -1000

            /*p3*/
            numInput.position.z = -30
            oneButton.position.z = -30
            twoButton.position.z = -30
            threeButton.position.z = -30
            fourButton.position.z = -30
            fiveButton.position.z = -30
            sixButton.position.z = -30
            sevenButton.position.z = -30
            eightButton.position.z = -30
            nineButton.position.z = -30
            asteriskButton.position.z = -30
            zeroButton.position.z = -30
            hashButton.position.z = -30
            callButton.position.z = -30
            resetButton.position.z = -30
            callTip.position.z = -30
            backp2Button.position.z = -30
        }else if( object.name === 'backp2' ){
            /*p2*/
            businessTip.position.z = -30
            business1Button.position.z = -30
            business2Button.position.z = -30
            business3Button.position.z = -30
            business4Button.position.z = -30
            business5Button.position.z = -30
            gop1Button.position.z = -30
            gop3Button.position.z = -30

            /*p3*/
            numInput.position.z = -1000
            oneButton.position.z = -1000
            twoButton.position.z = -1000
            threeButton.position.z = -1000
            fourButton.position.z = -1000
            fiveButton.position.z = -1000
            sixButton.position.z = -1000
            sevenButton.position.z = -1000
            eightButton.position.z = -1000
            nineButton.position.z = -1000
            asteriskButton.position.z = -1000
            zeroButton.position.z = -1000
            hashButton.position.z = -1000
            callButton.position.z = -1000
            resetButton.position.z = -1000
            callTip.position.z = -1000
            backp2Button.position.z = -1000
        }else if( object.name === '1'|| object.name === '2' || object.name === '3' || object.name === '4' || object.name === '5' || object.name === '6' || object.name === '7' || object.name === '8' || object.name === '9' || object.name === '0' ){
            /*清空之前的内容*/
            numInput.remove( numInputText );

            /*获取新文本*/
            const txt = object.name;
            phoneNum = phoneNum.concat(txt);
            numInputText = createText( phoneNum , 2 );
            numInputText.position.set( 0, 0, 0.01 );
            numInput.add( numInputText );

            /*修改数字背景*/
            object.material.map = new THREE.TextureLoader().load("../images/num_on.png");
            object.material.needsUpdate = true;
        }else if( object.name === 'reset' ){
            numInput.remove( numInputText );
            phoneNum=''
        }else if( object.name === 'call' ){
            var result = {
                "taskId" : "629",
                "callDataCustomerName" : "张三",
                "callDataCustomerDesc" : "意向客户",
                "callDataPhoneNumber" : phoneNum,
                "callDataTemplate" : "欢迎语：你好，欢迎致电客服小创！"
            }

            $.ajax({
                type: 'post',
                data: result,
                url:"https://192.168.52.35:9443/gc-csp-ai-outbound-gateway/outCallTask/addOutboundOneVr.action?accessToken=a82e9335cbffed63d30af9294822a39a20",
                success: function (data) {
                    //console.log(589);
                }
            })


            /*p3*/
            numInput.position.z = -1000
            oneButton.position.z = -1000
            twoButton.position.z = -1000
            threeButton.position.z = -1000
            fourButton.position.z = -1000
            fiveButton.position.z = -1000
            sixButton.position.z = -1000
            sevenButton.position.z = -1000
            eightButton.position.z = -1000
            nineButton.position.z = -1000
            asteriskButton.position.z = -1000
            zeroButton.position.z = -1000
            hashButton.position.z = -1000
            callButton.position.z = -1000
            resetButton.position.z = -1000
            callTip.position.z = -1000
            backp2Button.position.z = -1000

            /*p4*/
            callVideoDom.play();
            callVideoDom.loop = 'loop'
            callVideoMesh.position.z = -30
        }
        controller.userData.selected = undefined;
    }
}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(group.children);

}

function intersectObjects(controller) {

    if (controller.userData.selected !== undefined) return;

    var line = controller.getObjectByName('line');
    var intersections = getIntersections(controller);

    if (intersections.length > 0) {

        var intersection = intersections[0];

        var object = intersection.object;
        object.scale.set(1.2,1.2,1.2)
        //if( object.material && object.material.emissive ) { object.material.emissive.r = 1; } //设置rgb通道R通道颜色
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while (intersected.length) {

        var object = intersected.pop();
        object.scale.set(1,1,1)
        //if( object.material && object.material.emissive ) {object.material.emissive.r = 0;}

    }

}

function animate() {
    renderer.setAnimationLoop(render);
    //composer1.render();
}


function render() {

    cleanIntersected();

    intersectObjects(controller1);
    intersectObjects(controller2);

    /*旋转文字动画*/
    /*if ( flow ) {
        flow.moveAlongCurve( 0.001 );
    }*/

    /*模型动画*/
    var delta = clock.getDelta();
    if (boyMixer !== undefined) {
        boyMixer.update(delta);
    }
    if (robotMixer !== undefined) {
        robotMixer.update(delta);
    }

    /*顶部圆环旋转*/
    rotateList.forEach(e => {
        e.rotateY(0.005)
    })

    renderer.render(scene, camera);

}
