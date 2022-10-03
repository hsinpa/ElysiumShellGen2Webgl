import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import { Dictionary } from "typescript-collections";

export default class AnimAssetManager {

    private _scene: Scene;
    private _containerTable : Dictionary<string, AssetContainer>;

    constructor(scene: Scene) {
        this._scene = scene;
        this._containerTable = new Dictionary<string, AssetContainer>();
    }

    async LoadAnimation(asset_id: string, p_path: string) : Promise<boolean> {
        let loadContainer = await SceneLoader.LoadAssetContainerAsync(p_path, undefined, this._scene, function (container) {

        });

        if (loadContainer.animationGroups.length > 0) {
            loadContainer.animationGroups[0].name = asset_id;        
            this._containerTable.setValue(asset_id, loadContainer);    
        }

        return false;
    }


    GetAnimationAsset(asset_id: string) {

        if (this._containerTable.containsKey(asset_id)) {
            let selectedContainer = this._containerTable.getValue(asset_id);

            selectedContainer?.addToScene(x=> x.name == asset_id);
            //return this._scene.animationGroups[0];

            if (selectedContainer?.animationGroups != null && selectedContainer?.animationGroups.length > 0)
                return selectedContainer?.animationGroups[0];    
                
            return null;
        }

        return null;
    }

    AnimeGroupTransfer(mesh: AbstractMesh, cloneAnimeGroup: AnimationGroup, newAnimationGroupName : string) {
        var dictTable : Dictionary<string, any> = new Dictionary<string, any>();
        let newAnimGroup = new AnimationGroup(newAnimationGroupName);

        if (mesh.skeleton != null) {
            dictTable.setValue("Armature", mesh.skeleton);

            mesh.skeleton?.bones.forEach(x=> {
                let tn = x.getTransformNode();
                if (tn != null) {
                    dictTable.setValue(x.name, tn);
                    //console.log("Find part " + tn.name);
                }
            });
        }
        
        for (let import_anim of cloneAnimeGroup.targetedAnimations) {
            //console.log(import_anim.target);

            if (dictTable.containsKey(import_anim.target.name)) {
                let tn = dictTable.getValue(import_anim.target.name);
                newAnimGroup.addTargetedAnimation(import_anim.animation, tn);         
            } else {
                console.log("Lost part " + import_anim.target.name);
            }
        }
        newAnimGroup.loopAnimation = true;
        newAnimGroup.start(true, 1);

    }
}