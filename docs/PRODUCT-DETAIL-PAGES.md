# Product detail pages

All 18 active product IDs have full detail content in `catalogue/product-details.json`.
Short card descriptions remain in `catalogue/products.json`. The detail page adds
an introduction, overview, model-specific features, benefits, use cases,
specifications, ordering guidance and FAQs. Existing owner-edited descriptions
and specifications remain visible; no database records are changed by this work.

The gallery retains every supplied photo and its current order. The cover chosen
in admin remains the first image. Large, horizontally scrollable thumbnails,
previous/next arrows, keyboard navigation, touch swipes and a native-dialog viewer
provide access to the full set. Zoomed images scroll within the viewer. Escape
closes it and restores page scrolling. Thumbnail selection moves the thumbnail
rail without unexpectedly scrolling the whole page.

## Content basis

Capacities and product categories come from the supplied catalogue. For portable
power stations, additional connections and charging inputs come from the supplied
posters in each corresponding `public/products/Power Stations(ALL)` folder:

- 400W/256Wh: YJ-911 poster shows USB and 12V DC, LiFePO4 and solar input below
  50W. No AC outlet is promised for this variant.
- 500W/384Wh: Model 905 poster shows two AC sockets, USB/12V, an LED light and
  solar input up to 100W. The 384Wh name agrees with the poster's 12.8V/30Ah.
- 800W/576Wh: CNS800WA poster lists LiFePO4, two AC outlets, USB-C PD and solar
  input up to 150W.
- 1000W/768Wh: the supplied 3AC poster shows three AC outlets, USB/Type-C/12V
  and LED lighting. No battery chemistry or solar wattage is invented.
- 1500W/1152Wh: CNS1500WA poster lists LiFePO4, four AC sockets, USB-C PD and
  solar input up to 300W. Alternate photos in the folder may show another variant;
  the page asks the buyer to confirm the exact supplied configuration.
- 3000W/2662Wh: CNS3000WA poster lists LiFePO4, four AC sockets, USB-C PD, LED
  lighting and solar input up to 550W.

Fan and chair content describes visible construction in supplied photos and
asks for demonstrations/specifications where capabilities are not documented.
No exact battery-cell chemistry, cycle life, warranty duration, panel wattage,
weather rating, chair medical outcome or appliance runtime is manufactured.

General buying explanations were checked against these primary references:

- https://www.energy.gov/cmei/systems/solar-photovoltaic-technology-basics
- https://www.victronenergy.com/inverters-chargers/help-me-choose

These explain general technology; they are not datasheets for Rahat products.

## Verification

Content coverage tests check all active products, minimum information depth,
model-specific connections and the separation of watts from watt-hours.
`docs/product-detail-qa.json` records desktop/mobile browser interactions.
