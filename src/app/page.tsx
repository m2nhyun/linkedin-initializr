"use client";

import { useEffect, useMemo, useState } from "react";

type Tone = "linkedin" | "resume" | "meme";

type Preset = {
  label: string;
  role: string;
  targetRole: string;
  experience: string;
  stack: string;
  rawInput: string;
  tone: Tone;
};

const presets: Preset[] = [
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
    label: "1년차 운영",
    role: "프런트엔드 개발자",
    targetRole: "프런트엔드 개발자",
    experience: "1년차",
    stack: "React, TypeScript, Admin UI",
    rawInput:
      "admin 페이지 수정 많이 함\napi 붙임\n공통 컴포넌트 조금 만짐\n반복 작업 줄이는 화면 수정함",
    tone: "resume",
  },
  {
    label: "밈 테스트",
    role: "프런트엔드 개발자",
    targetRole: "프로덕트 프런트엔드 개발자",
    experience: "2년차",
    stack: "Next.js, React Query, Tailwind CSS",
    rawInput:
      "기획 변경 계속 반영함\n결제 버그 잡아봄\n이벤트 페이지 많이 만듦\n배포하고 QA 대응함",
    tone: "meme",
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
  "링크드인 냄새를 아주 살짝만 주입하는 중",
  "마지막으로 사람 말처럼 다듬는 중",
];

const spinnerLines = [
  "방금까지 '만듦'이던 문장을 '구현 및 고도화'로 번역 중",
  "과장은 줄이고 분위기는 올리는 중",
  "채용담당자 앞에서 덜 떨리는 문장으로 정리 중",
];

const expansionRules: Array<{ test: RegExp; output: string }> = [
  {
    test: /(포트폴리오|개인 사이트|블로그).*(만들|제작|구현)|React 사용/i,
    output:
      "개인 브랜딩 목적의 웹 경험을 직접 설계하고 구현하며, 컴포넌트 기반 UI 구성 역량을 실전 형태로 정리했습니다.",
  },
  {
    test: /(영화|검색).*(앱|사이트)|검색.*만들/i,
    output:
      "사용자 입력과 결과 노출 흐름을 고려한 검색형 인터페이스를 구현하며 데이터 기반 화면 구성 경험을 쌓았습니다.",
  },
  {
    test: /(로그인|인증|회원가입).*(맡|구현|작업)|로그인 맡음/i,
    output:
      "인증 관련 화면과 사용자 진입 흐름을 담당하며 서비스의 첫 사용 경험을 안정적으로 구현하는 역할을 수행했습니다.",
  },
  {
    test: /(관리자|admin).*(수정|운영|유지보수)|api 붙임/i,
    output:
      "운영 환경의 관리자 화면을 개선하고 API 연동을 다루며, 자주 바뀌는 요구사항에 빠르게 대응하는 실무형 프런트엔드 경험을 축적했습니다.",
  },
  {
    test: /(채팅|firebase|실시간)/i,
    output:
      "실시간 데이터 반영이 필요한 인터랙션을 구현하며 클라이언트 상태 변화와 외부 서비스 연동에 대한 이해를 높였습니다.",
  },
  {
    test: /(디자인 보고|퍼블리싱|반응형|화면 구현)/i,
    output:
      "디자인 시안을 실제 서비스 화면으로 구현하며 높은 UI 재현력과 반응형 레이아웃 감각을 갖췄습니다.",
  },
  {
    test: /(컴포넌트|공통).*(수정|만짐|정리)/i,
    output:
      "재사용 가능한 UI 구성 요소를 다루며 화면 일관성과 개발 효율을 함께 고려하는 방식으로 작업했습니다.",
  },
  {
    test: /(결제|버그|QA|배포)/i,
    output:
      "배포 이후 이슈 대응과 핵심 사용자 흐름 점검을 경험하며 안정성 중심의 화면 운영 역량을 강화했습니다.",
  },
  {
    test: /(이벤트 페이지|프로모션)/i,
    output:
      "프로모션 성격의 페이지를 반복 제작하며 빠른 실행력과 일정 대응력을 기반으로 비즈니스 요청을 구현했습니다.",
  },
];

