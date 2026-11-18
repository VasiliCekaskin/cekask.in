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

  portrait: { src: "/vasili-portrait.jpg", width: 1200, height: 1500 },

  openToWork: true,
  hasCapacity: true,

  // Portrait phone video. Optional WebVTT subtitles go in `captions`,
  // e.g. { de: "/intro.de.vtt" }.
  introVideo: {
    src: "/intro.mp4",
    poster: "/intro-poster.jpg",
    width: 464,
    height: 832,
    cropTop: 290,
    captions: {},
  },

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
