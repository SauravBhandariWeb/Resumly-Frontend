import type { Resume, TemplateId } from '@/types';
import { FONT_STACKS, FONT_SIZE_PX, SPACING_PX, monthYear } from '@/lib/resumeDefaults';

interface Props {
  resume: Resume;
  scale?: number;
}

export default function ResumeDocument({ resume, scale = 1 }: Props) {
  const { data, theme, sectionOrder, templateId } = resume;
  const fontStack = FONT_STACKS[theme.font] || FONT_STACKS.sans;
  const baseFont = FONT_SIZE_PX[theme.fontSize] || 14;
  const spacing = SPACING_PX[theme.spacing] || 18;
  const primary = theme.primary || '#1f4af0';
  const accent = theme.accent || '#0f172a';
  const text = theme.text || '#1e293b';
  const muted = theme.muted || '#64748b';

  const wrapStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: 794,
  };

  const pageStyle: React.CSSProperties = {
    width: 794,
    minHeight: 1123,
    background: '#ffffff',
    color: text,
    fontFamily: fontStack,
    fontSize: baseFont,
    lineHeight: 1.5,
    padding: 0,
    boxSizing: 'border-box',
  };

  const visibleSections = sectionOrder.filter(s => s.visible);

  return (
    <div style={wrapStyle}>
      <div
        style={pageStyle}
        className="resume-page"
        data-template={templateId}
      >
        <TemplateRouter
          templateId={templateId}
          data={data}
          theme={{
            primary,
            accent,
            text,
            muted,
            fontStack,
            baseFont,
            spacing,
          }}
          sections={visibleSections}
        />
      </div>
    </div>
  );
}

interface ThemeCtx {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  fontStack: string;
  baseFont: number;
  spacing: number;
}

