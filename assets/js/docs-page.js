const docsFaqItems = parseFaqData();
upsertFaqLdJson(docsFaqItems);
const docsFaqList = document.getElementById("faqList");
const isToolFaq = document.body.classList.contains("monthlyToolPage");

renderFaqList(
  docsFaqList,
  docsFaqItems,
  isToolFaq ? { interactive: true, answerPrefix: "A. " } : {}
);

if (isToolFaq) bindFaqToggles(docsFaqList);
