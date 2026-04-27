from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import urlencode, urljoin
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "attractions-feed.json"
EMBEDDED_OUTPUT_PATH = ROOT / "attractions-feed.js"
LOCAL_TZ = ZoneInfo("America/Chicago")
TODAY = datetime.now(LOCAL_TZ).date()
MAX_DATE = TODAY + timedelta(days=210)
COASTAL_MISSISSIPPI_EVENTS_URL = "https://www.coastalmississippi.com/events/"
COASTAL_MISSISSIPPI_LINK_NOTE = "Coastal Mississippi's event page is unavailable right now."
SOURCE_PRIORITY = {
    "Cruisin' the Coast": 5,
    "Jeepin' the Coast": 5,
    "Shoofly Magazine": 3,
    "Hancock Chamber": 2,
    "Coastal Mississippi": 1,
}
DATE_RANGE_PATTERN = re.compile(
    r"\b(?P<start_month>January|February|March|April|May|June|July|August|September|October|November|December)\s+"
    r"(?P<start_day>\d{1,2})\s*-\s*(?:(?P<end_month>January|February|March|April|May|June|July|August|September|October|November|December)\s+)?"
    r"(?P<end_day>\d{1,2}),\s*(?P<year>\d{4})\b",
    re.IGNORECASE,
)
SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (compatible; BayStLouisCampgroundBot/1.0; "
            "+https://github.com/Lsthun/Lsthun.github.io)"
        )
    }
)


@dataclass
class EventItem:
    date: str
    title: str
    location: str
    category: str
    description: str
    url: str
    cta: str
    source: str
    timeLabel: str = ""
    hasLiveLink: bool = True
    linkNote: str = ""

    def dedupe_key(self) -> tuple[str, str, str]:
        normalized_title = re.sub(r"[^a-z0-9]+", " ", self.title.lower()).strip()
        return (self.date, normalized_title, self.location)


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", unescape(value)).strip()


def normalize_location(*parts: Any) -> str:
    text = " ".join(clean_text(str(part)) for part in parts if part)
    lowered = text.lower().replace("saint", "st")

    if "bay st louis" in lowered or "bay st. louis" in lowered:
        return "Bay St. Louis"
    if "waveland" in lowered:
        return "Waveland"
    if "gulfport" in lowered or "biloxi" in lowered:
        return "Gulfport/Biloxi"

    return ""


def infer_category(title: str, description: str, raw_category: str = "") -> str:
    haystack = f"{raw_category} {title} {description}".lower()

    category_rules = [
        ("Dining", ["dinner", "brunch", "food", "burger", "wine", "brew", "taco", "culinary"]),
        ("Festival", ["festival", "parade", "mardi gras", "fest", "crawl", "rodeo", "market", "walk"]),
        ("Arts & Culture", ["art", "museum", "theater", "theatre", "workshop", "gallery", "writing"]),
        ("Family", ["family", "kids", "children", "touch-a-truck", "aquarium", "waterpark"]),
        ("Outdoors", ["beach", "park", "garden", "cruise", "fishing", "golf"]),
        ("Live Music", ["live music", "concert", "band", "music", "show", "tribute"]),
    ]

    for label, keywords in category_rules:
        if any(keyword in haystack for keyword in keywords):
            return label

    if raw_category:
        return clean_text(raw_category)

    return "Community"


def is_public_event(title: str, description: str) -> bool:
    haystack = f"{title} {description}".lower()
    excluded_keywords = [
        "board meeting",
        "committee",
        "ambassador meeting",
        "executive committee",
        "monthly meeting",
        "business after hours",
        "ribbon cutting",
        "power hour",
        "leadership steering",
        "chamber board",
        "education committee",
        "midyear meeting",
        "partners for stennis",
        "coffee call",
    ]
    return not any(keyword in haystack for keyword in excluded_keywords)


