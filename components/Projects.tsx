import type { ReactNode } from "react";
import { getContent } from "@/content";
import type { CaseStudy, Project, UiText } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { ArrowUpRightIcon } from "./icons";
import { ProjectLinks } from "./ProjectLinks";
import { Section } from "./Section";
import { TrackDemosVisual } from "./TrackDemosVisual";
import styles from "./Projects.module.css";

export function Projects({ locale }: { locale: Locale }) {
  const { featuredProject, projects, caseStudies, moreWork, ui } = getContent(locale);

  return (
    <Section
      id="projects"
      index="01"
      label={ui.projects.label}
      title={ui.projects.title}
      intro={ui.projects.intro}
      wide
    >
      <FeaturedProject project={featuredProject} ui={ui} />

      <div className={styles.secondary}>
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            ui={ui}
            visual={visuals[project.slug]}
          />
        ))}
      </div>

      <CaseStudies studies={caseStudies} ui={ui} />

      {moreWork.url && (
        <p className={styles.more}>
          <a href={moreWork.url} className="text-link" target="_blank" rel="noopener noreferrer">
            {moreWork.label}
            <ArrowUpRightIcon />
            <span className="visually-hidden">{ui.newTab}</span>
          </a>
        </p>
      )}
    </Section>
  );
}

function StackList({ stack, label }: { stack: string[]; label: string }) {
  return (
    <ul role="list" className="tool-list" aria-label={label}>
      {stack.map((tool) => (
        <li key={tool}>{tool}</li>
      ))}
    </ul>
  );
}

function FeaturedProject({ project, ui }: { project: Project; ui: UiText }) {
  return (
    <article className={`inverse ${styles.featured}`} aria-labelledby={`${project.slug}-title`}>
      <div className={styles.featuredText}>
        <p className="label">
          <span className={styles.featuredFlag}>{ui.projects.featured}</span> {project.kind}
        </p>
        <h3 id={`${project.slug}-title`} className={styles.featuredName}>
          {project.name}
        </h3>
        <p className={styles.featuredTagline}>{project.tagline}</p>

        <div className={styles.prose}>
          {project.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.role}>
          <p className="label">{ui.projects.myRole}</p>
          <p>{project.role}</p>
        </div>

        <StackList stack={project.stack} label={ui.projects.technologyOf(project.name)} />
        <ProjectLinks links={project.links} newTab={ui.newTab} className={styles.links} />
      </div>

      <div className={styles.featuredVisual}>
        <TrackDemosVisual text={ui.trackDemosVisual} />
      </div>

      {project.highlights && (
        <div className={styles.highlights}>
          <h4 className="label">{ui.projects.highlights}</h4>
          <ol role="list" className={styles.highlightList}>
            {project.highlights.map((highlight, i) => (
              <li key={highlight}>
                <span className={styles.highlightIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{highlight}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

type ProjectCardProps = { project: Project; ui: UiText; visual?: ReactNode };

function ProjectCard({ project, ui, visual }: ProjectCardProps) {
  return (
    <article className={styles.card} aria-labelledby={`${project.slug}-title`}>
      {visual && <div className={styles.cardVisual}>{visual}</div>}
      <div className={styles.cardBody}>
        <p className="label">{project.kind}</p>
        <h3 id={`${project.slug}-title`} className={styles.cardName}>
          {project.name}
        </h3>
        <p className={styles.cardTagline}>{project.tagline}</p>
        {project.description.map((paragraph) => (
          <p key={paragraph} className={styles.cardText}>
            {paragraph}
          </p>
        ))}
        <p className={styles.cardText}>
          <span className={styles.cardRole}>{ui.projects.myRole}: </span>
          {project.role}
        </p>
        <StackList stack={project.stack} label={ui.projects.technologyOf(project.name)} />
        <ProjectLinks links={project.links} newTab={ui.newTab} className={styles.links} />
      </div>
    </article>
  );
}

function CaseStudies({ studies, ui }: { studies: CaseStudy[]; ui: UiText }) {
  return (
    <div className={styles.cases}>
      <div className={styles.casesHead}>
        <h3 className={styles.casesTitle}>{ui.projects.casesTitle}</h3>
        <p className={styles.casesNote}>{ui.projects.casesNote}</p>
      </div>
      <ol role="list" className={styles.caseList}>
        {studies.map((study, i) => (
          <li key={study.title} className={styles.case}>
            <span className={`label ${styles.caseIndex}`} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className={styles.caseTitle}>{study.title}</h4>
            <p className={styles.cardText}>{study.summary}</p>
            <StackList stack={study.stack} label={ui.projects.technology} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --- Typographic tiles for projects without screenshots ----------------- */

const visuals: Record<string, ReactNode> = {
  "email-form-responder": (
    <div className={styles.tileForm} aria-hidden="true">
      <div className={styles.tileFormCard}>
        <span className={styles.tileField} />
        <span className={styles.tileField} />
        <span className={`${styles.tileField} ${styles.tileFieldTall}`} />
        <span className={styles.tileButton}>Send</span>
      </div>
      <div className={styles.tileReply}>
        <span className={styles.tileReplyLabel}>Auto-reply</span>
        Thanks for your message — we&apos;ll get back to you soon.
      </div>
    </div>
  ),
};
