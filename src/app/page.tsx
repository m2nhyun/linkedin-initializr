"use client";

import { useEffect, useMemo, useState } from "react";

type Tone = "linkedin" | "resume" | "meme";
type ResultView = "render" | "markdown" | "text";

type Preset = {
  label: string;
  role: string;
  targetRole: string;
  experience: string;
  stack: string;
  rawInput: string;
  tone: Tone;
};

type ResultPayload = {
  headline: string;
  titleKo: string;
  titleEn: string;
  summary: string;
  bullets: string[];
  skills: string[];
  markdown: string;
  plainText: string;
  mismatchNote?: string;
  realityBlock?: string[];
  polishedBlock?: string[];
};

const presets: Preset[] = [
  {
    label: "백수 테스트",
    role: "취업 준비생",
    targetRole: "프런트엔드 개발자",
    experience: "공백기, 개인 프로젝트 위주",
    stack: "React, TypeScript, Next.js",
    rawInput: "백수\n집에서 쉬는 중\n포트폴리오 사이트 만듦\n유튜브 많이 봄",
    tone: "linkedin",
  },
  {
    label: "취준 프론트엔드",
    role: "취업 준비생",
    targetRole: "주니어 프런트엔드 개발자",
    experience: "개인 프로젝트 위주",
    stack: "React, TypeScript, Next.js",
    rawInput:
      "포트폴리오 사이트 만듦\n영화 검색 앱 만들었음\n팀플에서 로그인 맡음\n디자인 보고 화면 구현함",
    tone: "linkedin",
  },
  {
    label: "직무 불일치",
    role: "프런트엔드 개발자",
    targetRole: "프런트엔드 개발자",
    experience: "이직 준비 중",
    stack: "React, TypeScript, Next.js",
    rawInput: "유튜브 많이 봄\n집에서 요리함\n게임 자주 함\n가끔 블로그 씀",
    tone: "resume",
  },
];

const funnelSteps = [
  { id: 1, label: "포지션" },
  { id: 2, label: "배경" },
  { id: 3, label: "메모" },
  { id: 4, label: "결과" },
] as const;

const loadingStages = [
  "짧은 메모에서 쓸 만한 포인트 추리는 중",
  "조금 민망한 표현은 덜고, 있어 보이는 표현만 고르는 중",
  "직무 맥락에 맞게 문장 톤을 조정하는 중",
  "붙여넣기 가능한 결과 형태로 정리하는 중",
];

const spinnerLines = [
  "방금까지 '백수'였던 표현을 덜 상처받게 다듬는 중",
  "과장은 줄이고 존재감은 올리는 중",
  "링크드인에 올려도 덜 민망한 톤으로 정리 중",
];

const leadershipTerms = ["리드", "아키텍처", "총괄", "전략", "오너십", "주도"];

const fancyTitleMap: Record<string, { ko: string; en: string }> = {
  백수: { ko: "홈프로텍터", en: "Home Life Strategist" },
  알바생: { ko: "멀티태스킹 서비스 어소시에이트", en: "Multi-Service Operations Associate" },
  "집에서 쉬는 중": { ko: "에너지 리커버리 스페셜리스트", en: "Personal Energy Recovery Specialist" },
  "게임 자주 함": { ko: "인터랙티브 미디어 연구원", en: "Interactive Media Researcher" },
  "유튜브 많이 봄": { ko: "디지털 콘텐츠 큐레이터", en: "Digital Content Curator" },
  "집에서 요리함": { ko: "홈 가스트로노미 디렉터", en: "Home Gastronomy Director" },
};

