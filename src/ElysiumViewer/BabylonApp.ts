import  "@babylonjs/loaders/glTF";
import {Constants, Engine} from '@babylonjs/core/Engines';
import {Scene} from '@babylonjs/core/scene';
import {DirectionalLight, HemisphericLight, ShadowGenerator} from '@babylonjs/core/Lights';
import {ArcRotateCamera} from '@babylonjs/core/Cameras';
import { SceneLoader , ISceneLoaderProgressEvent, SceneLoaderAnimationGroupLoadingMode} from '@babylonjs/core/Loading';
import { GlowLayer} from '@babylonjs/core/Layers';
import {Vector3, Color4, Matrix} from '@babylonjs/core/Maths';
import { AbstractMesh, Mesh, MeshBuilder, TransformNode } from "@babylonjs/core/Meshes";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";
import { HDRCubeTexture, Texture } from "@babylonjs/core/Materials/Textures";
import { Effect } from "@babylonjs/core/Materials/effect";
import { BackgroundMaterial } from "@babylonjs/core/Materials/Background";
import { PostProcess, PostProcessOptions } from "@babylonjs/core/PostProcesses/postProcess";

import WebglUtility from '../Utility/WebglUtility';
import { IMode, ModeEnum, FaceCloseUpLerpStruct, FreeStyleLerpStruct } from "./Mode/IMode";
import FreeStyleMode from "./Mode/FreeStyleMode";
import CloseUpMode from "./Mode/CloseUpMode";
import EventSystem from "../Utility/EventSystem";
import {EventTag, TexturePath, MaterialParameters} from "./GeneralStaticFlag";
import AnimAssetManager from "./AnimAssetManager";
import {BackgroundPostProcessingFrag} from "../Shader/GeneralShaderStatic";
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial";
import "@babylonjs/core/Materials/Node/Blocks";
import { TextureBlock } from "@babylonjs/core/Materials/Node/Blocks";
import LoadingScreenView from "../DOM/LoadingScreenView";

export default class BabylonApp {

    private m_canvasDOM : HTMLCanvasElement;
    private m_engine : Engine;
    private m_scene : Scene;
    private m_bg_scene : Scene;
    private m_webUti : WebglUtility;

    //Modes
    private m_current_mode : IMode;
    private m_free_style_mode: FreeStyleMode;
    private m_close_up_mode: CloseUpMode;
    private m_eventSystem : EventSystem;
    private m_animAssetManager : AnimAssetManager;
    private m_mainCharMesh: AbstractMesh
    private m_postprocess: PostProcess;
    
    private m_loadingScreen : LoadingScreenView;

    public get Mode() {
        return this.m_current_mode;
    }

    public get CharacterMesh() {
        return this.m_mainCharMesh;
    }

    constructor(canvasDOM: HTMLCanvasElement, eventSystem: EventSystem) {
        let self = this;

        this.m_loadingScreen = new LoadingScreenView("Hello world");
        this.m_eventSystem = eventSystem;
        this.m_webUti = new WebglUtility();
        this.m_canvasDOM = canvasDOM;

        this.m_engine = new Engine(this.m_canvasDOM, true, {
            preserveDrawingBuffer: true 
        });    

        this.m_engine.loadingScreen = this.m_loadingScreen;

        this.m_bg_scene = new Scene(this.m_engine);
        this.m_scene = new Scene(this.m_engine);
        this.m_animAssetManager = new AnimAssetManager(this.m_scene);
        
        this.SetBackgroundScene(this.m_bg_scene);
        this.SetFrontScene(this.m_scene);
        this.LoadEnvDDS(this.m_scene);

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

    private async SetBackgroundScene(bg_scene: Scene) {
        const self = this;

        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, Vector3.Zero(), bg_scene);
        
        Effect.ShadersStore['BackgroundFragmentShader'] = BackgroundPostProcessingFrag;
        this.m_postprocess = new PostProcess('', 'Background', [MaterialParameters.AspectRatio], [MaterialParameters.MainTex], 1, camera);
        
        this.m_postprocess.onApply = function (effect) {
            let bgTexture = new Texture(TexturePath.BG_GDN, bg_scene, false, false);

            effect.setFloat(MaterialParameters.AspectRatio, self.m_canvasDOM.clientWidth  / self.m_canvasDOM.clientHeight);
            effect.setTexture(MaterialParameters.MainTex, bgTexture);
        };

        this.m_postprocess.onSizeChanged =  function (postprocess) {
            postprocess.apply();
        };
    }

