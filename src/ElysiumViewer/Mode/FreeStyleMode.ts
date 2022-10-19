import { AbstractMesh } from "@babylonjs/core/Meshes";
import {ArcRotateCamera} from '@babylonjs/core/Cameras';
import {Quaternion, Vector3} from '@babylonjs/core/Maths';

import { Clamp } from "../../Utility/UtilityFunc";
import { IMode, ModeLerpHelper, ModeLerpStruct, ModeEnum } from "./IMode";

export default class FreeStyleMode implements IMode {
    tag: ModeEnum;
    m_camera: ArcRotateCamera;

    m_lerp_struct: ModeLerpStruct;
    m_lerp_helper: ModeLerpHelper;
    m_targetMesh : AbstractMesh;
    m_axis: Vector3 = new Vector3(0,1,0);

    m_trigger_count = 0; //Enable rotation after first trigger

    constructor(mode_tag: ModeEnum, camera: ArcRotateCamera, targetMesh : AbstractMesh, lerpStruct: ModeLerpStruct) {
        this.tag = mode_tag;
        this.m_camera = camera;
        this.m_targetMesh = targetMesh;
        this.m_lerp_struct = lerpStruct;
        this.m_lerp_helper = new ModeLerpHelper(lerpStruct);
    }

    Animate(enable: boolean) {
        this.m_trigger_count = (enable) ? 2 : 0;
    }

    OnEnterState() {
        this.m_trigger_count = 0;
        
        this.m_targetMesh.rotationQuaternion = Quaternion.Identity();
        this.m_targetMesh.rotate(new Vector3(0, 1, 0), Math.PI);

        this.m_lerp_helper.OnEnterState(this.m_camera);
        console.log("OnEnterState");
    }

    OnUpdate() {
        let iscomplete = this.m_lerp_helper.OnUpdate(this.m_camera);

        if (iscomplete) {
            this.m_camera.radius = Clamp(this.m_camera.radius, this.m_lerp_struct.min_camera_radius, this.m_lerp_struct.max_camera_radius);

            if (this.m_trigger_count > 1)
                this.m_targetMesh.rotate(this.m_axis, 0.002);
        }
    }

    OnLeaveState() {
        this.m_lerp_helper.Dispose();
    }

}