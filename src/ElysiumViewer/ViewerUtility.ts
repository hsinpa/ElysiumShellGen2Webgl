import { Vector3 } from "@babylonjs/core";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";
import { SceneLoader } from "@babylonjs/core/Loading";
import { HDRCubeTexture } from "@babylonjs/core/Materials";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import LoadingScreenView from "../DOM/LoadingScreenView";
import { Clamp } from "../Utility/UtilityFunc";
import AnimAssetManager from "./AnimAssetManager";
import GLBCharacterMesh from './GLBCharacterMesh';

export const LoadGLBFile = async function(p_scene: Scene, loaderViewCallback: LoadingScreenView) {
        //Load mesh
        let glbPath = "./assets/test_robots/H1317IVDs-B0117IVDs-A1017IVDs-L0117GDNs-EQP15n-x2048-APoseNoFreeze.glb";
        let glbMesh = await SceneLoader.ImportMeshAsync("", glbPath, undefined, p_scene, function (progressEvent) { 
            progressEvent.lengthComputable
            console.log(`GLB Load ${progressEvent.loaded}, Total ${progressEvent.total}`);

            if (progressEvent.lengthComputable)
                loaderViewCallback.progressUpdate(progressEvent.loaded / progressEvent.total );
            else {
                let estimateMB = 20;
                loaderViewCallback.progressUpdate( Clamp(progressEvent.loaded / (estimateMB * 1000000), 0, 1) );
            }
        });

        p_scene.animationPropertiesOverride = new AnimationPropertiesOverride();
        p_scene.animationPropertiesOverride.enableBlending = true;
        p_scene.animationPropertiesOverride.blendingSpeed = 0.1;
        p_scene.animationPropertiesOverride.loopMode = 1;

        let glbCMesh = new GLBCharacterMesh(glbMesh.meshes);

        let rootMesh = glbMesh.meshes.find(x=> x.name == "__root__");
        // if (glbCharMesh != null && targetAnimGroup != null) {
        //     this.m_currentAnimation =  this.m_animAssetManager.AnimeGroupTransfer(glbCharMesh, targetAnimGroup, "lanternAnimGroup");
        // }

        rootMesh.position =  new Vector3(0, 1.35, 0);
        
        return glbCMesh;
    }

    export const LoadAnimation = async function(animAssetManager: AnimAssetManager, anime_id: string, mesh: AbstractMesh, animationGroup : AnimationGroup) {
        if (animationGroup != null)
            animationGroup.pause();

        let animPath = "./assets/anime/"+anime_id;

        await animAssetManager.LoadAnimation(anime_id, animPath);

        let target_anime_group = animAssetManager.GetAnimationAsset(anime_id);

        if (target_anime_group == null)  {
            console.log("Load animation fail => anime group is not yet load");
            return;
        }

        return animAssetManager.AnimeGroupTransfer(mesh, target_anime_group, anime_id + "-agroup");
    }

    export const LoadEnvDDS = function(p_scene: Scene) {
        let hdrTexture = new HDRCubeTexture("./textures/adams_place_bridge_512_blur.hdr", p_scene,128, false, true, false, true);
        p_scene.environmentTexture = hdrTexture;
    }