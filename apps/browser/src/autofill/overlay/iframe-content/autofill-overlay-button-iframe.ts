import { AutofillOverlayPort } from "../../enums/autofill-overlay.enum";

import AutofillOverlayIframeElement from "./autofill-overlay-iframe-element";

class AutofillOverlayButtonIframe extends AutofillOverlayIframeElement {
  constructor(element: HTMLElement) {
    super(
      element,
      AutofillOverlayPort.Button,
      {
        background: "transparent",
        border: "none",
      },
      chrome.i18n.getMessage("bitwardenOverlayButton"),
      chrome.i18n.getMessage("bitwardenOverlayMenuAvailable"),
    );
  }
}

export default AutofillOverlayButtonIframe;