function TemplateRouter({
  templateId,
  data,
  theme,
  sections,
}: {
  templateId: TemplateId;
  data: Resume['data'];
  theme: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  switch (templateId) {
    case 'modern':
      return <Modern data={data} t={theme} sections={sections} />;
    case 'classic':
      return <Classic data={data} t={theme} sections={sections} />;
    case 'minimal':
      return <Minimal data={data} t={theme} sections={sections} />;
    case 'executive':
      return <Executive data={data} t={theme} sections={sections} />;
    case 'google':
      return <GoogleStyle data={data} t={theme} sections={sections} />;
    case 'harvard':
      return <Harvard data={data} t={theme} sections={sections} />;
    case 'stanford':
      return <Stanford data={data} t={theme} sections={sections} />;
    case 'professional':
      return <Professional data={data} t={theme} sections={sections} />;
    case 'creative':
      return <Creative data={data} t={theme} sections={sections} />;
    case 'corporate':
      return <Corporate data={data} t={theme} sections={sections} />;
    default:
      return <Modern data={data} t={theme} sections={sections} />;
  }
}

/* ---------- shared section rendering helpers ---------- */

function SectionTitle({
  title,
  t,
  align = 'left',
}: {
  title: string;
  t: ThemeCtx;
  align?: 'left' | 'center';
}) {
  return (
    <h2
      style={{
        fontSize: t.baseFont + 3,
        fontWeight: 700,
        color: t.accent,
        margin: 0,
        marginBottom: 8,
        textAlign: align,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      {title}
    </h2>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div
      style={{
        height: 1,
        background: color,
        margin: '8px 0 12px',
      }}
    />
  );
}

function Bullets({
  items,
  t,
}: {
  items: string[];
  t: ThemeCtx;
}) {
  if (!items.length) return null;

  return (
    <ul
      style={{
        margin: '4px 0 0',
        paddingLeft: 18,
      }}
    >
      {items.map((b, i) => (
        <li
          key={i}
          style={{
            marginBottom: 3,
            color: t.text,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
        >
          {b}
        </li>
      ))}
    </ul>
  );
}

function ExperienceBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.experience.length) return null;

  return (
    <div>
      {data.experience.map(e => (
        <div
          key={e.id}
          style={{
            marginBottom: t.spacing,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: t.text,
              }}
            >
              {e.position}
            </span>

            <span
              style={{
                color: t.muted,
                fontSize: t.baseFont - 1,
              }}
            >
              {monthYear(e.startDate)} –{' '}
              {e.current ? 'Present' : monthYear(e.endDate)}
            </span>
          </div>

          <div
            style={{
              color: t.muted,
              fontSize: t.baseFont - 1,
              marginBottom: 2,
            }}
          >
            {e.company}
            {e.location ? `, ${e.location}` : ''}
          </div>

          <Bullets items={e.bullets} t={t} />
        </div>
      ))}
    </div>
  );
}

function EducationBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.education.length) return null;

  return (
    <div>
      {data.education.map(e => (
        <div
          key={e.id}
          style={{
            marginBottom: t.spacing,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: t.text,
              }}
            >
              {e.degree}
              {e.field ? `, ${e.field}` : ''}
            </span>

            <span
              style={{
                color: t.muted,
                fontSize: t.baseFont - 1,
              }}
            >
              {monthYear(e.startDate)} –{' '}
              {e.current ? 'Present' : monthYear(e.endDate)}
            </span>
          </div>

          <div
            style={{
              color: t.muted,
              fontSize: t.baseFont - 1,
            }}
          >
            {e.school}
            {e.gpa ? ` · GPA ${e.gpa}` : ''}
          </div>

          {e.description && (
            <div
              style={{
                color: t.text,
                marginTop: 2,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
              }}
            >
              {e.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- PROJECTS ---------- */

function ProjectsBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.projects.length) return null;

  return (
    <div>
      {data.projects.map(p => (
        <div
          key={p.id}
          style={{
            marginBottom: t.spacing,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: t.text,
              }}
            >
              {p.name}
            </span>

            {p.link && (
              <span
                style={{
                  color: t.muted,
                  fontSize: t.baseFont - 1,
                }}
              >
                {p.link}
              </span>
            )}
          </div>

          {p.description && (
            <div
              style={{
                color: t.text,
                marginBottom: 2,

                /*
                 * IMPORTANT:
                 * Preserve exactly the line breaks and blank lines
                 * entered by the user.
                 */
                whiteSpace: 'pre-wrap',

                /*
                 * Prevent very long words/URLs from overflowing
                 * the resume page.
                 */
                overflowWrap: 'break-word',
              }}
            >
              {p.description}
            </div>
          )}

          {p.tech.length > 0 && (
            <div
              style={{
                color: t.muted,
                fontSize: t.baseFont - 1,
              }}
            >
              Tech: {p.tech.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillsBlock({
  data,
  t,
  asPills = false,
  accent,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  asPills?: boolean;
  accent?: string;
}) {
  if (!data.skills.length) return null;

  if (asPills) {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {data.skills.map(s => (
          <span
            key={s.id}
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 999,
              background: (accent || t.primary) + '18',
              color: accent || t.primary,
              fontSize: t.baseFont - 1,
              border: `1px solid ${(accent || t.primary)}30`,
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 10px',
      }}
    >
      {data.skills
        .map(s => (
          <span
            key={s.id}
            style={{
              color: t.text,
            }}
          >
            {s.name}
            {s.level ? ` (${s.level})` : ''}
          </span>
        ))
        .reduce(
          (acc: any[], el, i, arr) =>
            i < arr.length - 1
              ? [
                  ...acc,
                  el,
                  <span
                    key={`sep${i}`}
                    style={{
                      color: t.muted,
                    }}
                  >
                    ·
                  </span>,
                ]
              : [...acc, el],
          [],
        )}
    </div>
  );
}

function LanguagesBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.languages.length) return null;

  return (
    <div style={{ color: t.text }}>
      {data.languages
        .map(l => `${l.name} (${l.proficiency})`)
        .join(' · ')}
    </div>
  );
}

function CertsBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.certifications.length) return null;

  return (
    <div>
      {data.certifications.map(c => (
        <div
          key={c.id}
          style={{
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: t.text,
            }}
          >
            {c.name}
          </span>

          <span
            style={{
              color: t.muted,
            }}
          >
            {' — '}
            {c.issuer}, {monthYear(c.date)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AchievementsBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.achievements.length) return null;

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 18,
      }}
    >
      {data.achievements.map(a => (
        <li
          key={a.id}
          style={{
            marginBottom: 3,
            color: t.text,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {a.title}
          </span>

          {a.date ? ` (${monthYear(a.date)})` : ''}

          {a.description && (
            <>
              {' — '}
              <span
                style={{
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                }}
              >
                {a.description}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function InterestsBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.interests.length) return null;

  return (
    <div style={{ color: t.text }}>
      {data.interests.map(i => i.name).join(', ')}
    </div>
  );
}

function CustomBlocks({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  return (
    <>
      {data.customSections.map(cs => (
        <div
          key={cs.id}
          style={{
            marginBottom: t.spacing,
          }}
        >
          <SectionTitle title={cs.title} t={t} />

          {cs.items.map(it => (
            <div
              key={it.id}
              style={{
                marginBottom: 3,
                color: t.text,
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {it.title}
              </span>

              {it.value && (
                <span
                  style={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                  }}
                >
                  {' — '}
                  {it.value}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function SummaryBlock({
  data,
  t,
}: {
  data: Resume['data'];
  t: ThemeCtx;
}) {
  if (!data.summary.text) return null;

  return (
    <p
      style={{
        margin: 0,
        color: t.text,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
      }}
    >
      {data.summary.text}
    </p>
  );
}

function PersonalHeader({
  data,
  t,
  layout,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  layout?: 'center' | 'left' | 'sidebar';
}) {
  const p = data.personal;

  const contactBits = [
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
    p.github,
  ].filter(Boolean);

  const center = layout === 'center';

  return (
    <div
      style={{
        textAlign: center ? 'center' : 'left',
      }}
    >
      {p.photoUrl && layout !== 'sidebar' && (
        <img
          src={p.photoUrl}
          alt=""
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            objectFit: 'cover',
            float: center ? 'none' : 'left',
            marginRight: center ? 0 : 14,
            marginBottom: center ? 8 : 0,
            display: center ? 'block' : 'block',
            marginLeft: center ? 'auto' : 0,
          }}
        />
      )}

      <h1
        style={{
          fontSize: t.baseFont + 18,
          fontWeight: 800,
          color: t.text,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {p.fullName || 'Your Name'}
      </h1>

      {p.jobTitle && (
        <div
          style={{
            color: t.muted,
            fontSize: t.baseFont + 2,
            marginTop: 4,
          }}
        >
          {p.jobTitle}
        </div>
      )}

      <div
        style={{
          marginTop: 8,
          color: t.muted,
          fontSize: t.baseFont - 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px 10px',
          justifyContent: center ? 'center' : 'flex-start',
        }}
      >
        {contactBits.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Templates ---------- */

function Section({
  kind,
  data,
  t,
  pills,
  accent,
  center,
}: {
  kind: string;
  data: Resume['data'];
  t: ThemeCtx;
  pills?: boolean;
  accent?: string;
  center?: boolean;
}) {
  switch (kind) {
    case 'personal':
      return null;

    case 'summary':
      return (
        <div>
          <SectionTitle
            title={data.summary.title}
            t={t}
            align={center ? 'center' : 'left'}
          />
          <SummaryBlock data={data} t={t} />
        </div>
      );

    case 'experience':
      return (
        <div>
          <SectionTitle
            title="Experience"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <ExperienceBlock data={data} t={t} />
        </div>
      );

    case 'education':
      return (
        <div>
          <SectionTitle
            title="Education"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <EducationBlock data={data} t={t} />
        </div>
      );

    case 'projects':
      return (
        <div>
          <SectionTitle
            title="Projects"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <ProjectsBlock data={data} t={t} />
        </div>
      );

    case 'skills':
      return (
        <div>
          <SectionTitle
            title="Skills"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <SkillsBlock
            data={data}
            t={t}
            asPills={pills}
            accent={accent}
          />
        </div>
      );

    case 'languages':
      return (
        <div>
          <SectionTitle
            title="Languages"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <LanguagesBlock data={data} t={t} />
        </div>
      );

    case 'certifications':
      return (
        <div>
          <SectionTitle
            title="Certifications"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <CertsBlock data={data} t={t} />
        </div>
      );

    case 'achievements':
      return (
        <div>
          <SectionTitle
            title="Achievements"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <AchievementsBlock data={data} t={t} />
        </div>
      );

    case 'interests':
      return (
        <div>
          <SectionTitle
            title="Interests"
            t={t}
            align={center ? 'center' : 'left'}
          />
          <InterestsBlock data={data} t={t} />
        </div>
      );

    case 'custom':
      return <CustomBlocks data={data} t={t} />;

    default:
      return null;
  }
}

function Modern({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  const p = data.personal;

  return (
    <div style={{ minHeight: 1123 }}>
      <div
        style={{
          background: t.primary,
          color: '#ffffff',
          padding: '28px 40px',
        }}
      >
        <h1
          style={{
            fontSize: t.baseFont + 20,
            fontWeight: 800,
            margin: 0,
          }}
        >
          {p.fullName || 'Your Name'}
        </h1>

        <div
          style={{
            fontSize: t.baseFont + 2,
            opacity: 0.9,
            marginTop: 4,
          }}
        >
          {p.jobTitle}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: t.baseFont - 1,
            opacity: 0.9,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px 14px',
          }}
        >
          {[
            p.email,
            p.phone,
            p.location,
            p.website,
            p.linkedin,
            p.github,
          ]
            .filter(Boolean)
            .map((c, i) => (
              <span key={i}>{c}</span>
            ))}
        </div>
      </div>

      <div style={{ padding: '24px 40px' }}>
        {sections
          .filter(s => s.kind !== 'personal')
          .map(s => (
            <div
              key={s.id}
              style={{
                marginBottom: t.spacing + 4,
              }}
            >
              <Section
                kind={s.kind}
                data={data}
                t={t}
                pills={s.kind === 'skills'}
                accent={t.primary}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function Classic({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  t = { ...t, fontStack: FONT_STACKS.serif };

  return (
    <div
      style={{
        padding: '40px 48px',
        fontFamily: FONT_STACKS.serif,
      }}
    >
      <PersonalHeader data={data} t={t} layout="center" />

      <Divider color={t.accent} />

      {sections
        .filter(s => s.kind !== 'personal')
        .map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 4,
            }}
          >
            <Section
              kind={s.kind}
              data={data}
              t={t}
            />
          </div>
        ))}
    </div>
  );
}

function Minimal({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  return (
    <div style={{ padding: '44px 52px' }}>
      <PersonalHeader data={data} t={t} />

      {sections
        .filter(s => s.kind !== 'personal')
        .map((s, i, arr) => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 2,
            }}
          >
            <Section
              kind={s.kind}
              data={data}
              t={t}
            />

            {i < arr.length - 1 && (
              <div
                style={{
                  height: 1,
                  background: '#e2e8f0',
                  marginTop: t.spacing,
                }}
              />
            )}
          </div>
        ))}
    </div>
  );
}

function Executive({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  t = { ...t, fontStack: FONT_STACKS.serif };

  const p = data.personal;

  return (
    <div
      style={{
        padding: '48px 48px',
        fontFamily: FONT_STACKS.serif,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          borderBottom: `3px solid ${t.accent}`,
          paddingBottom: 16,
        }}
      >
        <h1
          style={{
            fontSize: t.baseFont + 22,
            fontWeight: 800,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          {p.fullName || 'Your Name'}
        </h1>

        <div
          style={{
            color: t.muted,
            marginTop: 6,
            fontSize: t.baseFont + 1,
          }}
        >
          {p.jobTitle}
        </div>

        <div
          style={{
            marginTop: 8,
            color: t.muted,
            fontSize: t.baseFont - 1,
          }}
        >
          {[p.email, p.phone, p.location, p.linkedin]
            .filter(Boolean)
            .join('  |  ')}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {sections
          .filter(s => s.kind !== 'personal')
          .map(s => (
            <div
              key={s.id}
              style={{
                marginBottom: t.spacing + 4,
              }}
            >
              <Section
                kind={s.kind}
                data={data}
                t={t}
                center
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function GoogleStyle({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  const p = data.personal;

  return (
    <div style={{ padding: '32px 40px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingBottom: 16,
          borderBottom: `2px solid ${t.primary}`,
        }}
      >
        {p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              objectFit: 'cover',
            }}
          />
        )}

        <div>
          <h1
            style={{
              fontSize: t.baseFont + 18,
              fontWeight: 700,
              color: t.text,
              margin: 0,
            }}
          >
            {p.fullName || 'Your Name'}
          </h1>

          <div
            style={{
              color: t.primary,
              fontSize: t.baseFont + 1,
              marginTop: 2,
            }}
          >
            {p.jobTitle}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          color: t.muted,
          fontSize: t.baseFont - 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px 12px',
        }}
      >
        {[p.email, p.phone, p.location, p.website, p.linkedin]
          .filter(Boolean)
          .map((c, i) => (
            <span key={i}>{c}</span>
          ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {sections
          .filter(s => s.kind !== 'personal')
          .map(s => (
            <div
              key={s.id}
              style={{
                marginBottom: t.spacing + 2,
              }}
            >
              <Section
                kind={s.kind}
                data={data}
                t={t}
                pills={s.kind === 'skills'}
                accent={t.primary}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function Harvard({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  t = {
    ...t,
    fontStack: FONT_STACKS.serif,
    accent: '#a41e22',
  };

  const p = data.personal;

  return (
    <div
      style={{
        padding: '40px 48px',
        fontFamily: FONT_STACKS.serif,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: t.baseFont + 18,
            fontWeight: 800,
            margin: 0,
            color: t.accent,
            letterSpacing: 2,
          }}
        >
          {p.fullName || 'Your Name'}
        </h1>

        <div
          style={{
            color: t.muted,
            marginTop: 6,
            fontSize: t.baseFont - 1,
          }}
        >
          {[p.email, p.phone, p.location, p.linkedin]
            .filter(Boolean)
            .join('  |  ')}
        </div>
      </div>

      {sections
        .filter(s => s.kind !== 'personal')
        .map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 2,
            }}
          >
            <div
              style={{
                borderBottom: `1px solid ${t.accent}`,
                marginBottom: 6,
              }}
            >
              <SectionTitle
                title={sectionLabel(s.kind, data)}
                t={t}
              />
            </div>

            <Section
              kind={s.kind}
              data={data}
              t={t}
            />
          </div>
        ))}
    </div>
  );
}

function Stanford({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  t = {
    ...t,
    fontStack: FONT_STACKS.serif,
    accent: '#8c1515',
  };

  const p = data.personal;

  return (
    <div
      style={{
        padding: '40px 48px',
        fontFamily: FONT_STACKS.serif,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        <h1
          style={{
            fontSize: t.baseFont + 20,
            fontWeight: 800,
            margin: 0,
            color: t.accent,
          }}
        >
          {p.fullName || 'Your Name'}
        </h1>

        <div
          style={{
            color: t.text,
            marginTop: 4,
            fontSize: t.baseFont + 1,
          }}
        >
          {p.jobTitle}
        </div>

        <div
          style={{
            color: t.muted,
            marginTop: 6,
            fontSize: t.baseFont - 1,
          }}
        >
          {[p.email, p.phone, p.location]
            .filter(Boolean)
            .join('  ·  ')}
        </div>
      </div>

      <Divider color={t.accent} />

      {sections
        .filter(s => s.kind !== 'personal')
        .map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 2,
            }}
          >
            <Section
              kind={s.kind}
              data={data}
              t={t}
            />
          </div>
        ))}
    </div>
  );
}

function Professional({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  const p = data.personal;

  const sideKinds = [
    'skills',
    'languages',
    'interests',
    'certifications',
  ];

  const mainSections = sections.filter(
    s =>
      !sideKinds.includes(s.kind) &&
      s.kind !== 'personal',
  );

  const sideSections = sections.filter(s =>
    sideKinds.includes(s.kind),
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 1123,
      }}
    >
      <div
        style={{
          width: 240,
          background: '#f1f5f9',
          padding: '28px 24px',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            style={{
              width: 100,
              height: 100,
              borderRadius: 999,
              objectFit: 'cover',
              display: 'block',
              margin: '0 auto 16px',
            }}
          />
        )}

        <div
          style={{
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: t.baseFont + 4,
              color: t.text,
            }}
          >
            {p.fullName}
          </div>

          <div
            style={{
              color: t.muted,
              fontSize: t.baseFont - 1,
              marginTop: 2,
            }}
          >
            {p.jobTitle}
          </div>
        </div>

        <div
          style={{
            marginBottom: 16,
            color: t.muted,
            fontSize: t.baseFont - 2,
            wordBreak: 'break-word',
          }}
        >
          {[p.email, p.phone, p.location, p.website, p.linkedin, p.github]
            .filter(Boolean)
            .map((c, i) => (
              <div
                key={i}
                style={{ marginBottom: 3 }}
              >
                {c}
              </div>
            ))}
        </div>

        {sideSections.map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 4,
            }}
          >
            <SectionTitle
              title={sectionLabel(s.kind, data)}
              t={t}
            />

            <Section
              kind={s.kind}
              data={data}
              t={t}
              pills={s.kind === 'skills'}
              accent={t.primary}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: '28px 32px',
        }}
      >
        {mainSections.map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 4,
            }}
          >
            <Section
              kind={s.kind}
              data={data}
              t={t}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Creative({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  const p = data.personal;

  const sideKinds = [
    'skills',
    'languages',
    'interests',
    'certifications',
  ];

  const mainSections = sections.filter(
    s =>
      !sideKinds.includes(s.kind) &&
      s.kind !== 'personal',
  );

  const sideSections = sections.filter(s =>
    sideKinds.includes(s.kind),
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 1123,
      }}
    >
      <div
        style={{
          width: 260,
          background: t.primary,
          color: '#ffffff',
          padding: '32px 24px',
        }}
      >
        {p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              objectFit: 'cover',
              display: 'block',
              margin: '0 auto 18px',
              border: '3px solid #ffffff',
            }}
          />
        )}

        <div
          style={{
            textAlign: 'center',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: t.baseFont + 6,
            }}
          >
            {p.fullName}
          </div>

          <div
            style={{
              opacity: 0.85,
              fontSize: t.baseFont,
              marginTop: 2,
            }}
          >
            {p.jobTitle}
          </div>
        </div>

        <div
          style={{
            marginBottom: 18,
            opacity: 0.9,
            fontSize: t.baseFont - 2,
            wordBreak: 'break-word',
          }}
        >
          {[p.email, p.phone, p.location, p.website, p.linkedin]
            .filter(Boolean)
            .map((c, i) => (
              <div
                key={i}
                style={{ marginBottom: 4 }}
              >
                {c}
              </div>
            ))}
        </div>

        {sideSections.map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 4,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: t.baseFont - 1,
                marginBottom: 6,
                opacity: 0.9,
                letterSpacing: 0.5,
              }}
            >
              {sectionLabel(s.kind, data)}
            </div>

            <Section
              kind={s.kind}
              data={data}
              t={{
                ...t,
                text: '#ffffff',
                muted: '#e2e8f0',
              }}
              pills={s.kind === 'skills'}
              accent="#ffffff"
            />
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: '32px 32px',
        }}
      >
        {mainSections.map(s => (
          <div
            key={s.id}
            style={{
              marginBottom: t.spacing + 4,
            }}
          >
            <Section
              kind={s.kind}
              data={data}
              t={t}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Corporate({
  data,
  t,
  sections,
}: {
  data: Resume['data'];
  t: ThemeCtx;
  sections: Resume['sectionOrder'];
}) {
  const p = data.personal;

  return (
    <div style={{ minHeight: 1123 }}>
      <div
        style={{
          background: t.accent,
          color: '#ffffff',
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: t.baseFont + 18,
              fontWeight: 800,
              margin: 0,
            }}
          >
            {p.fullName || 'Your Name'}
          </h1>

          <div
            style={{
              opacity: 0.85,
              marginTop: 4,
            }}
          >
            {p.jobTitle}
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontSize: t.baseFont - 2,
            opacity: 0.9,
          }}
        >
          {[p.email, p.phone, p.location]
            .filter(Boolean)
            .map((c, i) => (
              <div key={i}>{c}</div>
            ))}
        </div>
      </div>

      <div
        style={{
          height: 4,
          background: t.primary,
        }}
      />

      <div style={{ padding: '24px 40px' }}>
        {sections
          .filter(s => s.kind !== 'personal')
          .map(s => (
            <div
              key={s.id}
              style={{
                marginBottom: t.spacing + 4,
              }}
            >
              <Section
                kind={s.kind}
                data={data}
                t={t}
                pills={s.kind === 'skills'}
                accent={t.primary}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function sectionLabel(
  kind: string,
  data: Resume['data'],
): string {
  if (kind === 'summary') {
    return data.summary.title || 'Summary';
  }

  if (kind === 'custom') {
    return 'Custom';
  }

  return kind.charAt(0).toUpperCase() + kind.slice(1);
}
