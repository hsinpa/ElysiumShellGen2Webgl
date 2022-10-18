import {ArcRotateCamera} from '@babylonjs/core/Cameras';
import {Vector3} from '@babylonjs/core/Maths';

import { Lerp } from "../../Utility/UtilityFunc";

export interface IMode {
    tag: ModeEnum,

    OnEnterState: () => void,
    OnUpdate: () => void,
    OnLeaveState: () => void,
}

export enum ModeEnum {
    FreeStyle, FaceCloseUp
}

export interface ModeLerpStruct {
    lerp_target: Vector3,
    lerp_alpha: number,
    lerp_beta: number,
    lerp_radius: number,

    max_camera_radius: number,
    min_camera_radius: number
}

export let FreeStyleLerpStruct : ModeLerpStruct = {
    lerp_target: new Vector3(0, 2.3,0),
    lerp_alpha: Math.PI / 2.9,
    lerp_beta: Math.PI * 0.35,
    lerp_radius: 5.5,

    max_camera_radius: 10,
    min_camera_radius: 2.8,
}

export let FaceCloseUpLerpStruct : ModeLerpStruct = {
    lerp_target: new Vector3(0, 3.5,0),
    lerp_alpha: Math.PI / 2.9,
    lerp_beta: 1.9,
    lerp_radius: 2.0,

    max_camera_radius: 4.8,
    min_camera_radius: 1.5,
}

export class ModeLerpHelper {
    m_lerpStruct : ModeLerpStruct;
    m_lerpComplete: boolean;

    m_cache_position = new Vector3();
    m_cache_target = new Vector3();

    constructor(lerpStruct: ModeLerpStruct) {
        this.m_lerpStruct = lerpStruct;
        this.m_lerpComplete = false;
    }

    OnEnterState(p_camera: ArcRotateCamera) {
        this.m_cache_position = p_camera.position;
        this.m_cache_target = p_camera.target;
        this.m_lerpComplete = false;
    }

    OnUpdate(p_camera: ArcRotateCamera) {
        if (this.m_lerpComplete) return true;
        
        Vector3.LerpToRef(this.m_cache_target, this.m_lerpStruct.lerp_target, 0.15, this.m_cache_target);

        p_camera.alpha = Lerp(p_camera.alpha, this.m_lerpStruct.lerp_alpha, 0.15);
        p_camera.beta = Lerp(p_camera.beta, this.m_lerpStruct.lerp_beta, 0.15);
        p_camera.radius = Lerp(p_camera.radius, this.m_lerpStruct.lerp_radius, 0.15);
        
        let alpha_diff  = Math.abs(this.m_lerpStruct.lerp_alpha - p_camera.alpha);
        let beta_diff  = Math.abs(this.m_lerpStruct.lerp_beta - p_camera.beta);
        let radius_diff  = Math.abs(this.m_lerpStruct.lerp_radius - p_camera.radius);

        let threshold = 0.005;
        this.m_lerpComplete = alpha_diff < threshold && 
                            beta_diff < threshold && 
                            radius_diff < threshold; 

        return this.m_lerpComplete;
    }

    Dispose() {
        this.m_lerpComplete = false;
    }
}