const leadershipTerms = ["리드", "아키텍처", "총괄", "전략", "오너십", "주도"];

function parseLines(rawInput: string) {
  return rawInput
    .split("\n")
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function createHeadline(role: string, targetRole: string, stack: string) {
  const stackSlice = stack
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");

  return `${targetRole || role} | ${stackSlice || "Frontend · UI · Product Thinking"}`;
}

function expandLine(line: string) {
  const matched = expansionRules.find((rule) => rule.test.test(line));
  if (matched) return matched.output;

  return `${line} 경험을 바탕으로 화면 구현, 사용자 흐름 정리, 그리고 실제 서비스 맥락에서의 프런트엔드 기여를 설명할 수 있습니다.`;
}

function toResumeBullets(lines: string[]) {
  return lines.map((line) => `• ${expandLine(line)}`);
}

function toLinkedInSummary(role: string, targetRole: string, experience: string, lines: string[]) {
  const intro = `${targetRole || role} 포지션을 염두에 두고, ${experience || "프로젝트 중심"} 경험을 실제 사용자 흐름과 화면 품질 관점에서 풀어낼 수 있는 후보자입니다.`;
  const details = lines.slice(0, 3).map((line) => expandLine(line));
  return [intro, ...details].join(" ");
}

function toRealityVsLinkedIn(lines: string[]) {
  const reality = [
    "현실의 나",
    ...lines.slice(0, 3).map((line) => `- ${line}`),
  ].join("\n");

  const polished = [
    "LinkedIn의 나",
    ...lines.slice(0, 3).map((line) => `- ${expandLine(line)}`),
  ].join("\n");

  return `${reality}\n\n${polished}`;
}

function detectRisks(rawInput: string) {
  return leadershipTerms.filter((term) => rawInput.includes(term));
}

export default function Home() {
  const [role, setRole] = useState("프런트엔드 개발자");
  const [targetRole, setTargetRole] = useState("주니어 프런트엔드 개발자");
  const [experience, setExperience] = useState("취업 준비 중");
  const [stack, setStack] = useState("React, TypeScript, Next.js");
  const [rawInput, setRawInput] = useState(
    "포트폴리오 사이트 만듦\n영화 검색 앱 만들었음\n팀플에서 로그인 맡음\n디자인 보고 화면 구현함",
  );
  const [tone, setTone] = useState<Tone>("linkedin");
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [revealedOutput, setRevealedOutput] = useState<string[]>([]);

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const riskTerms = useMemo(() => detectRisks(rawInput), [rawInput]);

  const generatedOutput = useMemo(() => {
    if (parsedLines.length === 0) return [] as string[];

    if (tone === "resume") {
      return toResumeBullets(parsedLines);
    }

    if (tone === "meme") {
      return [toRealityVsLinkedIn(parsedLines)];
    }

    return [toLinkedInSummary(role, targetRole, experience, parsedLines)];
  }, [experience, parsedLines, role, targetRole, tone]);

  useEffect(() => {
    if (!isGenerating) return;

    const timers = [
      window.setTimeout(() => setProgressIndex(1), 900),
      window.setTimeout(() => setProgressIndex(2), 1800),
      window.setTimeout(() => setProgressIndex(3), 2800),
      window.setTimeout(() => setSpinnerIndex(1), 3400),
      window.setTimeout(() => setSpinnerIndex(2), 4300),
      window.setTimeout(() => {
        setRevealedOutput(generatedOutput);
        setIsGenerating(false);
        setStep(4);
      }, 5200),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [generatedOutput, isGenerating]);

  const canGoNextStep1 = role.trim() && targetRole.trim();
  const canGoNextStep2 = experience.trim() && stack.trim();
  const canGenerate = parsedLines.length > 0;
  const progressValue = ((Math.min(step, 4) - 1) / 3) * 100;

  function applyPreset(preset: Preset) {
    setRole(preset.role);
    setTargetRole(preset.targetRole);
    setExperience(preset.experience);
    setStack(preset.stack);
    setRawInput(preset.rawInput);
    setTone(preset.tone);
    setStep(1);
    setIsGenerating(false);
    setRevealedOutput([]);
  }

  function startGeneration() {
    setRevealedOutput([]);
    setProgressIndex(0);
    setSpinnerIndex(0);
    setIsGenerating(true);
    setStep(3);
  }

  function resetFlow() {
    setStep(1);
    setIsGenerating(false);
    setRevealedOutput([]);
    setProgressIndex(0);
    setSpinnerIndex(0);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_35%),linear-gradient(180deg,_#f7f1e5_0%,_#efe6d5_44%,_#e7dcc6_100%)] px-4 py-6 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:max-w-[640px]">
        <section className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(77,56,23,0.14)] backdrop-blur sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-50">
              LinkedIn Initializr
            </span>
            <span className="text-xs text-stone-500">Funnel MVP</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            몇 줄만 쓰고, 마지막에 그럴듯한 문장으로 받기.
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            바로 결과를 던지지 않고, 입력을 정리하는 과정을 짧게 보여준 뒤 결과를 공개합니다.
            모바일 기준으로 먼저 설계한 funnel 화면입니다.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span>
                Step {Math.min(step, 4)} / 4
              </span>
              <span>{funnelSteps[Math.min(step, 4) - 1].label}</span>
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
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">지금 상태와 목표를 적어주세요.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              사용자가 자기 자신을 어떻게 정의하는지부터 잡습니다.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">현재 상태</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="예: 프런트엔드 개발자"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">목표 직무</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="예: 주니어 프런트엔드 개발자"
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
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">배경과 스택을 빠르게 정리합니다.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              길게 쓸 필요 없습니다. 연차, 프로젝트 위주, 운영 위주 같은 수준이면 충분합니다.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">경력 요약</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="예: 1년차, 개인 프로젝트 위주"
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
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">짧고 투박한 메모를 넣어주세요.</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              한 줄에 하나씩. 이 화면에서는 일부러 짧게 쓰는 게 포인트입니다.
            </p>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-stone-700">짧은 입력</span>
              <textarea
                className="min-h-52 w-full rounded-[24px] border border-stone-200 bg-[#fffdf8] px-4 py-4 text-sm leading-7 outline-none transition focus:border-stone-500"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder={"예:\n포트폴리오 사이트 만듦\n팀플에서 로그인 맡음\napi 붙임"}
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
                    {mode === "linkedin" ? "LinkedIn 톤" : mode === "resume" ? "이력서 톤" : "밈 톤"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">미리보기 헤드라인</p>
              <p className="mt-2 text-base font-semibold text-stone-900">
                {createHeadline(role, targetRole, stack)}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                결과는 바로 보이지 않고, 생성 연출을 거친 뒤 마지막에 공개됩니다.
              </p>
            </div>

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
                  <p className="text-sm font-semibold text-stone-100">최종 문장 포장 중</p>
                  <p className="mt-1 text-sm leading-6 text-stone-300">
                    {spinnerLines[spinnerIndex]}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 4 && !isGenerating && (
          <>
            <section className="rounded-[28px] border border-stone-900/10 bg-[#111111] p-5 text-stone-50 shadow-[0_20px_60px_rgba(17,17,17,0.22)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Result</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {createHeadline(role, targetRole, stack)}
              </h2>

              <div className="mt-5 space-y-4">
                {revealedOutput.map((block) => (
                  <pre
                    key={block}
                    className="whitespace-pre-wrap rounded-[22px] bg-white/5 p-4 font-sans text-sm leading-7 text-stone-100"
                  >
                    {block}
                  </pre>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-900/10 bg-white/80 p-5 shadow-[0_16px_50px_rgba(77,56,23,0.12)] sm:p-6">
              <h3 className="text-lg font-semibold tracking-[-0.03em]">가드레일</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                <li>없는 수치 성과는 생성하지 않습니다.</li>
                <li>입력에 없는 리더십 표현은 자동으로 과하게 붙이지 않습니다.</li>
                <li>짧은 문장을 업무 맥락과 기여 중심 문장으로 재구성합니다.</li>
              </ul>

              {riskTerms.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  과장 위험 단어 감지: {riskTerms.join(", ")}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  현재 입력은 과장보다 정리 중심 톤에 가깝습니다.
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
