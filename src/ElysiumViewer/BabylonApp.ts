import  "@babylonjs/loaders/glTF";
import {Engine} from '@babylonjs/core/Engines';
import {Scene} from '@babylonjs/core/scene';
import {Vector3, Color4, Matrix} from '@babylonjs/core/Maths';
import { Tools } from "@babylonjs/core/";
import {Clamp} from '../Utility/UtilityFunc';
import WebglUtility from '../Utility/WebglUtility';
import { IMode, ModeEnum, FaceCloseUpLerpStruct, FreeStyleLerpStruct } from "./Mode/IMode";
import FreeStyleMode from "./Mode/FreeStyleMode";
import CloseUpMode from "./Mode/CloseUpMode";
import EventSystem from "../Utility/EventSystem";
import {EventTag, TexturePath, MaterialParameters} from "./GeneralStaticFlag";
import "@babylonjs/core/Materials/Node/Blocks";
import LoadingScreenView from "../DOM/LoadingScreenView";
import { EmojiSystem } from "./EmojiSystem";
import MainSceneHandler from "./MainSceneHandler";

export default class BabylonApp {
    private m_canvasDOM : HTMLCanvasElement;
    private m_engine : Engine;
    private m_webUti : WebglUtility;

    //Modes
    private m_current_mode : IMode;
    private m_free_style_mode: FreeStyleMode;
    private m_close_up_mode: CloseUpMode;
    private m_eventSystem : EventSystem;
    private m_emojiSystem: EmojiSystem;

    private m_mainScene : MainSceneHandler;

    private m_loadingScreen : LoadingScreenView;
    private m_click_date: number;

    private m_currentAnimationFlag : boolean = true;

    public get Mode() {
        return this.m_current_mode;
    }

    public get MainScene() {
        return this.m_mainScene;
    }

    public get IsAnimateMode() {
        return this.m_currentAnimationFlag;
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

        this.m_mainScene = new MainSceneHandler(this.m_engine, this.m_canvasDOM, this.m_loadingScreen, this.m_eventSystem);
    
        this.m_engine.runRenderLoop(this.RenderPipeline.bind(this));
        window.addEventListener('resize', function () {
            self.m_engine.resize();
        });

        this.m_canvasDOM.addEventListener('pointerdown', e => {
            this.m_click_date = Date.now();
        });

        this.m_canvasDOM.addEventListener('pointerup', e => {
            if (Date.now() - this.m_click_date < 300)
                this.ProcessMousePicking();
        });

        this.m_eventSystem.ListenToEvent(EventTag.BabylonAppReady, this.OnSceneReady.bind(this));
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

    public SetAnimationMode(play: boolean, overwritestate: boolean = true) {
        if (overwritestate) this.m_currentAnimationFlag = play;

        if (play) 
            this.m_mainScene.PlayAnimation();
        else 
            this.m_mainScene.PauseAnimation();
    }

    public async TakeScreenshot() {
        return await Tools.CreateScreenshotAsync(this.m_engine, this.MainScene.Camera, 1024, "image/jpg");
    }

    private OnSceneReady() {
        this.m_emojiSystem = new EmojiSystem(this.m_mainScene.Scene);

        this.m_free_style_mode = new FreeStyleMode(ModeEnum.FreeStyle, this.m_mainScene.Camera, this.m_mainScene.CharacterMesh, FreeStyleLerpStruct);
        this.m_close_up_mode = new CloseUpMode(ModeEnum.FaceCloseUp, this.m_mainScene.Camera, this.m_mainScene.CharacterMesh, FaceCloseUpLerpStruct);
    }

    private ProcessMousePicking() {
        if (this.m_mainScene == null || this.m_mainScene.Scene == undefined || this.m_mainScene.CharacterMesh == undefined) return;

        var pickResult = this.m_mainScene.Scene.pickWithBoundingInfo( this.m_mainScene.Scene.pointerX, this.m_mainScene.Scene.pointerY, null, true);
        
        if (pickResult.hit) {
            let bounding = this.m_mainScene.CharacterMesh.getBoundingInfo();


            this.m_emojiSystem.ShowRandomEmoji(new Vector3(0, bounding.maximum.y,0 ), this.m_mainScene.CharacterMesh.absoluteRotationQuaternion);
        }
    }

    private RenderPipeline() {
        if (this.m_emojiSystem != null)
            this.m_emojiSystem.OnUpdate();

        if (this.m_mainScene != null)
            this.m_mainScene.ProcessRender();

        if (this.m_current_mode != null)
            this.m_current_mode.OnUpdate();
    }
}