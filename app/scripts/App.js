
import OrbitControls from "./helpers/OrbitControls.js"
import Dat from "dat-gui"
import { Stats } from "three-stats"
import Clock from "./helpers/Clock.js"
import Nebula from "./components/Nebula"
import config from "./config.js";

export default class App {

    constructor() {
        
        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.body.addEventListener("click", this.updateMousePosition.bind(this), false);
        
        this.config = config;
        this.gui = new Dat.GUI();

        // Init
        this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor ( 0xEEEEEE, 1 )
        this.container.appendChild( this.renderer.domElement );

        // Camera and control
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
        this.camera.position.set(
            config.camera.position.x, 
            config.camera.position.y, 
            config.camera.position.z
        );

        this.controls = new OrbitControls( this.camera );
        this.controls.maxZoom = 50; 
        this.controls.minZoom = 50; 
        this.mouse = new THREE.Vector2();

        


        // Init Clock
        this.clock = new Clock();
        this.stats = new Stats();
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );

    	this.scene = new THREE.Scene();
       
        this.group = new THREE.Group();
        this.group.position.x = -1000;
        this.group.position.y = -1000;
        this.group.position.z = -1000;


        this.nebula = new Nebula({
            debug: false,
            nodes: [
                {
                    count: 10000,
                    position: new THREE.Vector3(200, 200, 200)
                },
                {
                    count: 10000,
                    position: new THREE.Vector3(1800, 1800, 1800)
                },
                {
                    count: 10000,
                    position: new THREE.Vector3(1800, 200, 200)
                },
                {
                    count: 10000,
                    position: new THREE.Vector3(1500, 1800, 200)
                }
            ],
            relations: [
                [0, 1],
                [1, 2],
                [3, 1],
                [3, 0]
            ], 
            scene: this.group,
            gui: this.gui
        });



        this.scene.add( this.group );
        this.group.add( this.nebula.mesh );
        this.group.add( this.nebula.debugPlane );

        this.onWindowResize();
        this.renderer.animate( this.render.bind(this) );

        this.gui.add(this.config.world, "timeFactor", 0, 0.0001);
    }

    // -----------------------------------------

    render() {
        this.stats.begin();

        this.clock.update();
        this.nebula.render(this.clock.elapsed);
    	this.renderer.render( this.scene, this.camera );

        this.stats.end();
    }


    // -----------------------------------------
        
    updateMousePosition( event ) { 
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    onWindowResize() {
    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
}