def parse_local_datetime(value: str, assume_local: bool = False) -> datetime:
    parsed = date_parser.parse(value)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=LOCAL_TZ if assume_local else UTC)
    return parsed


def in_window(day: date) -> bool:
    return TODAY <= day <= MAX_DATE


def format_clock(value: datetime) -> str:
    return value.astimezone(LOCAL_TZ).strftime("%I:%M %p").lstrip("0")


def format_month_day(value: datetime) -> str:
    return value.astimezone(LOCAL_TZ).strftime("%b %d").replace(" 0", " ")


def format_time_label(start: datetime | None, end: datetime | None, all_day: bool = False) -> str:
    if all_day:
        return "All day"
    if not start or not end:
        return ""

    local_start = start.astimezone(LOCAL_TZ)
    local_end = end.astimezone(LOCAL_TZ)

    if local_start.date() == local_end.date():
        return f"{format_clock(local_start)} - {format_clock(local_end)}"

    return (
        f"{format_month_day(local_start)} {format_clock(local_start)} - "
        f"{format_month_day(local_end)} {format_clock(local_end)}"
    )


def request_text(url: str, *, timeout: int = 30) -> str:
    response = SESSION.get(url, timeout=timeout)
    response.raise_for_status()
    return response.text


def normalize_public_url(url: str | None) -> str:
    normalized = clean_text(url)
    return requests.utils.requote_uri(normalized) if normalized else ""


def build_coastal_mississippi_detail_url(uri: str | None) -> str:
    normalized = clean_text(uri)
    if not normalized:
        return COASTAL_MISSISSIPPI_EVENTS_URL

    if normalized.startswith(("http://", "https://")):
        return normalize_public_url(normalized)

    if normalized.startswith("/events/"):
        return normalize_public_url(urljoin("https://www.coastalmississippi.com", normalized))

    return normalize_public_url(urljoin(COASTAL_MISSISSIPPI_EVENTS_URL, normalized.lstrip("/")))


def url_is_available(url: str, availability_cache: dict[str, bool], *, timeout: int = 20) -> bool:
    if not url:
        return False

    cached = availability_cache.get(url)
    if cached is not None:
        return cached

    response: requests.Response | None = None
    try:
        response = SESSION.head(url, timeout=timeout, allow_redirects=True)
        if response.status_code in {403, 405}:
            response.close()
            response = SESSION.get(url, timeout=timeout, allow_redirects=True, stream=True)

        is_available = 200 <= response.status_code < 400
    except requests.RequestException:
        is_available = False
    finally:
        if response is not None:
            response.close()

    availability_cache[url] = is_available
    return is_available


def extract_date_range(text: str) -> tuple[date, date] | None:
    match = DATE_RANGE_PATTERN.search(clean_text(text))
    if not match:
        return None

    start_month = match.group("start_month")
    start_day = int(match.group("start_day"))
    end_month = match.group("end_month") or start_month
    end_day = int(match.group("end_day"))
    year = int(match.group("year"))

    start_day_value = date_parser.parse(f"{start_month} {start_day} {year}").date()
    end_day_value = date_parser.parse(f"{end_month} {end_day} {year}").date()
    return start_day_value, end_day_value


def format_date_span(start_day: date, end_day: date) -> str:
    start_label = start_day.strftime("%b %d").replace(" 0", " ")
    end_label = end_day.strftime("%b %d").replace(" 0", " ")
    return f"{start_label} - {end_label}, {end_day.year}"


def build_span_items(
    *,
    title: str,
    start_day: date,
    end_day: date,
    location: str,
    description: str,
    url: str,
    source: str,
    category: str,
    time_label: str,
) -> list[EventItem]:
    items: list[EventItem] = []
    current_day = start_day

    while current_day <= end_day:
        if in_window(current_day):
            items.append(
                EventItem(
                    date=current_day.isoformat(),
                    title=title,
                    location=location,
                    category=category,
                    description=description,
                    url=url,
                    cta="View Event",
                    source=source,
                    timeLabel=time_label,
                )
            )
        current_day += timedelta(days=1)

    return items


