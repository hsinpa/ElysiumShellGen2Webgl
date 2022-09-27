import './style.scss'
import BabylonApp from './ElysiumViewer/BabylonApp';

window.addEventListener("load", function(event) {
  let main_canvas = document.querySelector("#main_app");

  if (main_canvas != null) {
    let babylonApp = new BabylonApp(main_canvas as HTMLCanvasElement);
    // babylonApp.Render();
  }

});
