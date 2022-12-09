import './stylesheet/style.scss'
import BabylonApp from './ElysiumViewer/BabylonApp';
import {AnimationSet, EventTag} from './ElysiumViewer/GeneralStaticFlag';

import EventSystem from './Utility/EventSystem';
import { ModeEnum } from './ElysiumViewer/Mode/IMode';
import ControlBarView from './DOM/ControlbarView';
import {DownloadBase64File} from "./Utility/UtilityFunc";

window.addEventListener("load", function(event) {
  let event_system = new EventSystem();

  let babylonApp = CreateBabylonApp(event_system);
});

let CreateBabylonApp = function(p_eventSystem: EventSystem) {
  let main_canvas = document.querySelector("#main_app");

  if (main_canvas != null) {
    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement, p_eventSystem);

    p_eventSystem.ListenToEvent(EventTag.BabylonAppReady, () => {
      SetControlBar(babylonApp);
      babylonApp.SetMode(ModeEnum.FreeStyle);
      babylonApp.Mode.Animate(false);
      // babylonApp.PausePlayAnimation(true);  
    });

    return babylonApp;
  }
  return null;
}

let SetControlBar = function(app: BabylonApp) {
  let control_bar = new ControlBarView();
  control_bar.SetCallback(
  //Skeleton Animation
  async (animation) =>  {
    await app.MainScene.LoadAnimation(animation);
    await new Promise(resolve => setTimeout(resolve, 200));

    // console.log(app.IsAnimate);
    if (!app.IsAnimateMode) app.SetAnimationMode(false);
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
    if (idle_span_dom != null) control_bar.SetSkeletonAnimationStyle(idle_span_dom);
    
    app.Mode.Animate(app.IsAnimateMode);
    app.SetAnimationMode(app.IsAnimateMode);
  },

  //Screenshot
  async () => {
    let data = await app.TakeScreenshot();    
    DownloadBase64File(data);
  },

  //Animation speed
  (speed : number) => {
    app.MainScene.SetAnimationSpeed(speed);
  }
  );
}