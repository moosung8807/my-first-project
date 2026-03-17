(function () {
  function getNameSuggestBox(tr) {
    return tr ? tr.querySelector(".nameSuggest") : null;
  }

  function getNameInput(tr) {
    return tr ? tr.querySelector(".name") : null;
  }

  function getNameSuggestionItems(tr) {
    const suggestBox = getNameSuggestBox(tr);
    if (!suggestBox) return [];
    return [...suggestBox.querySelectorAll(".nameSuggestItem")];
  }

  function getSuggestionActiveIndex(tr) {
    const suggestBox = getNameSuggestBox(tr);
    if (!suggestBox) return -1;
    const n = Number(suggestBox.dataset.activeIndex);
    return Number.isInteger(n) ? n : -1;
  }

  function setSuggestionActiveIndex(tr, nextIndex) {
    const suggestBox = getNameSuggestBox(tr);
    const nameEl = getNameInput(tr);
    if (!suggestBox || !nameEl) return;

    const items = getNameSuggestionItems(tr);
    const last = items.length - 1;
    const index = nextIndex < 0 || nextIndex > last ? -1 : nextIndex;
    suggestBox.dataset.activeIndex = String(index);

    items.forEach((item, itemIndex) => {
      const active = itemIndex === index;
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.classList.toggle("isActive", active);
      if (active) {
        nameEl.setAttribute("aria-activedescendant", item.id);
        item.scrollIntoView({ block: "nearest" });
      }
    });

    if (index === -1) {
      nameEl.removeAttribute("aria-activedescendant");
    }
  }

  window.RebalancingDomHelpers = Object.freeze({
    getNameInput,
    getNameSuggestBox,
    getNameSuggestionItems,
    getSuggestionActiveIndex,
    setSuggestionActiveIndex
  });
})();
