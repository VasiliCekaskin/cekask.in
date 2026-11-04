import type { Profile } from "./types";

/**
 * Personal facts that don't change between languages. Translatable text
 * lives in `content/en` and `content/de`.
 *
 * Anything marked TODO is a fact that still needs to be confirmed or filled
 * in. A `null` URL hides that link everywhere on the site.
 */
export const profile: Profile = {
  name: "Vasili Cekaskin",
  url: "https://cekask.in",

  avatar: "/vasili-2.png",
  portrait: { src: "/vasili.jpeg", width: 400, height: 400 },

  openToWork: true,

  // TODO: confirm this mailbox exists — taken from the commit email used in
  // the TrackDemos repositories.
  email: "vasili@cekask.in",

  social: {
    github: {
      label: "GitHub",
      url: "https://github.com/VasiliCekaskin",
    },
    // TODO: add your LinkedIn profile URL.
    linkedin: {
      label: "LinkedIn",
      url: null,
    },
  },
};
