# Feature requests and status

> Last updated: 2026-11-12. Owner: product (user). Work is split between two agents:
> backend (dev-b, `ftms` app) and frontend (`ftms-frontend`, Vercel `tms-web.celtcoksa.com`).

## Brand and UI
| # | Request | Status | Where |
|---|---------|--------|-------|
| B1 | Show company name in Thuluth-style font where FTMS was | Done (font: Amiri, closest Google font to Thuluth) | frontend `e534eea` |
| B2 | Install Google Fonts (Arabic, Urdu, Calibri-style Latin) | Done (Carlito for Latin, Amiri, Aref Ruqaa, Lateef, Noto Naskh, Noto Nastaliq) | frontend `ffca391`, `594e448` |
| B3 | Operator line: "شرکۃ النعمانیۃ کی جانب سے" | Done | frontend `9e25fdf` |
| B4 | App name | Done: **Al Haramain Taxi / الحرمین ٹیکسی** (user confirmed it is not the Haramain train brand) | frontend `51138eb`, `1c5925b` |
| B5 | Bookings page title: keep "Bookings" (not company name) | Done (reverted) | frontend |

## Login
| # | Request | Status | Where |
|---|---------|--------|-------|
| L1 | Google sign-in on tms-web via Firebase `tms-web-129f5` | Done, user confirmed login works | frontend `239534f`; backend `61c4b0d`, `3b15b31` |
| L2 | Same email in RideKSA and tms-web (different Firebase UIDs) | Done | backend `3b15b31` |
| L3 | Show capabilities (captain/passenger) in current user | Done | backend `263952b` |

## Driver features (new and common taxi drivers)
| # | Request | Status | Backend | Frontend |
|---|---------|--------|---------|----------|
| D1 | Home screen: big online/offline button | Done (card in driver workspace) | `subscription.set_online` (existing) | `22c5bf3` (needs live test by user) |
| D2 | Today's trips and earnings on home | Backend done | `ftms.api.driver_home.get_driver_home` (`d39f7a3`) | **To do**: show `trips_today`, `gross_today`, `driver_share_today` on the home card |
| D3 | Document expiry reminders (iqama, license, driver card, vehicle registration, insurance, operation card) | Backend done (30 days or expired) | `get_driver_home.expiring_documents` | **To do**: list them on the home card with days left |
| D4 | Subscription status clearly shown | Partly done (days/hours on card) | existing `check_status` | To do: payment button and "expired" message |
| D5 | Simple Urdu UI, big buttons, one-question onboarding | Not started | — | To do |
| D6 | One-screen trip flow (start / arrived / finish) | Not started | to check | To do |
| D7 | WhatsApp: send photo, get trip and print link back | Not started (big) | needs Meta/WhatsApp setup | — |
| D8 | Short video or picture guides | Not started | — | To do |
| D9 | Support button (WhatsApp) | Not started | — | To do |
| D10 | Offline-friendly trip data | Not started | — | To do (PWA partly exists) |

## Passenger app (future, large)
| # | Request | Status |
|---|---------|--------|
| P1 | Passenger can book a ride (like inDriver): passenger login, pick pickup and drop-off, see price, driver accepts | Not started |
| P2 | City to city trips (intercity), Saudi market first | Not started |
| P3 | Usable in other countries: currency, language, tax and payment by country | Not started |

## Frontend follow-up brief (for the other agent)
1. Wire the driver home card to `ftms.api.driver_home.get_driver_home`:
   - Show today's trips count and money (`gross_today`, `driver_share_today`).
   - List `expiring_documents` (name, days left, expiry date). Red if `days_left` < 0, amber if <= 7.
2. Add `api.driverHome()` in `src/lib/api.js` calling `ftms.api.driver_home.get_driver_home`.
3. Keep Urdu labels. Test on a phone width (375px).
4. Do not change the backend. Report any field that is missing.

## Notes and open questions
- Earnings: `driver_share_today = trip_value - driver_commission_amount`. Confirm with the user that the commission is the company share. Currently only `Trip` records with `trip_status = Completed`, `trip_date = today`, and `assigned_captain_user = you` are counted.
- Expiry check covers `Captain Profile` (own) and `Vehicle` (assigned to you).
