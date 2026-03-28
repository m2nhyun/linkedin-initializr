# 🚀 LinkedIn Initializr

> **평범한 나를, 거창하게.** 이직/취준생의 경험을 AI가 전문적으로 재포장해주는 서비스

[![Claude API](https://img.shields.io/badge/Powered%20by-Claude%20API-blueviolet)](https://www.anthropic.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red)](https://github.com/m2nhyun/linkedin-initializr)

---

## 💡 프로젝트 소개

**LinkedIn Initializr**는 이직·취업 준비 과정에서 자신의 경험을 과소평가하는 사람들을 위해 만들어진 AI 서비스입니다.

평범하게 표현된 나의 경험을 입력하면, Claude AI가 이를 **전문적이고 임팩트 있는 LinkedIn 스타일 표현**으로 즉시 변환해줍니다.

### 변환 예시

| 내가 쓴 표현 | LinkedIn Initializr의 변환 |
|---|---|
| 백수 | Home Life Strategist (홈프로텍터) |
| 알바생 | 멀티태스킹 서비스 어소시에이트 |
| 게임만 함 | 인터랙티브 미디어 연구원 |
| 유튜브 시청 | 디지털 콘텐츠 큐레이터 |
| 집에서 요리 | 홈 가스트로노미 디렉터 |
| 카페 알바 1년 | 1년간 고객 만족 최우선의 F&B 오퍼레이션 실무 담당 |

---

## ✨ 주요 기능

### 1. 경험 변환기
자신의 현재 상태나 경험을 자유롭게 입력하면 AI가 전문적인 직함과 표현으로 변환합니다.
- **격식체** — 공식 이력서용
- **유머체** — 가볍게 자기소개할 때
- **링크드인체** — LinkedIn 프로필 최적화용

### 2. 이력서 한 줄 부스터
이력서의 평범한 서술문을 임팩트 있는 표현으로 업그레이드합니다.

### 3. 자기소개 생성기
변환된 표현을 기반으로 자기소개 문장을 자동 생성합니다.

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React / Vue.js |
| Backend | FastAPI / Spring Boot |
| AI/LLM | Claude API (Anthropic) |
| 배포 | Vercel / Railway |

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- Anthropic API Key ([발급받기](https://console.anthropic.com))

### 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/m2nhyun/linkedin-initializr.git
cd linkedin-initializr

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 입력

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
ANTHROPIC_API_KEY=your_api_key_here
```

---

## 📖 사용 방법

1. 웹 브라우저에서 서비스에 접속합니다.
2. 입력창에 자신의 현재 상태나 경험을 자유롭게 입력합니다.
   - 예: "백수", "카페 알바 1년", "유튜브만 봄"
3. 원하는 변환 스타일(격식체 / 유머체 / 링크드인체)을 선택합니다.
4. **변환하기** 버튼을 클릭합니다.
5. AI가 생성한 결과물을 복사하여 이력서나 LinkedIn 프로필에 활용합니다.

---

## 🗂 프로젝트 구조

```
linkedin-initializr/
├── src/
│   ├── components/       # UI 컴포넌트
│   ├── pages/            # 페이지
│   ├── api/              # API 클라이언트
│   └── utils/            # 유틸리티
├── server/
│   ├── routes/           # API 라우트
│   └── prompts/          # LLM 프롬프트 템플릿
├── public/
└── README.md
```

---

## 🎯 기획 배경

이직·취업 준비를 하다 보면 자신의 경험을 지나치게 겸손하게 표현하는 경우가 많습니다. "백수", "알바생", "그냥 쉬는 중" 같은 표현들은 실제 경험의 가치를 제대로 담아내지 못합니다.

LinkedIn Initializr는 **딸깍톤(Ddalggakton)** 해커톤 출품작으로, 유머와 실용성을 동시에 추구합니다. 클릭 한 번으로 나의 경험에 새로운 이름을 붙여주세요.

> 자세한 기획 문서 → [Notion 기획서](https://www.notion.so/beberiche/3312c697cc9f80cc898ec0a510ea95e3)

---

## 🤝 기여하기

1. 이 레포지토리를 Fork합니다.
2. 새 브랜치를 생성합니다. (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다. (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다. (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

<div align="center">
  <strong>평범한 나를, 거창하게. 🚀</strong><br/>
  Made with ❤️ at 딸깍톤
</div>


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
