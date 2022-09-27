import "babylonjs-loaders";
import {Engine, Scene, HemisphericLight, Vector3, ArcRotateCamera, SceneLoader, ISceneLoaderProgressEvent, AbstractMesh} from 'babylonjs';
import WebglUtility from '../Utility/WebglUtility';
import { IMode, ModeEnum } from "./Mode/IMode";
import FreeStyleMode from "./Mode/FreeStyleMode";
import CloseUpMode from "./Mode/CloseUpMode";
import EventSystem from "../Utility/EventSystem";
import {EventTag} from "./GeneralStaticFlag";

export default class BabylonApp {

    private m_canvasDOM : HTMLCanvasElement;
    private m_engine : Engine;
    private m_scene : Scene;
    private m_webUti : WebglUtility;

    //Modes
    private m_current_mode : IMode;
    private m_free_style_mode: FreeStyleMode;
    private m_close_up_mode: CloseUpMode;
    private m_eventSystem : EventSystem;

    constructor(canvasDOM: HTMLCanvasElement, eventSystem: EventSystem) {
        let self = this;

        this.m_eventSystem = eventSystem;
        this.m_webUti = new WebglUtility();
        this.m_canvasDOM = canvasDOM;

        this.m_engine = new Engine(this.m_canvasDOM, true, {
            preserveDrawingBuffer: true 
        });    
        
        this.m_scene = new Scene(this.m_engine);

        this.PrepareBasicScene(this.m_scene);

        this.m_engine.runRenderLoop(this.RenderPipeline.bind(this));

        window.addEventListener('resize', function () {
            self.m_engine.resize();
        });
    }

    public SetMode(mode: ModeEnum) {
        switch (mode) {
            case ModeEnum.FreeStyle:
                this.m_current_mode = this.m_free_style_mode;
                this.m_current_mode.OnEnterState();
                break;

            case ModeEnum.FaceCloseUp:
                this.m_current_mode = this.m_close_up_mode;
                this.m_current_mode.OnEnterState();
                break;
        }
    }

    private async PrepareBasicScene(scene: Scene) {
        const cam_position = new Vector3(0, 0.8, 0);
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 3, cam_position, scene);

        camera.attachControl(this.m_canvasDOM, true);
        camera.wheelPrecision = 30;
        camera.wheelDeltaPercentage = 0.01;
        camera.maxZ = 20;
        camera.minZ = 0.3;

        const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);

        let glbMesh = await this.LoadTestGLBFile(this.m_scene);

        if (glbMesh != null) {
            glbMesh.rotate(new Vector3(0, 1, 0), Math.PI);
            this.PrepareMode(camera, glbMesh);
            this.m_eventSystem.Notify(EventTag.BabylonAppReady, 1);
        }
    }

    private async LoadTestGLBFile(p_scene: Scene) {
        let glbPath = "Assets/0915_IVD_1024.glb";
        // let glbData64 = await this.m_webUti.GetGLBFile(glbPath);
        // var base64_model_content = "data:;base64," + glbData64;
        let glbMesh = await SceneLoader.ImportMeshAsync("", glbPath, undefined, p_scene, function (progressEvent) { 
            console.log(`Load ${progressEvent.loaded}, Total ${progressEvent.total}`);
        });

        // for (let i = 0 ; i < glbMesh.meshes.length; i++) {
        //     console.log(glbMesh.meshes[i].name);
        // }

        return glbMesh.meshes.find(x=> x.name != "__root__");
    }

    private PrepareMode(camera: ArcRotateCamera, mainCharMesh: AbstractMesh) {
        this.m_free_style_mode = new FreeStyleMode("free_style", camera, );
        this.m_close_up_mode = new CloseUpMode("face_side", camera, );
    }

    private RenderPipeline() {
        if (this.m_scene == undefined || this.m_engine == undefined) return;
            this.m_scene.render();

        if (this.m_current_mode != null)
            this.m_current_mode.OnUpdate();
    }
}