import { ILoadingScreen } from "@babylonjs/core/Loading";

export default class CustomLoadingScreen implements ILoadingScreen {

    //optional, but needed due to interface definitions
    public loadingUIBackgroundColor: string;
    private m_htmlContainer : HTMLElement;
    private m_percentSVG : HTMLImageElement;
    private m_percentSpan : HTMLSpanElement;

    constructor(public loadingUIText: string) {
        this.m_percentSpan = window.document.querySelector<HTMLSpanElement>("#loading_ui .load_container span");
        this.m_htmlContainer = window.document.getElementById("loading_ui");
        this.m_percentSVG = window.document.querySelector<HTMLImageElement>("#loading_ui #esnx_logo_mask rect");
    }

    /**
     *
     *
     * @param {number} percent Between 0 - 1
     * @memberof CustomLoadingScreen
     */
    public progressUpdate(percent: number) {
        this.m_percentSVG.setAttribute("y",  Math.floor( ( 1 - percent) * 512).toString() );

        let span_message = (percent < 0.95) ? "LOADING " + (percent * 100).toFixed(2) + "%" : "COMPLETE!";

        // this.m_percentSpan.innerHTML = span_message;
        this.ShowMessage(span_message);
    }

    public displayLoadingUI() {
        this.ShowMessage("FETCHING DATA . . .");
    }

    public ShowMessage(message: string) {
        this.m_percentSpan.innerHTML = message;
    }
  
    public hideLoadingUI() {
        console.log("Loaded!");

        this.progressUpdate(1);
        this.m_htmlContainer.style.display = "none";
    }
  }