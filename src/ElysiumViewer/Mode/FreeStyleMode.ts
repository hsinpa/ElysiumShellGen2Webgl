import { ArcRotateCamera, Vector3 } from "babylonjs";
import { Clamp } from "../../Utility/UtilityFunc";
import { IMode, ModeLerpHelper, ModeLerpStruct, ModeEnum } from "./IMode";

export default class FreeStyleMode implements IMode {
    tag: ModeEnum;
    m_camera: ArcRotateCamera;

    m_lerp_struct: ModeLerpStruct;
    m_lerp_helper: ModeLerpHelper;

    constructor(mode_tag: ModeEnum, camera: ArcRotateCamera, lerpStruct: ModeLerpStruct) {
        this.tag = mode_tag;
        this.m_camera = camera;
        this.m_lerp_struct = lerpStruct;
        this.m_lerp_helper = new ModeLerpHelper(lerpStruct);
    }

    OnEnterState() {
        this.m_lerp_helper.OnEnterState(this.m_camera);
    }

    OnUpdate() {
        let iscomplete = this.m_lerp_helper.OnUpdate(this.m_camera);

        if (iscomplete)
            this.m_camera.radius = Clamp(this.m_camera.radius, this.m_lerp_struct.min_camera_radius, this.m_lerp_struct.max_camera_radius);
    }

    OnLeaveState() {
        this.m_lerp_helper.Dispose();
    }

}