import type { LegalConfig } from "./types";

/**
 * Details for the Impressum and Datenschutzerklärung.
 *
 * IMPORTANT: These pages are not legal advice and have not been reviewed by a
 * lawyer. Set `showDraftNotice: true` to mark both pages as a draft again.
 *
 * While a value is `null`, the page shows a clearly marked placeholder.
 */
export const legal: LegalConfig = {
  showDraftNotice: false,

  /** Name as it should appear in the Impressum. */
  name: "Vasili Cekaskin",
  street: "Westtangente 71",
  postalCodeAndCity: "40880 Ratingen",

  // TODO: confirm. Uses the same address as the contact section by default.
  email: "vasili@cekask.in",
  // Optional — check whether a second fast contact channel is needed for you.
  phone: null,

  // TODO: only needed if you have one (e.g. when working as a freelancer).
  vatId: null,

  hosting: {
    provider: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    privacyPolicyUrl: "https://vercel.com/legal/privacy-policy",
  },

  /** Competent data protection authority — NRW for the Düsseldorf area. */
  supervisoryAuthority: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",
    url: "https://www.ldi.nrw.de",
  },

  // Both sites are hosted on Vercel (checked via response headers, 19.11.2026).
  sites: [
    { domain: "cekask.in", name: "Portfolio Vasili Cekaskin", url: "https://cekask.in" },
    { domain: "diywithai.cekask.in", name: "DIY with AI", url: "https://diywithai.cekask.in" },
  ],

  lastUpdated: "19.11.2026",
};
