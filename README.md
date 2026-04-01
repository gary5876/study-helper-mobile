# Study Helper — Mobile App

PDF를 AI 학습 세션으로 변환하는 React Native 앱.
SM-2 간격 반복 알고리즘으로 장기 기억을 강화합니다.

---

## 현재 상태 (2026-03-31)

### 완성된 화면 및 기능

- [x] **PlanSelectionScreen** — 최초 온보딩: 무료(Gemini) / Anthropic / OpenAI GPT / TimelyGPT 4개 플랜 선택
- [x] **ApiKeySetupScreen** — 플랜별 동적 UI (제목·placeholder·검증 규칙·발급 링크 자동 변경)
- [x] **HomeScreen** — 세션 목록, 복습 예정 카운터, 새 세션 FAB, 플랜 변경 설정 아이콘, 한/EN 언어 토글
- [x] **UploadScreen** — PDF 선택 + 업로드 + 생성 진행률 실시간 표시
- [x] **StudyNotesScreen** — 핵심 개념 칩 · 섹션 요약 · 용어집
- [x] **MCQScreen** — 4지선다 퀴즈, 즉각 피드백, 개념 설명
- [x] **FillBlankScreen** — 빈칸 채우기, 퍼지 매칭 (Levenshtein 80%)
- [x] **ScoreScreen** — 점수(A~F) + 취약 영역 분석
- [x] **WrongAnswerScreen** — 오답 복습 + 신뢰도 평가 → SM-2 스케줄
- [x] **ReviewConceptScreen** — 개념 전체 정의 + 관련 섹션
- [x] SQLite 로컬 저장 — 생성 후 100% 오프라인 동작
- [x] 한국어 기본 UI + 한/EN 전환 (`src/i18n/strings.ts` + `languageStore`, SecureStore 언어 유지)
- [x] Jest 단위 테스트 27개
- [x] Maestro E2E 테스트 3개 시나리오

### 미구현 (추후 예정)

- [ ] 푸시 알림 (복습 예정일 알림, expo-notifications 설치됨)
- [ ] 앱스토어 / 플레이스토어 배포
- [ ] 사용자 계정 / 클라우드 동기화

---

## 화면별 상세 플로우

### 1. PlanSelectionScreen (`PlanSelection`)

최초 실행 시 진입. 플랜이 이미 선택되어 있으면 자동 건너뜀.
HomeScreen 헤더의 설정(⚙) 아이콘으로 언제든 재진입 가능.

```
진입 조건 A: 플랜 미선택 (hasPlanSelected() === false) — 초기 온보딩
진입 조건 B: HomeScreen 헤더 설정 아이콘 탭 — 플랜 변경
  ├─▶ 무료 플랜 선택      → savePlan('free')   → HomeScreen
  ├─▶ Anthropic 선택     → savePlan('paid')   → ApiKeySetupScreen
  ├─▶ OpenAI GPT 선택    → savePlan('gpt')    → ApiKeySetupScreen
  └─▶ TimelyGPT 선택     → savePlan('timely') → ApiKeySetupScreen

※ 플랜 변경 시 navigation.reset으로 스택 초기화 (뒤로가기 꼬임 방지)
```

### 2. ApiKeySetupScreen (`ApiKeySetup`)

비무료 플랜 선택 시 진입. API 키가 SecureStore에 저장되어 있으면 자동 건너뜀.
플랜에 따라 제목·placeholder·유효성 검사·발급 링크가 동적으로 변경됩니다.

```
진입 조건: 비무료 플랜 선택 && SecureStore에 API 키 없음
  ├─▶ paid   → Anthropic API 키 입력 (sk-ant-...)
  ├─▶ gpt    → OpenAI API 키 입력 (sk-...)
  ├─▶ timely → TimelyGPT API 키 입력 (timelygpt.co.kr 발급)
  └─▶ 저장 → HomeScreen
```

### 2. HomeScreen (`Home`)

모든 세션 목록 표시. SQLite `sessions` 테이블 조회.

