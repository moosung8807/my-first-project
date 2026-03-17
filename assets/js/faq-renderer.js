function createFaqLdJson(faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function parseFaqData(scriptId = "faqData") {
  const source = document.getElementById(scriptId);
  if (!source) return [];

  try {
    const payload = JSON.parse(source.textContent || "[]");
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Failed to parse FAQ data", error);
    return [];
  }
}

function upsertFaqLdJson(faqItems, scriptId = "faqStructuredData") {
  if (faqItems.length === 0) return;
  let ldScript = document.getElementById(scriptId);
  if (!ldScript) {
    ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.id = scriptId;
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(createFaqLdJson(faqItems));
}

function renderFaqList(container, faqItems, options = {}) {
  if (!container || faqItems.length === 0) return;

  const interactive = Boolean(options.interactive);
  const answerPrefix = options.answerPrefix || "";

  const fragment = document.createDocumentFragment();
  faqItems.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "faqItem";

    const heading = document.createElement("h3");
    heading.className = "faqQuestion";

    const questionLabel = `Q${index + 1}. ${item.question}`;
    const answerLabel = `${answerPrefix}${item.answer}`;

    if (interactive) {
      const button = document.createElement("button");
      const answerId = `faqAnswer${index + 1}`;
      const questionId = `faqQuestion${index + 1}`;
      button.className = "faqQuestion";
      button.type = "button";
      button.id = questionId;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", answerId);
      button.textContent = questionLabel;
      heading.replaceChildren(button);

      const answer = document.createElement("p");
      answer.id = answerId;
      answer.className = "faqAnswer";
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", questionId);
      answer.hidden = true;
      answer.textContent = answerLabel;
      article.append(heading, answer);
    } else {
      heading.textContent = questionLabel;
      const answer = document.createElement("p");
      answer.className = "faqAnswer";
      answer.textContent = answerLabel;
      article.append(heading, answer);
    }

    fragment.appendChild(article);
  });

  container.replaceChildren(fragment);
}
