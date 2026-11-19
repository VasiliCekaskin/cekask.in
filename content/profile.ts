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

  portrait: { src: "/vasili-portrait.png", width: 800, height: 800 },

  openToWork: true,
  hasCapacity: true,

  // Placeholder cartoons. Swap in your own pictures later.
  faces: {
    grin: "/faces/grin.svg",
    wink: "/faces/wink.svg",
    shock: "/faces/shock.svg",
  },

  // Your recorded ad for the game, e.g. { src: "/ad.mp4", poster: "/ad.jpg" }.
  // While null, the game shows a built-in animated fake commercial.
  adVideo: null,

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
      url: "https://www.linkedin.com/in/vasili-cekaskin-58350a221/",
    },
  },
};
