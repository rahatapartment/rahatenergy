export const categoryContent = [
  {
    slug: "solar-panels",
    category: "Solar Panels",
    title: "Start with the sun.",
    intro:
      "Explore the starting point of a solar energy system. Compare the provisional panel options, then request the specifications for your project.",
    description:
      "Solar panels turn sunlight into electricity. The right choice depends on available space, the rest of your system and the output you need.",
    checks: [
      "Available roof or installation space",
      "Panel dimensions and mounting requirements",
      "Compatibility with the proposed inverter",
      "Verified model, output and warranty details",
    ],
    productDescription:
      "Explore this panel as part of your solar shortlist. Request the exact model, dimensions and electrical specifications before choosing it for a system.",
  },
  {
    slug: "solar-inverters",
    category: "Solar Inverters",
    title: "Bring your system together.",
    intro:
      "Explore inverter options for your energy setup, with room to confirm the details before you choose.",
    description:
      "An inverter converts electricity into a form your appliances can use. Selecting one starts with understanding your loads and how it will work with panels, batteries and any existing supply.",
    checks: [
      "Appliances and equipment you want to power",
      "Existing solar and battery equipment",
      "Manufacturer compatibility requirements",
      "Verified capacity, operating modes and warranty",
    ],
    productDescription:
      "Add this inverter to your shortlist and ask for a verified specification sheet. Compatibility, operating modes and the demands of your appliances need to be reviewed together.",
  },
  {
    slug: "battery-storage",
    category: "Battery Storage",
    title: "Make space for stored energy.",
    intro:
      "Explore battery storage options and start a conversation about the energy you want available later.",
    description:
      "A battery stores energy for later use. Usable capacity and the way a battery works with your inverter matter as much as the product name.",
    checks: [
      "Equipment you need to keep running",
      "The backup duration you want to discuss",
      "Inverter and battery compatibility",
      "Verified usable capacity, installation and warranty",
    ],
    productDescription:
      "Consider this battery as a starting point for a storage enquiry. Request confirmed usable capacity, compatible equipment and installation requirements; runtime depends on the complete system and connected loads.",
  },
  {
    slug: "solar-lighting",
    category: "Solar Lighting",
    title: "A brighter outdoor space.",
    intro:
      "Explore lighting ideas for outdoor areas, entrances and other spaces where you want to discuss a solar-powered option.",
    description:
      "Choosing outdoor lighting starts with the space. Position, coverage, mounting and operating conditions should be reviewed alongside the product specifications.",
    checks: [
      "The area you want to illuminate",
      "Mounting position and installation height",
      "Expected operating schedule",
      "Verified light output, weather protection and warranty",
    ],
    productDescription:
      "Shortlist this lighting option for your outdoor space. Ask for verified light output, mounting requirements and operating details before deciding whether it suits the location.",
  },
  {
    slug: "energy-accessories",
    category: "Energy Accessories",
    title: "The details complete the system.",
    intro:
      "Explore the supporting components for a considered energy setup, from mounting to connections and charge control.",
    description:
      "Accessories need to suit the equipment they connect. Confirm the ratings, dimensions and manufacturer requirements for the complete installation.",
    checks: [
      "The equipment the accessory must work with",
      "Required electrical and mechanical ratings",
      "Cable lengths, mounting layout or controller needs",
      "Verified component specifications and quantities",
    ],
    productDescription:
      "Include this accessory in a project enquiry so its specification can be checked against the rest of the system. Exact ratings, dimensions and included components require confirmation.",
  },
] as const;
export const solutionContent = [
  {
    slug: "home",
    label: "For your home",
    title: "Energy around your everyday.",
    intro:
      "Start with the moments that matter at home. Tell us what you want to power, the space you have and what you would like your energy setup to do.",
    audience: "Homes and everyday living",
    image: "solar-home",
    categories: ["Solar Panels", "Solar Inverters", "Battery Storage"],
    prompts: [
      "Which appliances are your priorities?",
      "What equipment is already installed?",
      "Where could panels and storage be located?",
      "What location and project timeline should be considered?",
    ],
    steps: [
      [
        "Start with your needs",
        "List the appliances and routines you want to discuss, rather than choosing a system by a product name alone.",
      ],
      [
        "Consider the whole setup",
        "Explore panels, an inverter and storage together. Suitability depends on the combination and your location.",
      ],
      [
        "Confirm the proposal",
        "Request a written quote with verified equipment specifications, scope, pricing and any delivery or installation arrangements.",
      ],
    ],
  },
  {
    slug: "business",
    label: "For your business",
    title: "Plan around the way you work.",
    intro:
      "From a workspace to a growing operation, a useful energy conversation starts with your equipment, working hours and priorities.",
    audience: "Workspaces and business projects",
    image: "inverters",
    categories: ["Solar Panels", "Solar Inverters", "Battery Storage"],
    prompts: [
      "Which equipment is essential during working hours?",
      "What are your operating hours and peak-use periods?",
      "Do you have existing solar, storage or other power equipment?",
      "Who should be involved in reviewing the project requirements?",
    ],
    steps: [
      [
        "Define the priorities",
        "Separate essential equipment from other loads and explain what continuity means for your operation.",
      ],
      [
        "Share the site context",
        "Provide your location, available space and existing equipment so the project can be discussed in context.",
      ],
      [
        "Review the scope",
        "Confirm equipment, quantities, project responsibilities and commercial terms in a written proposal before committing.",
      ],
    ],
  },
  {
    slug: "bulk-projects",
    label: "Bulk & project enquiries",
    title: "Think bigger. Start with the details.",
    intro:
      "Bring your product list, quantities and project requirements into one enquiry. Keep the conversation focused on what needs to be confirmed.",
    audience: "Larger purchases and project planning",
    image: "panels",
    categories: ["Solar Panels", "Solar Lighting", "Energy Accessories"],
    prompts: [
      "Which products and quantities are you considering?",
      "Are model substitutions acceptable for review?",
      "Is delivery needed to one location or multiple locations?",
      "What documentation and project timing do you need to discuss?",
    ],
    steps: [
      [
        "Build your list",
        "Identify the products or categories, required quantities and specifications that matter to your project.",
      ],
      [
        "Discuss availability",
        "Ask for confirmation of exact models, stock and expected arrangements. A catalogue listing is not a stock commitment.",
      ],
      [
        "Agree the details",
        "Review itemised prices, delivery, scope and applicable terms in the written quotation before placing an order.",
      ],
    ],
  },
] as const;
export const faqs = [
  {
    question: "Where should I start if I am new to solar?",
    answer:
      "Start with what you want to power, your location and any equipment you already have. Visit the home or business solution page, then use the quote form to share those details.",
  },
  {
    question: "Are these product models and specifications confirmed?",
    answer:
      "The current collection contains 15 provisional product identities. Product photographs are illustrative. Ask for the exact manufacturer, model and verified specification sheet before making a decision.",
  },
  {
    question: "Why do some products say “Price on request”?",
    answer:
      "A price is shown only when an operational price has been configured. Unpriced products can be saved to your cart as a shortlist and included in an enquiry. A saved item does not lock a price.",
  },
  {
    question: "Can I pay or place an order on the website?",
    answer:
      "Checkout supports Paystack test payments when database, pricing, stock and delivery options are configured. Live payments are disabled. A test order is recorded only after you submit the checkout details.",
  },
  {
    question: "Can I request help with a complete energy system?",
    answer:
      "Use the project enquiry option on the quote form. Describe your space, appliances, existing equipment and priorities. The equipment and any service scope must be confirmed in a written quotation.",
  },
  {
    question: "Do you offer installation?",
    answer:
      "Installation availability, scope, responsibilities and pricing have not been confirmed for this preview. Include installation questions in your enquiry and request written confirmation.",
  },
  {
    question: "Where can products be delivered?",
    answer:
      "Delivery locations, fees and timing require confirmation. There are no published delivery zones or rates at present. Include the destination city and state in your enquiry.",
  },
  {
    question: "Can I collect my order?",
    answer:
      "Pickup availability and the collection location must be confirmed before you make arrangements. No collection address has been published yet.",
  },
  {
    question: "What warranty or returns cover applies?",
    answer:
      "Warranty and returns arrangements depend on the confirmed product and approved business terms. Request the written details before purchasing. The policy pages on this preview are drafts awaiting business approval.",
  },
  {
    question: "Does adding a product to my cart reserve stock?",
    answer:
      "No. The cart is a shortlist saved in your browser. It does not reserve stock, confirm availability or create a purchase commitment.",
  },
  {
    question: "How do quotation requests work?",
    answer:
      "When the enquiry service is available, the form saves your requirements and displays a reference. Keep that reference. The form tells you if submissions are unavailable; it does not simulate a successful request.",
  },
  {
    question: "How can I follow an existing order?",
    answer:
      "Use your order reference and private access code on the order access page. The code is shown at checkout and on your private order page. A reference alone cannot reveal your information.",
  },
];
export const policies = {
  delivery: {
    title: "Delivery & collection",
    intro: "Understand what needs to be agreed before your products travel.",
    sections: [
      [
        "Locations and service availability",
        "Delivery coverage and pickup availability have not been approved for publication. Share the destination city and state in your enquiry, and request confirmation before making arrangements.",
      ],
      [
        "Fees and timing",
        "Delivery charges and estimated timing should be stated in your written quotation or order confirmation. No delivery rate or dispatch promise is set by this draft.",
      ],
      [
        "Receiving your products",
        "Confirm the recipient, contact number, delivery address and any access requirements as part of the order arrangements. Ask how missing or damaged items should be reported.",
      ],
      [
        "Before launch",
        "Service areas, fee calculation, lead times, collection arrangements and the process for delivery issues need business approval.",
      ],
    ],
  },
  returns: {
    title: "Returns & warranty",
    intro: "Know the product terms before you make a purchase.",
    sections: [
      [
        "Confirm the applicable terms",
        "Request the approved returns and warranty information for the exact product before purchasing. This draft does not establish a returns window, eligibility rule or warranty promise.",
      ],
      [
        "If an item has a problem",
        "Keep the product details, order reference and any relevant photos. The approved process should explain who to contact and how the issue will be assessed.",
      ],
      [
        "Product warranty",
        "Manufacturer, model, warranty provider, coverage and any installation requirements must be confirmed in writing. Provisional catalogue names do not establish warranty coverage.",
      ],
      [
        "Before launch",
        "Return eligibility, notification periods, assessment, transport costs, refund handling and warranty contacts need business approval.",
      ],
    ],
  },
  privacy: {
    title: "Privacy notice",
    intro: "A clear view of the information used by this website.",
    sections: [
      [
        "Information you choose to provide",
        "The quotation form asks for your name, email, phone, location, product interest, quantity and project requirements. Additional notes are optional. Do not include payment details or unnecessary sensitive information.",
      ],
      [
        "Cart storage",
        "Your cart is saved in local storage in your browser so it can be restored on a later visit. It contains product identities and quantities. Removing browser site data clears this saved cart.",
      ],
      [
        "Enquiries and access",
        "When the enquiry service is connected, submissions are saved in the independent Rahat Energy database for authorised operations staff to review. The form reports when saving is unavailable. Checkout collects contact and delivery details to create a test order when you submit. Private order access uses an authentication cookie; the checkout attempt key and private access code are saved in session storage for recovery during that browser session.",
      ],
      [
        "Administrator sessions",
        "Signing in to operations creates an authentication cookie. It is used to protect access to private records and operational controls.",
      ],
      [
        "Before launch",
        "The responsible business contact, approved purposes, retention periods, service providers and process for privacy requests need to be confirmed. This notice must be reviewed against the final operating service.",
      ],
    ],
  },
  terms: {
    title: "Website terms",
    intro: "What the current browsing and enquiry experience provides.",
    sections: [
      [
        "Preview status",
        "This website is a development preview. Branding, product identities, illustrative photography and editorial content include provisional material. They should not be treated as a verified product specification or final commercial offer.",
      ],
      [
        "Browsing and your cart",
        "You may browse the catalogue and save products in a browser-local cart. Adding a product does not reserve stock, guarantee a price or place an order.",
      ],
      [
        "Quotes and purchases",
        "An enquiry is a request for information. Online checkout supports test payments only when configured. A test order records the equipment, quantities, price snapshot and selected delivery arrangement. Live purchases and final commercial terms still require approval.",
      ],
      [
        "Before launch",
        "The contracting business details, order acceptance process, payment terms, applicable policies and customer support process require business approval before these terms can be finalised.",
      ],
    ],
  },
} as const;
