import { ILoadingScreen } from "@babylonjs/core/Loading";

export default class CustomLoadingScreen implements ILoadingScreen {

    //optional, but needed due to interface definitions
    public loadingUIBackgroundColor: string;
    private m_htmlContainer : HTMLElement;
    private m_percentSpan : HTMLSpanElement;
    private m_percentBar : HTMLElement;

    constructor(public loadingUIText: string) {
        this.m_htmlContainer = window.document.getElementById("loading_ui");
        this.m_percentSpan = window.document.querySelector<HTMLSpanElement>("#loading_ui .load_container span");
        this.m_percentBar = window.document.querySelector<HTMLSpanElement>("#loading_ui .load_bar");
    }

    
    /**
     *
     *
     * @param {number} percent Between 0 - 1
     * @memberof CustomLoadingScreen
     */
    public progressUpdate(percent: number) {
        this.m_percentSpan.innerHTML = percent.toFixed(2) + "%";
        this.m_percentBar.style.width = (percent*100) + "%";
    }

    public displayLoadingUI() {
      this.progressUpdate(0);
    }
  
    public hideLoadingUI() {
        console.log("Loaded!");

        this.progressUpdate(1);
        this.m_htmlContainer.style.display = "none";
    }
  }