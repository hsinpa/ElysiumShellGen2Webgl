import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { ArcRotateCamera } from "@babylonjs/core/Cameras";
import { Engine } from "@babylonjs/core/Engines";
import { GlowLayer } from "@babylonjs/core/Layers";
import { DirectionalLight, ShadowGenerator } from "@babylonjs/core/Lights";
import { BackgroundMaterial, Effect, Texture } from "@babylonjs/core/Materials";
import { Color4, Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { PassPostProcess } from "@babylonjs/core/PostProcesses/passPostProcess";
import { Scene } from "@babylonjs/core/scene";
import LoadingScreenView from "../DOM/LoadingScreenView";
import {BackgroundPostProcessingFrag, ForegroundPostProcessingFrag, FrameDecorationPostProcessingFrag} from "../Shader/GeneralShaderStatic";
import EventSystem from "../Utility/EventSystem";
import AnimAssetManager from "./AnimAssetManager";
import {EventTag, TexturePath, MaterialParameters, AnimationSet} from "./GeneralStaticFlag";
import {LoadGLBFile, LoadEnvDDS, LoadAnimation} from './ViewerUtility';
import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import GLBCharacterMesh from './GLBCharacterMesh';
let FrontPostStrength: number = 0;

export default class MainSceneHandler {
    private m_backPostprocess: PostProcess;
    private m_frontPostprocess: PostProcess;
    private m_framePostprocess: PostProcess;

    private m_mainScene : Scene;
    private m_backgroundScene : Scene;
    private m_loadScreenView : LoadingScreenView;
    private m_canvasDOM: HTMLCanvasElement;
    private m_engine: Engine;
    private m_mainCam: ArcRotateCamera;
    private m_bgCam: ArcRotateCamera;

    private m_eventSystem: EventSystem;

    private m_animAssetManager : AnimAssetManager;
    private m_currentAnimation : AnimationGroup;

    private m_mainCharMesh: GLBCharacterMesh;

    private _animationSpeed: number = 1;

    public get CharacterMesh() {
        return this.m_mainCharMesh;
    }

    public get Scene() {
        return this.m_mainScene;
    }

    public get Camera() {
        return this.m_mainCam;
    }

    public get AspectRatio() {
        return this.m_canvasDOM.width / this.m_canvasDOM.height;
    }

    constructor(engine: Engine, canvasDOM: HTMLCanvasElement, loadScreenView: LoadingScreenView, eventSystem: EventSystem) {
        this.m_engine = engine;
        this.m_canvasDOM = canvasDOM;
        

        this.m_mainScene = new Scene(engine);
        this.m_backgroundScene = new Scene(engine);
        this.m_loadScreenView = loadScreenView;
        this.m_eventSystem = eventSystem;

        this.m_animAssetManager = new AnimAssetManager(this.m_mainScene);

        this.SetBackgroundScene(this.m_backgroundScene, canvasDOM.width, canvasDOM.height);
        this.SetMainScene(this.m_engine, this.m_mainScene, this.m_canvasDOM);
    }

    public async LoadAnimation(anime_id: string) {
        this.m_currentAnimation = await LoadAnimation(this.m_animAssetManager, anime_id, this.m_mainCharMesh.GetMainMesh, this.m_currentAnimation);
        this.SetAnimationSpeed(this._animationSpeed);
    }

    public PlayAnimation() {
        if (this.m_currentAnimation != null) this.m_currentAnimation.play();
    }

    public PauseAnimation() {
        if (this.m_currentAnimation != null) this.m_currentAnimation.pause();
    }

    public SetAnimationSpeed(speed : number) {
        this._animationSpeed = speed;
        if (this.m_currentAnimation != null) {
            this.m_currentAnimation.speedRatio = speed;
        }
    }

    public SetFramePostProcessingEffect(texture_path: string) {
        let self = this;

        if ((texture_path == null || texture_path == "")) {
            if (this.m_framePostprocess != null)
                this.m_framePostprocess.dispose();
            this.m_framePostprocess = null;    
            return;
        }

        let frame_tex_path = TexturePath.FrameBaseTexture + texture_path;
        var postProcess0 = new PassPostProcess("Scene copy", 1.0, this.m_bgCam);

        Effect.ShadersStore['FrameFragmentShader'] = FrameDecorationPostProcessingFrag;
        this.m_framePostprocess = new PostProcess('', 'Frame', [MaterialParameters.AspectRatio], 
                                                                    [MaterialParameters.FrameTex, MaterialParameters.BackgroundTex], 1, this.m_mainCam);

        let frameTexture = new Texture(frame_tex_path, this.m_mainScene, false, true);
        this.m_framePostprocess.onApply = function (effect) {
            effect.setTextureFromPostProcess(MaterialParameters.BackgroundTex, postProcess0);
            effect.setTexture(MaterialParameters.FrameTex, frameTexture);
            effect.setFloat(MaterialParameters.AspectRatio, self.AspectRatio);
        };
    }

    private async SetBackgroundScene(bg_scene: Scene, canvas_width: number, canvas_height: number) {
        this.m_bgCam = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, Vector3.Zero(), bg_scene);
        
        Effect.ShadersStore['BackgroundFragmentShader'] = BackgroundPostProcessingFrag;
        this.m_backPostprocess = new PostProcess('', 'Background', [MaterialParameters.AspectRatio], [MaterialParameters.MainTex], 1, this.m_bgCam);
        
        this.m_backPostprocess.onApply = function (effect) {
            let bgTexture = new Texture(TexturePath.BG_GDN, bg_scene, false, false);

            effect.setFloat(MaterialParameters.AspectRatio, canvas_width  / canvas_height);
            effect.setTexture(MaterialParameters.MainTex, bgTexture);
        };

        this.m_backPostprocess.onSizeChanged =  function (postprocess) {
            postprocess.apply();
        };
    }

    private async SetMainScene(engine: Engine, scene: Scene, canvasDOM: HTMLCanvasElement) {
        engine.displayLoadingUI();

        this.m_mainCharMesh = await LoadGLBFile(scene, this.m_loadScreenView);

        if (this.m_mainCharMesh == null) {
            console.error("Load GLB File fail");
            return;
        }

        this.m_mainCharMesh.IteratorOps((x) => x.visibility = 0 );

        await this.LoadAnimation( AnimationSet.Idle);

        this.SetFrontScene(this.m_mainCharMesh, scene, canvasDOM);

        LoadEnvDDS(scene);

        this.m_mainCharMesh.IteratorOps((x) => x.visibility = 1 );

        this.m_eventSystem.Notify(EventTag.BabylonAppReady, 1);

        await new Promise(resolve => setTimeout(resolve, 1000));

        engine.hideLoadingUI();
    }

    private SetFrontScene(glbMesh: GLBCharacterMesh, scene: Scene, canvasDOM: HTMLCanvasElement) {
        scene.autoClear = false;
        scene.clearColor = new Color4(0.0, 0.0, 0.0,  0.0);
        
        const cam_position = new Vector3(0, 1.8, 0);
        this.m_mainCam = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 30, cam_position, scene);

        this.m_mainCam.attachControl(canvasDOM, true);
        this.m_mainCam.wheelPrecision = 30;
        this.m_mainCam.wheelDeltaPercentage = 0.01;
        this.m_mainCam.maxZ = 60;
        this.m_mainCam.minZ = 5;
        this.m_mainCam.fov = 0.166;

        // let depthTex = scene.enableDepthRenderer(this.m_mainCam);
        let noiseTexture = new Texture(TexturePath.NoiseTexture, scene, false, false);

        Effect.ShadersStore['ForegroundFragmentShader'] = ForegroundPostProcessingFrag;
        this.m_frontPostprocess = new PostProcess('', 'Foreground', [MaterialParameters.Strength, MaterialParameters.AspectRatio], 
                                                                    [MaterialParameters.NoiseTex], 1, this.m_mainCam);

        this.m_frontPostprocess.onApply = function (effect) {
            effect.setTexture(MaterialParameters.NoiseTex, noiseTexture);
            effect.setFloat(MaterialParameters.AspectRatio, canvasDOM.clientWidth  / canvasDOM.clientHeight);
            effect.setFloat(MaterialParameters.Strength, FrontPostStrength);
        };

        const light = new DirectionalLight("light", new Vector3(0.3, -1, 0.55), scene);
        light.position = new Vector3(0, 11, 0);
        light.intensity = 2;

        //Shadow 
        var shadowMapper = new ShadowGenerator(1024, light);
        //shadowMapper.useBlurCloseExponentialShadowMap = true;
        shadowMapper.usePoissonSampling = true;

        glbMesh.IteratorOps(x=> {
            shadowMapper.getShadowMap().renderList.push(x);
            x.isPickable = true;
            x.receiveShadows = true;
            shadowMapper.addShadowCaster(x);
        });


        var gl = new GlowLayer("glow", scene);
        gl.intensity = 1;
    }

    private OnFrontPostProcessComplete(main_scene: Scene) {
        this.m_frontPostprocess.dispose();
        this.m_frontPostprocess = null;
        //Ground
        let ground_scale = 1.0;
        var ground = MeshBuilder.CreateGround("ground1", {width: ground_scale, height: ground_scale}, main_scene);
        ground.receiveShadows = true;
        ground.isPickable = false;
        var backgroundMaterial = new BackgroundMaterial("backgroundMaterial", main_scene);
        backgroundMaterial.diffuseTexture = new Texture(TexturePath.TransparentGround, main_scene);
        backgroundMaterial.shadowLevel = 0.1;

        if (backgroundMaterial.diffuseTexture != null) {
            backgroundMaterial.diffuseTexture.hasAlpha = true;
        }
        
        main_scene.disableDepthRenderer(this.m_mainCam);

        ground.material = backgroundMaterial;
        //Show shadow gradually
        let timer = setInterval(function() {
            ground_scale += 0.2;
            ground.scaling.set(ground_scale, ground_scale, ground_scale);

            if (ground_scale >= 5)
                clearInterval(timer);
          }, 50); 
    }

    public ProcessRender() {
        if (this.m_backgroundScene == undefined || this.m_engine == undefined) return;
            this.m_backgroundScene.render();

        if (this.m_mainScene == undefined || this.m_mainCam == null || this.m_engine == undefined) return;
            this.m_mainScene.render();

        if (this.m_frontPostprocess != null) {
            FrontPostStrength += 0.008; 
        
            if (FrontPostStrength > 1.0) {
                this.OnFrontPostProcessComplete(this.m_mainScene);
            }
        }
    }
}