import { ExtrasAsMetadata } from '@babylonjs/loaders/glTF/2.0';
import anime from 'animejs';
import 'simplebar';
import 'simplebar/dist/simplebar.css';

type SKAnimationType = {
    (s: string): void;
  };

type NormalClickEvent = { (): void; };

export default class ControlBarView {
    private _menu_flag: boolean;
    private _animation_container_flag: boolean;
    private _frame_container_flag: boolean;

    private _info_panel_flag: boolean;
    private _frame_foreground_flag: boolean;

    private _skeletonAnimationCallback: SKAnimationType;
    private _refreshBtnCallback: NormalClickEvent;
    private _stateRotateCallback: (enable: boolean) => void;
    private _screenshotBtnCallback: NormalClickEvent;
    private _animSpeedBtnCallback:  (speed: number) => void;
    private _frameBtnCallback:  (frame_name: string, is_enable : boolean) => void;

    //Side Btn or horizontal line
    private _backBtnDom : HTMLBaseElement;
    private _refreshBtnDom: HTMLBaseElement;
    private _pausePlayBtnDom: HTMLImageElement;
    private _animationBtnDom: HTMLBaseElement;
    private _bottomHoriLineDom: HTMLBaseElement;
    private _screenshotDom: HTMLBaseElement;
    private _infoDom: HTMLBaseElement;
    private _frameBtnDom: HTMLBaseElement;

    private _infoDomContainer: HTMLBaseElement;

    private _animationSpeedSet = [1, 2, 0.5];
    private _animationSpeedIndex = 0;

    private _leftCtrlBarExpandSize = 7.25;

    constructor( ) {
        this._menu_flag = false;
        this._animation_container_flag = false;

        this._infoDomContainer = document.querySelector("#tutorial_info_container");

        this.RegisterBtnEvent();
    }

    public SetCallback(skeletonAnimationCallback: SKAnimationType, stateRotateCallback: (enable: boolean) => void, refreshBtnCallback: NormalClickEvent, 
        screenshotCallback : NormalClickEvent, animSpeedCallback : (speed: number) => void, frameBtnCallback : (frame_name: string, is_enable : boolean) => void) {
        this._skeletonAnimationCallback = skeletonAnimationCallback;
        this._stateRotateCallback = stateRotateCallback;
        this._refreshBtnCallback = refreshBtnCallback;
        this._screenshotBtnCallback = screenshotCallback;
        this._animSpeedBtnCallback = animSpeedCallback;
        this._frameBtnCallback = frameBtnCallback;
    }

    public SetContainerSelectStyle(selfElement: HTMLElement, query: string) {
        let span_btn_dom = document.querySelectorAll<HTMLElement>(query);
            if (span_btn_dom != null) 
                span_btn_dom.forEach(x => {
                    x.classList.remove("selected");
                });

        selfElement.classList.add("selected");
    }

