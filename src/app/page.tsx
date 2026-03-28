"use client";

import { useMemo, useState } from "react";

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
    label: "1년차 운영 개발",
    role: "프런트엔드 개발자",
    targetRole: "프런트엔드 개발자",
    experience: "1년차",
    stack: "React, TypeScript, Admin UI",
    rawInput:
      "admin 페이지 수정 많이 함\napi 붙임\n공통 컴포넌트 조금 만짐\n반복 작업 줄이는 화면 수정함",
    tone: "resume",
  },
  {
    label: "밈 모드",
    role: "프런트엔드 개발자",
    targetRole: "프로덕트 프런트엔드 개발자",
    experience: "2년차",
    stack: "Next.js, React Query, Tailwind CSS",
    rawInput:
      "기획 변경 계속 반영함\n결제 버그 잡아봄\n이벤트 페이지 많이 만듦\n배포하고 QA 대응함",
    tone: "meme",
  },
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

  return `${targetRole || role} | ${stackSlice || "Frontend, UI, Product Thinking"}`;
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

  const parsedLines = useMemo(() => parseLines(rawInput), [rawInput]);
  const riskTerms = useMemo(() => detectRisks(rawInput), [rawInput]);

  const output = useMemo(() => {
    if (parsedLines.length === 0) return [] as string[];

    if (tone === "resume") {
      return toResumeBullets(parsedLines);
    }

    if (tone === "meme") {
      return [toRealityVsLinkedIn(parsedLines)];
    }

    return [toLinkedInSummary(role, targetRole, experience, parsedLines)];
  }, [experience, parsedLines, role, targetRole, tone]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_35%),linear-gradient(135deg,_#f3ede2_0%,_#efe7d7_45%,_#dbd5c9_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[32px] border border-stone-900/10 bg-white/75 shadow-[0_24px_80px_rgba(77,56,23,0.16)] backdrop-blur">
          <div className="border-b border-stone-900/10 px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full border border-stone-900/10 bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50">
                LinkedIn Initializr
              </span>
              <span className="text-xs font-medium text-stone-500">MVP</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              짧게 쓴 경력도 그럴듯한 커리어 문장으로 바꿔보는 실험.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              몇 줄짜리 메모를 넣으면 이력서형, LinkedIn형, 밈형 문장으로 재구성합니다.
              없는 사실은 만들지 않고, 표현만 정리하는 MVP입니다.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">현재 상태</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="예: 프런트엔드 개발자"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">목표 직무</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="예: 주니어 프런트엔드 개발자"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">경력 요약</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="예: 1년차, 개인 프로젝트 위주"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">기술 스택</span>
                <input
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                  value={stack}
                  onChange={(event) => setStack(event.target.value)}
                  placeholder="예: React, TypeScript, Next.js"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-stone-700">짧은 입력</span>
              <textarea
                className="min-h-52 w-full rounded-[28px] border border-stone-200 bg-[#fffdf8] px-4 py-4 text-sm leading-7 outline-none transition focus:border-stone-500"
                value={rawInput}
                onChange={(event) => setRawInput(event.target.value)}
                placeholder={"예:\n포트폴리오 사이트 만듦\n팀플에서 로그인 맡음\napi 붙임"}
              />
              <p className="text-xs leading-6 text-stone-500">
                한 줄에 하나씩 넣으면 됩니다. 최대한 짧고 투박하게 써도 됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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

            <div className="flex flex-wrap gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setRole(preset.role);
                    setTargetRole(preset.targetRole);
                    setExperience(preset.experience);
                    setStack(preset.stack);
                    setRawInput(preset.rawInput);
                    setTone(preset.tone);
                  }}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-[32px] border border-stone-900/10 bg-[#111111] text-stone-50 shadow-[0_24px_80px_rgba(17,17,17,0.2)]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {createHeadline(role, targetRole, stack)}
              </h2>
            </div>
            <div className="space-y-5 px-6 py-6 sm:px-8">
              {output.map((block) => (
                <pre
                  key={block}
                  className="whitespace-pre-wrap rounded-[24px] bg-white/5 p-5 font-sans text-sm leading-7 text-stone-100"
                >
                  {block}
                </pre>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-stone-900/10 bg-white/70 p-6 shadow-[0_20px_50px_rgba(77,56,23,0.1)] backdrop-blur sm:p-8">
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
          </div>

          <div className="rounded-[32px] border border-stone-900/10 bg-[#f7f2e8] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Suggested inputs
            </p>
            <div className="mt-4 grid gap-3 text-sm text-stone-700">
              <div className="rounded-2xl bg-white/80 px-4 py-3">포트폴리오 사이트 만듦</div>
              <div className="rounded-2xl bg-white/80 px-4 py-3">쇼핑몰 팀플에서 상품 상세 맡음</div>
              <div className="rounded-2xl bg-white/80 px-4 py-3">admin 페이지 수정 많이 함</div>
              <div className="rounded-2xl bg-white/80 px-4 py-3">Firebase로 채팅 구현</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
