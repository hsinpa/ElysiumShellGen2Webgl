import './stylesheet/style.scss'
import BabylonApp from './ElysiumViewer/BabylonApp';
import {EventTag} from './ElysiumViewer/GeneralStaticFlag';

import EventSystem from './Utility/EventSystem';
import { ModeEnum } from './ElysiumViewer/Mode/IMode';
import ControlBarView from './DOM/ControlbarView';

window.addEventListener("load", function(event) {
  let event_system = new EventSystem();

  let babylonApp = CreateBabylonApp(event_system);
});

let CreateBabylonApp = function(p_eventSystem: EventSystem) {
  let main_canvas = document.querySelector("#main_app");

  if (main_canvas != null) {
    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement, p_eventSystem);

    p_eventSystem.ListenToEvent(EventTag.BabylonAppReady, () => {
      //SetDropdownContent(babylonApp);
      //SetButtonEvent(babylonApp);
      SetControlBar(babylonApp);
      babylonApp.SetMode(ModeEnum.FreeStyle);
    });

    return babylonApp;
  }
  return null;
}

let SetControlBar = function(app: BabylonApp) {
  let control_bar = new ControlBarView();
  control_bar.SetCallback(
  (animation) => {
    app.LoadAnimation(animation, app.CharacterMesh);
  }, 
  () => {
    app.SetMode(ModeEnum.FreeStyle);
  });
}

let SetButtonEvent = function(app: BabylonApp) {
  let action_btn_dom = document.querySelector("#ctrl_mode_change");

  if (action_btn_dom != null) {
    action_btn_dom.addEventListener("click", () => {

      let nextMode = (app.Mode.tag == ModeEnum.FreeStyle) ? ModeEnum.FaceCloseUp : ModeEnum.FreeStyle;

      app.SetMode(nextMode);
    });
  }
}

let SetDropdownContent = function(app: BabylonApp) {
  let dropdown_select_dom = document.querySelector("#animation_dropdown select") as HTMLOptionElement;

  dropdown_select_dom?.addEventListener("change", (v) => { 
    console.log(dropdown_select_dom.value);

    app.LoadAnimation(dropdown_select_dom.value, app.CharacterMesh);
  });

}