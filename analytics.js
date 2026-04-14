(function () {
  const GA4_MEASUREMENT_ID = "G-2LVK3VXT76";
  const PRIVACY_NOTICE_STORAGE_KEY = "privacy_notice_seen";
  const PRIVACY_POLICY_PATH = "/privacy-policy/";
  let analyticsInitialized = false;
  let bannerElement = null;

  function readNoticeState() {
    try {
      return window.localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function writeNoticeState() {
    try {
      window.localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, "true");
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
    bannerElement.className = "privacy-notice";
    bannerElement.hidden = true;
    bannerElement.innerHTML = `
      <div class="privacy-notice__content" aria-live="polite" aria-label="Privacy notice">
        <p class="privacy-notice__text">We use Google Analytics to understand how visitors use our site. By continuing, you agree to our <a href="${PRIVACY_POLICY_PATH}">Privacy Policy</a>.</p>
        <button class="privacy-notice__button" type="button" data-notice-dismiss>Got it</button>
      </div>
    `;

    document.body.appendChild(bannerElement);

    const dismissButton = bannerElement.querySelector("[data-notice-dismiss]");

    if (dismissButton) {
      dismissButton.addEventListener("click", () => {
        writeNoticeState();
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

  function boot() {
    if (!GA4_MEASUREMENT_ID) {
      return;
    }

    initializeAnalytics();

    if (readNoticeState() !== "true") {
      showBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();