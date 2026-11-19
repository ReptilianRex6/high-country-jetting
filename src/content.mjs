export const business = {
  name: "High Country Jetting",
  phone: "(435) 823-5388",
  tel: "+14358235388",
  email: "highcountryjetting@gmail.com",
  domain: "https://www.highcountryjetting.com",
};
export const services = [
  [
    "hydro-jetting",
    "Hydro-jetting",
    "A thorough clean for stubborn buildup.",
    "High-pressure water clears grease, sludge, roots, and debris from drain and sewer lines. We assess the line and choose an appropriate cleaning method for the job.",
  ],
  [
    "drain-cleaning",
    "Drain cleaning",
    "Get things moving again.",
    "Professional snaking helps clear blockages in smaller residential lines. Depending on the condition of the pipe, jetting may follow to remove remaining buildup.",
  ],
  [
    "descaling",
    "Pipe descaling",
    "Help older pipes flow freely.",
    "Mechanical descaling removes accumulated scale and corrosion from cast iron and older metal drain lines. An inspection helps determine whether descaling is right for your pipes.",
  ],
  [
    "inspection",
    "Camera inspections",
    "See what’s happening underground.",
    "Sewer cameras help identify blockages, buildup, and visible pipe damage. Ask about troubleshooting, property inspections, or planning maintenance.",
  ],
  [
    "locating",
    "Line locating",
    "Know where your line runs.",
    "Electronic equipment helps trace underground sewer lines and their depth before repair or excavation. Contact us to discuss the line you need located.",
  ],
];
export const other = [
  [
    "Gutter cleaning",
    "Clearing leaves and debris, flushing channels, and cleaning downspouts to help water drain away from your property.",
  ],
  [
    "Chimney sweeping",
    "Cleaning for fireplaces and wood-burning stoves to remove soot and creosote. Available work depends on safe access and the condition of the chimney.",
  ],
  [
    "Power washing",
    "Hot-water pressure washing for residential surfaces, commercial sites, and equipment. Tell us about the surface and buildup so we can discuss the right approach.",
  ],
];
// Approved real client photos only: {src, alt, caption, width, height}.
export const work = [
  { slug: 'jetting-equipment', alt: 'High Country Jetting trailer and hoses at an outdoor job site', caption: 'Jetting equipment on site', width: 1280, height: 1707 },
  { slug: 'indoor-drain-work', alt: 'Technician feeding a green hose into an indoor drain access', caption: 'Indoor drain service', width: 1280, height: 1707 },
  { slug: 'drain-inspection', alt: 'Technician working beside drain inspection equipment indoors', caption: 'A closer look at the line', width: 1280, height: 1707 },
  { slug: 'gutter-cleaning', alt: 'Open roof gutter with debris and cleaning equipment', caption: 'Gutter cleaning in progress', width: 1280, height: 1707 },
  { slug: 'gutter-detail', alt: 'Close view beneath a gutter guard during maintenance', caption: 'Gutter maintenance up close', width: 1280, height: 1707 },
  { slug: 'jetting-trailer', alt: 'High Country Jetting equipment trailer parked inside a workshop', caption: 'Equipment ready for the next job', width: 1125, height: 2000 },
];

// Confirmed communities in Uintah and Duchesne counties.
// The service area runs from Fruitland to Jensen.
// Only Vernal, Roosevelt, and Duchesne get their own pages.
export const towns = [
  {
    slug: "vernal",
    name: "Vernal",
    county: "Uintah",
    page: true,
    lead: "Hydro-jetting, drain cleaning, and sewer camera inspections for homes and businesses in Vernal, Utah.",
    blurb:
      "Naples and Ballard are nearby Uintah County communities in the same service area. Call with the town and what the line is doing: a slow drain, a backup, or a look with a camera before any repair.",
  },
  { slug: "naples", name: "Naples", county: "Uintah" },
  { slug: "ballard", name: "Ballard", county: "Uintah" },
  { slug: "fort-duchesne", name: "Fort Duchesne", county: "Uintah" },
  { slug: "jensen", name: "Jensen", county: "Uintah" },
  {
    slug: "roosevelt",
    name: "Roosevelt",
    county: "Duchesne",
    page: true,
    lead: "Hydro-jetting, drain cleaning, and sewer camera inspections for homes and businesses in Roosevelt, Utah.",
    blurb:
      "Roosevelt is in Duchesne County. Myton lies west of town, and Ballard and Fort Duchesne are nearby communities in the service area. Tell us the town and what’s going on, and we’ll talk through the next step.",
  },
  {
    slug: "duchesne",
    name: "Duchesne",
    county: "Duchesne",
    page: true,
    lead: "Hydro-jetting, drain cleaning, and sewer camera inspections for homes and businesses in Duchesne, Utah.",
    blurb:
      "Duchesne is in Duchesne County, west of Roosevelt and Myton. Altamont and Tabiona are smaller communities in the same county and the same service area. Call with the town and a short description of the problem.",
  },
  { slug: "myton", name: "Myton", county: "Duchesne" },
  { slug: "altamont", name: "Altamont", county: "Duchesne" },
  { slug: "tabiona", name: "Tabiona", county: "Duchesne" },
  { slug: "fruitland", name: "Fruitland", county: "Duchesne" },
];

export const faqs = [
  {
    q: "Do you serve Vernal?",
    a: `Yes. Vernal is in Uintah County, in the Uintah Basin area we cover. Call or text ${business.phone} with the town and what’s happening with the line.`,
  },
  {
    q: "Do you serve Roosevelt and Duchesne?",
    a: "Yes. Roosevelt and Duchesne are in Duchesne County. The service area runs from Fruitland to Jensen and also includes Ballard, Naples, Myton, Fort Duchesne, Altamont, and Tabiona. If the job is outside Uintah and Duchesne counties, call and we’ll discuss availability.",
  },
  {
    q: "What’s the difference between hydro-jetting and snaking?",
    a: "Snaking helps clear a blockage in a smaller residential line. Hydro-jetting uses high-pressure water to clear grease, sludge, roots, and debris from the pipe. Depending on the condition of the line, jetting may follow a snake to wash out what’s left. We assess the line and choose an appropriate method.",
  },
  {
    q: "How do I request service?",
    a: `Call or text ${business.phone}, or email ${business.email}. Share your name, the town, what’s happening, and a good time to talk. Please call for urgent issues. Email response times can vary.`,
  },
];

// Public profiles. The build copies these URLs into JSON-LD sameAs.
export const profiles = [
  {
    label: "Google Business Profile",
    url: "https://maps.app.goo.gl/GthDx15HMS8DQn7VA",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/people/High-Country-Jetting/61577259598908/",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/highcountryjetting/",
  },
];

// TODO(owner): postal address to publish, or leave null.
// Shape: { "@type": "PostalAddress", streetAddress, addressLocality, addressRegion, postalCode, addressCountry }
export const address = null;

// TODO(owner): hours to publish, or leave null. The site does not state hours today.
// Shape: ["Mo-Fr 08:00-17:00"]  (schema.org openingHours text)
export const openingHours = null;

// TODO(owner): map coordinates to publish, or leave null.
// Shape: { "@type": "GeoCoordinates", latitude, longitude }
export const geo = null;
