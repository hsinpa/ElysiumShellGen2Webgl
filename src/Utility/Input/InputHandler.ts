import { vec2, vec3 } from "gl-matrix";
import { KeycodeLookupTable, InputEventTitle } from "./KeycodeTable";

export const InputMovementType = Object.freeze({
    Up : vec2.fromValues(0, 1),
    Down : vec2.fromValues(0, -1),
    Left : vec2.fromValues(-1, 0),
    Right : vec2.fromValues(1, 0),
    Center : vec2.fromValues(0, 0),
})

export interface InputMovementCallback {
    (direction: vec2): void;
}

export interface InputMouseCallback {
    (mouse_position : number[], mouse_delta: number[]): void;
}

export interface InputMouseClickCallback {
    (state : ClickState): void;
}
  
export enum ClickState {
    Down, Up, Click
}

class InputHandler {

    private _buttonState = Object.create({});
    private _keyboardCallback : InputMovementCallback;
    private _cacheKeyboardDirection : vec2 = vec2.create();

    private _mouseClickCallback : InputMouseClickCallback;
    private isMouseDown = false;

    public deltaArray = [0, 0];
    public mousePosition = [0, 0];

    constructor() {
        this._keyboardCallback =  (direction: vec2) => {};
        this._mouseClickCallback =  (state : ClickState) => {};
    }

    public GetButtonState(actionName : string) : boolean {
        return false;
    }

    public RegisterButtonEvent(canvas : HTMLCanvasElement,  callback : InputMouseClickCallback) {
        this._mouseClickCallback = callback;
        let self = this;

        canvas.addEventListener('click', e => {
            callback(ClickState.Click);
        });

        canvas.addEventListener('pointerdown', e => {
            callback(ClickState.Down);
            this.isMouseDown = true;
        });

        canvas.addEventListener('pointerup', e => {
            this.isMouseDown = false;
            callback(ClickState.Up);
        });
    }

    public RegisterMouseMovement(canvasDom : HTMLElement, callback : InputMouseCallback) {
        //canvasDom.requestPointerLock();

        let deltaArray = [0, 0];
        let mousePosition = [0, 0];

        window.addEventListener('mousemove', e => {
            deltaArray[0] = e.movementX;
            deltaArray[1] = e.movementY;

            mousePosition[0] = e.offsetX;
            mousePosition[1] = e.offsetY;

            callback(mousePosition, deltaArray);
        });
    }

    public RegisterMovementEvent(callback : InputMovementCallback) {

        let self = this;
        this._keyboardCallback = callback;

        window.addEventListener("keydown", e => {
            let lowerCaseKey = e.key.toLowerCase();

            if (lowerCaseKey in KeycodeLookupTable) {
                this.SetKeyboardState(KeycodeLookupTable[e.key], true);
            }
        } );

        window.addEventListener("keyup", e => {
            let lowerCaseKey = e.key.toLowerCase();

            if (lowerCaseKey in KeycodeLookupTable)
                this.SetKeyboardState(KeycodeLookupTable[e.key], false);
        } );
    }

    public OnUpdate() {
        //Reset to zero
        this._cacheKeyboardDirection[0] = 0;
        this._cacheKeyboardDirection[1] = 0;
        
        if (this._buttonState.hasOwnProperty(InputEventTitle.left)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Left);
        }

        if (this._buttonState.hasOwnProperty(InputEventTitle.down)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Down);
        }

        if (this._buttonState.hasOwnProperty(InputEventTitle.right)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Right);
        }

        if (this._buttonState.hasOwnProperty(InputEventTitle.up)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Up);
        }

        if (this.isMouseDown && this._mouseClickCallback != null)
            this._mouseClickCallback(ClickState.Down);

        if (this._keyboardCallback != null)
            this._keyboardCallback(this._cacheKeyboardDirection);
    }

    private SetKeyboardState(keyCode : string, state : boolean) {
        if (state)
            this._buttonState[keyCode] = true;
        else 
            delete this._buttonState[keyCode];
    }

}

export default InputHandler;