# Reherbalizer

Reherbalizer is a community-focused website supporting township youth affected by drug abuse through herbal wellness, peer support, life-skills coaching, and positive community care.

**Live site:** https://thelisper.github.io/Reherbilizer/

## What the site includes

- **Home:** programme overview, illustrated service cards, and an accessible image gallery with a lightbox
- **About:** organisation values presented in an interactive accordion
- **Services:** dynamically rendered programmes with search, category filtering, sorting, cost, and availability details
- **Enquiry:** validated service, volunteering, and sponsorship enquiries with immediate cost and availability feedback
- **Contact:** validated contact form and an interactive Leaflet/OpenStreetMap map
- **Responsive layout:** desktop and mobile navigation, reduced-motion support, and accessible form statuses
- **SEO:** page descriptions, Open Graph metadata, canonical URLs, structured data, and a sitemap

## Services currently configured

| Service | Cost | Availability |
| --- | --- | --- |
| Herbal Therapy | Free for youth | Tuesdays and Thursdays, 16:00 |
| Life-Skills Coaching | R50 per session; sponsored places available | Mondays and Wednesdays, 15:30 |
| Community Support Programs | Free | Saturdays, 10:00 |

Service information is defined in `script.js` and can be updated by editing the `SERVICES` array.

## Project structure

```text
.
├── index.html          # Home page and image gallery
├── pages/
│   ├── about.html      # About page and accordion
│   ├── services.html   # Searchable service directory
│   ├── enquiry.html    # Service, volunteer, and sponsor enquiry form
│   └── contact.html    # Contact form and interactive map
├── assets/             # Site artwork and illustrations
├── script.js           # Shared interactions, data, validation, and form handling
├── styles.css          # Shared responsive styling
├── sitemap.xml         # Search engine sitemap
└── .vscode/            # Local launch configuration
```

## Running locally

The site has no build step. Serve the project directory to avoid browser restrictions around local files:

```powershell
python -m http.server 8080
```

Then open http://localhost:8080. The repository also includes a VS Code Edge launch configuration for port 8080.

You can also open `index.html` directly, or use the VS Code Live Preview or Live Server extension.

## Configuration

Before publishing, replace the sample values in `script.js`:

- `RECIPIENT`: the email address that receives contact and enquiry submissions
- `MAP_CENTER`: the latitude and longitude displayed on the map
- `SERVICES`: programme names, categories, descriptions, costs, and availability

The forms use FormSubmit for AJAX delivery. Replace the placeholder `you@example.com` action URLs in the enquiry and contact pages with the same real recipient used by `RECIPIENT`.

## Accessibility and safety

- Keyboard-accessible navigation, gallery controls, accordion controls, forms, and lightbox
- Visible validation messages and live status feedback
- Reduced-motion support and semantic page landmarks
- Herbal programmes are clearly presented as support that does not replace professional medical care

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- FormSubmit
- Leaflet and OpenStreetMap

## Mission

To help young people find healing, purpose, and a healthier future through support, guidance, natural wellness, and community care.
