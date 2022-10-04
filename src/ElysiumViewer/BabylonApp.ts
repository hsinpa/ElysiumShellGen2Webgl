import  "@babylonjs/loaders/glTF";
import {Engine} from '@babylonjs/core/Engines';
import {Scene} from '@babylonjs/core/scene';
import {HemisphericLight} from '@babylonjs/core/Lights';
import {ArcRotateCamera} from '@babylonjs/core/Cameras';
import { SceneLoader , ISceneLoaderProgressEvent, SceneLoaderAnimationGroupLoadingMode} from '@babylonjs/core/Loading';
import { GlowLayer} from '@babylonjs/core/Layers';
import {Vector3, Color4, Matrix} from '@babylonjs/core/Maths';
import { AbstractMesh, TransformNode } from "@babylonjs/core/Meshes";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";

import WebglUtility from '../Utility/WebglUtility';
import { IMode, ModeEnum, FaceCloseUpLerpStruct, FreeStyleLerpStruct } from "./Mode/IMode";
import FreeStyleMode from "./Mode/FreeStyleMode";
import CloseUpMode from "./Mode/CloseUpMode";
import EventSystem from "../Utility/EventSystem";
import {EventTag} from "./GeneralStaticFlag";
import { Dictionary } from "typescript-collections";
import AnimAssetManager from "./AnimAssetManager";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";

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
    private m_animAssetManager : AnimAssetManager;
    private m_mainCharMesh: AbstractMesh

    public get Mode() {
        return this.m_current_mode;
    }

    public get CharacterMesh() {
        return this.m_mainCharMesh;
    }

    constructor(canvasDOM: HTMLCanvasElement, eventSystem: EventSystem) {
        let self = this;

        this.m_eventSystem = eventSystem;
        this.m_webUti = new WebglUtility();
        this.m_canvasDOM = canvasDOM;

        this.m_engine = new Engine(this.m_canvasDOM, true, {
            preserveDrawingBuffer: true 
        });    

        this.m_scene = new Scene(this.m_engine);
        this.m_animAssetManager = new AnimAssetManager(this.m_scene);

        this.PrepareBasicScene(this.m_scene);
        //this.PrepareTestScene(this.m_scene);

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

    public async LoadAnimation(anime_id: string, mesh: AbstractMesh) {

        let animPath = "./assets/"+anime_id;

        await this.m_animAssetManager.LoadAnimation(anime_id, animPath);

        let target_anime_group = this.m_animAssetManager.GetAnimationAsset(anime_id);

        if (target_anime_group == null)  {
            console.log("Load animation fail => anime group is not yet load");
            return;
        }

        this.m_animAssetManager.AnimeGroupTransfer(mesh, target_anime_group, anime_id + "-agroup");
    }

    private async PrepareBasicScene(scene: Scene) {

        scene.clearColor = new Color4(0.38, 0.43, 0.43,  1.0);
        const cam_position = new Vector3(0, 1.8, 0);
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, cam_position, scene);

        camera.attachControl(this.m_canvasDOM, true);
        camera.wheelPrecision = 30;
        camera.wheelDeltaPercentage = 0.01;
        camera.maxZ = 20;
        camera.minZ = 0.3;

        const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);

        let glbMesh = await this.LoadGLBFile(this.m_scene);

        if (glbMesh != null) {
           glbMesh.rotate(new Vector3(0, 1, 0), Math.PI);

            var gl = new GlowLayer("glow", scene);
            gl.intensity = 2.0;

            this.PrepareMode(camera, glbMesh);
            this.m_eventSystem.Notify(EventTag.BabylonAppReady, 1);
        }
    }

    private async LoadGLBFile(p_scene: Scene) {
        //Load animation
        let animPath = "./assets/anime@idle.glb";
        await this.m_animAssetManager.LoadAnimation("anim@idle", animPath);

        let running = this.m_animAssetManager.GetAnimationAsset("anim@idle");
        let targetAnimGroup = running;

        //Load mesh
        let glbPath = "./assets/GDN-H0418-B0103-A0116-L0113-x2048.glb";
        let glbMesh = await SceneLoader.ImportMeshAsync("", glbPath, undefined, p_scene, function (progressEvent) { 
            console.log(`GLB Load ${progressEvent.loaded}, Total ${progressEvent.total}`);
        });

        p_scene.animationPropertiesOverride = new AnimationPropertiesOverride();
        p_scene.animationPropertiesOverride.enableBlending = true;
        p_scene.animationPropertiesOverride.blendingSpeed = 0.1;
        p_scene.animationPropertiesOverride.loopMode = 1;

        let glbCharMesh = glbMesh.meshes.find(x=> x.name != "__root__");
        if (glbCharMesh != null && targetAnimGroup != null) {
            this.m_animAssetManager.AnimeGroupTransfer(glbCharMesh, targetAnimGroup, "lanternAnimGroup");
        }

        return glbCharMesh;
    }

    

    private PrepareMode(camera: ArcRotateCamera, mainCharMesh: AbstractMesh) {
        this.m_free_style_mode = new FreeStyleMode(ModeEnum.FreeStyle, camera, mainCharMesh, FreeStyleLerpStruct);
        this.m_close_up_mode = new CloseUpMode(ModeEnum.FaceCloseUp, camera, mainCharMesh, FaceCloseUpLerpStruct);
        this.m_mainCharMesh = mainCharMesh;
    }

    private RenderPipeline() {
        if (this.m_scene == undefined || this.m_engine == undefined) return;
            this.m_scene.render();

        if (this.m_current_mode != null)
            this.m_current_mode.OnUpdate();
    }
}