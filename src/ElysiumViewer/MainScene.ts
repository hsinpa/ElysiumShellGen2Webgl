import { ArcRotateCamera } from "@babylonjs/core/Cameras";
import { Engine } from "@babylonjs/core/Engines";
import { Effect, Texture } from "@babylonjs/core/Materials";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { Scene } from "@babylonjs/core/scene";
import {BackgroundPostProcessingFrag, ForegroundPostProcessingFrag} from "../Shader/GeneralShaderStatic";
import {EventTag, TexturePath, MaterialParameters} from "./GeneralStaticFlag";

export default class MainScene {
    private m_mainCharMesh: AbstractMesh
    private m_backPostprocess: PostProcess;
    private m_frontPostprocess: PostProcess;
    private m_mainScene : Scene;
    private m_backgroundScene : Scene;

    constructor(engine: Engine, canvasDOM: HTMLCanvasElement) {
        this.m_mainScene = new Scene(engine);
        this.m_backgroundScene = new Scene(engine);

        this.SetBackgroundScene(this.m_backgroundScene, canvasDOM.width, canvasDOM.height);
    }

    private async SetBackgroundScene(bg_scene: Scene, canvas_width: number, canvas_height: number) {
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, Vector3.Zero(), bg_scene);
        
        Effect.ShadersStore['BackgroundFragmentShader'] = BackgroundPostProcessingFrag;
        this.m_backPostprocess = new PostProcess('', 'Background', [MaterialParameters.AspectRatio], [MaterialParameters.MainTex], 1, camera);
        
        this.m_backPostprocess.onApply = function (effect) {
            let bgTexture = new Texture(TexturePath.BG_GDN, bg_scene, false, false);

            effect.setFloat(MaterialParameters.AspectRatio, canvas_width  / canvas_height);
            effect.setTexture(MaterialParameters.MainTex, bgTexture);
        };

        this.m_backPostprocess.onSizeChanged =  function (postprocess) {
            postprocess.apply();
        };
    }

}