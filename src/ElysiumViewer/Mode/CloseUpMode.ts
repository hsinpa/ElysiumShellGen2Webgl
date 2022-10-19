import { AbstractMesh } from "@babylonjs/core/Meshes";
import {ArcRotateCamera} from '@babylonjs/core/Cameras';
import {Vector3, Quaternion} from '@babylonjs/core/Maths';

import {Lerp, Clamp} from "../../Utility/UtilityFunc";
import { IMode, ModeLerpHelper, ModeLerpStruct, ModeEnum } from "./IMode";

export default class CloseUpMode implements IMode {
    tag: ModeEnum;
    m_camera: ArcRotateCamera;

    m_lerp_struct: ModeLerpStruct;
    m_lerp_helper: ModeLerpHelper;
    m_targetMesh : AbstractMesh;

    m_targetDirection: Quaternion;

    constructor(tag: ModeEnum, camera: ArcRotateCamera, targetMesh : AbstractMesh, lerpStruct: ModeLerpStruct) {
        this.tag = tag;
        this.m_camera = camera;
        this.m_targetMesh = targetMesh;
        this.m_lerp_struct = lerpStruct;
        this.m_lerp_helper = new ModeLerpHelper(lerpStruct);
        this.m_targetDirection = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI);
    }

    OnEnterState() {
        this.m_lerp_helper.OnEnterState(this.m_camera);
    }

    OnUpdate() {
        let iscomplete = this.m_lerp_helper.OnUpdate(this.m_camera);

        if (iscomplete)
            this.m_camera.radius = Clamp(this.m_camera.radius, this.m_lerp_struct.min_camera_radius, this.m_lerp_struct.max_camera_radius);
        else {
            if (this.m_targetMesh.rotationQuaternion)
                this.m_targetMesh.rotationQuaternion = Quaternion.Slerp(this.m_targetMesh.rotationQuaternion, this.m_targetDirection, 0.1);
        }
    }

    Animate(enable: boolean) {

    }

    OnLeaveState() {
        this.m_lerp_helper.Dispose();
    }

}