def scrape_jeepin_the_coast() -> tuple[list[EventItem], dict[str, Any]]:
    source_name = "Jeepin' the Coast"
    official_url = "https://jeepinthecoast.com/"
    official_html = request_text(official_url)
    official_text = BeautifulSoup(official_html, "html.parser").get_text(" ", strip=True)
    parsed_range = extract_date_range(official_text)

    if parsed_range is None:
        return [], {
            "name": source_name,
            "status": "error",
            "itemCount": 0,
            "notes": "JeepinTheCoast.com did not expose a parsable annual date range on the public page.",
        }

    start_day, end_day = parsed_range
    description = (
        f"Major Gulf Coast Jeep festival with Bay St. Louis activity during the run. "
        f"Official {start_day.year} dates: {format_date_span(start_day, end_day)}. "
        "Long Beach Breeze coverage notes Bay St. Louis after-parties and the final Sunday meet-up."
    )
    items = build_span_items(
        title="Jeepin' the Coast",
        start_day=start_day,
        end_day=end_day,
        location="Bay St. Louis",
        category="Festival",
        description=description,
        url=official_url,
        source=source_name,
        time_label="Multi-day event",
    )

    return items, {
        "name": source_name,
        "status": "ok",
        "itemCount": len(items),
        "notes": (
            "Canonical dates pulled from JeepinTheCoast.com. Community reference to monitor: "
            "https://www.longbeachbreeze.com/2025/05/14/jeepin-the-coast-set-for-may-28-to-june-1/ "
            "and prior Long Beach Breeze coverage at "
            "https://www.longbeachbreeze.com/2023/05/17/long-beach-revving-up-for-5th-annual-jeepin-the-coast/."
        ),
    }


def scrape_cruisin_the_coast() -> tuple[list[EventItem], dict[str, Any]]:
    source_name = "Cruisin' the Coast"
    official_url = "https://www.cruisinthecoast.com/"
    official_html = request_text(official_url)
    official_text = BeautifulSoup(official_html, "html.parser").get_text(" ", strip=True)
    parsed_range = extract_date_range(official_text)

    if parsed_range is None:
        return [], {
            "name": source_name,
            "status": "error",
            "itemCount": 0,
            "notes": "CruisinTheCoast.com did not expose a parsable annual date range on the public page.",
        }

    start_day, end_day = parsed_range
    description = (
        f"Weeklong classic-car festival with Bay St. Louis as an official venue during Cruisin' week. "
        f"Official {start_day.year} dates: {format_date_span(start_day, end_day)}. "
        "The official schedule includes Bay St. Louis venue days and Bay St. Louis-area entertainment during the event window."
    )
    items = build_span_items(
        title="Cruisin' the Coast",
        start_day=start_day,
        end_day=end_day,
        location="Bay St. Louis",
        category="Festival",
        description=description,
        url="https://www.cruisinthecoast.com/schedule/",
        source=source_name,
        time_label="Multi-day event",
    )

    return items, {
        "name": source_name,
        "status": "ok",
        "itemCount": len(items),
        "notes": (
            "Canonical dates pulled from CruisinTheCoast.com. Community reference to monitor: "
            "https://www.longbeachbreeze.com/2025/08/18/cruisin-the-coast-2025-is-just-around-the-corner/ "
            "and the Long Beach Breeze search hub at https://www.longbeachbreeze.com/?s=Cruisin%27+the+Coast."
        ),
    }


