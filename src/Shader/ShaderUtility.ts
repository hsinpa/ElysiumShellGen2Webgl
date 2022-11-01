import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials";
import {Scene} from '@babylonjs/core/scene';

export function SetMaterial(shader_name : string, raw_vert : string, raw_frag : string) {
    Effect.ShadersStore[shader_name + "VertexShader"] = raw_vert;
    Effect.ShadersStore[shader_name + "FragmentShader"] = raw_frag;
}

export function GetMaterial(shader_name : string, scene : Scene) {
    return new ShaderMaterial(
        shader_name,
        scene,
        {
          vertex: shader_name,
          fragment: shader_name,
        },
        {
          attributes: ["position", "normal", "uv"],
          uniforms: ["world", "worldViewProjection"],
        },
      );
}
