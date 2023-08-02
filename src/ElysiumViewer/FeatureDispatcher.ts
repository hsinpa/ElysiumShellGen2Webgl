import { BackgroundMaterial, GroundMesh, MeshBuilder, MirrorTexture, Plane, Scene, Texture } from "@babylonjs/core";
import { CustomMaterial } from "@babylonjs/materials/custom";
import { TexturePath, WebsiteOption } from "./GeneralStaticFlag";
import GLBCharacterMesh from "./GLBCharacterMesh";

export function SetPhysicsGround(weboption : WebsiteOption, scene : Scene, glbMesh: GLBCharacterMesh) : GroundMesh {
    if (weboption.is_website)
        return SetWebsiteModeGround(scene, glbMesh);

    if (!weboption.is_website)
        return SetNativeModeGround(scene);

    return null
}

const SetWebsiteModeGround = function(scene : Scene, glbMesh: GLBCharacterMesh) : GroundMesh{
        //Ground
        let ground_scale = 500.0;
        var ground = MeshBuilder.CreateGround("shader_ground", {width: ground_scale, height: ground_scale}, scene);
        //ground.position = new Vector3(0 ,-1, 0);

        ground.receiveShadows = true;
        ground.isPickable = false;
        ground.renderingGroupId = 0;

        var reflector = new Plane(0, -1, 0, -0.05);
        var backgroundMaterial = new CustomMaterial("backgroundMaterial", scene);
        // backgroundMaterial.diffuseTexture = new Texture(TexturePath.TransparentGround_02, main_scene, true);
        // backgroundMaterial.diffuseTexture.hasAlpha = true;
        backgroundMaterial.disableLighting = true;

        //Mirror
        let mirror = new MirrorTexture("mirror", 1024, scene, true);
        mirror.mirrorPlane = reflector;
        mirror.level = 1;
        mirror.blurKernel = 24;
        mirror.hasAlpha = true;
        backgroundMaterial.Fragment_Before_FragColor(`
            color.a *= reflectionColor.a * 0.5;
        `);
        
        glbMesh.IteratorOps(x=> {
            mirror.renderList.push(x);
        });
        
        backgroundMaterial.reflectionTexture = mirror;      
        ground.material = backgroundMaterial;

    return ground;
}

const SetNativeModeGround = function(scene : Scene) : GroundMesh {
    let ground_scale = 5.0;
    var ground = MeshBuilder.CreateGround("ground1", {width: ground_scale, height: ground_scale}, scene);
    ground.receiveShadows = true;
    ground.isPickable = false;
    ground.renderingGroupId = 0;

    var backgroundMaterial = new BackgroundMaterial("backgroundMaterial", scene);
    backgroundMaterial.diffuseTexture = new Texture(TexturePath.TransparentGround, scene);
    backgroundMaterial.shadowLevel = 0.1;

    if (backgroundMaterial.diffuseTexture != null) {
        backgroundMaterial.diffuseTexture.hasAlpha = true;
    }

    ground.material = backgroundMaterial;

    return ground;
}
