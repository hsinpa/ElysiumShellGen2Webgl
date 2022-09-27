import "babylonjs-loaders";
import {Engine, Scene, HemisphericLight, Vector3, ArcRotateCamera, MeshBuilder, SceneLoader} from 'babylonjs';
import WebglUtility from '../Utility/WebglUtility';

export default class BabylonApp {

    private m_canvasDOM : HTMLCanvasElement;
    private m_engine : Engine;
    private m_scene : Scene;
    private m_webUti : WebglUtility;

    constructor(canvasDOM: HTMLCanvasElement) {
        this.m_canvasDOM = canvasDOM;

        this.m_engine = new Engine(this.m_canvasDOM, true, {
            preserveDrawingBuffer: true 
        });    
        
        this.m_scene = new Scene(this.m_engine);

        this.CreateDemoScene(this.m_scene);
        this.m_webUti = new WebglUtility();
        this.LoadTestGLBFile(this.m_scene);

       this.m_engine.runRenderLoop(this.RenderPipeline.bind(this));
    }

    CreateDemoScene(scene: Scene) {
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);

        const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    
        const sphere = MeshBuilder.CreateSphere("sphere", {}, scene);
    }

    async LoadTestGLBFile(scene: Scene) {
        let glbPath = "Assets/0915_IVD_1024.glb";
        // let glbData64 = await this.m_webUti.GetGLBFile(glbPath);
        // var base64_model_content = "data:;base64," + glbData64;

        SceneLoader.Append(glbPath, undefined, scene, function (scene) { 
            // do something with the scene
        });
        
    }

    private RenderPipeline() {
        if (this.m_scene == undefined || this.m_engine == undefined) return;
        this.m_scene.render();
    }
}