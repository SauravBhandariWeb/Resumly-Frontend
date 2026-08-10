import type { AIRequest, AIResponse, ResumeData } from '@/types';


const STRONG_VERBS = ['Led','Architected','Built','Launched','Optimized','Streamlined','Spearheaded','Engineered','Drove','Delivered','Scaled','Automated','Redesigned','Migrated','Established'];

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

function deriveRole(data?: Partial<ResumeData>): string {
  return data?.personal?.jobTitle || data?.personal?.fullName || 'the candidate';
}

export function localAI(req: AIRequest): AIResponse {
  switch (req.feature) {
    case 'summary': {
      const role = deriveRole(req.resumeData);
      const years = (req.resumeData?.experience?.length || 0) + 2;
      const top = req.resumeData?.skills?.slice(0,3).map(s=>s.name).join(', ') || 'cross-functional collaboration, system design, and delivery';
      const text = `${role} with ${years}+ years of experience delivering measurable impact across ${top}. Proven track record of leading initiatives end-to-end, improving efficiency, and translating ambiguous requirements into reliable outcomes. Seeking to apply a strong product sense and technical depth to a high-impact team.`;
      return { result: text };
    }
    case 'bullets': {
      const role = deriveRole(req.resumeData);
      const seed = (role + (req.context||'')).length;
      return { result: [
        `${pick(STRONG_VERBS, seed)} ${role.toLowerCase()} initiatives that improved key metrics by 22% within two quarters.`,
        `Collaborated with stakeholders to define requirements and ship ${pick(['a platform','a feature suite','an automation pipeline'], seed+1)} used by 10k+ users.`,
        `Reduced ${pick(['latency','cost','manual effort'], seed+2)} by ${15 + (seed%20)}% through ${pick(['refactoring','automation','caching'], seed+3)} and observability improvements.`,
        `Mentored ${1 + (seed%4)} engineers and established reusable patterns adopted across the organization.`,
      ]};
    }
    case 'skills': {
      const base = ['JavaScript','TypeScript','React','Node.js','REST APIs','Git','SQL','AWS','CI/CD','Communication','Problem Solving','Agile','Testing','Performance Optimization','System Design','Team Leadership'];
      return { result: base.slice(0, 14) };
    }
    case 'projectDescription': {
      const name = req.context || 'the project';
      return { result: `${name} is a full-stack application built to solve ${pick(['a workflow inefficiency','a data visibility gap','a scalability constraint'], name.length)}. It features a clean architecture, automated testing, and a responsive UI, and is deployed with CI/CD for reliable, repeatable releases.` };
    }
    case 'coverLetter': {
      const role = deriveRole(req.resumeData);
      const company = req.context || 'your company';
      const name = req.resumeData?.personal?.fullName || 'I';
      return { result: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${role} role at ${company}. With a background spanning ${pick(['product','engineering','design'], role.length)} and a track record of delivering measurable outcomes, I am confident I can contribute meaningfully to your team.\n\nIn my recent work I led initiatives that improved efficiency and shipped products used by thousands. I am drawn to ${company}'s mission and would welcome the chance to bring my skills to your team.\n\nThank you for considering my application. I look forward to the opportunity to discuss further.\n\nSincerely,\n${name}` };
    }
    case 'improveGrammar': {
      const t = req.text || '';
      const fixed = t.replace(/\bi\b/g, 'I').replace(/\s+/g, ' ').trim().replace(/\.([A-Z])/g, '. $1');
      return { result: fixed || 'No text provided.' };
    }
    case 'rewrite': {
      const t = req.text || 'Responsible for managing tasks.';
      return { result: `Spearheaded and delivered ${t.replace(/^(responsible for|in charge of|managed|worked on)\s*/i,'').toLowerCase() || 'key initiatives'}, driving measurable results.` };
    }
    case 'shorten': {
      const t = (req.text || '').split(' ');
      return { result: t.slice(0, Math.max(6, Math.floor(t.length*0.5))).join(' ') + (t.length>6?'…':'') };
    }
    case 'expand': {
      const t = req.text || 'Led a team.';
      return { result: `${t} Specifically, I established clear goals, coordinated cross-functional work, removed blockers, and delivered the initiative on time with a measurable improvement in team throughput.` };
    }
    case 'atsScore': {
      const d = req.resumeData || emptyResumeDataFallback();
      let score = 40;
      if (d.personal?.fullName) score += 8;
      if (d.personal?.email && d.personal?.phone) score += 8;
      if ((d.summary?.text?.length || 0) > 60) score += 10;
      if ((d.experience?.length||0) >= 1) score += 12;
      if ((d.experience||[]).some(e => e.bullets.length >= 2)) score += 10;
      if ((d.skills?.length||0) >= 6) score += 6;
      if (d.education?.length) score += 6;
      score = Math.min(100, score);
      const suggestions: string[] = [];
      if (!d.summary?.text) suggestions.push('Add a 3–4 line professional summary.');
      if (!(d.experience||[]).some(e => e.bullets.length >= 3)) suggestions.push('Use 3+ quantified bullet points per role.');
      if ((d.skills?.length||0) < 8) suggestions.push('Include at least 8–12 relevant skills.');
      if (!d.personal?.linkedin) suggestions.push('Add a LinkedIn URL for credibility.');
      if (suggestions.length === 0) suggestions.push('Great job — your resume is well-structured and ATS-friendly.');
      return { result: `Score: ${score}/100`, score, suggestions };
    }
    case 'keywordSuggestions': {
      const base = ['Leadership','Cross-functional collaboration','Stakeholder management','Scalability','CI/CD','Performance tuning','Data-driven','Mentorship','Roadmapping','User experience','Testing strategy','Incident response'];
      const have = (req.resumeData?.skills || []).map(s => s.name.toLowerCase());
      const missing = base.filter(k => !have.includes(k.toLowerCase()));
      const matched = base.filter(k => have.includes(k.toLowerCase()));
      return { result: `${matched.length}/${base.length} common keywords found.`, keywords: { matched, missing } };
    }
    case 'jdMatch': {
      const jd = (req.jobDescription || '').toLowerCase();
      const resumeText = JSON.stringify(req.resumeData || {}).toLowerCase();
      const tokens = [...new Set(jd.match(/[a-z][a-z0-9+#.-]{2,}/g) || [])].filter(t => !['the','and','for','with','you','will','our','are','that','this','have','from','your','into','their'].includes(t));
      const matched = tokens.filter(t => resumeText.includes(t));
      const missing = tokens.filter(t => !resumeText.includes(t)).slice(0, 12);
      const matchPercent = tokens.length ? Math.round(matched.length / tokens.length * 100) : 0;
      return { result: `Match: ${matchPercent}%`, matchPercent, keywords: { matched: matched.slice(0,20), missing } };
    }
    default:
      return { result: 'Unsupported feature.' };
  }
}

function emptyResumeDataFallback(): ResumeData {
  return { personal:{fullName:'',jobTitle:'',email:'',phone:'',location:''}, summary:{id:'',title:'',text:''}, experience:[],education:[],projects:[],skills:[],languages:[],certifications:[],achievements:[],interests:[],customSections:[] };
}
