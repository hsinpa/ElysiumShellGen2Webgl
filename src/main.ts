import './style.scss'
import BabylonApp from './ElysiumViewer/BabylonApp';
import {EventTag} from './ElysiumViewer/GeneralStaticFlag';

import EventSystem from './Utility/EventSystem';
import { ModeEnum } from './ElysiumViewer/Mode/IMode';

window.addEventListener("load", function(event) {
  let main_canvas = document.querySelector("#main_app");
  let event_system = new EventSystem();
  if (main_canvas != null) {
    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement, event_system);
    
    event_system.ListenToEvent(EventTag.BabylonAppReady, () => {
      babylonApp.SetMode(ModeEnum.FaceCloseUp);
    });
  }
});
