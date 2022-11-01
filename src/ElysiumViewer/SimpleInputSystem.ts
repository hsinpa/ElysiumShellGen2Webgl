import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";

export class SimpleInputSystem {
    
    private _pointer_event: number;
    public get MousePointerEvent() {
        return this._pointer_event;
    }

    constructor(scene: Scene) {
        scene.onPointerObservable.add((eventData) => {
            this._pointer_event = eventData.type;
        });
    }
}