export function injectConditionalStyles(btn: HTMLElement) {
  let tabs = document.querySelectorAll("#easy-email-editor > div > div");



  let allBtns = btn.parentNode!.children!;

  if (allBtns[1] === btn) {
    //is desktop
    let DOM = (tabs[2].querySelector("div > div")) as HTMLElement;
    let body = DOM.querySelector("div")?.shadowRoot?.querySelector("body");

    if (!body?.querySelector("style.hideMobileElements")) {
      let style = document.createElement("style");
      style.classList.add("hideMobileElements");

      style.type = "text/css";

      style.innerHTML = `
        .mobile-only {
          display: none !important;
        }
      `;

      body?.append(style);
    }
  } else if (allBtns[2] === btn) {
    let DOM = (tabs[3].querySelector("div > div")) as HTMLElement;
    const iframe = DOM.querySelector("iframe")!;
    let doc = iframe.srcdoc!;

    if (doc?.includes("hideDesktopElements")) return;
    (DOM.parentNode! as HTMLElement).style.height = "calc(100% - 150px)";
    doc = doc.replace("</body>", "<style class='hideDesktopElements'>.desktop-only {display: none;}</style></body>");

    iframe.srcdoc = doc;
  }

}