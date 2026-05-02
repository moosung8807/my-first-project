(() => {
  const promoImage = document.getElementById("financialStandardsPromoImage");
  if (!promoImage) return;

  const bannerImages = [
    "data/ChatGPT Image 2026년 5월 2일 오후 04_40_23 (2).png",
    "data/ChatGPT Image 2026년 5월 2일 오후 04_40_23 (3).png"
  ];

  const randomIndex = Math.floor(Math.random() * bannerImages.length);
  promoImage.src = bannerImages[randomIndex];
})();
