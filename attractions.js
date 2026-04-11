const embeddedAttractionsFeed = window.__ATTRACTIONS_FEED__ && Array.isArray(window.__ATTRACTIONS_FEED__.items)
  ? window.__ATTRACTIONS_FEED__
  : { items: [] };

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
    return embeddedAttractionsFeed;
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
  const calendarAgenda = document.getElementById("calendar-agenda");
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

  function getItemsByDay(monthItems) {
    const itemsByDay = new Map();

    monthItems.forEach((item) => {
      const day = item.dateObject.getDate();
      if (!itemsByDay.has(day)) {
        itemsByDay.set(day, []);
      }
      itemsByDay.get(day).push(item);
    });

    return itemsByDay;
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
    const itemsByDay = getItemsByDay(monthItems);

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

  function renderAgenda() {
    if (!calendarAgenda) {
      return;
    }

    const [year, month] = getActiveMonthKey().split("-").map(Number);
    const monthItems = getMonthItems();
    const itemsByDay = getItemsByDay(monthItems);
    const dayEntries = Array.from(itemsByDay.entries()).sort((left, right) => left[0] - right[0]);

    if (dayEntries.length === 0) {
      calendarAgenda.innerHTML = `
        <div class="calendar-feed-empty">
          <p>No sourced community events are loaded for this location in the selected month yet.</p>
        </div>
      `;
      return;
    }

    calendarAgenda.innerHTML = dayEntries
      .map(([dayNumber, dayItems]) => {
        const dayKey = `${getActiveMonthKey()}-${String(dayNumber).padStart(2, "0")}`;
        const dayDate = new Date(year, month - 1, dayNumber);
        const isToday =
          year === today.getFullYear() &&
          month - 1 === today.getMonth() &&
          dayNumber === today.getDate();
        const dayClasses = ["calendar-agenda__day"];

        if (selectedDate === dayKey) {
          dayClasses.push("is-selected");
        }

        if (isToday) {
          dayClasses.push("is-today");
        }

        const previewMarkup = dayItems
          .slice(0, 3)
          .map(
            (item) =>
              `<span class="calendar-grid__pill" data-city="${escapeHtml(getLocationSlug(item.location))}">${escapeHtml(item.title)}</span>`
          )
          .join("");

        const countLabel = `${dayItems.length} ${dayItems.length === 1 ? "event" : "events"}`;
        const moreMarkup = dayItems.length > 3 ? `<span class="calendar-grid__more">+${dayItems.length - 3} more</span>` : "";

        return `
          <button class="${dayClasses.join(" ")}" type="button" data-day-key="${dayKey}" aria-pressed="${String(selectedDate === dayKey)}">
            <span class="calendar-agenda__day-top">
              <span class="calendar-agenda__date">${escapeHtml(dayDetailFormatter.format(dayDate))}</span>
              <span class="calendar-agenda__count">${countLabel}</span>
            </span>
            <div class="calendar-agenda__items">${previewMarkup}${moreMarkup}</div>
          </button>
        `;
      })
      .join("");
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
    zoomCopy.textContent = `Showing ${monthItems.length} activities for ${locationLabel}. Select a day with events to zoom in.`;

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
    renderAgenda();
    renderZoomState();
    renderFeed();
  }

  function handleDaySelection(nextDayKey) {
    selectedDate = selectedDate === nextDayKey ? null : nextDayKey;
    render();
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

    handleDaySelection(target.dataset.dayKey);
  });

  if (calendarAgenda) {
    calendarAgenda.addEventListener("click", (event) => {
      const target = event.target.closest("[data-day-key]");
      if (!target) {
        return;
      }

      handleDaySelection(target.dataset.dayKey);
    });
  }

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