```
  ├─▶ 세션 탭 → StudyNotesScreen (기존 세션)
  ├─▶ 복습 예정 카운터 (SM-2 due_date <= 오늘)
  ├─▶ FAB (+) → UploadScreen
  └─▶ 헤더 설정(⚙) 아이콘 → PlanSelectionScreen (플랜 변경)
```

### 3. UploadScreen (`Upload`)

PDF 선택 → 업로드 → 생성 → StudyNotes.

```
  └─▶ expo-document-picker로 PDF 선택
  └─▶ getPlan() 로드 → plan 인식
  └─▶ POST /upload (plan 필드 포함 · 유료 플랜만 X-API-Key 헤더)
  └─▶ POST /generate (plan + session_id · 유료 플랜만 X-API-Key 헤더)
  └─▶ GET /status 폴링 (3초 간격, 최대 5분)
        5%  → 업로드 완료
        40% → 학습 노트 생성됨
        80% → MCQ 생성됨
        100% → 빈칸 채우기 완료
  └─▶ GET /result
  └─▶ SQLite study_content 저장
  └─▶ StudyNotesScreen
```

### 4. StudyNotesScreen (`StudyNotes`)

생성된 학습 자료 탐색.

```
  ├─▶ 핵심 개념 칩 탭 → ConceptHighlight 모달
  │     └─▶ 개념 정의 + 중요도 배지 (high/medium/low)
  ├─▶ 섹션 요약 + 불릿 포인트 목록
  ├─▶ 용어집 열람
  └─▶ "MCQ 시작" → MCQScreen
```

### 5. MCQScreen (`MCQ`)

`retryIds` 파라미터가 있으면 해당 문제만 필터링 (오답 재시도 모드).

```
  └─▶ 문제 1개씩 표시 + ProgressBar
        └─▶ A/B/C/D 선택
        └─▶ FeedbackModal 표시
              ├─▶ 정답: 초록 + 설명
              └─▶ 오답: 빨강 + 정답 + 설명
        └─▶ "다음" → 다음 문제
  └─▶ 완료 → FillBlankScreen
```

### 6. FillBlankScreen (`FillBlank`)

```
  └─▶ "___" 포함 문장 표시
        └─▶ "힌트" 버튼 (선택)
        └─▶ 텍스트 입력
        └─▶ 퍼지 매칭 검사:
              - 정확히 일치 → 정답
              - Levenshtein 유사도 ≥ 80% → 정답
              - 미달 → 오답
        └─▶ FeedbackModal
  └─▶ 완료 → ScoreScreen
```

### 7. ScoreScreen (`Score`)

```
  ├─▶ 점수 = 전체 정답 / 전체 문제
  ├─▶ 등급: A(90+) B(80+) C(70+) D(60+) F(미달)
  ├─▶ 취약 영역: concept별 오답률 > 50% 개념 목록
  ├─▶ "오답 복습" → WrongAnswerScreen
  └─▶ "홈으로" → HomeScreen
```

### 8. WrongAnswerScreen (`WrongAnswer`)

```
  └─▶ 오답 목록 (문제 + 내 답 + 정답)
        ├─▶ "개념 보기" → ReviewConceptScreen
        └─▶ 신뢰도 평가:
              "Got It"         → quality=5, easeFactor 상승, interval 연장
              "Needs Hint"     → quality=3, easeFactor 유지
              "Still Confused" → quality=1, interval=1일, 즉시 재시도 대기
  └─▶ review_schedule 저장
  └─▶ "Still Confused" 항목 있으면 → MCQ (retryIds 필터)
  └─▶ 없으면 → HomeScreen
```

### 9. ReviewConceptScreen (`ReviewConcept`)

```
  └─▶ 개념 ID로 SQLite study_content 조회
  └─▶ 표시: term, definition, importance, 관련 섹션, 용어집 항목
  └─▶ 뒤로 → WrongAnswerScreen
```

---

## SM-2 간격 반복 알고리즘 (`src/services/scheduler.ts`)

SuperMemo-2(SM-2) 알고리즘 기반 복습 스케줄링.

### 신뢰도 → 품질(quality) 변환

| 사용자 평가 | quality 값 | 의미 |
|------------|-----------|------|
| Got It | 5 | 완전히 기억 |
| Needs Hint | 3 | 힌트 있으면 기억 |
| Still Confused | 1 | 거의 기억 못함 |

