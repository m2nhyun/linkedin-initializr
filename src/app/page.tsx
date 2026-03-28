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
  { id: 3, label: "AI 재포장 중" },
  { id: 4, label: "결과 확인" },
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
    rawInput: "리액트로 토이프로젝트 만들어봄\nCSS 하루종일 붙잡고 버튼 가운데 정렬함\n유튜브로 Next.js 강의 들음",
  },
  {
    label: "PM 이력서",
    careerLevel: "entry",
    jobRole: "pm",
    tone: "resume",
    rawInput: "팀 프로젝트에서 회의 진행하고 노션에 정리함\n스프린트 일정 짜봤는데 다 밀림\nA/B 테스트 기획해봄",
  },
  {
    label: "AI 밈톤",
    careerLevel: "entry",
    jobRole: "ai",
    tone: "meme",
    rawInput: "ChatGPT API 붙여서 챗봇 만들어봄\n논문 읽다가 수식에서 포기함\n파인튜닝 시도했는데 GPU 없어서 실패",
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

function detectRisks(rawInput: string) {
  return ["리드", "총괄", "아키텍처", "매출", "KPI", "오너십"].filter((term) => rawInput.includes(term));
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
    subtitle: "밈톤은 과장과 재미를 살리되 직무 맥락은 유지하도록 구성했습니다.",
  };
}

