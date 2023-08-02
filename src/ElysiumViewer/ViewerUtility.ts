import { Vector3 } from "@babylonjs/core";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";
import { SceneLoader } from "@babylonjs/core/Loading";
import { HDRCubeTexture } from "@babylonjs/core/Materials";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import LoadingScreenView from "../DOM/LoadingScreenView";
import { Clamp, GetRelativeURL, BlobToBase64, MobileCheck } from "../Utility/UtilityFunc";
import AnimAssetManager from "./AnimAssetManager";
import GLBCharacterMesh from './GLBCharacterMesh';
import {OpenseaTraitType, TexturePath, API, OpenseaDataType, WebsiteOption, String} from './GeneralStaticFlag';

export const LoadGLBFile = async function(p_scene: Scene, path: string, loaderViewCallback: LoadingScreenView) {
        //Load mesh
        let glbPath = "./assets/test_robots/H2208IVDn-B0205IVDn-A0408IVDn-L1005IVDs-EQP06n-x2048.glb";

        console.log("LoadGLBFile \n" + path);

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

        let glbCMesh = new GLBCharacterMesh(glbMesh.meshes, 1);

        let rootMesh = glbMesh.meshes.find(x=> x.name == "__root__");
        // if (glbCharMesh != null && targetAnimGroup != null) {
        //     this.m_currentAnimation =  this.m_animAssetManager.AnimeGroupTransfer(glbCharMesh, targetAnimGroup, "lanternAnimGroup");
        // }
        
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
        hdrTexture.rotationY = Math.PI * 0.5;
        p_scene.environmentTexture = hdrTexture;
        p_scene.environmentIntensity = 2.0;
    }

    export const ParseBackgroundTexturePath = function(code: string, option : WebsiteOption) {
        try {
            let code_table : any = {
                GDN : (option.is_website) ? TexturePath.Website_GDN : TexturePath.GDN,
                IVD : (option.is_website) ? TexturePath.Website_IVD :TexturePath.IVD,
                ORC : (option.is_website) ? TexturePath.Website_ORC :TexturePath.ORC,
                OTL : (option.is_website) ? TexturePath.Website_OTL :TexturePath.OTL,
                ARC : (option.is_website) ? TexturePath.Website_ARC : TexturePath.ARC,
                TTN : (option.is_website) ? TexturePath.Website_GDN : TexturePath.TTN,
            };

            if (option.is_website && option.is_mobile) {
                code_table.GDN = TexturePath.Website_Mobile_GDN;
                code_table.IVD =  TexturePath.Website_Mobile_IVD;
                code_table.ORC =  TexturePath.Website_Mobile_ORC;
                code_table.OTL =  TexturePath.Website_Mobile_OTL;
                code_table.ARC =  TexturePath.Website_Mobile_ARC;
            }
    
            if (code in code_table) {
                console.log(code_table[code]);
                return code_table[code];
            }
        } catch {
            console.log("Background Texture Parse Error");
        }

        return TexturePath.GDN;
    }

export const ParseOpenseaMetaData = function(raw_json: any) {
    let attributes : OpenseaTraitType[] = raw_json["attributes"];    
    let code_trait = attributes.find(x=>x.trait_type == "Code").value;

    let glb_full_url = raw_json["glbIpfsCid"];
    // glb_full_url = glb_full_url.replace('ipfs://', "");

    // if (glb_full_url == "" || glb_full_url == undefined) {
    //     glb_full_url = "bafybeifgfdtkgbved373px7m73mdnz436gd6fximy5gjzum3egd23mcygm";
    // }

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

export const GetWebOptions = function() {
    let hash_string = window.location.hash;

    let questionmark_index = hash_string.indexOf("?");

    let id_string = window.location.hash.replace("#/", "");

    if (questionmark_index > 0) {
        id_string = id_string.substring(0, id_string.indexOf("?"));    
    }

    let option_string = hash_string.substring(hash_string.indexOf('?') + 1);
    let params = new URLSearchParams(option_string);

    let options : WebsiteOption = {
        id : id_string,
        mode : params.get("mode"),
        background : params.get("background"),
        is_website : params.get("mode") == String.WEBSITE_MODE,
        is_mobile : MobileCheck() || window.innerWidth < window.innerHeight,
    };

    return options;
}