import {Engine, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder} from 'babylonjs';

export default class BabylonApp {

    private m_canvasDOM : HTMLCanvasElement;
    private m_engine : Engine;
    private m_scene : Scene;

    constructor(canvasDOM: HTMLCanvasElement) {
        this.m_canvasDOM = canvasDOM;
        this.m_engine =   new Engine(this.m_canvasDOM, true, {
            preserveDrawingBuffer: true 
        });    
        
        this.m_scene = new Scene(this.m_engine);
        this.CreateDemoScene(this.m_scene);
    }

    CreateDemoScene(scene: Scene) {
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

        // Targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // Attaches the camera to the canvas
        camera.attachControl(this.m_canvasDOM, true);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Dim the light a small amount 0 - 1
        light.intensity = 0.7;

        // Built-in 'sphere' shape.
        const sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

        // Move phere upward 1/2 its height
        sphere.position.y = 1;

        const ground = MeshBuilder.CreateGround("ground",  {width: 6, height: 6},  scene);
    }

    Render() {
        if (this.m_scene == null || this.m_engine == null) return;

        this.m_scene.render();
    }
}