### SM-2 계산 공식

```
새 easeFactor = 현재 easeFactor + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))
easeFactor 하한 = 1.3

quality >= 3 (기억):
  interval(1회차) = 1일
  interval(2회차) = 6일
  interval(n회차) = 이전interval × easeFactor

quality < 3 (망각):
  interval = 1일 (처음부터 재시작)
```

### `computeNextState(current, action)` 반환값

```typescript
{
  interval: number,      // 다음 복습까지 일수
  easeFactor: number,    // 업데이트된 ease factor
  repetitions: number,   // 반복 횟수
  dueDate: Date          // 다음 복습 예정일
}
```

---

## 데이터 저장 (SQLite — `src/db/schema.ts`)

모든 데이터는 기기 SQLite에만 저장됩니다. 서버에 저장하지 않습니다.

### 테이블 구조 (6개)

| 테이블 | 주요 컬럼 | 설명 |
|--------|-----------|------|
| `sessions` | id, pdf_name, status, created_at | PDF 메타데이터 + 생성 상태 |
| `study_content` | session_id, notes_json, mcq_json, fill_json | AI 생성 콘텐츠 (JSON 블롭) |
| `attempts` | id, session_id, quiz_type, score_pct, completed_at | 퀴즈 시도 기록 |
| `answers` | attempt_id, question_id, user_answer, is_correct, time_spent_ms | 문제별 답변 |
| `review_schedule` | concept_id, interval, ease_factor, repetitions, due_date | SM-2 복습 스케줄 |
| `user_settings` | key, value | API 키 상태, 설정값 (키/값 쌍) |

---

## 상태 관리 (Zustand — `src/store/sessionStore.ts`)

```typescript
// 전역 상태
{
  sessionId: string | null,
  studyContent: StudyContent | null,
  quiz: {
    type: 'mcq' | 'fill',
    questions: Question[],
    currentIndex: number,
    answers: Map<string, Answer>,
    startedAt: Date
  } | null,
  wrongQuestionIds: string[]   // 퀴즈 완료 후 파생
}

// 액션
setSession(id, content)
startQuiz(type, questions)
recordAnswer(questionId, answer, isCorrect)
advanceQuestion()
finishQuiz()
```

---

## 네비게이션 (`src/navigation/AppNavigator.tsx`)

React Navigation Native Stack 기반.

```typescript
RootStackParamList = {
  PlanSelection: undefined,
  ApiKeySetup: undefined,
  Home: undefined,
  Upload: undefined,
  StudyNotes: { sessionId: string },
  MCQ: { sessionId: string; retryIds?: string[] },
  FillBlank: { sessionId: string },
  Score: { attemptId: string; sessionId: string },
  WrongAnswer: { attemptId: string; sessionId: string },
  ReviewConcept: { conceptId: string; sessionId: string }
}
```

초기 라우트 결정 로직:
```
hasPlanSelected() === false                     → PlanSelection
getPlan() === 'paid' && hasApiKey() === false   → ApiKeySetup
그 외                                            → Home
```

---

## API 통신 (`src/services/api.ts`)

- **Base URL**: `app.config.ts` 또는 `.env`에서 주입 (빌드 시 환경변수로만 설정)
- **API 키**: `X-API-Key` 헤더 (비무료 플랜만 — Expo SecureStore에서 로드)
- **Plan 타입**: `'free' | 'paid' | 'gpt' | 'timely'`
- **플랜 헬퍼**: `savePlan(plan)` / `getPlan()` / `hasPlanSelected()` — SecureStore 기반
- **타임아웃**: 요청당 120초
- **재시도**: 네트워크 오류 / 5xx 응답 시 3회, 지수 백오프 (1s → 2s → 4s)
- **비재시도**: 4xx 클라이언트 오류, 429 Rate Limit

---

## Configuration

| 환경변수 | 기본값 | 설명 |
|----------|--------|------|
| `BACKEND_URL` | `http://localhost:8000` | 백엔드 서버 URL |
| `SENTRY_DSN` | `""` | Sentry DSN (프로덕션에서 설정 권장) |
| `APP_ENVIRONMENT` | `development` | `development` / `staging` / `production` |

