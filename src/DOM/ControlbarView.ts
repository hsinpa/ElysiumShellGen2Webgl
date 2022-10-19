import { ExtrasAsMetadata } from '@babylonjs/loaders/glTF/2.0';
import anime from 'animejs';
import 'simplebar';
import 'simplebar/dist/simplebar.css';

type SKAnimationType = {
    (s: string): void;
  };

export default class ControlBarView {

    private _menu_flag: boolean;
    private _skeleton_animation_flag: boolean;

    private _skeletonAnimationCallback: SKAnimationType;
    private _refreshBtnCallback: () => void;
    private _stateRotateCallback: (enable: boolean) => void;

    constructor( ) {
        this._menu_flag = false;
        this._skeleton_animation_flag = false;

        this.RegisterBtnEvent();
        this.SetAnimationBarStyle();
    }

    public SetCallback(skeletonAnimationCallback: SKAnimationType, stateRotateCallback: (enable: boolean) => void, refreshBtnCallback: () => void ) {
        this._skeletonAnimationCallback = skeletonAnimationCallback;
        this._stateRotateCallback = stateRotateCallback;
        this._refreshBtnCallback = refreshBtnCallback;
    }

    private RegisterBtnEvent() {

        let action_btn_dom = document.querySelector("#ctrl_mode_change");
        if (action_btn_dom != null) 
            action_btn_dom.addEventListener("click", this.OnMenuBtnClick.bind(this));

        let skeletonAnimExpand_btn_dom = document.querySelector("#ctrl_animation_change");
        if (skeletonAnimExpand_btn_dom != null) 
            skeletonAnimExpand_btn_dom.addEventListener("click", this.OnSkeletonAnimationExpandClick.bind(this));
    
        let playpause_btn_dom = document.querySelector<HTMLImageElement>("#ctrl_play_change");
        if (playpause_btn_dom != null) {
            playpause_btn_dom.addEventListener("click", () => this.OnPlayPauseClick(playpause_btn_dom));
        }

        let refresh_btn_dom = document.querySelector("#ctrl_refresh_change");
            if (refresh_btn_dom != null) 
                refresh_btn_dom.addEventListener("click", () => {
                    let playpause_btn_dom = document.querySelector<HTMLImageElement>("#ctrl_play_change");
                    let playSrc = playpause_btn_dom.getAttribute("play_src");
                    playpause_btn_dom.setAttribute("src", playSrc);
            
                    this._refreshBtnCallback();
                });

        let span_btn_dom = document.querySelectorAll<HTMLSpanElement>(".animation_container span");
            if (span_btn_dom != null) 
                span_btn_dom.forEach(x => {
                    x.addEventListener("click", () => this.OnSkeletonAnimationSpanClick(x));
            });
    }

    private OnMenuBtnClick() {
        let closeStyle = {
            width: '6.5rem',
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

        let expand_dom = document.querySelector<HTMLBaseElement>(".control_bar_expand");
        if (expand_dom != null) expand_dom.style.display = (this._menu_flag) ? "none" : "block"; 

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
        if (animation_container != null) animation_container.style.display = (this._skeleton_animation_flag) ? "none" : "block"; 
        this._skeleton_animation_flag = !this._skeleton_animation_flag;
    }

    private OnSkeletonAnimationSpanClick(selfElement: HTMLSpanElement) {
        console.log(this);
        let dataValue = selfElement.getAttribute("data-value");
        let span_btn_dom = document.querySelectorAll<HTMLSpanElement>(".animation_container span");
            if (span_btn_dom != null) 
                span_btn_dom.forEach(x => {
                    x.classList.remove("selected");
                });

        selfElement.classList.add("selected");

        if (this._skeletonAnimationCallback != null && dataValue != null)
            this._skeletonAnimationCallback(dataValue);
    }

    private SetAnimationBarStyle() {
        let animation_container = document.querySelector<HTMLBaseElement>(".animation_container");
        if (animation_container == null) return;

    }
}