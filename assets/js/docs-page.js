const docsFaqItems = parseFaqData();
upsertFaqLdJson(docsFaqItems);
renderFaqList(document.getElementById("faqList"), docsFaqItems);
