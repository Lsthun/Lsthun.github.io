const fallbackAttractionsFeed = {
  items: [
    {
      date: "2026-04-11",
      title: "Avocado's dinner walk",
      location: "Bay St. Louis",
      category: "Dining",
      description: "Walking-distance dinner idea from camp when you want tacos, drinks, and an easy night out.",
      url: "https://avocados-grill.com/location/bay-st-louise/",
      cta: "Visit Website"
    },
    {
      date: "2026-04-12",
      title: "Bay St. Louis Beach afternoon",
      location: "Bay St. Louis",
      category: "Outdoors",
      description: "A simple beach-and-sunset plan about 2 miles from the campground.",
      url: "https://www.google.com/maps/dir/Bay+St+Louis+Campground,+814+US-90,+Bay+St+Louis,+MS+39520/Bay+St.+Louis+Beach,+Bay+St+Louis,+MS+39520/@30.3117344,-89.3479605,3893m/data=!3m2!1e3!4b1!4m14!4m13!1m5!1m1!1s0x889c2da330913efd:0xfc19d4c4cbeead78!2m2!1d-89.3518966!2d30.3137503!1m5!1m1!1s0x889c2db2e1f97c7d:0x2f117dc7ecd3162e!2m2!1d-89.329896!2d30.3033478!3e0?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D",
      cta: "View Route"
    },
    {
      date: "2026-04-15",
      title: "Downtown dining crawl",
      location: "Bay St. Louis",
      category: "Dining",
      description: "Build a dinner-and-drinks night around downtown seafood, bars, and harbor views.",
      url: "https://www.google.com/maps/search/?api=1&query=restaurants+bars+downtown+Bay+St.+Louis+MS",
      cta: "Open Dining Map"
    },
    {
      date: "2026-04-18",
      title: "Old Town shopping loop",
      location: "Bay St. Louis",
      category: "Shopping",
      description: "Take an easy afternoon for coffee, boutiques, and a walk through Old Town Bay St. Louis.",
      url: "https://www.google.com/maps/search/?api=1&query=Old+Town+Bay+St.+Louis+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-04-19",
      title: "Buccaneer State Park outing",
      location: "Waveland",
      category: "Family",
      description: "A family-friendly Waveland day trip with room for beach time, walking, and park stops.",
      url: "https://www.google.com/maps/search/?api=1&query=Buccaneer+State+Park+Waveland+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-04-23",
      title: "Waveland beachfront sunset",
      location: "Waveland",
      category: "Outdoors",
      description: "Quick coastal detour for a quieter shoreline and an easy sunset plan.",
      url: "https://www.google.com/maps/search/?api=1&query=Waveland+Beach+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-04-25",
      title: "Mississippi Aquarium day",
      location: "Gulfport/Biloxi",
      category: "Family",
      description: "A family day trip option when you want a bigger outing beyond Bay St. Louis.",
      url: "https://www.google.com/maps/search/?api=1&query=Mississippi+Aquarium+Gulfport+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-04-26",
      title: "Biloxi lighthouse loop",
      location: "Gulfport/Biloxi",
      category: "Sightseeing",
      description: "Pair the Biloxi lighthouse area with a waterfront walk for an easy coast drive.",
      url: "https://www.google.com/maps/search/?api=1&query=Biloxi+Lighthouse+Biloxi+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-05-02",
      title: "Harbor brunch and marina walk",
      location: "Bay St. Louis",
      category: "Dining",
      description: "Plan a late breakfast or brunch and wander the harbor before heading back to camp.",
      url: "https://www.google.com/maps/search/?api=1&query=Bay+St.+Louis+Harbor+Bay+St.+Louis+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-05-09",
      title: "Avocado's casual dinner stop",
      location: "Bay St. Louis",
      category: "Dining",
      description: "A repeatable dinner pick when you want something close, easy, and reliable.",
      url: "https://www.google.com/maps/place/Avocado%E2%80%99s+Bar+%26+Grill/@30.314825,-89.351807,17z/data=!3m1!4b1!4m6!3m5!1s0x889dd10d23bf1ebf:0x87149ee3aa7e4f32!8m2!3d30.314825!4d-89.351807!16s%2Fg%2F11hbkbqfxx?entry=ttu&g_ep=EgoyMDI2MDQwNy4wIKXMDSoASAFQAw%3D%3D",
      cta: "Open In Maps"
    },
    {
      date: "2026-05-16",
      title: "Waveland beach afternoon",
      location: "Waveland",
      category: "Outdoors",
      description: "A lower-key beach plan when you want a second coastal option outside Bay St. Louis.",
      url: "https://www.google.com/maps/search/?api=1&query=Waveland+Beach+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-05-23",
      title: "Gulf Islands Waterpark day",
      location: "Gulfport/Biloxi",
      category: "Family",
      description: "A larger family outing option for warmer weekends on the coast.",
      url: "https://www.google.com/maps/search/?api=1&query=Gulf+Islands+Waterpark+Gulfport+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-06-06",
      title: "Downtown dinner and music venues",
      location: "Bay St. Louis",
      category: "Night Out",
      description: "Use the downtown map to line up a longer evening around food, bars, and live-music stops.",
      url: "https://www.google.com/maps/search/?api=1&query=restaurants+bars+downtown+Bay+St.+Louis+MS",
      cta: "Open Dining Map"
    },
    {
      date: "2026-06-13",
      title: "Jones Park waterfront outing",
      location: "Gulfport/Biloxi",
      category: "Sightseeing",
      description: "A simple Gulfport waterfront plan that pairs well with other stops in the area.",
      url: "https://www.google.com/maps/search/?api=1&query=Jones+Park+Gulfport+MS",
      cta: "Open In Maps"
    },
    {
      date: "2026-06-20",
      title: "Waveland weekend coast drive",
      location: "Waveland",
      category: "Outdoors",
      description: "An easy coast drive for a slower day with beach views and time outside.",
      url: "https://www.google.com/maps/search/?api=1&query=Waveland+MS+Beachfront",
      cta: "Open In Maps"
    }
  ]
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const descriptionLimit = 180;

const locationSlugMap = {
  "Bay St. Louis": "bay-st-louis",
  Waveland: "waveland",
  "Gulfport/Biloxi": "gulfport-biloxi"
};

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLocationSlug(location) {
  return locationSlugMap[location] || "other";
}

function truncateText(value, maxLength = descriptionLimit) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.trimEnd()}...`;
}

function buildSourceLabel(item) {
  if (item.source) {
    return `View on ${item.source}`;
  }

  return item.cta || "Open";
}

async function loadAttractionsFeed() {
  try {
    const response = await fetch("./attractions-feed.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Feed request failed");
    }

    const data = await response.json();
    if (!Array.isArray(data.items)) {
      throw new Error("Feed shape is invalid");
    }

    return data;
  } catch {
    return fallbackAttractionsFeed;
  }
}

function normalizeItems(rawItems) {
  return rawItems
    .map((item) => ({
      ...item,
      dateObject: parseLocalDate(item.date)
    }))
    .sort((left, right) => left.dateObject - right.dateObject || left.title.localeCompare(right.title));
}

document.addEventListener("DOMContentLoaded", async () => {
  const monthLabel = document.getElementById("calendar-month-label");
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarFeed = document.getElementById("calendar-feed");
  const calendarFeedTitle = document.getElementById("calendar-feed-title");
  const zoomCopy = document.getElementById("calendar-zoom-copy");
  const clearDayButton = document.getElementById("calendar-clear-day");
  const filterButtons = Array.from(document.querySelectorAll("[data-location-filter]"));
  const navButtons = Array.from(document.querySelectorAll("[data-calendar-nav]"));

  if (!monthLabel || !calendarGrid || !calendarFeed || filterButtons.length === 0 || navButtons.length === 0) {
    return;
  }

  const feed = await loadAttractionsFeed();
  const items = normalizeItems(feed.items || []);
  const monthKeys = Array.from(new Set(items.map((item) => formatMonthKey(item.dateObject))));

  if (monthKeys.length === 0) {
    calendarFeed.innerHTML = '<div class="calendar-feed-empty"><p>No attractions are loaded yet.</p></div>';
    return;
  }

  const today = new Date();
  const todayKey = formatMonthKey(today);
  let currentMonthIndex = monthKeys.includes(todayKey) ? monthKeys.indexOf(todayKey) : 0;
  let activeLocation = "All";
  let selectedDate = null;

  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
  const dayFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const dayDetailFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

  function getActiveMonthKey() {
    return monthKeys[currentMonthIndex];
  }

  function getMonthItems() {
    const activeMonthKey = getActiveMonthKey();
    return items.filter((item) => {
      const matchesMonth = formatMonthKey(item.dateObject) === activeMonthKey;
      const matchesLocation = activeLocation === "All" || item.location === activeLocation;
      return matchesMonth && matchesLocation;
    });
  }

  function getVisibleItems() {
    const monthItems = getMonthItems();
    if (!selectedDate) {
      return monthItems;
    }

    return monthItems.filter((item) => item.date === selectedDate);
  }

  function renderMonthLabel() {
    const [year, month] = getActiveMonthKey().split("-").map(Number);
    monthLabel.textContent = monthFormatter.format(new Date(year, month - 1, 1));
  }

  function renderNavState() {
    navButtons.forEach((button) => {
      const isPrevious = button.dataset.calendarNav === "prev";
      const isDisabled = isPrevious ? currentMonthIndex === 0 : currentMonthIndex === monthKeys.length - 1;
      button.disabled = isDisabled;
      button.setAttribute("aria-disabled", String(isDisabled));
    });
  }

  function syncSelectedDate() {
    if (!selectedDate) {
      return;
    }

    const hasMatch = getMonthItems().some((item) => item.date === selectedDate);
    if (!hasMatch) {
      selectedDate = null;
    }
  }

  function renderGrid() {
    const [year, month] = getActiveMonthKey().split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const monthItems = getMonthItems();
    const itemsByDay = new Map();

    monthItems.forEach((item) => {
      const day = item.dateObject.getDate();
      if (!itemsByDay.has(day)) {
        itemsByDay.set(day, []);
      }
      itemsByDay.get(day).push(item);
    });

    const labelsMarkup = weekdayLabels
      .map((label) => `<div class="calendar-grid__label">${label}</div>`)
      .join("");

    const blanksMarkup = Array.from({ length: firstDay.getDay() }, () => '<div class="calendar-grid__blank" aria-hidden="true"></div>').join("");

    const daysMarkup = Array.from({ length: lastDay.getDate() }, (_, index) => {
      const dayNumber = index + 1;
      const dayItems = itemsByDay.get(dayNumber) || [];
      const dayKey = `${getActiveMonthKey()}-${String(dayNumber).padStart(2, "0")}`;
      const isToday =
        year === today.getFullYear() &&
        month - 1 === today.getMonth() &&
        dayNumber === today.getDate();
      const dayClasses = ["calendar-grid__day"];

      if (isToday) {
        dayClasses.push("is-today");
      }

      if (dayItems.length > 0) {
        dayClasses.push("has-items", "is-clickable");
      }

      if (selectedDate === dayKey) {
        dayClasses.push("is-selected");
      }

      const pills = dayItems
        .slice(0, 2)
        .map((item) => `<span class="calendar-grid__pill" data-city="${escapeHtml(getLocationSlug(item.location))}">${escapeHtml(item.title)}</span>`)
        .join("");

      const more = dayItems.length > 2 ? `<span class="calendar-grid__more">+${dayItems.length - 2} more</span>` : "";

      return `
        <button class="${dayClasses.join(" ")}" type="button" data-day-key="${dayKey}" aria-pressed="${String(selectedDate === dayKey)}" ${dayItems.length === 0 ? "disabled" : ""}>
          <span class="calendar-grid__date">${dayNumber}</span>
          <div class="calendar-grid__items">${pills}${more}</div>
        </button>
      `;
    }).join("");

    calendarGrid.innerHTML = `${labelsMarkup}${blanksMarkup}${daysMarkup}`;
  }

  function renderZoomState() {
    if (!zoomCopy) {
      return;
    }

    if (selectedDate) {
      const selectedItems = getVisibleItems();
      zoomCopy.textContent = `${selectedItems.length} activities on ${dayDetailFormatter.format(parseLocalDate(selectedDate))}.`;
      if (clearDayButton) {
        clearDayButton.hidden = false;
      }

      if (calendarFeedTitle) {
        calendarFeedTitle.textContent = `All activities on ${dayDetailFormatter.format(parseLocalDate(selectedDate))}`;
      }

      return;
    }

    const monthItems = getMonthItems();
    const locationLabel = activeLocation === "All" ? "all cities" : activeLocation;
    zoomCopy.textContent = `Showing ${monthItems.length} activities for ${locationLabel}. Click a day with events to zoom in.`;

    if (clearDayButton) {
      clearDayButton.hidden = true;
    }

    if (calendarFeedTitle) {
      calendarFeedTitle.textContent = `Filtered picks for ${monthLabel.textContent}`;
    }
  }

  function renderFeed() {
    const visibleItems = getVisibleItems();

    if (visibleItems.length === 0) {
      calendarFeed.innerHTML = `
        <div class="calendar-feed-empty">
          <p>No sourced community events are loaded for this location in the selected month yet.</p>
        </div>
      `;
      return;
    }

    calendarFeed.innerHTML = visibleItems
      .map(
        (item) => `
          <article class="calendar-feed-card" data-city="${escapeHtml(getLocationSlug(item.location))}">
            <p class="calendar-feed-card__meta">
              <span>${escapeHtml(dayFormatter.format(item.dateObject))}</span>
              <span data-city="${escapeHtml(getLocationSlug(item.location))}">${escapeHtml(item.location)}</span>
              <span>${escapeHtml(item.category)}</span>
              ${item.timeLabel ? `<span>${escapeHtml(item.timeLabel)}</span>` : ""}
              ${item.source ? `<span>${escapeHtml(item.source)}</span>` : ""}
            </p>
            <h4>${escapeHtml(item.title)}</h4>
            <p class="calendar-feed-card__description">${escapeHtml(truncateText(item.description))}</p>
            <div class="calendar-feed-card__actions">
              <a class="attraction-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(buildSourceLabel(item))}</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function render() {
    syncSelectedDate();
    renderMonthLabel();
    renderNavState();
    renderGrid();
    renderZoomState();
    renderFeed();
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.calendarNav === "next" ? 1 : -1;
      const nextIndex = currentMonthIndex + direction;
      if (nextIndex < 0 || nextIndex >= monthKeys.length) {
        return;
      }

      currentMonthIndex = nextIndex;
      selectedDate = null;
      render();
    });
  });

  calendarGrid.addEventListener("click", (event) => {
    const target = event.target.closest("[data-day-key]");
    if (!target || target.disabled) {
      return;
    }

    const nextDayKey = target.dataset.dayKey;
    selectedDate = selectedDate === nextDayKey ? null : nextDayKey;
    render();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeLocation = button.dataset.locationFilter || "All";
      selectedDate = null;

      filterButtons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });

      render();
    });
  });

  if (clearDayButton) {
    clearDayButton.addEventListener("click", () => {
      selectedDate = null;
      render();
    });
  }

  render();
});