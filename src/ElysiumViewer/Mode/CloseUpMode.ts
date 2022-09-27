import { ArcRotateCamera, Vector3 } from "babylonjs";
import {Lerp, Clamp} from "../../Utility/UtilityFunc";
import { IMode } from "./IMode";

export default class CloseUpMode implements IMode {
    name: string;
    m_camera: ArcRotateCamera;

    m_lerp_position = new Vector3(0,0.1,-1);
    m_lerp_target = new Vector3(0,1.5,0);
    m_lerp_alpha = Math.PI / 2.9;
    m_lerp_beta = 1.9;
    m_lerp_radius = 1.0;

    m_cache_position = new Vector3();
    m_cache_target = new Vector3();

    m_animation_complete_flag: boolean = false;

    m_max_radius: number = 1.8;
    m_min_radius: number = 0.5;

    constructor(name: string, camera: ArcRotateCamera) {
        this.name = name;
        this.m_camera = camera;
    }

    OnEnterState() {
        //this.m_camera.position = new Vector3(0,0.1,-1);
        //this.m_camera.target = new Vector3(0,1.5,0);
        // this.m_camera.alpha = 4.3;
        // this.m_camera.beta = 1.9;
        // this.m_camera.radius = 1.2;
        this.m_cache_position = this.m_camera.position;
        this.m_cache_target = this.m_camera.target;
        this.m_animation_complete_flag = false;
    }

    OnUpdate() {
        if (!this.m_animation_complete_flag) {

            Vector3.LerpToRef(this.m_cache_position, this.m_lerp_position, 0.1, this.m_cache_position);
            Vector3.LerpToRef(this.m_cache_target, this.m_lerp_target, 0.1, this.m_cache_target);
    
            this.m_camera.alpha = Lerp(this.m_camera.alpha, this.m_lerp_alpha, 0.1);
            this.m_camera.beta = Lerp(this.m_camera.beta, this.m_lerp_beta, 0.1);
            this.m_camera.radius = Lerp(this.m_camera.radius, this.m_lerp_radius, 0.1);
            
            let diff  = Math.abs(this.m_lerp_alpha - this.m_camera.alpha);
            if (diff < 0.01)
                this.m_animation_complete_flag = true;
        }

        this.m_camera.radius = Clamp(this.m_camera.radius, this.m_min_radius, this.m_max_radius);
    }

    OnLeaveState() {
        this.m_animation_complete_flag = true;
    }

}