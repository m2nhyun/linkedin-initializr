"use client";

import { useEffect, useMemo, useState } from "react";

type CareerLevel = "entry" | "experienced";
type JobRole = "frontend" | "backend" | "designer" | "pm" | "ai";
type Tone = "meme" | "linkedin" | "resume";
type ResultView = "render" | "markdown" | "text";

type ResultPayload = {
  markdown: string;
  plainText: string;
  mismatchNote: string;
  sourceNotes?: string[];
  linkedin: {
    headline: string;
    about: string;
    experienceTitle: string;
    experiencePeriod: string;
    experienceBullets: string[];
    skills: string[];
  };
  resume: {
    position: string;
    majorResponsibilities: string[];
    achievementSummary: string;
    coverLetterParagraph: string;
    competencyTags: string[];
  };
  meme: {
    koreanTitle: string;
    englishTitle: string;
    oneLiner: string;
    capabilityBullets: string[];
    closingLine: string;
    realityBlock: string[];
    polishedBlock: string[];
  };
};

const funnelSteps = [
  { id: 1, label: "경력 · 직무 · 톤" },
  { id: 2, label: "자유형식 경험" },
  { id: 3, label: "외부 정보 보강" },
] as const;

const careerOptions: Array<{ value: CareerLevel; label: string }> = [
  { value: "entry", label: "신입" },
  { value: "experienced", label: "경력" },
];

const jobOptions: Array<{ value: JobRole; label: string }> = [
  { value: "frontend", label: "프런트엔드" },
  { value: "backend", label: "백엔드" },
  { value: "designer", label: "디자이너" },
  { value: "pm", label: "PM" },
  { value: "ai", label: "AI" },
];

const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "meme", label: "밈톤" },
  { value: "linkedin", label: "링크드인톤" },
  { value: "resume", label: "이력서톤" },
];

const roleExamples: Record<JobRole, string[]> = {
  frontend: [
    "리액트로 토이프로젝트 만들어봄",
    "노션 클론 만들다가 포기함",
    "CSS 하루종일 붙잡고 버튼 가운데 정렬함",
    "깃허브 잔디 열심히 심었음",
    "유튜브로 Next.js 강의 들음",
  ],
  backend: [
    "스프링 부트 강의 3개 들음",
    "DB 설계하다가 ERD 10번 갈아엎음",
    "API 만들어서 포스트맨으로 테스트함",
    "AWS EC2에 배포해봤는데 왜 되는지 모름",
    "SQL 쿼리 최적화 시도하다 포기",
  ],
  designer: [
    "피그마로 앱 화면 20개 만듦",
    "브랜드 로고 혼자 다 만들어봄",
    "사용자 인터뷰 3명한테 해봄",
    "색깔 팔레트 고르는데 이틀 씀",
    "디자인 시스템 혼자 정의해봄",
  ],
  pm: [
    "팀 프로젝트에서 회의 진행하고 노션에 정리함",
    "기획서 쓰다가 요구사항 계속 바뀜",
    "유저 스토리 작성하고 백로그 만들어봄",
    "스프린트 일정 짜봤는데 다 밀림",
    "A/B 테스트 기획해봄",
  ],
  ai: [
    "캐글 튜토리얼 따라해봄",
    "ChatGPT API 붙여서 챗봇 만들어봄",
    "논문 읽다가 수식에서 포기함",
    "파인튜닝 시도했는데 GPU 없어서 실패",
    "프롬프트 엔지니어링 독학함",
  ],
};

const commonExamples = [
  "6개월 백수",
  "유튜브만 봄",
  "스터디 일주일 만에 나옴",
  "사이드 프로젝트 기획만 3번 함",
  "개발 유튜버 구독만 100개",
];