def scrape_coastal_mississippi() -> tuple[list[EventItem], dict[str, Any]]:
    source_name = "Coastal Mississippi"
    page_html = request_text("https://www.coastalmississippi.com/events/")
    soup = BeautifulSoup(page_html, "html.parser")
    listings_block = soup.select_one(".listings")
    if listings_block is None:
        return [], {"name": source_name, "status": "error", "itemCount": 0, "notes": "Listings block was not found."}

    info = json.loads(listings_block.get("data-info", "{}"))
    config = json.loads(listings_block.get("data-config", "{}"))
    app_id = info["appId"]
    api_key = info["apiKey"]
    index_name = info["index"]
    algolia_url = f"https://{app_id.lower()}-dsn.algolia.net/1/indexes/{index_name}/query"

    items: list[EventItem] = []
    url_availability: dict[str, bool] = {}
    page = 0
    total_pages = 1

    while page < total_pages:
        params = {
            "hitsPerPage": 100,
            "page": page,
            "filters": config.get("filters", ""),
        }
        response = SESSION.post(
            algolia_url,
            timeout=30,
            headers={
                "X-Algolia-API-Key": api_key,
                "X-Algolia-Application-Id": app_id,
                "Content-Type": "application/json",
            },
            json={"params": urlencode(params)},
        )
        response.raise_for_status()
        payload = response.json()
        total_pages = int(payload.get("nbPages", 0) or 0)

        for hit in payload.get("hits", []):
            location = normalize_location(hit.get("partnerRegions"), hit.get("address"), hit.get("title"), hit.get("content"))
            if not location:
                continue

            start = datetime.fromtimestamp(hit["startDate"], UTC)
            end = datetime.fromtimestamp(hit.get("endDate", hit["startDate"]), UTC)
            if not in_window(start.date()):
                continue

            description = clean_text(hit.get("content") or hit.get("snippet"))
            title = clean_text(hit.get("title"))
            if not title or not is_public_event(title, description):
                continue

            detail_url = build_coastal_mississippi_detail_url(hit.get("uri"))
            raw_categories = hit.get("eventCategories") or []
            category = infer_category(title, description, raw_categories[0] if raw_categories else "")
            has_live_link = url_is_available(detail_url, url_availability)
            item_url = detail_url if has_live_link else COASTAL_MISSISSIPPI_EVENTS_URL
            item_cta = "View Event" if has_live_link else "Browse Coastal Mississippi events"
            link_note = "" if has_live_link else COASTAL_MISSISSIPPI_LINK_NOTE

            items.append(
                EventItem(
                    date=start.date().isoformat(),
                    title=title,
                    location=location,
                    category=category,
                    description=description,
                    url=item_url,
                    cta=item_cta,
                    source=source_name,
                    timeLabel="" if hit.get("isAllDay") else format_time_label(start, end),
                    hasLiveLink=has_live_link,
                    linkNote=link_note,
                )
            )

        page += 1

    broken_url_count = sum(1 for is_available in url_availability.values() if not is_available)

    return items, {
        "name": source_name,
        "status": "ok",
        "itemCount": len(items),
        "notes": (
            "Pulled from the public Algolia listings index exposed on the events page. "
            f"Validated {len(url_availability)} linked detail pages; {broken_url_count} fell back to the main events listing."
        ),
    }


def parse_chamber_detail(detail_url: str) -> dict[str, str]:
    html = request_text(detail_url)
    soup = BeautifulSoup(html, "html.parser")
    description = ""

    for subtitle in soup.select("h3.gz-subtitle"):
        if clean_text(subtitle.get_text(" ", strip=True)).lower() != "description":
            continue
        container = subtitle.parent
        paragraphs = [clean_text(node.get_text(" ", strip=True)) for node in container.find_all("p")]
        description = clean_text(" ".join(paragraphs))
        break

    location_node = soup.select_one('[itemprop="location"]')
    location_text = clean_text(location_node.get_text(" ", strip=True)) if location_node else ""

    return {
        "description": description,
        "location": location_text,
    }


