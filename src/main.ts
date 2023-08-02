import BabylonApp from './ElysiumViewer/BabylonApp';
import {AnimationSet, EventTag} from './ElysiumViewer/GeneralStaticFlag';
import anime from 'animejs';

import EventSystem from './Utility/EventSystem';
import { ModeEnum } from './ElysiumViewer/Mode/IMode';
import ControlBarView from './DOM/ControlbarView';
import {DownloadBase64File} from "./Utility/UtilityFunc";
import {GetWebOptions} from "./ElysiumViewer/ViewerUtility";

let webOptions = GetWebOptions();
let htmlContainer = window.document.getElementById("loading_ui");
let ctrl_bar_dom : HTMLBaseElement= document.querySelector(".contral_bar_canvas");

if (webOptions.is_website) {
  ctrl_bar_dom.style.display = "none";

  if (webOptions.background != null) {
    htmlContainer.style.backgroundColor = "#" + webOptions.background;
  } else
    htmlContainer.style.backgroundColor = "#AEAEAE";
} else {
  htmlContainer.style.backgroundColor = "black";
}

import './stylesheet/style.scss';

window.addEventListener("load", function(event) {
  let event_system = new EventSystem();

  let babylonApp = CreateBabylonApp(event_system);
});

let CreateBabylonApp = function(p_eventSystem: EventSystem) {
  let main_canvas = document.querySelector("#main_app");

  main_canvas.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation() });

  if (main_canvas != null) {

    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement, p_eventSystem);
    let controlbar_view : ControlBarView  = null;

    p_eventSystem.ListenToEvent(EventTag.BabylonAppReady, () => {
      controlbar_view = SetControlBar(babylonApp);
      babylonApp.SetMode(ModeEnum.FreeStyle);
      babylonApp.Mode.Animate(false);
      // babylonApp.PausePlayAnimation(true);  
    });

    p_eventSystem.ListenToEvent(EventTag.BabylonAppDisplay, () => {
        //Show menu icon
        if (!webOptions.is_website) {
          let menu_icon = document.querySelector<HTMLImageElement>("#ctrl_mode_change");
          menu_icon.style.display = "block";    
          
          controlbar_view.OnMenuBtnClick();
      }
    });

    return babylonApp;
  }
  return null;
}

let SetControlBar = function(app: BabylonApp) {
  let control_bar = new ControlBarView(webOptions);
  control_bar.SetCallback(
  //Skeleton Animation
  async (animation) =>  {
    await app.MainScene.LoadAnimation(animation);
    
    if (!app.IsAnimateMode) {
      let playpause_btn_dom = document.querySelector<HTMLImageElement>("#ctrl_play_change");
      playpause_btn_dom.click();
    }
    
    //await new Promise(resolve => setTimeout(resolve, 200));
    // if (!app.IsAnimateMode) app.SetAnimationMode(false);
  }, 

  //Pause Play Btn
  (enable: boolean) => {
    app.Mode.Animate(enable);
    app.SetAnimationMode(enable);
  },

  //Refresh Btn
  async () => {
    app.SetMode(ModeEnum.FreeStyle);
    await app.MainScene.LoadAnimation(AnimationSet.Idle);
    await new Promise(resolve => setTimeout(resolve, 200));

    let idle_span_dom : HTMLSpanElement = document.querySelector('.animation_container span[data-value="idle.glb"]');
    if (idle_span_dom != null) control_bar.SetContainerSelectStyle(idle_span_dom, ".animation_container span");
    
    app.Mode.Animate(app.IsAnimateMode);
    app.SetAnimationMode(app.IsAnimateMode);
  },

  //Screenshot
  async () => {
    let screen_img_dom : HTMLImageElement = document.querySelector('#screen_shot_container img');

    let data = await app.TakeScreenshot(screen_img_dom);   
  },

  //Animation speed
  (speed : number) => {
    app.MainScene.SetAnimationSpeed(speed);
  },
  
  //Frame foreground
  (frame_name: string, is_enable: boolean) => {

    app.MainScene.SetFramePostProcessingEffect( is_enable ? frame_name : null);

  },
  );

  return control_bar;
}