const presets: Array<{
  label: string;
  careerLevel: CareerLevel;
  jobRole: JobRole;
  tone: Tone;
  rawInput: string;
}> = [
  {
    label: "프런트 링크드인",
    careerLevel: "entry",
    jobRole: "frontend",
    tone: "linkedin",
    rawInput:
      "리액트로 토이프로젝트 만들어봄\nCSS 하루종일 붙잡고 버튼 가운데 정렬함\n유튜브로 Next.js 강의 들음",
  },
  {
    label: "PM 이력서",
    careerLevel: "entry",
    jobRole: "pm",
    tone: "resume",
    rawInput:
      "팀 프로젝트에서 회의 진행하고 노션에 정리함\n스프린트 일정 짜봤는데 다 밀림\nA/B 테스트 기획해봄",
  },
  {
    label: "AI 밈톤",
    careerLevel: "entry",
    jobRole: "ai",
    tone: "meme",
    rawInput:
      "ChatGPT API 붙여서 챗봇 만들어봄\n논문 읽다가 수식에서 포기함\n파인튜닝 시도했는데 GPU 없어서 실패",
  },
];

const loadingStages = [
  "직무와 경력 수준에 맞는 포지셔닝을 잡는 중",
  "자유형식 경험에서 써먹을 포인트를 추리는 중",
  "선택한 톤에 맞게 문장을 재구성하는 중",
  "붙여넣기 가능한 결과 포맷으로 정리하는 중",
];

const spinnerLines = [
  "밈은 밈답게, 링크드인은 진지하게 조정 중",
  "직무 맥락에 맞는 키워드를 마지막으로 다듬는 중",
  "복사해서 바로 쓸 수 있게 마감 중",
];