---

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator 또는 Expo Go 실기기
- 실행 중인 [study-helper-backend](../study-helper-backend) 인스턴스

## Quick Start

```bash
npm install
npx expo start

# i → iOS 시뮬레이터
# a → Android 에뮬레이터
# QR 코드 → Expo Go 실기기
```

---

## QA — 테스트

### 단위 테스트 (Jest — 총 27개)

```
src/__tests__/
├── scheduler.test.ts   (13개)  SM-2 알고리즘, quality 변환, 등급 계산, 퍼지 매칭
├── api.test.ts         (8개)   API 키 저장/조회, URL 설정, 에러 정규화
└── sessionStore.test.ts (6개)  Zustand 상태 전환, 퀴즈 시작/완료, 오답 추출
```

```bash
npm test                      # 전체 실행
npm run test:coverage         # 커버리지 포함
npm run lint                  # ESLint 검사
```

### E2E 테스트 (Maestro — 3개 시나리오)

| 파일 | 검증 내용 |
|------|-----------|
| `01_api_key_setup.yaml` | API 키 입력 → 홈 화면 이동 |
| `02_upload_flow.yaml` | PDF 업로드 → 생성 완료 → Study Notes 진입 |
| `03_mcq_quiz_flow.yaml` | MCQ 퀴즈 완료 → Fill in the Blank 이동 |

```bash
# Maestro 설치
curl -Ls "https://get.maestro.mobile.dev" | bash

# 시나리오 실행
maestro test .maestro/01_api_key_setup.yaml
maestro test .maestro/02_upload_flow.yaml
maestro test .maestro/03_mcq_quiz_flow.yaml
```

---

## 프로젝트 구조

```
src/
├── config/
│   └── env.ts                 환경별 설정 (BACKEND_URL 등)
├── screens/                   화면 10개
│   ├── PlanSelectionScreen.tsx
│   ├── ApiKeySetupScreen.tsx
│   ├── HomeScreen.tsx
│   ├── UploadScreen.tsx
│   ├── StudyNotesScreen.tsx
│   ├── MCQScreen.tsx
│   ├── FillBlankScreen.tsx
│   ├── ScoreScreen.tsx
│   ├── WrongAnswerScreen.tsx
│   └── ReviewConceptScreen.tsx
├── components/                공유 UI 컴포넌트
│   ├── QuestionCard.tsx       MCQ 렌더러
│   ├── FeedbackModal.tsx      정답/오답 모달
│   ├── ConceptHighlight.tsx   개념 정의 모달
│   └── ProgressBar.tsx        퀴즈 진행 표시
├── services/
│   ├── api.ts                 백엔드 HTTP 클라이언트
│   ├── storage.ts             SQLite CRUD (25개 함수)
│   └── scheduler.ts           SM-2 간격 반복 알고리즘
├── store/
│   └── sessionStore.ts        Zustand 전역 상태
├── db/
│   └── schema.ts              SQLite 스키마 + TypeScript 타입
├── navigation/
│   └── AppNavigator.tsx       React Navigation 설정
└── __tests__/                 Jest 단위 테스트
.maestro/                      Maestro E2E 테스트 시나리오
```

---

## Building for Production

```bash
# EAS CLI 설치
npm install -g eas-cli
eas login

# 빌드
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 빌드 프로파일 (`eas.json`)

| 프로파일 | 용도 | 배포 방식 |
|----------|------|-----------|
| `development` | 로컬 개발, 시뮬레이터 | 내부 배포 |
| `preview` | QA 테스트 | 내부 배포 (APK) |
| `production` | 스토어 배포 | App Bundle |

---

## CI/CD

`main` 브랜치에 push 시 자동 실행 (`.github/workflows/ci.yml`):

```
1. Test    → lint + 타입체크 + Jest + codecov
2. Build   → EAS Android 빌드 (preview)
3. Build   → EAS iOS 빌드 (preview, macOS runner)
```

필요한 GitHub Secrets:

| Secret | 설명 |
|--------|------|
| `EXPO_TOKEN` | Expo 계정 토큰 |
