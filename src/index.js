import * as THREE from 'https://cdn.skypack.dev/three@0.130.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.130.0/examples/jsm/loaders/GLTFLoader.js';


class Animation{
  constructor(width, heigth){

    this.width = width;
    this.heigth = heigth;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.light = null;
    this.animate = this.animate.bind(this)
    this.dom = null
    this.sign = null

    this._init()
  }

  _rayEventListener(){

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getObjects = () => {
      // get object
    }

    const onMouseMove = ( event ) =>{

      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components

      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera( mouse, camera );

      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects( getObjects() );
      let obj

      for ( let i = 0; i < intersects.length; i ++ ) {

        obj = Cube.find(intersects[i].object);

        if(obj){
          obj.handleMouseHover();
        }

      }
    }    

    window.addEventListener( 'mousemove', onMouseMove, false );
  }

  _resizeListener(){
    camera.aspect = this.width / this.heigth;
    camera.updateProjectionMatrix();
    renderer.setSize( this.width, this.heigth);
  }

  _tweenCamera(){

    new TWEEN.Tween(this.camera.position)
    .to({x: [5, 0, -5, 0]}, 18000)
    .onUpdate(() => {
      this.camera.lookAt(new THREE.Vector3());
      this.camera.updateProjectionMatrix();
    })
    .repeat(Infinity)
    .start()
  }

  _tweenSign(){
    // the sign will seem to appear from nothing, growing

    const rotation = new TWEEN.Tween(this.sign.rotation)
      .to({y:300}, 2500)
      .easing(TWEEN.Easing.Exponential.Out)

    const light = new TWEEN.Tween(this.light.target.position)
      .to({z:[100,0,this.light.target.position.z]}, 2500)
      .easing(TWEEN.Easing.Quintic.InOut)
    
    const main = () => {
      new TWEEN.Tween(this.sign.scale)
      .to({x:.005, y: .005, z: .005}, 2500)
      .easing(TWEEN.Easing.Elastic.Out)
      .delay(300)
      .onStart(() => {
        rotation.start();
        light.start();
      })
      .start()
    }

    main()

  }

  _eventListeners(){

  }

  _loadSign(){
    const loader = new GLTFLoader();
    const self = this

    loader.load( '../models/sign/scene.gltf', function ( gltf ) {

      self.sign = gltf.scene.children[0].children[0].children[0].children[0]
      self.sign.scale.set(.00005, .00005, .00005)
      self.sign.position.set(0, 0, 0)
      self.sign.rotation.set(0, 200, 0)
      self.sign.children[0].children[0].castShadow = true
      self.sign.children[0].children[1].castShadow = true
      self.scene.add(self.sign)

      self._tweenSign()

    }, undefined, function ( error ) {

      console.error( error );

    } );
  }

  _init(){

    const addLight = () => {

      this.light = new THREE.SpotLight( 0xffffff,0.8, 100, .5, 1, 2);
      this.light.position.set(0, 0, -10);
      this.light.target = new THREE.Object3D();
      this.light.target.position.set(0, 0, 100);
      this.light.castShadow = true;
      this.light.shadow.mapSize.width = 2048 ;
      this.light.shadow.mapSize.height = 2048;
      this.light.shadow.camera.near = 1;
      this.light.shadow.camera.far = 200;
      this.light.shadow.camera.fov = 75;
      this.scene.add( this.light );
      this.scene.add( this.light.target);

    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.heigth, 1, 1000 );
    this.camera.lookAt(new THREE.Vector3(0, 0, 50));
    this.camera.position.set(0, 0, -10);

    this.renderer = new THREE.WebGL1Renderer({antialias: true});
    this.renderer.setSize( this.width, this.heigth );
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = true;

    document.body.appendChild( this.renderer.domElement );
    
    addLight()
    // this._eventListeners()
    this._createDom()
    this._tweenCamera()
    this._loadSign()
  }


  _createDom(){
    const g = new THREE.SphereGeometry(50, 55, 55)
    const m = new THREE.MeshPhongMaterial({color: 0xffffff, side: THREE.DoubleSide})
    this.dom = new THREE.Mesh(g, m)
    this.dom.receiveShadow = true
    this.scene.add(this.dom)
  }


  animate(){
    requestAnimationFrame( this.animate ); 

    TWEEN.update();

    this.renderer.render( this.scene, this.camera );
  }
}


const a = new Animation(window.innerWidth, window.innerHeight);
a.animate();