function parseLines(rawInput: string) {
  return rawInput
    .split("\n")
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function getResultHeading(result: ResultPayload, tone: Tone) {
  if (tone === "linkedin") {
    return {
      title: result.linkedin.headline,
      subtitle: "LinkedIn에 바로 붙여넣을 수 있는 프로필 구조로 정리했습니다.",
    };
  }

  if (tone === "resume") {
    return {
      title: result.resume.position,
      subtitle: "국문 이력서와 자기소개서 문체에 맞춰 격식체로 정리했습니다.",
    };
  }

  return {
    title: `${result.meme.koreanTitle} | ${result.meme.englishTitle}`,
    subtitle:
      "밈톤은 과장과 재미를 살리되 직무 맥락은 유지하도록 구성했습니다.",
  };
}

export default function Home() {
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("entry");
  const [jobRole, setJobRole] = useState<JobRole>("frontend");
  const [tone, setTone] = useState<Tone>("linkedin");
  const [rawInput, setRawInput] = useState(
    "리액트로 토이프로젝트 만들어봄\nCSS 하루종일 붙잡고 버튼 가운데 정렬함\n유튜브로 Next.js 강의 들음",
  );
  const [githubId, setGithubId] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [pendingResult, setPendingResult] = useState<ResultPayload | null>(
    null,
  );
  const [revealedResult, setRevealedResult] = useState<ResultPayload | null>(
    null,
  );
  const [activeResultView, setActiveResultView] =
    useState<ResultView>("render");
  const [copyState, setCopyState] = useState<"idle" | "markdown" | "text">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const funnelStep = Math.min(step, 3);
  const progressValue = funnelStep === 1 ? 33 : funnelStep === 2 ? 66 : 100;
  const resultHeading = useMemo(
    () => (revealedResult ? getResultHeading(revealedResult, tone) : null),
    [revealedResult, tone],
  );

  useEffect(() => {
    if (!isGenerating) return;

    const timers = [
      window.setTimeout(() => setProgressIndex(1), 900),
      window.setTimeout(() => setProgressIndex(2), 1800),
      window.setTimeout(() => setProgressIndex(3), 2800),
      window.setTimeout(() => setSpinnerIndex(1), 3400),
      window.setTimeout(() => setSpinnerIndex(2), 4300),
      window.setTimeout(() => setLoadingFinished(true), 5200),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating || !loadingFinished || !pendingResult) return;

    setRevealedResult(pendingResult);
    setIsGenerating(false);
    setStep(4);
  }, [isGenerating, loadingFinished, pendingResult]);

  async function startGeneration() {
    setErrorMessage(null);
    setPendingResult(null);
    setRevealedResult(null);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setLoadingFinished(false);
    setCopyState("idle");
    setActiveResultView("render");
    setIsGenerating(true);
    setStep(4);

    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerLevel,
          jobRole,
          tone,
          rawInput,
          githubId,
          blogUrl,
        }),
      });

      const data = (await response.json()) as {
        result?: ResultPayload;
        error?: string;
      };
      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "결과 생성에 실패했습니다.");
      }

      setPendingResult(data.result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류로 결과 생성에 실패했습니다.";
      setErrorMessage(message);
      setIsGenerating(false);
      setLoadingFinished(false);
    }
  }

  async function copyToClipboard(mode: "markdown" | "text") {
    if (!revealedResult) return;
    const content =
      mode === "markdown" ? revealedResult.markdown : revealedResult.plainText;
    await navigator.clipboard.writeText(content);
    setCopyState(mode);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function applyPreset(preset: (typeof presets)[number]) {
    setCareerLevel(preset.careerLevel);
    setJobRole(preset.jobRole);
    setTone(preset.tone);
    setRawInput(preset.rawInput);
    setGithubId("");
    setBlogUrl("");
    setStep(1);
    setIsGenerating(false);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setLoadingFinished(false);
    setPendingResult(null);
    setRevealedResult(null);
    setActiveResultView("render");
    setCopyState("idle");
    setErrorMessage(null);
  }

  function resetFlow() {
    setStep(1);
    setGithubId("");
    setBlogUrl("");
    setIsGenerating(false);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setLoadingFinished(false);
    setPendingResult(null);
    setRevealedResult(null);
    setActiveResultView("render");
    setCopyState("idle");
    setErrorMessage(null);
  }

  return (
    <main className="min-h-screen bg-[#020402] px-3 py-4 text-[#75ff5a] sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:max-w-[640px]">
        <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 shadow-[0_0_0_1px_rgba(117,255,90,0.2)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="border border-[#75ff5a]/80 bg-[#75ff5a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#75ff5a]">
              ./TERMINAL/ROOT_
            </span>
            <span className="border border-[#75ff5a]/60 px-2 py-1 text-[11px] uppercase text-[#75ff5a]/70">
              Execute
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[#75ff5a]/55">
            <span>[home]</span>
            <span>[logs]</span>
            <span>[files]</span>
            <span>[network]</span>
          </div>

          <h1 className="mt-4 text-[2rem] font-bold leading-none tracking-[-0.06em] text-[#75ff5a] sm:text-[2.4rem]">
            Load &quot;Professional_Identity&quot;
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">
            &gt; 자유형식 데이터를 입력하십시오.
            <br />
            &gt; 인터리전트 엔진이 귀하의 경험을 분석 중입니다.
            <br />
            &gt; 최적화된 결과물을 생성하십시오.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-[#75ff5a]/62">
              <span>Funnel {funnelStep} / 3</span>
              <span>{funnelSteps[funnelStep - 1].label}</span>
            </div>
            <div className="mt-2 h-2 border border-[#75ff5a]/40 bg-[#021302]">
              <div
                className="h-full bg-[#75ff5a] transition-all duration-500"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="border border-[#75ff5a]/50 bg-transparent px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {step === 1 && (
          <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75ff5a]/55">
              [system_prompt] step 01
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#75ff5a]">
              경력, 직무, 톤을 먼저 선택합니다.
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#d4d4d4]">
              기획 기준:
              <br />
              <span className="block">경력: 신입 / 경력</span>
              <span className="block">
                직무: 프런트엔드, 백엔드, 디자이너, PM, AI
              </span>
              <span className="block">톤: 밈톤, 링크드인톤, 이력서톤</span>
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">
                  경력
                </span>
                <select
                  className="w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-3 text-sm text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                  value={careerLevel}
                  onChange={(event) =>
                    setCareerLevel(event.target.value as CareerLevel)
                  }
                >
                  {careerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">
                  직무
                </span>
                <select
                  className="w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-3 text-sm text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                  value={jobRole}
                  onChange={(event) =>
                    setJobRole(event.target.value as JobRole)
                  }
                >
                  {jobOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">
                  톤
                </span>
                <select
                  className="w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-3 text-sm text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="border border-[#75ff5a] bg-[#75ff5a]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#75ff5a] transition hover:bg-[#75ff5a]/16"
              >
                &gt; continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75ff5a]/55">
              [input_module] step 02
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#75ff5a]">
              자유형식 경험을 입력합니다.
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#d4d4d4]">
              도움말:
              <br />
              <span className="block">ex) SNS 프로젝트를 진행해보았어요.</span>
              <span className="block">ex) 인턴을 해보았어요.</span>
              <span className="mt-2 block text-[#75ff5a]/62">
                짧은 메모, 실패 경험, 중단한 프로젝트도 입력 가능합니다.
                딸깍톤이 역할·과정·역량 관점으로 재정리합니다.
              </span>
            </p>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">
                자유형식 경험
              </span>
              <textarea
                className="min-h-56 w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-4 text-sm leading-7 text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder={
                  "예:\nSNS 프로젝트를 진행해보았어요.\n인턴을 해보았어요."
                }
              />
            </label>

            <div className="mt-5 border border-[#75ff5a]/50 bg-[#010401] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                직무별 자유형식 경험 입력 예시
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#75ff5a]">
                  {jobOptions.find((option) => option.value === jobRole)?.label}
                </p>
                <div className="mt-3 space-y-2">
                  {roleExamples[jobRole].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setRawInput((prev) =>
                          prev.trim() ? `${prev}\n${example}` : example,
                        );
                      }}
                      className="block w-full border border-[#75ff5a]/35 bg-transparent px-4 py-3 text-left text-sm text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-[#75ff5a]">
                  공통 예시
                </p>
                <div className="mt-3 grid gap-2">
                  {commonExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setRawInput((prev) =>
                          prev.trim() ? `${prev}\n${example}` : example,
                        );
                      }}
                      className="border border-[#75ff5a]/35 bg-transparent px-4 py-3 text-left text-sm text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-5 border border-red-500/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border border-[#75ff5a]/45 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#75ff5a]/86 transition hover:bg-[#75ff5a]/8"
              >
                &lt; back
              </button>
              <button
                type="button"
                disabled={parsedLines.length === 0}
                onClick={() => setStep(3)}
                className="border border-[#75ff5a] bg-[#75ff5a]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#75ff5a] transition hover:bg-[#75ff5a]/16 disabled:cursor-not-allowed disabled:border-[#75ff5a]/20 disabled:text-[#75ff5a]/25"
              >
                &gt; enrich_sources
              </button>
            </div>
          </section>
        )}

        {step === 3 && !isGenerating && (
          <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75ff5a]/55">[source_module] step 03</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#75ff5a]">
              외부 공개 정보로 입력을 보강합니다.
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#d4d4d4]">
              GitHub 공개 프로필과 개인 블로그 URL이 있으면 같이 넣습니다.
              <br />
              LinkedIn은 차단 가능성이 높아 현재는 제외했습니다.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">GitHub ID 또는 URL</span>
                <input
                  className="w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-3 text-sm text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                  value={githubId}
                  onChange={(event) => setGithubId(event.target.value)}
                  placeholder="예: m2nhyun 또는 https://github.com/m2nhyun"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.14em] text-[#75ff5a]">개인 블로그 URL</span>
                <input
                  className="w-full border border-[#75ff5a]/60 bg-[#010401] px-4 py-3 text-sm text-[#75ff5a] outline-none transition focus:border-[#75ff5a]"
                  value={blogUrl}
                  onChange={(event) => setBlogUrl(event.target.value)}
                  placeholder="예: https://your-blog.com"
                />
              </label>
            </div>

            <div className="mt-5 border border-[#75ff5a]/40 bg-[#010401] px-4 py-4 text-sm leading-7 text-[#d4d4d4]">
              <p className="font-semibold uppercase tracking-[0.14em] text-[#75ff5a]">수집 방식</p>
              <p className="mt-2">- GitHub: 공개 프로필과 최근 공개 저장소를 읽어 기술 맥락을 보강합니다.</p>
              <p>- 블로그: 페이지 제목, 설명, 본문 일부를 읽어 관심사와 글감 맥락을 보강합니다.</p>
              <p>- 둘 다 비워도 결과 생성은 가능합니다.</p>
            </div>

            {errorMessage && (
              <div className="mt-5 border border-red-500/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="border border-[#75ff5a]/45 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#75ff5a]/86 transition hover:bg-[#75ff5a]/8"
              >
                &lt; back
              </button>
              <button
                type="button"
                disabled={parsedLines.length === 0}
                onClick={startGeneration}
                className="border border-[#75ff5a] bg-[#75ff5a]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#75ff5a] transition hover:bg-[#75ff5a]/16 disabled:cursor-not-allowed disabled:border-[#75ff5a]/20 disabled:text-[#75ff5a]/25"
              >
                &gt; start_session_now [enter]
              </button>
            </div>
          </section>
        )}

        {isGenerating && (
          <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 text-[#75ff5a] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75ff5a]/55">
              [terminal_window] ai processing
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#75ff5a]">
              {loadingStages[Math.min(progressIndex, loadingStages.length - 1)]}
            </h2>

            <div className="mt-5 space-y-3">
              {loadingStages.map((stage, index) => {
                const active = index <= progressIndex;
                return (
                  <div
                    key={stage}
                    className={`border px-4 py-3 text-sm transition ${
                      active
                        ? "border-[#75ff5a]/80 bg-[#75ff5a]/10 text-[#75ff5a]"
                        : "border-[#75ff5a]/20 bg-transparent text-[#75ff5a]/45"
                    }`}
                  >
                    {active ? "완료" : "대기"} · {stage}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border border-[#75ff5a]/40 bg-[#010401] px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-spin border-4 border-[#75ff5a]/25 border-t-[#75ff5a]" />
                <div>
                  <p className="text-sm font-semibold uppercase text-[#75ff5a]">
                    최종 마감 중
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#d4d4d4]">
                    {spinnerLines[spinnerIndex]}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 4 && !isGenerating && revealedResult && (
          <>
            <section className="border border-[#75ff5a]/80 bg-[#040a04] p-4 text-[#75ff5a] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75ff5a]/55">
                [terminal_window] output
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#75ff5a]">
                {resultHeading?.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#d4d4d4]">
                {resultHeading?.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(["render", "markdown", "text"] as ResultView[]).map(
                  (view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setActiveResultView(view)}
                      className={`border px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] transition ${
                        activeResultView === view
                          ? "border-[#75ff5a] bg-[#75ff5a] text-[#020402]"
                          : "border-[#75ff5a]/35 bg-transparent text-[#75ff5a]/75 hover:bg-[#75ff5a]/8"
                      }`}
                    >
                      {view === "render"
                        ? "기본 렌더"
                        : view === "markdown"
                          ? "Markdown"
                          : "일반 텍스트"}
                    </button>
                  ),
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard("markdown")}
                  className="border border-[#75ff5a]/45 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
                >
                  {copyState === "markdown"
                    ? "Markdown 복사됨"
                    : "Markdown 복사"}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard("text")}
                  className="border border-[#75ff5a]/45 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
                >
                  {copyState === "text" ? "텍스트 복사됨" : "일반 텍스트 복사"}
                </button>
              </div>

              {activeResultView === "render" && (
                <div className="mt-5 space-y-4">
                  {tone === "linkedin" && (
                    <>
                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          Headline
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-[#75ff5a]">
                          {revealedResult.linkedin.headline}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          About
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">
                          {revealedResult.linkedin.about}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                            Experience
                          </p>
                          <p className="text-xs text-[#75ff5a]/55">
                            {revealedResult.linkedin.experiencePeriod}
                          </p>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[#75ff5a]">
                          {revealedResult.linkedin.experienceTitle}
                        </p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.linkedin.experienceBullets.map(
                            (bullet, index) => (
                              <div
                                key={bullet}
                                className="border border-[#75ff5a]/20 bg-transparent px-4 py-3 text-sm leading-7 text-[#d4d4d4]"
                              >
                                <span className="mr-2 text-[#75ff5a]/62">
                                  [{index + 1}]
                                </span>
                                {bullet}
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          Skills
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {revealedResult.linkedin.skills.map((skill) => (
                            <span
                              key={skill}
                              className="border border-[#75ff5a]/30 bg-transparent px-3 py-2 text-xs font-medium text-[#75ff5a]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {tone === "resume" && (
                    <>
                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          직무명
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-[#75ff5a]">
                          {revealedResult.resume.position}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          주요 업무
                        </p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.resume.majorResponsibilities.map(
                            (item, index) => (
                              <div
                                key={item}
                                className="border border-[#75ff5a]/20 bg-transparent px-4 py-3 text-sm leading-7 text-[#d4d4d4]"
                              >
                                <span className="mr-2 text-[#75ff5a]/62">
                                  [{index + 1}]
                                </span>
                                {item}
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          성과 요약
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">
                          {revealedResult.resume.achievementSummary}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          자기소개서 활용 단락
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">
                          {revealedResult.resume.coverLetterParagraph}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          보유 역량
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {revealedResult.resume.competencyTags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-[#75ff5a]/30 bg-transparent px-3 py-2 text-xs font-medium text-[#75ff5a]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {tone === "meme" && (
                    <>
                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          포장된 직함
                        </p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-[#75ff5a]">
                          {revealedResult.meme.koreanTitle}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#75ff5a]/62">
                          {revealedResult.meme.englishTitle}
                        </p>
                        <p className="mt-4 border border-[#75ff5a]/20 bg-transparent px-4 py-3 text-sm leading-7 text-[#d4d4d4]">
                          {revealedResult.meme.oneLiner}
                        </p>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          핵심 역량
                        </p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.meme.capabilityBullets.map(
                            (bullet, index) => (
                              <div
                                key={bullet}
                                className="border border-[#75ff5a]/20 bg-transparent px-4 py-3 text-sm leading-7 text-[#d4d4d4]"
                              >
                                <span className="mr-2 text-[#75ff5a]/62">
                                  [{index + 1}]
                                </span>
                                {bullet}
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                            현실의 나
                          </p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-[#d4d4d4]">
                            {revealedResult.meme.realityBlock.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </div>
                        <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                            포장된 나
                          </p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-[#d4d4d4]">
                            {revealedResult.meme.polishedBlock.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#75ff5a]/40 bg-[#010401] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#75ff5a]/55">
                          한마디
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#d4d4d4]">
                          {revealedResult.meme.closingLine}
                        </p>
                      </div>
                    </>
                  )}

                  {revealedResult.mismatchNote && (
                    <p className="border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-sm leading-6 text-amber-200">
                      {revealedResult.mismatchNote}
                    </p>
                  )}

                  {revealedResult.sourceNotes &&
                    revealedResult.sourceNotes.length > 0 && (
                      <div className="border border-[#75ff5a]/30 bg-[#021302] px-3 py-3 text-sm leading-6 text-[#d4d4d4]">
                        <p className="font-semibold uppercase tracking-[0.12em] text-[#75ff5a]">
                          Source Notes
                        </p>
                        <div className="mt-2 space-y-1">
                          {revealedResult.sourceNotes.map((note) => (
                            <p key={note}>- {note}</p>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {activeResultView === "markdown" && (
                <pre className="mt-5 overflow-x-auto whitespace-pre-wrap border border-[#75ff5a]/40 bg-[#010401] p-4 font-mono text-[13px] leading-7 text-[#d4d4d4]">
                  {revealedResult.markdown}
                </pre>
              )}

              {activeResultView === "text" && (
                <pre className="mt-5 overflow-x-auto whitespace-pre-wrap border border-[#75ff5a]/40 bg-[#010401] p-4 font-sans text-sm leading-7 text-[#d4d4d4]">
                  {revealedResult.plainText}
                </pre>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-[#75ff5a]/45 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#75ff5a] transition hover:bg-[#75ff5a]/8"
                >
                  edit_input
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="border border-[#75ff5a] bg-[#75ff5a]/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#75ff5a] transition hover:bg-[#75ff5a]/16"
                >
                  reboot_flow
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
