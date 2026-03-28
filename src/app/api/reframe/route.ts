import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CareerLevel = "entry" | "experienced";
type JobRole = "frontend" | "backend" | "designer" | "pm" | "ai";
type Tone = "meme" | "linkedin" | "resume";

const roleMap: Record<JobRole, string> = {
  frontend: "프런트엔드",
  backend: "백엔드",
  designer: "디자이너",
  pm: "PM",
  ai: "AI",
};

const careerMap: Record<CareerLevel, string> = {
  entry: "신입",
  experienced: "경력",
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["markdown", "plainText", "mismatchNote", "linkedin", "resume", "meme"],
  properties: {
    markdown: { type: "string" },
    plainText: { type: "string" },
    mismatchNote: { type: "string" },
    linkedin: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "about", "experienceTitle", "experiencePeriod", "experienceBullets", "skills"],
      properties: {
        headline: { type: "string" },
        about: { type: "string" },
        experienceTitle: { type: "string" },
        experiencePeriod: { type: "string" },
        experienceBullets: { type: "array", items: { type: "string" } },
        skills: { type: "array", items: { type: "string" } },
      },
    },
    resume: {
      type: "object",
      additionalProperties: false,
      required: ["position", "majorResponsibilities", "achievementSummary", "coverLetterParagraph", "competencyTags"],
      properties: {
        position: { type: "string" },
        majorResponsibilities: { type: "array", items: { type: "string" } },
        achievementSummary: { type: "string" },
        coverLetterParagraph: { type: "string" },
        competencyTags: { type: "array", items: { type: "string" } },
      },
    },
    meme: {
      type: "object",
      additionalProperties: false,
      required: [
        "koreanTitle",
        "englishTitle",
        "oneLiner",
        "capabilityBullets",
        "closingLine",
        "realityBlock",
        "polishedBlock",
      ],
      properties: {
        koreanTitle: { type: "string" },
        englishTitle: { type: "string" },
        oneLiner: { type: "string" },
        capabilityBullets: { type: "array", items: { type: "string" } },
        closingLine: { type: "string" },
        realityBlock: { type: "array", items: { type: "string" } },
        polishedBlock: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

function rolePrompt(role: JobRole) {
  if (role === "frontend") {
    return `
직무: 프런트엔드
- 포지셔닝 키워드: UI Engineering, Component Architecture, Web Performance
- 강조 역량: 사용자 경험, 코드 품질, 렌더링 최적화, 반응형 구현
`.trim();
  }

  if (role === "backend") {
    return `
직무: 백엔드
- 포지셔닝 키워드: Systems Design, API Development, Cloud Infrastructure
- 강조 역량: 확장성, 안정성, 데이터 처리, 트러블슈팅
`.trim();
  }

  if (role === "designer") {
    return `
직무: 디자이너
- 포지셔닝 키워드: UX Research, Design System, Visual Strategy
- 강조 역량: 사용자 중심 사고, 시각적 일관성, 프로토타이핑, 브랜드 감각
`.trim();
  }

  if (role === "pm") {
    return `
직무: PM
- 포지셔닝 키워드: Product Strategy, Stakeholder Management, Agile
- 강조 역량: 우선순위 결정, 문서화, 커뮤니케이션, 일정 관리
`.trim();
  }

  return `
직무: AI
- 포지셔닝 키워드: LLM Integration, Prompt Engineering, Model Optimization
- 강조 역량: 실험 설계, 데이터 분석, 모델 응용, 서비스 통합
`.trim();
}

function careerPrompt(careerLevel: CareerLevel) {
  if (careerLevel === "entry") {
    return `
경력 수준: 신입
- 학습 주도성, 성장 가능성, 실행력 중심으로 서술할 것
- 완성된 경력이 없어도 "실행한 경험"과 "문제 해결 과정"을 강점으로 연결할 것
- 사용자가 제공하지 않은 회사명, 협업 규모, 운영 성과는 만들지 말 것
`.trim();
  }

  return `
경력 수준: 경력
- 성과, 임팩트, 기여도 중심으로 서술할 것
- 다만 사용자가 제공하지 않은 KPI, 매출, 팀 리딩, 리더십은 허위로 만들지 말 것
- 수치는 보수적 추정치만 사용할 것
`.trim();
}

function basePrompt() {
  return `
당신은 "딸깍톤"의 결과 생성 엔진입니다.
이직/취준을 준비하는 사용자가 입력한 평범한 정보를, 실제로 복사해 사용할 수 있을 정도로 정돈된 문장으로 재구성합니다.

핵심 원칙:
- 입력을 과하게 비틀지 말고, 사용 목적에 맞게 전문적으로 포장할 것
- 없는 사실은 만들지 말 것
- 다만 모호한 표현은 역할, 과정, 역량, 기여 관점으로 재해석할 것
- 직무와 직접 맞지 않는 입력은 transferable skills로 연결할 것
- 장난스러운 결과는 밈톤에서만 허용하고, 링크드인톤과 이력서톤은 실제 제출 가능한 수준으로 쓸 것
- 수치가 필요할 때는 보수적 추정치만 사용하고, 허위 KPI나 매출, 조직 규모는 금지
- 복사 전용 결과인 markdown과 plainText는 tone에 맞는 최종본으로 작성할 것

출력 규칙:
- 반드시 JSON만 반환할 것
- linkedin / resume / meme 세 섹션을 모두 채우되, 선택한 tone이 아닌 섹션은 빈 문자열 또는 빈 배열로 반환할 것
- mismatchNote는 입력과 직무가 완전히 일치하지 않을 때만 짧고 차분하게 작성하고, 일치하면 빈 문자열로 둘 것
`.trim();
}

function linkedinPrompt() {
  return `
선택 tone: 링크드인톤

목표:
- 실제 LinkedIn 프로필의 Headline / About / Experience / Skills에 바로 붙여넣을 수 있는 결과
- 한국어를 기본으로 쓰되, 전문 용어는 영어 그대로 자연스럽게 혼재
- 진지하고 자신감 있는 톤 유지

강한 규칙:
- headline은 한 줄로 간결하고 professional 해야 함
- about은 3~4문장으로 작성하고, 뻔한 문구보다 포지셔닝이 선명해야 함
- experienceBullets는 3개 작성하고, 각각 능동적 동사로 시작하거나 동사 중심 서술로 읽혀야 함
- skills는 5개 내외로 직무 적합성이 높아야 함
- markdown은 정확히 아래 구조를 따를 것

### 🏷 Headline
{headline}

---

### 👤 About
{about}

---

### 💼 Experience
**{experienceTitle}**
{experiencePeriod}

- {bullet 1}
- {bullet 2}
- {bullet 3}

---

### 🛠 Skills
\`{skill 1}\` \`{skill 2}\` \`{skill 3}\` \`{skill 4}\` \`{skill 5}\`

추가 규칙:
- 영어만으로 채우지 말고 한국어 기반을 유지할 것
- 유머, 밈, 자기비하, 과도한 허세 금지
- 링크드인에서 바로 써도 민망하지 않은 수준으로 정리할 것
`.trim();
}

function resumePrompt() {
  return `
선택 tone: 이력서톤

목표:
- 국문 이력서나 자기소개서에 직접 붙여넣을 수 있는 격식체
- 역량, 과정, 성과를 설득력 있게 정리

강한 규칙:
- position은 국문 직무명 또는 담당 역할로 작성
- majorResponsibilities는 3개 작성
- achievementSummary는 한 문장으로 압축
- coverLetterParagraph는 3~5문장, STAR 흐름이 자연스럽게 묻어나야 함
- competencyTags는 완전한 국문 또는 직무 고유명사 위주로 4~6개 작성
- markdown은 정확히 아래 구조를 따를 것

### 📌 직무명
{position}

---

### 📋 주요 업무
- {responsibility 1}
- {responsibility 2}
- {responsibility 3}

---

### 🏆 성과 요약
{achievementSummary}

---

### 📝 자기소개서 활용 단락
{coverLetterParagraph}

추가 규칙:
- 완전한 한국어 격식체 사용
- 영어 버즈워드, 밈, 가벼운 표현 금지
- 허위 경력 생성 금지
`.trim();
}

function memePrompt() {
  return `
선택 tone: 밈톤

목표:
- SNS에 공유하고 싶은 정도의 과장된 재미를 살리되, 직무 연결은 유지
- 웃음 포인트는 "하찮은 입력"과 "과하게 근엄한 포장" 사이의 간극에서 만들어낼 것

강한 규칙:
- koreanTitle, englishTitle은 과장된 직함으로 작성
- oneLiner는 자신감 넘치는 한 줄이 아니라, 캡처해서 공유하고 싶은 한 줄이어야 함
- capabilityBullets는 3개 작성
- realityBlock과 polishedBlock은 각각 2~4개 작성
- closingLine은 단언형 마무리
- markdown은 현실 vs 포장된 나의 대비가 분명히 드러나야 함

추가 규칙:
- 밈톤에서만 과장 허용
- 비하, 혐오, 직무 무관 서술 금지
- polite한 이력서 문체 금지
- 버즈워드, 과장된 직함, "이게 맞습니다", "부정할 수 없음", "ㄹㅇ", "레전드", "실화임" 같은 단언형 마무리를 적극 활용할 것
- 사용자가 입력한 원문이 하찮을수록 더 진지하고 장엄하게 포장할 것
- realityBlock은 사용자의 원문을 냉정하고 짧게 요약하고, polishedBlock은 그것을 직무 밈으로 과장해 대비를 만들 것
- 재미가 약하면 실패로 간주하고, 반드시 한두 줄은 웃기게 만들 것
`.trim();
}

function tonePrompt(tone: Tone) {
  if (tone === "linkedin") return linkedinPrompt();
  if (tone === "resume") return resumePrompt();
  return memePrompt();
}

function buildInput(payload: {
  careerLevel: CareerLevel;
  jobRole: JobRole;
  tone: Tone;
  rawInput: string;
  externalContext: string;
}) {
  return `
기획 컨텍스트:
- 서비스명: 딸깍톤 (Ddalggakton)
- 목적: 이직/취준 사용자가 입력한 정보를 거창하고 전문적으로 재포장하되, 실제로 활용 가능한 수준으로 정리
- 대표 예시: "백수" -> "홈프로텍터 (Home Life Strategist)"

선택 정보:
- 경력: ${careerMap[payload.careerLevel]}
- 직무: ${roleMap[payload.jobRole]}
- 톤: ${payload.tone}

직무별 맥락:
${rolePrompt(payload.jobRole)}

경력별 맥락:
${careerPrompt(payload.careerLevel)}

사용자 자유형식 경험:
${payload.rawInput}

외부 공개 정보:
${payload.externalContext}
`.trim();
}

function parseGithubId(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/github\.com\/([^/?#]+)/i);
  if (match) return match[1];

  return trimmed.replace(/^@/, "");
}

function stripHtmlTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchGithubContext(githubId: string) {
  const notes: string[] = [];
  if (!githubId) {
    return { summary: "GitHub 정보 없음", notes };
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "ddalggakton-app",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const userResponse = await fetch(`https://api.github.com/users/${githubId}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!userResponse.ok) {
      notes.push(`GitHub 공개 프로필을 읽지 못했습니다: ${githubId}`);
      return { summary: "GitHub 공개 프로필 조회 실패", notes };
    }

    const user = (await userResponse.json()) as {
      login?: string;
      name?: string;
      bio?: string;
      public_repos?: number;
      followers?: number;
    };

    const reposResponse = await fetch(
      `https://api.github.com/users/${githubId}/repos?sort=updated&per_page=5`,
      {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );

    const repos = reposResponse.ok
      ? ((await reposResponse.json()) as Array<{
          name?: string;
          language?: string;
          stargazers_count?: number;
          description?: string;
        }>)
      : [];

    const repoSummary = repos
      .slice(0, 3)
      .map((repo) => {
        const parts = [repo.name, repo.language].filter(Boolean);
        return parts.join(" / ");
      })
      .filter(Boolean)
      .join(", ");

    return {
      summary: [
        `GitHub ID: ${user.login ?? githubId}`,
        user.name ? `이름: ${user.name}` : "",
        user.bio ? `Bio: ${user.bio}` : "",
        typeof user.public_repos === "number" ? `공개 저장소 수: ${user.public_repos}` : "",
        typeof user.followers === "number" ? `팔로워 수: ${user.followers}` : "",
        repoSummary ? `최근 공개 저장소: ${repoSummary}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      notes,
    };
  } catch {
    notes.push(`GitHub 공개 정보를 읽는 중 오류가 발생했습니다: ${githubId}`);
    return { summary: "GitHub 공개 프로필 조회 실패", notes };
  }
}

async function fetchBlogContext(blogUrl: string) {
  const notes: string[] = [];
  const trimmed = blogUrl.trim();
  if (!trimmed) {
    return { summary: "블로그 정보 없음", notes };
  }

  try {
    const response = await fetch(trimmed, {
      headers: {
        "User-Agent": "ddalggakton-app",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      notes.push(`블로그 URL을 읽지 못했습니다: ${trimmed}`);
      return { summary: "블로그 페이지 조회 실패", notes };
    }

    const html = await response.text();
    const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() ?? "";
    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ??
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ??
      "";
    const excerpt = stripHtmlTags(html).slice(0, 400);

    return {
      summary: [
        `블로그 URL: ${trimmed}`,
        title ? `페이지 제목: ${title}` : "",
        description ? `설명: ${description}` : "",
        excerpt ? `본문 요약: ${excerpt}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      notes,
    };
  } catch {
    notes.push(`블로그 페이지를 읽는 중 오류가 발생했습니다: ${trimmed}`);
    return { summary: "블로그 페이지 조회 실패", notes };
  }
}

async function buildExternalContext(payload: { githubId?: string; blogUrl?: string }) {
  const github = await fetchGithubContext(parseGithubId(payload.githubId ?? ""));
  const blog = await fetchBlogContext(payload.blogUrl ?? "");

  return {
    summary: [github.summary, blog.summary].filter(Boolean).join("\n\n"),
    notes: [...github.notes, ...blog.notes],
  };
}

function normalizeResult(result: unknown, tone: Tone) {
  const normalized = result as {
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

  if (tone !== "linkedin") {
    normalized.linkedin = {
      headline: "",
      about: "",
      experienceTitle: "",
      experiencePeriod: "",
      experienceBullets: [],
      skills: [],
    };
  }

  if (tone !== "resume") {
    normalized.resume = {
      position: "",
      majorResponsibilities: [],
      achievementSummary: "",
      coverLetterParagraph: "",
      competencyTags: [],
    };
  }

  if (tone !== "meme") {
    normalized.meme = {
      koreanTitle: "",
      englishTitle: "",
      oneLiner: "",
      capabilityBullets: [],
      closingLine: "",
      realityBlock: [],
      polishedBlock: [],
    };
  }

  return normalized;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다. 환경 변수 설정 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = (await request.json()) as {
      careerLevel?: CareerLevel;
      jobRole?: JobRole;
      tone?: Tone;
      rawInput?: string;
      githubId?: string;
      blogUrl?: string;
    };

    if (!body.careerLevel || !body.jobRole || !body.tone || !body.rawInput) {
      return NextResponse.json({ error: "필수 입력값이 부족합니다." }, { status: 400 });
    }

    const externalContext = await buildExternalContext({
      githubId: body.githubId,
      blogUrl: body.blogUrl,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      instructions: [basePrompt(), tonePrompt(body.tone)].join("\n\n"),
      input: buildInput({
        careerLevel: body.careerLevel,
        jobRole: body.jobRole,
        tone: body.tone,
        rawInput: body.rawInput,
        externalContext: externalContext.summary,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "ddalggakton_result",
          strict: true,
          schema,
        },
      },
    });

    const result = normalizeResult(JSON.parse(response.output_text), body.tone);
    return NextResponse.json({ result: { ...result, sourceNotes: externalContext.notes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI 요청 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