    private RegisterBtnEvent() {
        let action_btn_dom = document.querySelector("#ctrl_mode_change");
        if (action_btn_dom != null) 
            action_btn_dom.addEventListener("click", this.OnMenuBtnClick.bind(this));

        this._animationBtnDom = document.querySelector("#ctrl_animation_change");
        if (this._animationBtnDom != null) 
        this._animationBtnDom.addEventListener("click", this.OnSkeletonAnimationExpandClick.bind(this));
        
        let playpause_btn_dom = document.querySelector<HTMLImageElement>("#ctrl_play_change");
        if (playpause_btn_dom != null) {
            playpause_btn_dom.addEventListener("click", () => this.OnPlayPauseClick(playpause_btn_dom));
            this._pausePlayBtnDom = playpause_btn_dom;
        }

        this._refreshBtnDom = document.querySelector("#ctrl_refresh_change");
            if (this._refreshBtnDom != null) 
                this._refreshBtnDom.addEventListener("click", () => {
                    // let playpause_btn_dom = document.querySelector<HTMLImageElement>("#ctrl_play_change");
                    // let playSrc = playpause_btn_dom.getAttribute("pause_src");
                    // playpause_btn_dom.setAttribute("src", playSrc);
                    
                    this._refreshBtnCallback();
                });

        let span_btn_dom = document.querySelectorAll<HTMLSpanElement>(".animation_container span");
            if (span_btn_dom != null) 
                span_btn_dom.forEach(x => {
                    x.addEventListener("click", () => this.OnSkeletonAnimationSpanClick(x));
            });

        let frame_btn_doms = document.querySelectorAll<HTMLImageElement>(".frame_container img");
            if (frame_btn_doms != null) 
            frame_btn_doms.forEach(x => {
                    x.addEventListener("click", () => this.OnSingleFrameButtonClick(x));
            });
        
        this._screenshotDom = document.querySelector("#ctrl_screenshot");
        this._bottomHoriLineDom = document.querySelector("#ctrl_info_line");
        this._backBtnDom = document.querySelector("#ctrl_back_container");
        this._infoDom = document.querySelector("#ctrl_info");
        this._frameBtnDom = document.querySelector("#ctrl_frame");

        this.SetClickButtonEvent("#ctrl_screenshot", () => this._screenshotBtnCallback() );
        this.SetClickButtonEvent("#ctrl_back", () => {
            this.ResetUI();
        } );

        this.SetClickButtonEvent("#ctrl_info", this.OnInfoBtnClick.bind(this));
        this.SetClickButtonEvent("#ctrl_frame", this.OnFrameForegroundClick.bind(this));

        window.addEventListener("resize", (event) => {
            if (this._info_panel_flag) this.UpdateInfoPanelWidthRatio();
        });
        //this.SetClickButtonEvent("#ctrl_animation_speed", this.OnAnimationSpeedChange.bind(this));
    }

    private OnMenuBtnClick() {
        let menu_icon : HTMLImageElement = document.querySelector("#ctrl_mode_change");

        let closeStyle = {
            width:  this._leftCtrlBarExpandSize + 'rem',
            backgroundColor: "#000000", 
        };

        let openStyle = {
            width: '0rem',
        };

        let selectedStyle = (this._menu_flag) ? openStyle : closeStyle;
        anime(
            Object.assign(selectedStyle,
            {
                targets: '.contral_bar_canvas',
                duration: 100,
                easing: 'easeInOutQuad'
            })
        );

        this.SetIconSelectStyle(menu_icon, !this._menu_flag);

        let expand_dom = document.querySelector<HTMLBaseElement>(".control_bar_expand");
        if (expand_dom != null) expand_dom.style.display = (this._menu_flag) ? "none" : "block"; 

        this.ResetUI();

        this._menu_flag = !this._menu_flag;
    }

    private OnPlayPauseClick(dom: HTMLImageElement) {
        console.log(this);
        let currentSrc = dom.getAttribute("src");
        let playSrc = dom.getAttribute("pause_src");
        let pauseSrc = dom.getAttribute("play_src");

        if (currentSrc == null || playSrc == null || pauseSrc == null) return;

        dom.setAttribute("src", (currentSrc == playSrc) ? pauseSrc : playSrc);
        this._stateRotateCallback(currentSrc != playSrc);
    }

    private OnSkeletonAnimationExpandClick() {
        let animation_container = document.querySelector<HTMLBaseElement>(".animation_container");
        if (animation_container != null) animation_container.style.display = (this._animation_container_flag) ? "none" : "block"; 
        this._animation_container_flag = !this._animation_container_flag;

        this.SetIconSelectStyle(this._animationBtnDom, this._animation_container_flag);

        this.PreExpandBtnAction(this._animation_container_flag, [this._animationBtnDom]);
    }

    private OnSkeletonAnimationSpanClick(selfElement: HTMLSpanElement) {
        this.SetContainerSelectStyle(selfElement, ".animation_container span");
        let dataValue = selfElement.getAttribute("data-value");

        if (this._skeletonAnimationCallback != null && dataValue != null)
            this._skeletonAnimationCallback(dataValue);
    }