    private async SetFrontScene(scene: Scene) {
        scene.autoClear = false;
        let engine = scene.getEngine();
        //scene.clearColor = new Color4(0.38, 0.43, 0.43,  1.0);
        const cam_position = new Vector3(0, 1.8, 0);
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, cam_position, scene);

        camera.attachControl(this.m_canvasDOM, true);
        camera.wheelPrecision = 30;
        camera.wheelDeltaPercentage = 0.01;
        camera.maxZ = 20;
        camera.minZ = 0.3;

        const light = new DirectionalLight("light", new Vector3(-2, -2.1, -1), scene);
        light.position = new Vector3(3, 9, 3);
        light.intensity = 3;
        //Shadow 
        var shadowMapper = new ShadowGenerator(1024, light);

        //Ground
        var ground = MeshBuilder.CreateGround("ground1", {width: 5, height: 5}, scene);
        ground.receiveShadows = true;

        var backgroundMaterial = new BackgroundMaterial("backgroundMaterial", scene);
        backgroundMaterial.diffuseTexture = new Texture(TexturePath.TransparentGround, scene);
        backgroundMaterial.shadowLevel = 0.1;

        if (backgroundMaterial.diffuseTexture != null) {
            backgroundMaterial.diffuseTexture.hasAlpha = true;
        }

        ground.material = backgroundMaterial;

        this.m_engine.displayLoadingUI();
        let glbMesh = await this.LoadGLBFile(this.m_scene, this.m_loadingScreen);
        this.m_engine.hideLoadingUI();

        if (glbMesh != null) {
            glbMesh.rotate(new Vector3(0, 1, 0), Math.PI);

            shadowMapper.addShadowCaster(glbMesh);

            var gl = new GlowLayer("glow", scene);
            gl.intensity = 2.0;

            this.PrepareMode(camera, glbMesh);
            this.m_eventSystem.Notify(EventTag.BabylonAppReady, 1);
        }
    }

    private LoadEnvDDS(p_scene: Scene) {
        let hdrTexture = new HDRCubeTexture("./textures/adams_place_bridge_512_blur.hdr", p_scene,128, false, true, false, true);
        p_scene.environmentTexture = hdrTexture;
    }

    private async LoadGLBFile(p_scene: Scene, loaderViewCallback: LoadingScreenView) {
        //Load animation
        let animPath = "./assets/anime@idle.glb";
        await this.m_animAssetManager.LoadAnimation("anim@idle", animPath);

        let running = this.m_animAssetManager.GetAnimationAsset("anim@idle");
        let targetAnimGroup = running;

        //Load mesh
        let glbPath = "./assets/GDN-H0418-B0103-A0116-L0113-x2048.glb";
        let glbMesh = await SceneLoader.ImportMeshAsync("", glbPath, undefined, p_scene, function (progressEvent) { 
            console.log(`GLB Load ${progressEvent.loaded}, Total ${progressEvent.total}`);
            loaderViewCallback.progressUpdate(progressEvent.loaded / progressEvent.total );
        });

        console.log(glbMesh);

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
        if (this.m_bg_scene == undefined || this.m_engine == undefined) return;
        this.m_bg_scene.render();

        if (this.m_scene == undefined || this.m_engine == undefined) return;
            this.m_scene.render();

        if (this.m_current_mode != null)
            this.m_current_mode.OnUpdate();
    }
}