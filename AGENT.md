# Agent Entry

이 폴더에서 작업을 시작할 때는 아래 순서로 문서를 읽고 컨텍스트를 확보합니다.

## 1. 먼저 읽을 문서

1. [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
   - 현재 구현 상태
   - funnel 구조
   - AI 처리 방식
   - 외부 정보 보강
   - 브랜딩 상태
   - 최근 변경 사항

## 2. 작업 목적에 따라 추가로 읽을 문서

- 서비스 소개 / 기본 실행 방법:
  - [`README.md`](./README.md)

- 톤 품질 수정:
  - [`prompts/prompt-linkedin.md`](./prompts/prompt-linkedin.md)
  - [`prompts/prompt-resume.md`](./prompts/prompt-resume.md)
  - [`prompts/prompt-meme.md`](./prompts/prompt-meme.md)

- UI / funnel 수정:
  - [`src/app/page.tsx`](./src/app/page.tsx)

- 메타데이터 / 공유 미리보기 수정:
  - [`src/app/layout.tsx`](./src/app/layout.tsx)

- OpenAI / 외부 정보 보강 수정:
  - [`src/app/api/reframe/route.ts`](./src/app/api/reframe/route.ts)

## 3. 작업 원칙

- README만 보고 구현 상태를 판단하지 말 것
- 실제 운영 컨텍스트는 `PROJECT_CONTEXT.md`를 우선 기준으로 삼을 것
- tone 관련 변경은 반드시 `prompts/*.md`와 `route.ts`의 연결 방식을 함께 확인할 것
- 직무 관련 변경은 프런트와 서버를 동시에 확인할 것
- 브랜딩 관련 변경은 사용자 노출명과 내부 프롬프트 명칭이 섞여 있을 수 있으므로 함께 점검할 것

## 4. 변경 후 기본 검증

1. `npm run build`
2. 필요 시 `npm run lint`
3. 배포가 필요한 경우 Vercel 프로덕션 반영 확인
