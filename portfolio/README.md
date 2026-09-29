# 황재민 포트폴리오

Vite + React 포트폴리오. GitHub Pages 프로젝트 사이트로 배포합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 테스트

```bash
npm test
```

## 서브경로(`base`) 확인

```bash
npm run build
npm run preview
```

브라우저에서 `http://localhost:4173/portfolio/` 를 엽니다.

## 콘텐츠 수정

- **`03_페이지_문구.md`** — 페이지별 제목·설명(lead), 홈·About·연구 방식, **`## papers`** 논문 Abstract·연구 소개, 논문 UI 문구
- `src/content/profile.ts` — 이름, 소속, 경력, 키워드, 지표
- `src/content/research.ts` — 논문 메타(제목·저자·venue·상태·featured). 본문은 MD의 `papers` 섹션
- `src/content/projects.ts` — 프로젝트

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml` 이 빌드·배포합니다.

공개 URL: `https://<GitHub 사용자명>.github.io/portfolio/`

경로: `/` 홈, `/research`, `/publications`, `/publications/:id`, `/projects`, `/about`, `/contact`

GitHub Pages에서 새로고침이 되도록 `public/404.html`이 경로를 `index.html`로 되돌립니다.

GitHub 저장소 Settings → Pages → Source: **GitHub Actions**
