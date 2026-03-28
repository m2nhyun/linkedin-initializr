# 딸깍톤 | linkedin-initializr

이직·취준 사용자가 입력한 평범한 경험을 AI가 `밈톤`, `링크드인톤`, `이력서톤`으로 재포장해주는 Next.js 웹앱입니다.

## 현재 구조

- Frontend: Next.js 16, React 19, Tailwind CSS 4
- AI: OpenAI Responses API
- 배포: Vercel
- 입력 방식:
  - Funnel 1: 경력 / 직무 / 톤
  - Funnel 2: 자유형식 경험
- 출력 방식:
  - 기본 렌더
  - Markdown 복사
  - 일반 텍스트 복사

## 톤 정의

- `링크드인톤`
  - 한국어 기반 + 직무 용어 영어 혼재
  - Headline / About / Experience / Skills 구조
  - 실제 LinkedIn에 붙여넣을 수 있는 수준 지향
- `이력서톤`
  - 완전한 한국어 격식체
  - 직무명 / 주요 업무 / 성과 요약 / 자기소개서 활용 단락 구조
- `밈톤`
  - 입력의 하찮음과 포장의 과장 사이 간극을 웃음 포인트로 사용
  - 현실의 나 / 포장된 나 대비 포함

프롬프트 기준 문서는 아래 파일을 참고합니다.

- [`prompts/prompt-linkedin.md`](./prompts/prompt-linkedin.md)
- [`prompts/prompt-resume.md`](./prompts/prompt-resume.md)
- [`prompts/prompt-meme.md`](./prompts/prompt-meme.md)

## 시작하기

사전 요구사항:

- Node.js 18+
- OpenAI API Key

설치 및 실행:

```bash
git clone https://github.com/m2nhyun/linkedin-initializr.git
cd linkedin-initializr
npm install
```

프로젝트 루트에 `.env.local`을 만들고 아래 값을 넣습니다.

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini
```

개발 서버 실행:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

## 주요 파일

```txt
src/app/page.tsx
  - funnel UI
  - 생성 진행 상태
  - 결과 렌더 / 복사 UX

src/app/api/reframe/route.ts
  - OpenAI Responses API 호출
  - tone별 프롬프트 조합
  - JSON schema 응답 강제

prompts/*.md
  - 톤별 기획 문서와 프롬프트 기준
```

## 주의 사항

- `OPENAI_API_KEY`는 서버에서만 사용합니다.
- `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.
- `.env.local`만 로컬에 두고 git에는 올리지 않습니다.

## 배포

Vercel 프로젝트 환경 변수에 아래 값을 등록합니다.

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini
```

배포 후 `/api/reframe`가 정상 응답하면 프로덕션도 정상 동작합니다.
