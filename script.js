const bootstrapCSS = document.getElementById("bootstrapCSS");
const subscribeForm = document.getElementById("subscribeForm");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("formMessage");
const learnMoreModal = document.getElementById("learnMoreModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const bootstrapLTR = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";
const bootstrapRTL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.rtl.min.css";
const bootstrapRTLIntegrity = "sha384-CfCrinSRH2IR6a4e6fy2q6ioOX7O6Mtm1L9vRvFZ1trBncWmMePhzvafv7oIcWiW";

const rtlLanguages = ["ar", "dv", "fa", "he", "ku", "ps", "sd", "ug", "ur", "yi"];

let directionUpdateTimer;
let activeDirection = "";

function getCookieValue(name) {
  const cookie = document.cookie
    .split("; ")
    .find(function (item) {
      return item.startsWith(name + "=");
    });

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

function getGoogleTranslateLanguage() {
  const googleTranslateSelect = document.querySelector(".goog-te-combo");

  if (googleTranslateSelect && googleTranslateSelect.value) {
    return googleTranslateSelect.value.toLowerCase();
  }

  const googleTranslateCookie = getCookieValue("googtrans");

  if (googleTranslateCookie) {
    const translatedLanguage = googleTranslateCookie.split("/").filter(Boolean).pop();

    if (translatedLanguage) {
      return translatedLanguage.toLowerCase();
    }
  }

  return "";
}

function detectLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get("lang");
  const googleTranslateLanguage = getGoogleTranslateLanguage();

  if (googleTranslateLanguage) {
    return googleTranslateLanguage;
  }

  if (urlLanguage) {
    return urlLanguage.toLowerCase();
  }

  const pageLanguage = document.documentElement.getAttribute("lang");

  if (pageLanguage) {
    return pageLanguage.toLowerCase();
  }

  return navigator.language ? navigator.language.toLowerCase() : "en";
}

function isRTL(language) {
  const shortCode = language.split("-")[0];
  return rtlLanguages.includes(shortCode);
}

function useRTLBootstrap() {
  bootstrapCSS.setAttribute("href", bootstrapRTL);
  bootstrapCSS.setAttribute("integrity", bootstrapRTLIntegrity);
  bootstrapCSS.setAttribute("crossorigin", "anonymous");
}

function useLTRBootstrap() {
  bootstrapCSS.setAttribute("href", bootstrapLTR);
  bootstrapCSS.removeAttribute("integrity");
  bootstrapCSS.removeAttribute("crossorigin");
}

function detectDirection() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlDirection = urlParams.get("dir");
  const detectedLanguage = detectLanguage();
  const pageClasses = [
    document.documentElement.className,
    document.body.className
  ].join(" ");

  if (urlDirection === "rtl" || urlDirection === "ltr") {
    return urlDirection;
  }

  if (pageClasses.includes("translated-rtl")) {
    return "rtl";
  }

  if (pageClasses.includes("translated-ltr")) {
    return "ltr";
  }

  return isRTL(detectedLanguage) ? "rtl" : "ltr";
}

function applyDirection() {
  const detectedDirection = detectDirection();

  if (detectedDirection === activeDirection) {
    return;
  }

  activeDirection = detectedDirection;

  if (detectedDirection === "rtl") {
    document.documentElement.setAttribute("dir", "rtl");
    document.body.setAttribute("dir", "rtl");
    useRTLBootstrap();
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.body.setAttribute("dir", "ltr");
    useLTRBootstrap();
  }
}

function scheduleDirectionUpdate() {
  window.clearTimeout(directionUpdateTimer);
  directionUpdateTimer = window.setTimeout(applyDirection, 100);
}

document.addEventListener("change", function (event) {
  if (event.target instanceof Element && event.target.matches(".goog-te-combo")) {
    scheduleDirectionUpdate();
  }
});

window.addEventListener("load", scheduleDirectionUpdate);
window.addEventListener("focus", scheduleDirectionUpdate);
window.setInterval(scheduleDirectionUpdate, 1000);
applyDirection();

const languageObserver = new MutationObserver(scheduleDirectionUpdate);

languageObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class", "dir", "lang"]
});

languageObserver.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["class", "dir", "lang"]
});

subscribeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  formMessage.classList.remove("text-success", "text-danger");

  if (!emailInput.validity.valid) {
    formMessage.textContent = "Please enter a valid email address.";
    formMessage.classList.add("text-danger");
    emailInput.focus();
    return;
  }

  formMessage.textContent = "Thank you! You have subscribed successfully.";
  formMessage.classList.add("text-success");
  subscribeForm.reset();
});

learnMoreModal.addEventListener("show.bs.modal", function (event) {
  const button = event.relatedTarget;

  modalTitle.textContent = button.getAttribute("data-title");
  modalBody.textContent = button.getAttribute("data-text");
});