    private OnFrameAnimationExpandClick( ) {
        let frame_container = document.querySelector<HTMLBaseElement>(".frame_container");
        if (frame_container != null) frame_container.style.display = (this._frame_container_flag) ? "none" : "block"; 
        this._frame_container_flag = !this._frame_container_flag;

        this.SetIconSelectStyle(this._frameBtnDom, this._frame_container_flag);

        this.PreExpandBtnAction(this._frame_container_flag, [this._frameBtnDom]);
    }

    private async OnSingleFrameButtonClick(selfElement: HTMLImageElement) {
        let dataValue = selfElement.getAttribute("data-value");
        let is_selected = selfElement.classList.contains("selected");

        if (!is_selected) {
            this.SetContainerSelectStyle(selfElement, ".frame_container img");
        } else
            selfElement.classList.remove("selected");

        if (this._frameBtnCallback != null && dataValue != null) {
            //Clear previous state first
            this._frameBtnCallback(dataValue, false);

            this._frameBtnCallback(dataValue, !is_selected);
        }
    }

    private OnAnimationSpeedChange(dom: HTMLSpanElement) {
        this._animationSpeedIndex= (this._animationSpeedIndex + 1) % this._animationSpeedSet.length;

        let speed = this._animationSpeedSet[this._animationSpeedIndex];
        this._animSpeedBtnCallback(speed);

        dom.innerHTML = speed + "x";
    }

    private OnFrameForegroundClick() {

        //this._frame_foreground_flag = !this._frame_foreground_flag;

        this.OnFrameAnimationExpandClick();
        
        // if (this._frameBtnCallback != null)
        //     this._frameBtnCallback(this._frame_foreground_flag);
    }

    private SetClickButtonEvent<T extends Element>(query: string, callback : (dom: T) => void )  {
        let q_dom = document.querySelector<T>(query);

        if (q_dom != null) {
            q_dom.addEventListener("click", () => callback(q_dom));
        }
    }

    private OnInfoBtnClick() {
        this.SetInfoPanelVisibility(!this._info_panel_flag);

        this.PreExpandBtnAction(this._info_panel_flag, [this._infoDom]);
    }

    private SetInfoPanelVisibility(is_show: boolean) {

        this._infoDomContainer.style.display = is_show ? "block" : "none";
        this.UpdateInfoPanelWidthRatio();

        this.SetIconSelectStyle(this._infoDom, is_show);

        this._info_panel_flag = is_show;
    }

    private UpdateInfoPanelWidthRatio() {
        let displacement = 0;
        let infobar_width = (window.innerWidth * 0.0625) - (this._leftCtrlBarExpandSize + displacement);
        this._infoDomContainer.style.width = infobar_width +"rem";

        console.log("UpdateInfoPanelWidthRatio");
    }

    //#region  UI Expand Ctrl

    //Hide all btn first
    private PreExpandBtnAction(is_hide: boolean, exceptions? : any[] ) {
        let stylesheet = is_hide ? "none" : "block";
        let revert_stylesheet = is_hide ? "block" : "none";

        this._animationBtnDom.style.display = stylesheet;
        this._pausePlayBtnDom.style.display = stylesheet;
        this._bottomHoriLineDom.style.display = stylesheet;
        this._refreshBtnDom.style.display = stylesheet;
        this._screenshotDom.style.display = stylesheet;
        this._infoDom.style.display = stylesheet;
        this._frameBtnDom.style.display = stylesheet;

        this._backBtnDom.style.display = revert_stylesheet
        
        if (exceptions != null) {
            exceptions.forEach(x => {
                x.style.display = "block";
            });
        }
    }

    private SetIconSelectStyle(icon : HTMLElement, is_selected: boolean) {
        if (is_selected) {
            icon.classList.add("selected");
        } else {
            icon.classList.remove("selected");
        }
    }

    private ResetUI() {
        if (this._animation_container_flag)
            this.OnSkeletonAnimationExpandClick();

        if (this._frame_container_flag)
            this.OnFrameAnimationExpandClick();

        this.SetInfoPanelVisibility(false);

        this.PreExpandBtnAction(false);
    }
    //#endregion
}