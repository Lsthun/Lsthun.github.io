(function () {
  const GA4_MEASUREMENT_ID = "G-2LVK3VXT76";
  const CONSENT_STORAGE_KEY = "bslcampground_cookie_consent";
  const PRIVACY_POLICY_PATH = "./privacy-policy.html";
  let analyticsInitialized = false;
  let bannerElement = null;

  function readConsent() {
    try {
      return window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function writeConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      return;
    }
  }

  function clearConsent() {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      return;
    }
  }

  function getSectionLabel(link) {
    const section = link.closest("section[id]");
    if (section) {
      return section.id;
    }

    const main = link.closest("main[id]");
    return main ? main.id : "global";
  }

  function getLinkText(link) {
    return (link.textContent || link.getAttribute("aria-label") || "link")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  }

  function loadGoogleTag(measurementId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function trackEvent(eventName, params) {
    if (!analyticsInitialized || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", eventName, params);
  }

  function trackPhoneClicks() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach((link) => {
      link.addEventListener("click", () => {
        trackEvent("phone_call_click", {
          event_category: "engagement",
          link_text: getLinkText(link),
          link_url: link.href,
          page_location: window.location.href,
          section: getSectionLabel(link)
        });
      });
    });
  }

  function trackDirectionsClicks() {
    const directionsLinks = Array.from(document.querySelectorAll("a[href]"))
      .filter((link) => /google\.com\/maps|google\.com\/maps\/search|google\.com\/maps\/place/i.test(link.href));

    directionsLinks.forEach((link) => {
      link.addEventListener("click", () => {
        trackEvent("directions_click", {
          event_category: "engagement",
          link_text: getLinkText(link),
          link_url: link.href,
          page_location: window.location.href,
          section: getSectionLabel(link)
        });
      });
    });
  }

  function trackOutboundClicks() {
    const currentHost = window.location.host;
    const outboundLinks = Array.from(document.querySelectorAll("a[href]"))
      .filter((link) => {
        if (!/^https?:/i.test(link.href)) {
          return false;
        }

        try {
          return new URL(link.href).host !== currentHost;
        } catch {
          return false;
        }
      });

    outboundLinks.forEach((link) => {
      link.addEventListener("click", () => {
        trackEvent("outbound_click", {
          event_category: "engagement",
          link_text: getLinkText(link),
          link_url: link.href,
          page_location: window.location.href,
          section: getSectionLabel(link)
        });
      });
    });
  }

  function initializeAnalytics() {
    if (analyticsInitialized || !GA4_MEASUREMENT_ID) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;

    loadGoogleTag(GA4_MEASUREMENT_ID);
    window.gtag("js", new Date());
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("config", GA4_MEASUREMENT_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    trackPhoneClicks();
    trackDirectionsClicks();
    trackOutboundClicks();
    analyticsInitialized = true;
  }

  function ensureBanner() {
    if (bannerElement || !document.body) {
      return bannerElement;
    }

    bannerElement = document.createElement("div");
    bannerElement.className = "cookie-banner";
    bannerElement.hidden = true;
    bannerElement.innerHTML = `
      <div class="cookie-banner__content" role="dialog" aria-live="polite" aria-label="Cookie notice">
        <div class="cookie-banner__copy">
          <p class="cookie-banner__eyebrow">Privacy Notice</p>
          <p class="cookie-banner__title">We use Google Analytics to understand site traffic.</p>
          <p class="cookie-banner__text">If you accept, we will measure page visits and clicks such as phone calls and directions requests. You can review details in our <a href="${PRIVACY_POLICY_PATH}">Privacy Policy</a>.</p>
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-banner__button cookie-banner__button--ghost" type="button" data-cookie-decline>Decline</button>
          <button class="cookie-banner__button cookie-banner__button--primary" type="button" data-cookie-accept>Accept</button>
        </div>
      </div>
    `;

    document.body.appendChild(bannerElement);

    const acceptButton = bannerElement.querySelector("[data-cookie-accept]");
    const declineButton = bannerElement.querySelector("[data-cookie-decline]");

    if (acceptButton) {
      acceptButton.addEventListener("click", () => {
        writeConsent("accepted");
        hideBanner();
        initializeAnalytics();
      });
    }

    if (declineButton) {
      declineButton.addEventListener("click", () => {
        writeConsent("declined");
        hideBanner();
      });
    }

    return bannerElement;
  }

  function showBanner() {
    const banner = ensureBanner();
    if (!banner) {
      return;
    }

    banner.hidden = false;
    requestAnimationFrame(() => {
      banner.classList.add("is-visible");
    });
  }

  function hideBanner() {
    if (!bannerElement) {
      return;
    }

    bannerElement.classList.remove("is-visible");
    bannerElement.hidden = true;
  }

  function bindPreferenceControls() {
    const controls = document.querySelectorAll("[data-cookie-preferences]");

    controls.forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        clearConsent();
        showBanner();
      });
    });
  }

  function boot() {
    bindPreferenceControls();

    if (!GA4_MEASUREMENT_ID) {
      return;
    }

    const consent = readConsent();

    if (consent === "accepted") {
      initializeAnalytics();
      return;
    }

    if (consent !== "declined") {
      showBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();