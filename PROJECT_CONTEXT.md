# Project Context

이 문서는 `linkedin-initializr`의 현재 구현 상태와 작업 히스토리를 빠르게 파악하기 위한 운영 문서입니다.
새 작업을 시작할 때는 이 문서를 먼저 읽고, 세부 톤 규칙은 `prompts/*.md`를 추가로 확인합니다.

## 1. 프로젝트 개요

- 프로젝트명: `링크드인 이니셜라이저 | LinkedIn Initializr`
- 성격: 이직·취준 사용자의 짧고 평범한 경험을 AI가 재구성해주는 Next.js 웹앱
- 핵심 출력 톤:
  - `밈톤`
  - `링크드인톤`
  - `이력서톤`
- 배포 URL: `https://linkedin-initializr.vercel.app`
- GitHub URL: `https://github.com/m2nhyun/linkedin-initializr`

## 2. 현재 UX 구조

현재 메인 UX는 3개의 funnel과 별도 결과 화면으로 구성됩니다.

1. Funnel 1
   - 경력: `신입` / `경력`
   - 직무: 기본 5개 선택 + `직접 입력`
   - 톤: `밈톤` / `링크드인톤` / `이력서톤`

2. Funnel 2
   - 자유형식 경험 입력
   - 짧은 메모, 실패 경험, 중단한 프로젝트 모두 허용
   - 직무별 예시 버튼 + 공통 예시 버튼 제공

3. Funnel 3
   - 외부 공개 정보 보강
   - `GitHub ID 또는 URL`
   - `개인 블로그 URL`
   - LinkedIn URL 입력은 제외됨

4. 결과 화면
   - funnel에 포함되지 않음
   - 기본 렌더 / Markdown / 일반 텍스트 뷰 제공
   - 복사 기능 제공

## 3. 현재 구현 상태

### 프런트엔드

- 프레임워크: `Next.js 16`, `React 19`, `Tailwind CSS 4`
- 메인 UI 파일:
  - [`src/app/page.tsx`](./src/app/page.tsx)
- 레이아웃 / 메타데이터:
  - [`src/app/layout.tsx`](./src/app/layout.tsx)
- 글로벌 스타일:
  - [`src/app/globals.css`](./src/app/globals.css)

### 현재 UI 특징

- 터미널 느낌의 검정 + 네온 그린 테마
- 모바일 우선 레이아웃
- 밈톤이 기본 선택값
- 자유형식 경험 입력값은 기본적으로 비어 있음
- 공유 메타데이터는 현재 `링크드인 이니셜라이저` 기준으로 정리됨

## 4. AI 처리 구조

AI 요청은 Next.js 서버 라우트에서 OpenAI Responses API를 사용합니다.

- 서버 라우트:
  - [`src/app/api/reframe/route.ts`](./src/app/api/reframe/route.ts)
- 모델:
  - `OPENAI_MODEL` 환경변수 사용
  - 미지정 시 기본값은 코드에서 지정
- 인증:
  - `OPENAI_API_KEY`
  - 서버 전용 환경변수로만 사용
  - `NEXT_PUBLIC_` 접두사 금지

### 현재 동작 방식

1. 클라이언트가 funnel 입력값을 `/api/reframe`로 전송
2. 서버가 tone별 프롬프트 md 파일을 읽음
3. 외부 공개 정보(GitHub, 블로그)를 수집 및 요약
4. OpenAI Responses API에 구조화된 프롬프트와 JSON schema를 전달
5. 결과를 정규화한 뒤 UI에 표시

## 5. 프롬프트 구조

tone별 프롬프트는 코드에 하드코딩하지 않고 md 파일에서 읽습니다.

- [`prompts/prompt-linkedin.md`](./prompts/prompt-linkedin.md)
- [`prompts/prompt-resume.md`](./prompts/prompt-resume.md)
- [`prompts/prompt-meme.md`](./prompts/prompt-meme.md)

### 중요