def scrape_hancock_chamber() -> tuple[list[EventItem], dict[str, Any]]:
    source_name = "Hancock Chamber"
    html = request_text("https://business.hancockchamber.org/community-calendar")
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.select(".gz-events-card")
    detail_cache: dict[str, dict[str, str]] = {}
    items: list[EventItem] = []

    for card in cards:
        title_link = card.select_one(".gz-event-card-title")
        start_meta = card.select_one('meta[itemprop="startDate"]')
        end_meta = card.select_one('meta[itemprop="endDate"]')
        time_node = card.select_one(".gz-event-card-time")
        teaser_node = card.select_one(".gz-events-description")

        if not title_link or not start_meta:
            continue

        start = parse_local_datetime(start_meta["content"], assume_local=True)
        end = parse_local_datetime(end_meta["content"], assume_local=True) if end_meta else None
        if not in_window(start.date()):
            continue

        title = clean_text(title_link.get_text(" ", strip=True))
        detail_url = urljoin("https://business.hancockchamber.org/", title_link.get("href", ""))
        if not title or not detail_url:
            continue

        if detail_url not in detail_cache:
            detail_cache[detail_url] = parse_chamber_detail(detail_url)
        detail = detail_cache[detail_url]

        description = detail.get("description") or clean_text(teaser_node.get_text(" ", strip=True) if teaser_node else "")
        if not is_public_event(title, description):
            continue

        location = normalize_location(detail.get("location"), title, description)
        if not location:
            continue

        items.append(
            EventItem(
                date=start.date().isoformat(),
                title=title,
                location=location,
                category=infer_category(title, description),
                description=description,
                url=detail_url,
                cta="View Event",
                source=source_name,
                timeLabel=clean_text(time_node.get_text(" ", strip=True) if time_node else ""),
            )
        )

    return items, {
        "name": source_name,
        "status": "ok",
        "itemCount": len(items),
        "notes": "Scraped from GrowthZone event cards and detail pages.",
    }


def scrape_shoofly() -> tuple[list[EventItem], dict[str, Any]]:
    source_name = "Shoofly Magazine"
    html = request_text("https://tockify.com/shooflymagazine?view=agenda")
    soup = BeautifulSoup(html, "html.parser")
    script = soup.select_one('script[type="application/ld+json"]')
    if script is None or not script.string:
        return [], {
            "name": source_name,
            "status": "error",
            "itemCount": 0,
            "notes": "Shoofly agenda page did not expose JSON-LD event data.",
        }

    raw_payload = json.loads(script.string)
    raw_events = raw_payload if isinstance(raw_payload, list) else [raw_payload]
    items: list[EventItem] = []

    for raw_event in raw_events:
        title = clean_text(raw_event.get("name"))
        description = clean_text(raw_event.get("description"))
        if not title or not is_public_event(title, description):
            continue

        start = parse_local_datetime(raw_event["startDate"])
        end = parse_local_datetime(raw_event.get("endDate", raw_event["startDate"]))
        if not in_window(start.astimezone(LOCAL_TZ).date()):
            continue

        location_info = raw_event.get("location", {})
        address = location_info.get("address", {}) if isinstance(location_info, dict) else {}
        location = normalize_location(
            location_info.get("name") if isinstance(location_info, dict) else "",
            address.get("addressLocality") if isinstance(address, dict) else "",
            description,
        )
        if not location:
            continue

        items.append(
            EventItem(
                date=start.astimezone(LOCAL_TZ).date().isoformat(),
                title=title,
                location=location,
                category=infer_category(title, description),
                description=description,
                url=clean_text(raw_event.get("url")),
                cta="View Event",
                source=source_name,
                timeLabel=format_time_label(start, end),
            )
        )

    return items, {
        "name": source_name,
        "status": "ok",
        "itemCount": len(items),
        "notes": "Pulled from the public Tockify agenda page JSON-LD payload.",
    }


