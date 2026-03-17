(function () {
  function setMobileDetailHeader(tr, { nameText = "", decision = "유지", tradeText = "" } = {}) {
    if (!tr) return;
    const nameCell = tr.querySelector(".col-name");
    if (!nameCell) return;
    let rich = nameCell.querySelector(".mobileHeaderRich");
    if (!rich) {
      rich = document.createElement("div");
      rich.className = "mobileHeaderRich";
      rich.innerHTML = `
        <span class="mobileHeaderName"></span>
        <span class="mobileHeaderSep"> : </span>
        <span class="mobileHeaderTrade"></span>
        <span class="mobileHeaderDecision"></span>
      `;
      nameCell.appendChild(rich);
    }
    const nameEl = rich.querySelector(".mobileHeaderName");
    const decisionEl = rich.querySelector(".mobileHeaderDecision");
    const tradeEl = rich.querySelector(".mobileHeaderTrade");
    if (nameEl) nameEl.textContent = nameText || "이름 미입력";
    if (decisionEl) {
      decisionEl.textContent = `[${decision}]`;
      decisionEl.className = `mobileHeaderDecision ${decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold"}`;
    }
    if (tradeEl) tradeEl.textContent = tradeText || "";
  }

  function renderMobileResultList(refs, format, trades, cashResidual) {
    if (!refs.mobileResultList) return;
    refs.mobileResultList.innerHTML = "";

    const activeTrades = trades.filter((t) => !t.inactive);
    if (!activeTrades.length) {
      const empty = document.createElement("li");
      empty.className = "mobileResultItem empty";
      empty.textContent = "표시할 계산 결과가 없습니다.";
      refs.mobileResultList.appendChild(empty);
      return;
    }

    activeTrades.forEach((t) => {
      const item = document.createElement("li");
      item.className = "mobileResultItem";
      const name = String(t.tr?.querySelector(".name")?.value || "").trim() || "이름 미입력";
      const decision = t.tradeQty > 0 ? "매수" : t.tradeQty < 0 ? "매도" : "유지";
      const qtyText = t.tradeQty === 0 ? "0주" : `${t.tradeQty > 0 ? "+" : "-"}${format.fmt(Math.abs(t.tradeQty))}주`;
      const nameEl = document.createElement("span");
      nameEl.className = "name";
      nameEl.textContent = name;
      const decisionEl = document.createElement("span");
      decisionEl.className = `decision ${decision === "매수" ? "buy" : decision === "매도" ? "sell" : "hold"}`;
      decisionEl.textContent = decision;
      const qtyEl = document.createElement("span");
      qtyEl.className = "qty";
      qtyEl.textContent = qtyText;
      item.append(nameEl, decisionEl, qtyEl);
      refs.mobileResultList.appendChild(item);
    });

    const cashItem = document.createElement("li");
    cashItem.className = "mobileResultItem cash";
    const cashName = document.createElement("span");
    cashName.className = "name";
    cashName.textContent = "현금";
    const cashDecision = document.createElement("span");
    cashDecision.className = `decision ${cashResidual >= 0 ? "buy" : "sell"}`;
    cashDecision.textContent = cashResidual >= 0 ? "잔액" : "부족";
    const cashQty = document.createElement("span");
    cashQty.className = "qty";
    cashQty.textContent = `${cashResidual < 0 ? "-" : ""}${format.fmt(Math.round(Math.abs(cashResidual)))}원`;
    cashItem.append(cashName, cashDecision, cashQty);
    refs.mobileResultList.appendChild(cashItem);
  }

  window.RebalancingMobileHelpers = Object.freeze({
    renderMobileResultList,
    setMobileDetailHeader
  });
})();
