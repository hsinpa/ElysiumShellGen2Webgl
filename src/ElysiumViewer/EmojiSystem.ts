import { Quaternion, Space, Vector3 } from '@babylonjs/core/Maths';
import { Mesh, MeshBuilder } from '@babylonjs/core/Meshes';
import {Scene} from '@babylonjs/core/scene';
import {GetRandomRange, Clamp} from '../Utility/UtilityFunc';
import {SetMaterial, GetMaterial} from '../Shader/ShaderUtility';
import {UniversalVert, EmojiFrag} from '../Shader/GeneralShaderStatic';
import {MaterialParameters} from './GeneralStaticFlag';

import { Effect } from '@babylonjs/core/Materials/effect';
import {EmojiTextureArray} from './GeneralStaticFlag';
import { ShaderMaterial, Texture } from '@babylonjs/core/Materials';
import { Engine } from '@babylonjs/core/Engines';

const EmojiShaderName = "EmojiShader";
const DeltaTime = 0.02;
const EmojiLastTime = 5000;

export class EmojiSystem {
    private m_scene : Scene;
    private m_mesh : Mesh;
    private m_shareMat: ShaderMaterial;
    private m_quad_height = 1;
    private m_quad_width = 1;

    private m_direction = 0;
    private m_mask = 0;
    private m_interval_id = 0;
    constructor(scene: Scene) {
        this.m_scene = scene;
        
        SetMaterial(EmojiShaderName, UniversalVert, EmojiFrag);
        this.m_shareMat = GetMaterial(EmojiShaderName, this.m_scene);
        this.m_shareMat.backFaceCulling = false;

        this.m_mesh = this.CreateQuadMesh(this.m_shareMat);
    }

    public ShowRandomEmoji(position: Vector3, rotation: Quaternion) {
        clearInterval(this.m_interval_id);

        this.m_interval_id = setInterval(() => {
            this.m_direction = -1;
        }, EmojiLastTime);

        if (this.m_direction == 1) return;

        this.m_direction = 1;

        position = position.addInPlaceFromFloats(0, this.m_quad_height * 0.5, 0);

        let random_index = Math.floor(GetRandomRange(0, EmojiTextureArray.length));
        let emoji_file_path = EmojiTextureArray[random_index];
        let texture = new Texture(emoji_file_path, this.m_scene, false, false);
        this.m_shareMat.setTexture(MaterialParameters.MainTex, texture);

        //this.m_mesh.material  = this.m_shareMat;
        this.m_mesh.position = position;
        this.m_mesh.rotationQuaternion = rotation;
        this.m_mesh.setEnabled(true);
    }

    public OnUpdate() {
        //if (this.m_mask <= 0 || this.m_mask >= 1) return;

        let mask = this.m_mask + (DeltaTime * this.m_direction);
        this.m_mask = Clamp(mask, 0, 1);
        this.m_shareMat.setFloat(MaterialParameters.Strength, this.m_mask);
    }

    private CreateQuadMesh(material: ShaderMaterial) {
        let mesh = MeshBuilder.CreatePlane("emoji_quad", {width: this.m_quad_width, height: this.m_quad_height}, this.m_scene);
        mesh.rotate(new Vector3(1, 0,0), Math.PI);
        mesh.material = material;

        mesh.setEnabled(false);
        return mesh;
    }
}