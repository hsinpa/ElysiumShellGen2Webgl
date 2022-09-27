export interface IMode {
    name: string,

    OnEnterState: () => void,
    OnUpdate: () => void,
    OnLeaveState: () => void,
}

export enum ModeEnum {
    FreeStyle, FaceCloseUp
}