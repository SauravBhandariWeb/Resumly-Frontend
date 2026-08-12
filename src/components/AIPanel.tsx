import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  X,
  Wand2,
  FileText,
  ListChecks,
  Tags,
  Mail,
  SpellCheck,
  Scissors,
  Maximize,
  Gauge,
  KeyRound,
  Target,
  Check,
  Copy,
  Loader2,
} from "lucide-react"
import type { AIFeature, AIResponse, ResumeData } from "@/types"
import { api } from "@/api"
import { useToast } from "@/context/ToastContext"
import { cls } from "@/lib/utils"
import { Badge } from "./ui/primitives"

const FEATURES: { id: AIFeature; label: string; icon: any; desc: string }[] = [
  {
    id: "summary",
    label: "Generate summary",
    icon: FileText,
    desc: "Professional profile summary",
  },
  {
    id: "bullets",
    label: "Bullet points",
    icon: ListChecks,
    desc: "Impactful experience bullets",
  },
  {
    id: "skills",
    label: "Suggest skills",
    icon: Tags,
    desc: "Relevant skill keywords",
  },
  {
    id: "projectDescription",
    label: "Project description",
    icon: Wand2,
    desc: "Describe a project",
  },
  {
    id: "coverLetter",
    label: "Cover letter",
    icon: Mail,
    desc: "Draft a full cover letter",
  },
  {
    id: "improveGrammar",
    label: "Improve grammar",
    icon: SpellCheck,
    desc: "Fix grammar & typos",
  },
  {
    id: "rewrite",
    label: "Rewrite sentence",
    icon: Wand2,
    desc: "Stronger phrasing",
  },
  {
    id: "shorten",
    label: "Shorten text",
    icon: Scissors,
    desc: "Concise version",
  },
  {
    id: "expand",
    label: "Expand text",
    icon: Maximize,
    desc: "Add detail & context",
  },
  {
    id: "atsScore",
    label: "ATS score",
    icon: Gauge,
    desc: "Score & suggestions",
  },
  {
    id: "keywordSuggestions",
    label: "Keyword check",
    icon: KeyRound,
    desc: "Matched & missing keywords",
  },
  {
    id: "jdMatch",
    label: "Job description match",
    icon: Target,
    desc: "Match % vs a job post",
  },
]

interface Props {
  open: boolean
  onClose: () => void
  resumeData: ResumeData
  onApplyText?: (text: string, feature: AIFeature) => void
  onApplyArray?: (items: string[], feature: AIFeature) => void
}

