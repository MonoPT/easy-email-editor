import { injectConditionalStyles } from './stylesInjector/conditionalStyles';

let bodyContainer: null | HTMLElement = null;


const targetNode = document.body;

// Configuração do observador
const config = { childList: true, subtree: true, attributes: true };

// Callback para executar quando houver mudanças
const callback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      let temp: any = document.querySelector(".arco-card-body");

      if (temp && bodyContainer) return;

      bodyContainer = temp;

      if (bodyContainer) {
        heightFix(bodyContainer);
      }
    }
  }
};

// Criar o observador e iniciar a observação
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

function heightFix(bodyContainer: HTMLElement) {
  let els = document.querySelectorAll(".easy-email-editor-tabWrapper .easy-email-editor-tabItem");

  (document.querySelector(".arco-card-body")! as HTMLElement).addEventListener("scroll", (e) => {
    (e.target as HTMLElement).scrollTop = 0;
  });

  els.forEach(element => {
    let btn = element.parentNode! as HTMLElement;
    btn.addEventListener("click", async (e) => {
      injectConditionalStyles(btn);
      bodyContainer.classList.add("fixHeightTemp");
      await wait(.05);
      window.scrollTo({ top: 0, behavior: "instant" });
      bodyContainer.classList.remove("fixHeightTemp");
    });

  });
}