def inspect_old_town() -> dict[str, Any]:
    source_name = "Old Town Merchants Association"
    html = request_text("https://www.baystlouisoldtown.com/events/")
    soup = BeautifulSoup(html, "html.parser")
    tockify_node = soup.select_one("[data-tockify-calendar]")
    calendar_name = tockify_node.get("data-tockify-calendar", "") if tockify_node else ""

    if not calendar_name:
        return {
            "name": source_name,
            "status": "error",
            "itemCount": 0,
            "notes": "No Tockify calendar identifier was found on the Old Town events page.",
        }

    agenda_html = request_text(f"https://tockify.com/{calendar_name}?view=agenda")
    agenda_soup = BeautifulSoup(agenda_html, "html.parser")
    has_jsonld = bool(agenda_soup.select_one('script[type="application/ld+json"]'))

    return {
        "name": source_name,
        "status": "unavailable",
        "itemCount": 0,
        "notes": (
            "Old Town uses a Tockify calendar, but its public agenda page did not expose "
            "server-rendered event records or JSON-LD for automated scraping."
            if not has_jsonld
            else "Old Town exposes structured data and can be added later."
        ),
    }


def inspect_city_special_events() -> dict[str, Any]:
    source_name = "City of Bay St. Louis"
    response = SESSION.get("https://www.baystlouis-ms.gov/special-events", timeout=30)
    if response.status_code == 403 and "Just a moment" in response.text:
        return {
            "name": source_name,
            "status": "blocked",
            "itemCount": 0,
            "notes": "Cloudflare protection blocked automated access to the city special events page.",
        }

    return {
        "name": source_name,
        "status": "limited",
        "itemCount": 0,
        "notes": "The city page lists annual event hubs, but not machine-readable dated calendar entries.",
    }


def dedupe_items(items: list[EventItem]) -> list[EventItem]:
    winners: dict[tuple[str, str, str], EventItem] = {}
    for item in items:
        key = item.dedupe_key()
        current = winners.get(key)
        if current is None or SOURCE_PRIORITY.get(item.source, 0) > SOURCE_PRIORITY.get(current.source, 0):
            winners[key] = item

    return sorted(winners.values(), key=lambda item: (item.date, item.location, item.title))


def write_payload_files(payload: dict[str, Any]) -> None:
    json_text = json.dumps(payload, indent=2)
    OUTPUT_PATH.write_text(json_text, encoding="utf-8")
    EMBEDDED_OUTPUT_PATH.write_text(
        f"window.__ATTRACTIONS_FEED__ = {json_text};\n",
        encoding="utf-8",
    )


def main() -> None:
    source_reports: list[dict[str, Any]] = []
    all_items: list[EventItem] = []

    for scraper in (
        scrape_jeepin_the_coast,
        scrape_cruisin_the_coast,
        scrape_shoofly,
        scrape_hancock_chamber,
        scrape_coastal_mississippi,
    ):
        try:
            items, report = scraper()
        except Exception as exc:  # pragma: no cover - defensive logging path
            report = {
                "name": scraper.__name__,
                "status": "error",
                "itemCount": 0,
                "notes": str(exc),
            }
            items = []

        source_reports.append(report)
        all_items.extend(items)

    for inspector in (inspect_old_town, inspect_city_special_events):
        try:
            source_reports.append(inspector())
        except Exception as exc:  # pragma: no cover - defensive logging path
            source_reports.append(
                {
                    "name": inspector.__name__,
                    "status": "error",
                    "itemCount": 0,
                    "notes": str(exc),
                }
            )

    unique_items = dedupe_items(all_items)
    payload = {
        "generatedAt": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "window": {
            "start": TODAY.isoformat(),
            "end": MAX_DATE.isoformat(),
        },
        "sources": source_reports,
        "items": [item.__dict__ for item in unique_items],
    }

    write_payload_files(payload)
    print(f"Wrote {len(unique_items)} events to {OUTPUT_PATH} and {EMBEDDED_OUTPUT_PATH}")


if __name__ == "__main__":
    main()