export default function AIPanel({
  open,
  onClose,
  resumeData,
  onApplyText,
  onApplyArray,
}: Props) {
  const { toast } = useToast()
  const [active, setActive] = useState<AIFeature | null>(null)
  const [input, setInput] = useState("")
  const [jd, setJd] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResponse | null>(null)

  const run = async (feature: AIFeature) => {
    setActive(feature)
    setResult(null)
    setLoading(true)
    try {
      const res = await api.ai.run({
        feature,
        resumeData,
        text: input,
        jobDescription: jd,
        context: input,
      })
      setResult(res)
    } catch (e: any) {
      toast("error", e.message || "AI request failed")
    } finally {
      setLoading(false)
    }
  }

  const needsText = ["improveGrammar", "rewrite", "shorten", "expand"].includes(
    active || "",
  )
  const needsJD = active === "jdMatch"
  const needsContext =
    active === "projectDescription" || active === "coverLetter"

  const copyResult = () => {
    if (!result) return
    const text = Array.isArray(result.result)
      ? result.result.join("\n")
      : String(result.result)
    navigator.clipboard.writeText(text)
    toast("success", "Copied to clipboard.")
  }

  const apply = () => {
    if (!result || !active) return
    if (Array.isArray(result.result) && onApplyArray) {
      onApplyArray(result.result, active)
      toast("success", "Applied to editor.")
    } else if (onApplyText) {
      onApplyText(String(result.result), active)
      toast("success", "Applied to editor.")
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-ink-900 shadow-soft-lg flex flex-col"
          >
            <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 grid place-items-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">AI Assistant</h3>
                  <p className="text-xs text-ink-500">
                    Powered by Google Gemini
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost h-9 w-9 p-0">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {!active && (
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setActive(f.id)
                        setResult(null)
                        setInput("")
                        setJd("")
                      }}
                      className="text-left p-3 rounded-xl border border-ink-200 dark:border-ink-700 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition group"
                    >
                      <f.icon className="h-5 w-5 text-primary-600 mb-2 group-hover:scale-110 transition" />
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">
                        {f.label}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {active && (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setActive(null)
                      setResult(null)
                    }}
                    className="text-sm text-ink-500 hover:text-ink-800 flex items-center gap-1"
                  >
                    ← Back to tools
                  </button>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const f = FEATURES.find((x) => x.id === active)!
                      return (
                        <>
                          <f.icon className="h-5 w-5 text-primary-600" />
                          <h4 className="font-display font-semibold">
                            {f.label}
                          </h4>
                        </>
                      )
                    })()}
                  </div>

                  {(needsText || needsContext) && (
                    <div>
                      <label className="label">
                        {needsContext
                          ? "Context (optional)"
                          : "Text to process"}
                      </label>
                      <textarea
                        className="input min-h-[80px]"
                        placeholder={
                          needsContext
                            ? "e.g. project name or company"
                            : "Paste your text here…"
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                    </div>
                  )}
                  {needsJD && (
                    <div>
                      <label className="label">Paste the job description</label>
                      <textarea
                        className="input min-h-[120px]"
                        placeholder="Full job description…"
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => run(active)}
                    disabled={loading || (needsText && !input)}
                    className="btn-primary w-full h-11"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}{" "}
                    Generate
                  </button>

                  {loading && (
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="skeleton h-4 w-full rounded" />
                      ))}
                    </div>
                  )}

                  {result && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      {typeof result.score === "number" && (
                        <div className="card p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              ATS Score
                            </span>
                            <Badge
                              color={
                                result.score >= 70
                                  ? "success"
                                  : result.score >= 50
                                    ? "warning"
                                    : "error"
                              }
                            >
                              {result.score}/100
                            </Badge>
                          </div>
                          <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${result.score}%`,
                                background:
                                  result.score >= 70
                                    ? "#10b981"
                                    : result.score >= 50
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {typeof result.matchPercent === "number" && (
                        <div className="card p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Match</span>
                            <Badge
                              color={
                                result.matchPercent >= 60
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {result.matchPercent}%
                            </Badge>
                          </div>
                        </div>
                      )}
                      {result.suggestions && (
                        <div className="card p-4">
                          <p className="text-sm font-medium mb-2">
                            Suggestions
                          </p>
                          <ul className="space-y-1.5">
                            {result.suggestions.map((s, i) => (
                              <li
                                key={i}
                                className="text-sm text-ink-600 dark:text-ink-300 flex gap-2"
                              >
                                <Check className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.keywords && (
                        <div className="card p-4 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-success-700 mb-1.5">
                              Matched ({result.keywords.matched.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {result.keywords.matched.map((k) => (
                                <Badge key={k} color="success">
                                  {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-error-700 mb-1.5">
                              Missing ({result.keywords.missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {result.keywords.missing.map((k) => (
                                <Badge key={k} color="error">
                                  {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Result</p>
                          <button
                            onClick={copyResult}
                            className="text-ink-400 hover:text-primary-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {Array.isArray(result.result) ? (
                          <ul className="space-y-2">
                            {result.result.map((r, i) => (
                              <li
                                key={i}
                                className="text-sm text-ink-700 dark:text-ink-200 flex gap-2"
                              >
                                <span className="text-primary-600">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">
                            {typeof result.result === "object" &&
                            result.result !== null
                              ? JSON.stringify(result.result, null, 2)
                              : String(result.result)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={apply}
                          className="btn-primary flex-1 h-10"
                        >
                          <Check className="h-4 w-4" /> Apply to resume
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
