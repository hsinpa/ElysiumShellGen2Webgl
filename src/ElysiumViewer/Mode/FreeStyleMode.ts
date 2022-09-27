import { ArcRotateCamera, Vector3 } from "babylonjs";
import { IMode } from "./IMode";

export default class FreeStyleMode implements IMode {
    name: string;
    m_camera: ArcRotateCamera;

    constructor(name: string, camera: ArcRotateCamera) {
        this.name = name;
        this.m_camera = camera;
    }

    OnEnterState() {
        this.m_camera.target = new Vector3(0, 0.8, 0);
        this.m_camera.alpha = Math.PI / 2;
        this.m_camera.beta = Math.PI / 2;
        this.m_camera.radius = 3;
    }

    OnUpdate() {

    }

    OnLeaveState() {
        
    }
}