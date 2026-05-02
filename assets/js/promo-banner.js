(() => {
  const promoImage = document.getElementById("financialStandardsPromoImage");
  if (!promoImage) return;

  const bannerBasePath = promoImage.dataset.bannerBasePath || "data/";
  const bannerImages = [
    "ChatGPT Image 2026년 5월 2일 오후 04_40_23 (2).png",
    "ChatGPT Image 2026년 5월 2일 오후 04_40_23 (3).png"
  ];

  let currentBannerIndex = -1;

  const changeBanner = () => {
    let newIndex;
    if (bannerImages.length > 1) {
      do {
        newIndex = Math.floor(Math.random() * bannerImages.length);
      } while (newIndex === currentBannerIndex);
    } else {
      newIndex = 0;
    }
    
    currentBannerIndex = newIndex;
    promoImage.src = `${bannerBasePath}${bannerImages[currentBannerIndex]}`;
  };

  // 페이지 로드 시 첫 배너 설정
  changeBanner();

  // 1분(60,000밀리초)마다 배너 변경
  setInterval(changeBanner, 60000);
})();
