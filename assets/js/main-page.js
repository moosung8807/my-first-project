(() => {
  const faqItems = parseFaqData();
  upsertFaqLdJson(faqItems);

  const faqList = document.getElementById("faqList");
  renderFaqList(faqList, faqItems, { interactive: true, answerPrefix: "A. " });

  const guideTemplate = document.querySelector("#guideTemplate");
  const guideTarget = document.querySelector("#desktopGuideContent");
  if (guideTemplate && guideTarget) {
    guideTarget.replaceChildren(guideTemplate.content.cloneNode(true));
  }

  const guidePanel = document.querySelector("#guidePanel");
  const guidePanelToggle = document.querySelector("#guidePanelToggle");
  const guidePanelClose = document.querySelector("#guidePanelClose");
  const guidePanelOverlay = document.querySelector("#guidePanelOverlay");
  const guidePanelArrow = document.querySelector("#guidePanelArrow");

  function setGuidePanelOpen(nextOpen) {
    const open = Boolean(nextOpen);
    if (!guidePanel || !guidePanelToggle || !guidePanelOverlay || !guidePanelArrow) return;
    guidePanel.classList.toggle("open", open);
    guidePanelOverlay.hidden = !open;
    guidePanelToggle.setAttribute("aria-expanded", open ? "true" : "false");
    guidePanelToggle.setAttribute("aria-label", open ? "리밸런싱 계산기 사용방법 닫기" : "리밸런싱 계산기 사용방법 열기");
    guidePanelArrow.textContent = open ? "◀" : "▶";
    document.body.classList.toggle("guide-panel-open", open);
  }

  if (guidePanelToggle) {
    guidePanelToggle.addEventListener("click", () => {
      const isOpen = guidePanel?.classList.contains("open");
      setGuidePanelOpen(!isOpen);
    });
  }
  if (guidePanelClose) {
    guidePanelClose.addEventListener("click", () => setGuidePanelOpen(false));
  }
  if (guidePanelOverlay) {
    guidePanelOverlay.addEventListener("click", () => setGuidePanelOpen(false));
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setGuidePanelOpen(false);
  });

  const faqButtons = document.querySelectorAll(".faqQuestion button");
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      const answerId = button.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;

      button.setAttribute("aria-expanded", isOpen ? "false" : "true");
      if (answer) answer.hidden = isOpen;
    });
  });
})();
