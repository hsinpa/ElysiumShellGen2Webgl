import './style.scss'
import BabylonApp from './ElysiumViewer/BabylonApp';
import {EventTag} from './ElysiumViewer/GeneralStaticFlag';

import EventSystem from './Utility/EventSystem';
import { ModeEnum } from './ElysiumViewer/Mode/IMode';
import { Nullable } from 'babylonjs';

window.addEventListener("load", function(event) {
  let event_system = new EventSystem();

  let babylonApp = CreateBabylonApp(event_system);
  
  if (babylonApp != null)
    SetButtonEvent(babylonApp);
});

let CreateBabylonApp = function(p_eventSystem: EventSystem) {
  let main_canvas = document.querySelector("#main_app");

  if (main_canvas != null) {
    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement, p_eventSystem);

    p_eventSystem.ListenToEvent(EventTag.BabylonAppReady, () => {
      babylonApp.SetMode(ModeEnum.FreeStyle);
    });

    return babylonApp;
  }
  return null;
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