- `route.ts` 안에는 예전 inline prompt 함수가 일부 남아 있을 수 있음
- 실제 런타임 기준 tone 프롬프트는 `prompts/*.md`를 읽는 방식이 우선
- tone 변경 작업 시에는 반드시 md 파일 기준으로 수정 여부를 확인할 것

## 6. 외부 정보 보강

현재는 외부 공개 정보를 결과 생성에 보강 정보로 사용합니다.

### GitHub

- 공개 프로필 조회
- 최근 공개 저장소 조회
- 저장소의 `README.md`, `package.json` 일부 분석
- 대표 기술, 프로젝트 맥락, 사용 언어를 요약해 프롬프트에 반영

### 블로그

- 페이지 title, description, 본문 일부를 추출
- 기술 블로그 성격의 문맥이 있으면 입력 보강에 사용

### 제외 항목

- LinkedIn 프로필은 차단 가능성과 안정성 이슈 때문에 제외

## 7. 직무 입력 구조

기존 5개 직무는 빠른 선택용으로 유지합니다.

- `frontend`
- `backend`
- `designer`
- `pm`
- `ai`

추가로 `직접 입력`이 구현되어 있습니다.

예:

- `iOS 개발자`
- `데이터 분석가`
- `DevRel`
- `게임 클라이언트`

서버는 이 직접 입력 직무명을 그대로 프롬프트에 반영합니다.

## 8. 결과 형식

### 링크드인톤

- Headline
- About
- Experience
- Skills

### 이력서톤

- 직무명
- 주요 업무
- 성과 요약
- 자기소개서 활용 단락

### 밈톤

- 과장된 직함
- 한 줄 소개
- 핵심 역량
- 현실 vs 포장된 나 대비

## 9. 현재 확인된 브랜딩 상태

브랜드 명칭이 코드상에서 완전히 통일된 것은 아닙니다.

### 현재 사용자 노출명

- 메타데이터와 공유 미리보기: `링크드인 이니셜라이저`

### 아직 남아 있는 내부 표현

- 일부 문구나 프롬프트에서는 `딸깍톤`이 남아 있을 수 있음
- 예:
  - `src/app/page.tsx` 일부 안내 문구
  - `src/app/api/reframe/route.ts`의 base prompt / buildInput 문구
  - `README.md` 제목

새 작업 시 브랜드 통일이 필요하면 위 파일들을 함께 점검할 것

## 10. 환경 변수

로컬:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

운영:

- Vercel 환경 변수에 동일하게 등록

주의:

- `.env.local`만 로컬에 유지
- `.env`, `.env.example`는 현재 운영 기준 필수가 아님

## 11. 검증 방식

변경 후 기본 검증 순서:

1. `npm run build`
2. 필요 시 `npm run lint`
3. Vercel 프로덕션 배포 확인

## 12. 최근 주요 변경 사항

- OpenAI Responses API 연동
- tone 프롬프트를 `prompts/*.md`에서 읽도록 변경
- GitHub / 블로그 외부 정보 보강 구현
- GitHub repo README / package.json 기반 요약 강화
- 결과 복사용 Markdown / 일반 텍스트 뷰 제공
- 메타데이터 브랜딩을 `링크드인 이니셜라이저`로 변경
- 직무에 `직접 입력` 옵션 추가
- 밈톤을 기본 선택값으로 변경

## 13. 다음 작업 시 주의할 점

- tone 품질 변경은 UI보다 `prompts/*.md`의 영향이 큼
- 직무 로직 수정 시 프런트 `page.tsx`와 서버 `route.ts`를 함께 봐야 함
- 공유 미리보기 수정은 `layout.tsx`의 metadata를 봐야 함
- 외부 정보 보강 품질 문제는 `route.ts`의 GitHub / 블로그 수집 로직을 먼저 확인할 것
- README는 제품 소개용이고, 실제 작업 컨텍스트는 이 문서를 우선 기준으로 볼 것
