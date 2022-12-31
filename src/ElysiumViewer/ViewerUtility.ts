import { Vector3 } from "@babylonjs/core";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";
import { SceneLoader } from "@babylonjs/core/Loading";
import { HDRCubeTexture } from "@babylonjs/core/Materials";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import LoadingScreenView from "../DOM/LoadingScreenView";
import { Clamp, GetRelativeURL, BlobToBase64 } from "../Utility/UtilityFunc";
import AnimAssetManager from "./AnimAssetManager";
import GLBCharacterMesh from './GLBCharacterMesh';
import {OpenseaTraitType, TexturePath, API, OpenseaDataType} from './GeneralStaticFlag';

export const LoadGLBFile = async function(p_scene: Scene, path: string, loaderViewCallback: LoadingScreenView) {
        //Load mesh
        let glbPath = "./assets/test_robots/bafybeifgfdtkgbved373px7m73mdnz436gd6fximy5gjzum3egd23mcygm.glb";

        let glbMesh = await SceneLoader.ImportMeshAsync("", path, undefined, p_scene, function (progressEvent) { 
            progressEvent.lengthComputable
            console.log(`GLB Load ${progressEvent.loaded}, Total ${progressEvent.total}`);

            if (progressEvent.lengthComputable)
                loaderViewCallback.progressUpdate(progressEvent.loaded / progressEvent.total );
            else {
                let estimateMB = 25;
                loaderViewCallback.progressUpdate( Clamp(progressEvent.loaded / (estimateMB * 1000000), 0, 1) );
            }
        }, ".glb");

        p_scene.animationPropertiesOverride = new AnimationPropertiesOverride();
        p_scene.animationPropertiesOverride.enableBlending = true;
        p_scene.animationPropertiesOverride.blendingSpeed = 0.1;
        p_scene.animationPropertiesOverride.loopMode = 1;

        let glbCMesh = new GLBCharacterMesh(glbMesh.meshes);

        let rootMesh = glbMesh.meshes.find(x=> x.name == "__root__");
        // if (glbCharMesh != null && targetAnimGroup != null) {
        //     this.m_currentAnimation =  this.m_animAssetManager.AnimeGroupTransfer(glbCharMesh, targetAnimGroup, "lanternAnimGroup");
        // }

       // rootMesh.position =  new Vector3(0, -0.15, 0);
        
        return glbCMesh;
    }

    export const LoadAnimation = async function(animAssetManager: AnimAssetManager, anime_id: string, mesh: AbstractMesh, animationGroup : AnimationGroup) {
        if (animationGroup != null)
            animationGroup.pause();

        let animPath = "./assets/anime/"+anime_id;

        console.log(animPath);
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

    export const ParseBackgroundTexturePath = function(code: string) {
        try {
            let code_table : any = {
                GDN : TexturePath.GDN,
                IVD : TexturePath.IVD,
                ORC : TexturePath.ORC,
                OTL : TexturePath.OTL,
                ATC : TexturePath.ATC,
            };
    
            if (code in code_table) {
                return code_table[code];
            }
        } catch {
            console.log("Background Texture Parse Error");
        }

        return TexturePath.GDN;
    }

export const ParseOpenseaMetaData = function(raw_json: any) {
    console.log(raw_json);
    let attributes : OpenseaTraitType[] = raw_json["attributes"];    
    let code_trait = attributes.find(x=>x.trait_type == "Code").value;

    let glb_full_url = raw_json["glb"];
    glb_full_url = glb_full_url.replace('ipfs://', "");

    glb_full_url = API.gateway.replace(":id", glb_full_url);

    let opensea_data : OpenseaDataType = {
        glb : glb_full_url,
        code : code_trait,
        id : raw_json["tokenId"]
    };

    return opensea_data;
}

export const FetchMetaData = async function(id: string) {
    let url = API.metadata;
    let replace_url = url.replace(":id", id);
    let rawjson = await fetch(replace_url);

    return rawjson.json();
}

export const GetDomainID = function() {
    return GetRelativeURL(window.location.href);
}