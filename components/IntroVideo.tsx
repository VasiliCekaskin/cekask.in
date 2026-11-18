import type { CSSProperties } from "react";
import Image from "next/image";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./IntroVideo.module.css";

/**
 * The media column is always shown: the intro video once configured, the
 * portrait photo until then.
 */
export const showVideoSlot = true;

/**
 * The self-hosted intro video, framed like a figure in a technical drawing:
 * corner marks and a numbered caption. Nothing loads until the visitor
 * presses play (`preload="none"`). While `profile.introVideo` is null it
 * shows the portrait photo (`profile.portrait`) in the same frame, uncaptioned.
 */
export function IntroVideo({ locale }: { locale: Locale }) {
  const config = profile.introVideo;
  const { video } = getContent(locale);
  // Visible height after trimming `cropTop` source pixels off the top.
  const shownHeight = config ? config.height - (config.cropTop ?? 0) : 0;

  return (
    <figure
      className={styles.figure}
      style={config ? ({ "--ar": config.width / shownHeight } as CSSProperties) : undefined}
    >
      <div className={styles.frame}>
        {config ? (
          <video
            className={styles.video}
            width={config.width}
            height={shownHeight}
            style={{ aspectRatio: `${config.width} / ${shownHeight}` }}
            poster={config.poster}
            controls
            // No fullscreen or picture-in-picture: the inline crop is the intended view.
            controlsList="nofullscreen noremoteplayback"
            disablePictureInPicture
            playsInline
            preload="none"
            aria-label={video.label}
          >
            <source src={config.src} type="video/mp4" />
            {Object.entries(config.captions).map(([lang, src]) => (
              <track
                key={lang}
                src={src}
                kind="subtitles"
                srcLang={lang}
                label={lang === "de" ? "Deutsch" : "English"}
                default={lang === locale}
              />
            ))}
            {video.fallback}
          </video>
        ) : (
          <Image
            className={styles.photo}
            src={profile.portrait.src}
            alt={video.photoAlt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            sizes="(min-width: 60rem) 45vw, 100vw"
            priority
          />
        )}
      </div>
      {config && (
        <figcaption className={styles.caption}>
          <span className={styles.figNo}>{video.figure}</span>
          <span>
            <strong>{video.title}.</strong> {video.caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