export default function Home() {
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("entry");
  const [jobRole, setJobRole] = useState<JobRole>("frontend");
  const [tone, setTone] = useState<Tone>("linkedin");
  const [rawInput, setRawInput] = useState(
    "리액트로 토이프로젝트 만들어봄\nCSS 하루종일 붙잡고 버튼 가운데 정렬함\n유튜브로 Next.js 강의 들음",
  );
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [pendingResult, setPendingResult] = useState<ResultPayload | null>(null);
  const [revealedResult, setRevealedResult] = useState<ResultPayload | null>(null);
  const [activeResultView, setActiveResultView] = useState<ResultView>("render");
  const [copyState, setCopyState] = useState<"idle" | "markdown" | "text">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const riskTerms = useMemo(() => detectRisks(rawInput), [rawInput]);
  const currentStep = Math.min(step, 4);
  const progressValue = currentStep * 25;
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
    setStep(3);

    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerLevel,
          jobRole,
          tone,
          rawInput,
        }),
      });

      const data = (await response.json()) as { result?: ResultPayload; error?: string };
      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "결과 생성에 실패했습니다.");
      }

      setPendingResult(data.result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류로 결과 생성에 실패했습니다.";
      setErrorMessage(message);
      setIsGenerating(false);
      setLoadingFinished(false);
    }
  }

  async function copyToClipboard(mode: "markdown" | "text") {
    if (!revealedResult) return;
    const content = mode === "markdown" ? revealedResult.markdown : revealedResult.plainText;
    await navigator.clipboard.writeText(content);
    setCopyState(mode);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function applyPreset(preset: (typeof presets)[number]) {
    setCareerLevel(preset.careerLevel);
    setJobRole(preset.jobRole);
    setTone(preset.tone);
    setRawInput(preset.rawInput);
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.72),_transparent_35%),linear-gradient(180deg,_#f8f2e5_0%,_#efe3cf_50%,_#e4d6bc_100%)] px-4 py-6 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:max-w-[640px]">
        <section className="rounded-[28px] border border-stone-900/10 bg-white/82 p-5 shadow-[0_20px_60px_rgba(77,56,23,0.14)] backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-50">
              딸깍톤
            </span>
            <span className="text-xs text-stone-500">OpenAI Responses API</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            평범한 경험을 톤에 맞게 다시 써주는 포지셔닝 엔진.
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            지금은 OpenAI를 <span className="font-semibold text-stone-900">결과 생성 단계</span>에 사용합니다.
            사용자가 고른 경력, 직무, 톤과 자유형식 경험을 바탕으로 우리가 설계한 프롬프트를 보내고,
            구조화된 결과를 받습니다.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span>
                Step {currentStep} / 4
              </span>
              <span>{funnelSteps[currentStep - 1].label}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-stone-200">
              <div
                className="h-2 rounded-full bg-stone-900 transition-all duration-500"
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
                className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {step === 1 && (
          <section className="rounded-[28px] border border-stone-900/10 bg-white/78 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Funnel 1</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">경력, 직무, 톤을 먼저 선택합니다.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              기획 기준:
              <br />
              <span className="block">경력: 신입 / 경력</span>
              <span className="block">직무: 프런트엔드, 백엔드, 디자이너, PM, AI</span>
              <span className="block">톤: 밈톤, 링크드인톤, 이력서톤</span>
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">경력</span>
                <select
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={careerLevel}
                  onChange={(event) => setCareerLevel(event.target.value as CareerLevel)}
                >
                  {careerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">직무</span>
                <select
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={jobRole}
                  onChange={(event) => setJobRole(event.target.value as JobRole)}
                >
                  {jobOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">톤</span>
                <select
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
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
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
              >
                다음으로
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-[28px] border border-stone-900/10 bg-white/78 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Funnel 2</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">자유형식 경험을 입력합니다.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              도움말:
              <br />
              <span className="block">ex) SNS 프로젝트를 진행해보았어요.</span>
              <span className="block">ex) 인턴을 해보았어요.</span>
              <span className="mt-2 block text-stone-500">
                짧은 메모, 실패 경험, 중단한 프로젝트도 입력 가능합니다. 딸깍톤이 역할·과정·역량 관점으로 재정리합니다.
              </span>
            </p>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-stone-700">자유형식 경험</span>
              <textarea
                className="min-h-56 w-full rounded-[24px] border border-stone-200 bg-[#fffdf8] px-4 py-4 text-sm leading-7 outline-none transition focus:border-stone-500"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder={"예:\nSNS 프로젝트를 진행해보았어요.\n인턴을 해보았어요."}
              />
            </label>

            <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                직무별 자유형식 경험 입력 예시
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-stone-900">
                  {jobOptions.find((option) => option.value === jobRole)?.label}
                </p>
                <div className="mt-3 space-y-2">
                  {roleExamples[jobRole].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setRawInput((prev) => (prev.trim() ? `${prev}\n${example}` : example));
                      }}
                      className="block w-full rounded-2xl bg-white px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-stone-100"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-stone-900">공통 예시</p>
                <div className="mt-3 grid gap-2">
                  {commonExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setRawInput((prev) => (prev.trim() ? `${prev}\n${example}` : example));
                      }}
                      className="rounded-2xl bg-white px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-stone-100"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
              >
                이전
              </button>
              <button
                type="button"
                disabled={parsedLines.length === 0}
                onClick={startGeneration}
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                결과 생성하기
              </button>
            </div>
          </section>
        )}

        {isGenerating && (
          <section className="rounded-[28px] border border-stone-900/10 bg-[#111111] p-5 text-stone-50 shadow-[0_20px_60px_rgba(17,17,17,0.22)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Generating</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {loadingStages[Math.min(progressIndex, loadingStages.length - 1)]}
            </h2>

            <div className="mt-5 space-y-3">
              {loadingStages.map((stage, index) => {
                const active = index <= progressIndex;
                return (
                  <div
                    key={stage}
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${
                      active
                        ? "border-emerald-400/40 bg-emerald-400/10 text-stone-50"
                        : "border-white/10 bg-white/5 text-stone-400"
                    }`}
                  >
                    {active ? "완료" : "대기"} · {stage}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-600 border-t-stone-100" />
                <div>
                  <p className="text-sm font-semibold text-stone-100">최종 마감 중</p>
                  <p className="mt-1 text-sm leading-6 text-stone-300">{spinnerLines[spinnerIndex]}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 4 && !isGenerating && revealedResult && (
          <>
            <section className="rounded-[28px] border border-stone-900/10 bg-[#111111] p-5 text-stone-50 shadow-[0_20px_60px_rgba(17,17,17,0.22)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Result</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{resultHeading?.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">{resultHeading?.subtitle}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(["render", "markdown", "text"] as ResultView[]).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveResultView(view)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeResultView === view
                        ? "bg-stone-50 text-stone-900"
                        : "bg-white/5 text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    {view === "render" ? "기본 렌더" : view === "markdown" ? "Markdown" : "일반 텍스트"}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard("markdown")}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-white/8"
                >
                  {copyState === "markdown" ? "Markdown 복사됨" : "Markdown 복사"}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard("text")}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-white/8"
                >
                  {copyState === "text" ? "텍스트 복사됨" : "일반 텍스트 복사"}
                </button>
              </div>

              {activeResultView === "render" && (
                <div className="mt-5 space-y-4">
                  {tone === "linkedin" && (
                    <>
                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Headline</p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-stone-50">
                          {revealedResult.linkedin.headline}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">About</p>
                        <p className="mt-3 text-sm leading-7 text-stone-100">{revealedResult.linkedin.about}</p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Experience</p>
                          <p className="text-xs text-stone-400">{revealedResult.linkedin.experiencePeriod}</p>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-stone-50">
                          {revealedResult.linkedin.experienceTitle}
                        </p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.linkedin.experienceBullets.map((bullet) => (
                            <div key={bullet} className="rounded-2xl bg-white/6 px-4 py-3 text-sm leading-7 text-stone-100">
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Skills</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {revealedResult.linkedin.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-stone-100"
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
                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">직무명</p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-stone-50">
                          {revealedResult.resume.position}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">주요 업무</p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.resume.majorResponsibilities.map((item) => (
                            <div key={item} className="rounded-2xl bg-white/6 px-4 py-3 text-sm leading-7 text-stone-100">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">성과 요약</p>
                        <p className="mt-3 text-sm leading-7 text-stone-100">
                          {revealedResult.resume.achievementSummary}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                          자기소개서 활용 단락
                        </p>
                        <p className="mt-3 text-sm leading-7 text-stone-100">
                          {revealedResult.resume.coverLetterParagraph}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">보유 역량</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {revealedResult.resume.competencyTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-stone-100"
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
                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">포장된 직함</p>
                        <p className="mt-3 text-lg font-semibold leading-8 text-stone-50">
                          {revealedResult.meme.koreanTitle}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-300">{revealedResult.meme.englishTitle}</p>
                        <p className="mt-4 rounded-2xl bg-white/6 px-4 py-3 text-sm leading-7 text-stone-100">
                          {revealedResult.meme.oneLiner}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">핵심 역량</p>
                        <div className="mt-3 space-y-3">
                          {revealedResult.meme.capabilityBullets.map((bullet) => (
                            <div key={bullet} className="rounded-2xl bg-white/6 px-4 py-3 text-sm leading-7 text-stone-100">
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[22px] bg-white/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">현실의 나</p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-stone-100">
                            {revealedResult.meme.realityBlock.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[22px] bg-white/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">포장된 나</p>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-stone-100">
                            {revealedResult.meme.polishedBlock.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">한마디</p>
                        <p className="mt-3 text-sm leading-7 text-stone-100">{revealedResult.meme.closingLine}</p>
                      </div>
                    </>
                  )}

                  {revealedResult.mismatchNote && (
                    <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-3 text-sm leading-6 text-amber-100">
                      {revealedResult.mismatchNote}
                    </p>
                  )}
                </div>
              )}

              {activeResultView === "markdown" && (
                <pre className="mt-5 whitespace-pre-wrap rounded-[22px] bg-white/5 p-4 font-mono text-[13px] leading-7 text-stone-100">
                  {revealedResult.markdown}
                </pre>
              )}

              {activeResultView === "text" && (
                <pre className="mt-5 whitespace-pre-wrap rounded-[22px] bg-white/5 p-4 font-sans text-sm leading-7 text-stone-100">
                  {revealedResult.plainText}
                </pre>
              )}
            </section>

            <section className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
              <h3 className="text-lg font-semibold tracking-[-0.03em]">가드레일</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                <li>경력, 직무, 톤 선택값을 프롬프트에 직접 반영합니다.</li>
                <li>직무와 덜 맞는 입력은 전이 가능한 강점으로 재해석합니다.</li>
                <li>없는 수치 성과나 허위 리더십은 생성하지 않도록 지시합니다.</li>
              </ul>

              {riskTerms.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  과장 위험 단어 감지: {riskTerms.join(", ")}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  현재 입력은 재해석 중심으로 정리되었습니다.
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                >
                  입력 수정하기
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
                >
                  처음부터 다시
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
