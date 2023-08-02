import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { ArcRotateCamera } from "@babylonjs/core/Cameras";
import { Engine } from "@babylonjs/core/Engines";
import { GlowLayer } from "@babylonjs/core/Layers";
import { AlphaState, Constants, DefaultRenderingPipeline, Plane, ShaderMaterial } from "@babylonjs/core";
import { DirectionalLight, ShadowGenerator } from "@babylonjs/core/Lights";
import { BackgroundMaterial, Effect, Texture, MirrorTexture, StandardMaterial, FresnelParameters } from "@babylonjs/core/Materials";
import { Color3, Color4, Vector3, Vector4 } from "@babylonjs/core/Maths";
import { AbstractMesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { PassPostProcess } from "@babylonjs/core/PostProcesses/passPostProcess";
import { Scene } from "@babylonjs/core/scene";
import LoadingScreenView from "../DOM/LoadingScreenView";
import {BackgroundPostProcessingFrag, FrameDecorationPostProcessingFrag} from "../Shader/GeneralShaderStatic";
import EventSystem from "../Utility/EventSystem";
import AnimAssetManager from "./AnimAssetManager";
import {EventTag, TexturePath, MaterialParameters, AnimationSet, API, String, WebsiteOption} from "./GeneralStaticFlag";
import {LoadGLBFile, LoadEnvDDS, LoadAnimation, ParseBackgroundTexturePath, GetWebOptions, FetchMetaData, ParseOpenseaMetaData} from './ViewerUtility';
import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import GLBCharacterMesh from './GLBCharacterMesh';
import {GDNMockSet} from './MockDataSet';
import {HexToRgb, MobileCheck} from '../Utility/UtilityFunc';
import {SetPhysicsGround} from "./FeatureDispatcher";

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
    private m_options : WebsiteOption;

    private _animationSpeed: number = 1;
    private _light: DirectionalLight;

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

    public get Light() { return this._light; }
    
    constructor(engine: Engine, canvasDOM: HTMLCanvasElement, options: WebsiteOption, loadScreenView: LoadingScreenView, eventSystem: EventSystem) {
        this.m_engine = engine;
        this.m_canvasDOM = canvasDOM;
        this.m_options = options;
        
        this.m_mainScene = new Scene(engine);
        this.m_backgroundScene = new Scene(engine);
        this.m_loadScreenView = loadScreenView;
        this.m_eventSystem = eventSystem;

        this.m_animAssetManager = new AnimAssetManager(this.m_mainScene);

        this.PrepareScene();
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
        this.m_framePostprocess = new PostProcess('', 'Frame', [MaterialParameters.AspectRatio, MaterialParameters.AspectRatioRevert, MaterialParameters.AlignHeightFlag], 
                                                                    [MaterialParameters.FrameTex, MaterialParameters.BackgroundTex], 1, this.m_mainCam);
        let option = this.m_options;
        let frameTexture = new Texture(frame_tex_path, this.m_mainScene, false, true);
        this.m_framePostprocess.onApply = function (effect) {
            effect.setTextureFromPostProcess(MaterialParameters.BackgroundTex, postProcess0);
            effect.setFloat(MaterialParameters.AspectRatioRevert, self.m_canvasDOM.clientHeight  / self.m_canvasDOM.clientWidth);
            effect.setTexture(MaterialParameters.FrameTex, frameTexture);
            effect.setFloat(MaterialParameters.AspectRatio, self.AspectRatio);
            effect.setInt(MaterialParameters.AlignHeightFlag, option.is_mobile ? 1 : 0);
        };
    }

    private async PrepareScene(try_count = 0) {
        let max_try_count = 5;
        this.m_engine.displayLoadingUI();

        try {
            let glb_static_link = "./assets/test_robots/test-1615.glb";
            if (this.m_options.id == "2") {
                glb_static_link = "./assets/test_robots/test-6773.glb"
            } else if (this.m_options.id == "3") {
                glb_static_link = "./assets/test_robots/test-10663.glb"
            }

            console.log("ID " + this.m_options.id);
            //let metadata = await FetchMetaData(this.m_options.id);
            //console.log(metadata);
            //let metadata = GDNMockSet;
            //let opensea_data = ParseOpenseaMetaData(metadata);

            // if (opensea_data.glb == "" || opensea_data.glb == null) {
            //     throw new Error(String.IPFS_GLB_NOT_EXIST);
            // }




            this.SetBackgroundScene(this.m_backgroundScene, "GDN");
            await this.SetMainScene(this.m_engine, this.m_mainScene, glb_static_link, this.m_canvasDOM);

            this.m_engine.hideLoadingUI();

            this.m_eventSystem.Notify(EventTag.BabylonAppDisplay);
        } 
        catch(e) {
            console.error("Fetch data error " + e);

            if (try_count >= max_try_count)
                this.m_loadScreenView.ShowMessage( String.IPFS_GLB_NOT_EXIST );
            else {
                try_count++;

                await new Promise(resolve => setTimeout(resolve, 1000));
                this.PrepareScene(try_count);
            }
        }
    }

    private async SetBackgroundScene(bg_scene: Scene, code: string) {
        this.m_bgCam = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, Vector3.Zero(), bg_scene);
        
        Effect.ShadersStore['BackgroundFragmentShader'] = BackgroundPostProcessingFrag;
        this.m_backPostprocess = new PostProcess('', 'Background', [MaterialParameters.AspectRatio, MaterialParameters.BackgroundColor, MaterialParameters.EnablePureBGColor],
                                                 [MaterialParameters.MainTex, MaterialParameters.MainBackground], 1, this.m_bgCam);
        
        let mainTexture = new Texture(ParseBackgroundTexturePath(code, this.m_options), bg_scene, true, true);
        let bgTexture = new Texture(TexturePath.Website_BG, bg_scene, true, true);

        let bgColor = HexToRgb(this.m_options.background);
        let option = this.m_options;
        let self = this;
        let fix_website_text_aspectRatio = ( 675 / 1200);

        this.m_backPostprocess.onApply = function (effect) {

            let aspect_ratio = (option.is_website) ? (fix_website_text_aspectRatio * self.AspectRatio): self.AspectRatio;

            if (option.is_website && option.is_mobile) aspect_ratio = self.AspectRatio;

            effect.setFloat(MaterialParameters.AspectRatio, aspect_ratio);
            effect.setTexture(MaterialParameters.MainTex, mainTexture);
            effect.setTexture(MaterialParameters.MainBackground, bgTexture);

            effect.setFloat(MaterialParameters.EnablePureBGColor, (bgColor != null) ? 1 : 0);

            if (bgColor != null)
                effect.setFloat3(MaterialParameters.BackgroundColor, bgColor.r, bgColor.g, bgColor.b);
        };
    }

    private async SetMainScene(engine: Engine, scene: Scene, glb_url: string, canvasDOM: HTMLCanvasElement) {
        this.m_mainCharMesh = await LoadGLBFile(scene, glb_url, this.m_loadScreenView);

        if (this.m_mainCharMesh == null) {
            console.error("Load GLB File fail");
            return;
        }

        //this.m_mainCharMesh.IteratorOps((x) => x.visibility = 0 );

        await this.LoadAnimation( AnimationSet.Idle);
        this.SetFrontScene(this.m_mainCharMesh, scene, canvasDOM);

        LoadEnvDDS(scene);

        //this.m_mainCharMesh.IteratorOps((x) => x.visibility = 1 );
        this.OnFrontPostProcessComplete(this.m_mainScene);

        this.m_eventSystem.Notify(EventTag.BabylonAppReady, 1);

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    private SetFrontScene(glbMesh: GLBCharacterMesh, scene: Scene, canvasDOM: HTMLCanvasElement) {
        scene.autoClear = false;
        scene.clearColor = new Color4(0.0, 0.0, 0.0,  0.0);
        let option = this.m_options;
        const cam_position = new Vector3(0, 5.7, 0);
        this.m_mainCam = new ArcRotateCamera("Camera", Math.PI *1.5, Math.PI / 2, 30, cam_position, scene);

        this.m_mainCam.attachControl(canvasDOM, false);
        this.m_mainCam.wheelPrecision = 30;
        this.m_mainCam.wheelDeltaPercentage = 0.01;
        this.m_mainCam.maxZ = 60;
        this.m_mainCam.minZ = 0.3;
        this.m_mainCam.fov = 0.166;

        if (option.background != null && option.is_website) {
            this.m_mainCam.position = cam_position;
        }

        if (this.m_options.is_website)
            this.m_mainCam.panningSensibility = 0;

        let engine = this.m_engine;
        let render_pipeline = new DefaultRenderingPipeline("main_renderpipeline", true, this.m_mainScene, this.m_mainScene.cameras);
        //render_pipeline.fxaaEnabled = true;
        render_pipeline.samples = MobileCheck() ? 2 : 4;

        let last_postProcess = this.m_mainCam._postProcesses[this.m_mainCam._postProcesses.length - 1];        
        this.m_backPostprocess.clearColor = new Color4(0, 0, 0, 0);
        last_postProcess.alphaMode = Constants.ALPHA_COMBINE;

        last_postProcess.onActivateObservable.add(() => {
            engine.clear(this.m_backPostprocess.clearColor, true, true);
        });

        const light = new DirectionalLight("light", new Vector3(-0.5, -1, 0.8), scene);
        light.position = new Vector3(0, 11, 0);
        light.intensity = 1.0;

        this._light = light;

        //Shadow 
        // var shadowMapper = new ShadowGenerator(1024, light);
        // shadowMapper.usePoissonSampling = true;

        glbMesh.IteratorOps(x=> {
            // shadowMapper.getShadowMap().renderList.push(x);
            x.isPickable = true;
            x.receiveShadows = true;

            // shadowMapper.addShadowCaster(x);
        });

        var gl = new GlowLayer("glow", scene);
        gl.intensity = 0.1;        
    }

    private OnFrontPostProcessComplete(main_scene: Scene) {
        //Ground
        main_scene.disableDepthRenderer(this.m_mainCam);

        let spawnGroundMesh = SetPhysicsGround(this.m_options, main_scene, this.CharacterMesh);
    }

    public ProcessRender() {
        if ( this.m_loadScreenView.visible) return;

        if (this.m_backgroundScene == undefined || this.m_engine == undefined) return;
            this.m_backgroundScene.render();

        if (this.m_mainScene == undefined || this.m_mainCam == null || this.m_engine == undefined) return;
            this.m_mainScene.render();
    }


}