function parseLines(rawInput: string) {
  return rawInput
    .split("\n")
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function detectTitlePreview(lines: string[]) {
  for (const line of lines) {
    const found = fancyTitleMap[line];
    if (found) return `${found.ko} (${found.en})`;
  }

  return "포지셔닝 리빌더 (Professional Narrative Reframer)";
}

function detectRisks(rawInput: string) {
  return leadershipTerms.filter((term) => rawInput.includes(term));
}

export default function Home() {
  const [role, setRole] = useState("취업 준비생");
  const [targetRole, setTargetRole] = useState("프런트엔드 개발자");
  const [experience, setExperience] = useState("이직/취준 준비 중");
  const [stack, setStack] = useState("React, TypeScript, Next.js");
  const [rawInput, setRawInput] = useState(
    "백수\n포트폴리오 사이트 만듦\n영화 검색 앱 만들었음\n유튜브 많이 봄",
  );
  const [tone, setTone] = useState<Tone>("linkedin");
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [activeResultView, setActiveResultView] = useState<ResultView>("render");
  const [copyState, setCopyState] = useState<"idle" | "markdown" | "text">("idle");
  const [pendingResult, setPendingResult] = useState<ResultPayload | null>(null);
  const [revealedResult, setRevealedResult] = useState<ResultPayload | null>(null);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const riskTerms = useMemo(() => detectRisks(rawInput), [rawInput]);

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

  const canGoNextStep1 = role.trim() && targetRole.trim();
  const canGoNextStep2 = experience.trim() && stack.trim();
  const canGenerate = parsedLines.length > 0;
  const currentStep = Math.min(step, 4);
  const progressValue = currentStep * 25;
  const previewTitle = detectTitlePreview(parsedLines);

  async function copyToClipboard(mode: "markdown" | "text") {
    if (!revealedResult) return;

    const content = mode === "markdown" ? revealedResult.markdown : revealedResult.plainText;
    await navigator.clipboard.writeText(content);
    setCopyState(mode);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function applyPreset(preset: Preset) {
    setRole(preset.role);
    setTargetRole(preset.targetRole);
    setExperience(preset.experience);
    setStack(preset.stack);
    setRawInput(preset.rawInput);
    setTone(preset.tone);
    setStep(1);
    setIsGenerating(false);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setPendingResult(null);
    setRevealedResult(null);
    setLoadingFinished(false);
    setErrorMessage(null);
    setActiveResultView("render");
  }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          targetRole,
          experience,
          stack,
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

  function resetFlow() {
    setStep(1);
    setIsGenerating(false);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setPendingResult(null);
    setRevealedResult(null);
    setLoadingFinished(false);
    setCopyState("idle");
    setActiveResultView("render");
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
            <span className="text-xs text-stone-500">Responses API</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            평범한 정보를, 덜 평범하게 포장합니다.
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            이직과 취준을 준비하는 사용자의 평범한 정보를 전문적인 표현으로 재포장합니다. 예:
            <span className="font-semibold text-stone-900"> 백수 → 홈프로텍터</span>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">현재 포지션과 목표를 입력합니다.</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">현재 상태</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="예: 취업 준비생, 프런트엔드 개발자"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">목표 직무</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="예: ML 개발자, 프런트엔드 개발자"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!canGoNextStep1}
                onClick={() => setStep(2)}
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                다음으로
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-[28px] border border-stone-900/10 bg-white/78 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">배경과 기술 맥락을 적습니다.</h2>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">경력 요약</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="예: 이직 준비 중, 공백기, 1년차"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">기술 스택</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={stack}
                  onChange={(event) => setStack(event.target.value)}
                  placeholder="예: React, TypeScript, Next.js"
                />
              </label>
            </div>

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
                disabled={!canGoNextStep2}
                onClick={() => setStep(3)}
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                다음으로
              </button>
            </div>
          </section>
        )}

        {step === 3 && !isGenerating && (
          <section className="rounded-[28px] border border-stone-900/10 bg-white/78 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Step 3</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">평범한 입력을 넣어주세요.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              `백수`, `유튜브 많이 봄`, `포트폴리오 사이트 만듦` 같이 솔직하게 적으면 됩니다.
            </p>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-stone-700">짧은 입력</span>
              <textarea
                className="min-h-56 w-full rounded-[24px] border border-stone-200 bg-[#fffdf8] px-4 py-4 text-sm leading-7 outline-none transition focus:border-stone-500"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder={"예:\n백수\n유튜브 많이 봄\n포트폴리오 사이트 만듦"}
              />
            </label>

            <div className="mt-5">
              <p className="text-sm font-medium text-stone-700">출력 톤</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(["linkedin", "resume", "meme"] as Tone[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTone(mode)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      tone === mode
                        ? "bg-stone-900 text-stone-50"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {mode === "linkedin" ? "LinkedIn 톤" : mode === "resume" ? "이력서 톤" : "유머 톤"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">예상 직함</p>
              <p className="mt-2 text-base font-semibold text-stone-900">{previewTitle}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                생성은 OpenAI Responses API를 통해 서버에서 처리됩니다.
              </p>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
              >
                이전
              </button>
              <button
                type="button"
                disabled={!canGenerate}
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
                  <p className="text-sm font-semibold text-stone-100">마지막 포장 중</p>
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
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{revealedResult.headline}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                {revealedResult.titleKo} ({revealedResult.titleEn})
              </p>

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
                  <div className="rounded-[22px] bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Summary</p>
                    <p className="mt-3 text-sm leading-7 text-stone-100">{revealedResult.summary}</p>
                    {revealedResult.mismatchNote && (
                      <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-3 text-sm leading-6 text-amber-100">
                        {revealedResult.mismatchNote}
                      </p>
                    )}
                  </div>

                  <div className="rounded-[22px] bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Reframed Experience</p>
                    <div className="mt-3 space-y-3">
                      {revealedResult.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-2xl bg-white/6 px-4 py-3 text-sm leading-7 text-stone-100">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>

                  {revealedResult.skills.length > 0 && (
                    <div className="rounded-[22px] bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {revealedResult.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-stone-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {revealedResult.realityBlock && revealedResult.polishedBlock && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">현실의 나</p>
                        <div className="mt-3 space-y-2 text-sm leading-7 text-stone-100">
                          {revealedResult.realityBlock.map((item) => (
                            <p key={item}>- {item}</p>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[22px] bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">링크드인의 나</p>
                        <div className="mt-3 space-y-2 text-sm leading-7 text-stone-100">
                          {revealedResult.polishedBlock.map((item) => (
                            <p key={item}>- {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
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
                <li>직무와 맞는 입력은 전문 용어 중심으로 정리합니다.</li>
                <li>직무와 직접 관련 없는 입력은 전이 가능한 역량 관점으로 재해석합니다.</li>
                <li>없는 수치 성과와 허위 리더십은 생성하지 않도록 지시합니다.</li>
              </ul>

              {riskTerms.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  과장 위험 단어 감지: {riskTerms.join(", ")}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  현재 입력은 과장보다 재해석 중심으로 정리되었습니다.
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
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
