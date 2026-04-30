# Study Helper — Mobile App

PDF를 AI 학습 세션으로 변환하는 React Native 앱.
SM-2 간격 반복 알고리즘으로 장기 기억을 강화합니다.

---

## 현재 상태 (2026-04-30)

> **2026-04-30** — `chore/coderabbit-config` 브랜치에서 CodeRabbit 자동 코드
> 리뷰 설정 도입. `.coderabbit.yaml` (한국어 리뷰, `src/screens`·`src/services`·
> `src/store`·`src/components`·`__tests__` 별 path 지침). 핵심 가드: SecureStore
> 강제(AsyncStorage 금지), `__DEV__` 로깅 가드, i18n `t()` 강제, FlatList
> 사용. 상세: `../documents/record_progress/2026-04-30-01-coderabbit-도입.md`.

> **참고 (2026-04-15)** — 백엔드에서 "세션이 영구 pending에 갇히는 버그"를 종합 수정했습니다. 모바일은 백엔드 `/user/sessions`·`/result` 응답만 신뢰하면 되므로 별도 수정 없음. 상세는 `study-helper-backend/README.md` 및 `documents/problem/2026-04-15-session-stuck-pending.md` 참고.

> **참고 (2026-04-25)** — 백엔드 `feat/question-quality-phase-a` 브랜치에서 문제 생성 품질 개선 진행 (OX 유형 추가, Few-shot exemplar 주입, 한글 validation 버그 수정). 응답에 `ox_questions: list[OXQuestion]` 필드가 새로 포함되지만 모바일은 명시적으로 사용하는 필드만 파싱하므로 **코드 변경 없이 호환**. OX 학습 화면을 노출하려면 별도 후속 작업 필요. 상세는 `documents/record_progress/2026-04-25-01-문제생성-품질-개선-Phase-A-1차.md` 참고.

### 완성된 화면 및 기능

- [x] **PlanSelectionScreen** — 서비스 드롭다운(TimelyGPT/Anthropic/OpenAI) + 모델 드롭다운 + API Key 입력 한 화면으로 통합. 저장된 키는 ●●● 마스킹 + 변경 버튼. TimelyGPT 키 발급 가이드 내장. *(Gemini 무료 옵션은 키 확보 후 재노출)*
- [x] **HomeScreen** — **과목별 탭 필터** (전체·미분류·과목별 수평 스크롤 탭) + 과목 추가 모달 + 세션 카드에 과목 배지 표시 + 복습 예정 카운터 + 새 세션 FAB + 한/EN 언어 토글
- [x] **UploadScreen** — 최초 업로드 전 동의 모달(1회) + PDF 선택 → **과목 선택 단계** (기존 과목 칩 / 새 과목 생성) → 업로드 + 생성 진행률 실시간 표시
- [x] **StudyNotesScreen** — 핵심 개념 칩 · 섹션 요약 · 용어집
- [x] **QuizModeScreen** — 학습 목적에 맞는 3가지 모드 선택: **가볍게 공부**(Lv.1–2) / **시험 대비**(Lv.3–5) / **최고난도**(Lv.5)
- [x] **MCQScreen** — 4지선다 퀴즈. **Lv.N 배지**(5단계 색상) + **개념/실습 유형 배지** 표시. 선택한 모드 기준 레벨 필터링 적용
- [x] **FillBlankScreen** — 빈칸 채우기. Lv.N + 유형 배지 표시. 모드 기준 레벨 필터링 적용. 퍼지 매칭 (Levenshtein 80%)
- [x] **ScoreScreen** — 점수(A~F) + 취약 영역 분석
- [x] **WrongAnswerScreen** — 오답 복습 + 신뢰도 평가 → SM-2 스케줄
- [x] **ReviewConceptScreen** — 개념 전체 정의 + 관련 섹션
- [x] SQLite 로컬 저장 — 생성 후 100% 오프라인 동작
- [x] 한국어 기본 UI + 한/EN 전환 (`src/i18n/strings.ts` + `languageStore`, SecureStore 언어 유지)
- [x] 프로바이더별 AI 모델 선택 (`modelStore`, SecureStore 영속화, `options.model`로 백엔드 전달)
- [x] Jest 단위 테스트 27개
- [x] Maestro E2E 테스트 3개 시나리오
- [x] **UI 색상 대비 개선** — FillBlankScreen placeholder(`#aaa`), QuestionCard dimmed 선택지 opacity·텍스트 가독성 향상, WrongAnswerScreen 오답(`#c62828`) / 정답(`#2e7d32`) 색상 WCAG AA 기준 충족
- [x] **SM-2 버그 수정** — WrongAnswerScreen에서 기존 복습 상태를 불러와서 SM-2 계산하도록 수정 (`getReviewSchedule()` 함수 추가). 이전에는 항상 초기 상태에서 계산하여 간격 반복이 실제로 작동하지 않았음
- [x] **개인정보처리방침 화면** — 앱 내 PrivacyScreen 추가, 한/영 다국어 지원. PlanSelectionScreen에서 외부 URL 대신 앱 내 화면으로 연결
- [x] **테스트 수정** — scheduler.test.ts의 `getDifficultyWeights` → `getLevelWeights` import 오류 수정
- [x] **API 에러 로그·URL 노출 `__DEV__` 제한** (2026-04-14, `63c92b5`) — `src/services/api.ts`에서 baseURL·스택 등 디버깅 정보 출력을 `__DEV__` 가드 안에서만 수행. 프로덕션 빌드에서는 사용자 친화 메시지만 노출. `.env.example` 갱신
- [x] **백엔드 세션 ID 단일화와 호환 확인** (2026-04-14) — 백엔드에서 `SessionCreate`에 optional `id` 필드를 추가하고 `/upload`·`/generate`가 `user_sessions` 행을 upsert/동기화하도록 바뀜. 모바일은 `/upload` 응답의 `session_id`를 그대로 받아 쓰는 기존 흐름이 변경 없이 유지되고, `/user/sync` 스키마도 하위 호환이라 모바일 코드 변경 없음
- [x] **세션 장기 누르기 삭제** (2026-04-14) — `HomeScreen` 카드 `onLongPress` 핸들러에서 `Alert.alert` 확인 모달 후 `deleteSession(storage)`로 로컬 SQLite에서 세션 제거. 모바일은 로컬 우선이라 서버 호출 없음. i18n 신규 키 `homeDeleteTitle`·`homeDeleteMessage`·`homeDelete` (ko/en)
- [x] **Supabase Auth 로그인/회원가입 도입** (2026-04-15) — 신규 의존성: `@supabase/supabase-js`, `expo-auth-session`, `expo-web-browser`, `expo-linking`, `react-native-url-polyfill`.
  - `src/services/supabase.ts` — `expo-secure-store` 어댑터 기반 Supabase 클라이언트 (`autoRefreshToken`, `persistSession`, `detectSessionInUrl: false`)
  - `src/store/authStore.ts` — zustand 스토어, 앱 시작 시 `getSession()` + `onAuthStateChange` 구독, `signOut()`
  - `src/screens/LoginScreen.tsx` — 이메일/비밀번호 toggle + Google OAuth(`WebBrowser.openAuthSessionAsync` → 딥링크 `studyhelper://auth/callback` → `exchangeCodeForSession`). 회원가입 모드에서 약관 동의 체크박스 필수, 미체크 시 버튼 비활성화. `signUp.options.data.terms_accepted_at`에 ISO 타임스탬프 기록
  - `src/navigation/AppNavigator.tsx` — 세션 가드: `session == null`이면 Login 스택, 있으면 기존 `PlanSelection`/`Home` 스택. `Linking.addEventListener`로 OAuth 콜백 URL 수신 후 세션 교환
  - `src/services/api.ts` — axios 요청 인터셉터에서 `supabase.auth.getSession()`으로 access token 조회 → `Authorization: Bearer` 자동 주입. 호출부 변경 없음
  - `src/services/migration.ts` — 최초 로그인 시 로컬 SQLite 과목·세션을 기존 `/user/sync`로 1회 업로드, SecureStore `cloud_sync_completed_at` 플래그로 중복 실행 방지. 실패해도 앱 진입 비차단(로그만)
  - `src/screens/HomeScreen.tsx` — 헤더 우측에 로그아웃 `IconButton` 추가, 확인 Alert 후 `signOut()`
  - `app.config.ts` — `scheme: 'studyhelper'` 추가, `extra.supabaseUrl` / `extra.supabaseAnonKey` 노출. `src/config/env.ts`에 `SUPABASE_URL`/`SUPABASE_ANON_KEY` 추가
  - 운영 작업: Supabase 대시보드에서 Redirect URL에 `studyhelper://auth/callback` 추가 필요. 모바일 `.env`/EAS secret에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 설정 필요
- [x] **백엔드 결과 영속화 리팩터와의 호환 확인** (2026-04-15) — 백엔드에서 `user_sessions`에 `result_json/error_message/completed_at` 컬럼 추가(migration 004), 생성 결과를 소유자 테이블에 primary로 저장하도록 리팩터됨. 모바일은 `/result/{id}`를 호출하지 않고 로컬 SQLite의 `study_content`만 사용하므로 **코드 변경 없음**. `/user/sessions` 응답에 새 컬럼이 포함될 수 있으나 모바일은 명시적으로 필요한 필드만 쓰므로 호환. 상세: `../documents/record_progress/2026-04-15-03-result-영속화-리팩터.md`

### 미구현 (추후 예정)

- [ ] 푸시 알림 (복습 예정일 알림, expo-notifications 설치됨)
- [ ] 앱스토어 / 플레이스토어 배포
- [ ] 비밀번호 찾기/재설정 화면
- [ ] 복습 일정(`review_schedule`)의 로그인 후 sync 확장 (현재 subjects/sessions만 최초 업로드)

---

## 화면별 상세 플로우

### 1. PlanSelectionScreen (`PlanSelection`)

최초 실행 시 진입. 설정 완료 후 HomeScreen으로 이동.
HomeScreen 헤더의 설정(⚙) 아이콘으로 언제든 재진입 가능.

```
진입 조건 A: 플랜 미선택 — 초기 온보딩
진입 조건 B: API 키 없음 — 재설정
진입 조건 C: HomeScreen 헤더 설정 아이콘 탭 — 플랜 변경

화면 구성 (단일 카드):
  [서비스  ▾]  TimelyGPT / Anthropic Claude / OpenAI GPT
               ※ Google Gemini(무료)는 키 확보 후 재노출 예정
  [모델    ▾]  서비스에 따라 모델 목록 자동 변경
  [API Key  ]  저장된 키는 ●●● + 변경 버튼
  [시작하기 ]  → savePlan + saveApiKey + setModel → HomeScreen (navigation.reset)

※ 플랜 변경 시 navigation.reset으로 스택 초기화
```

### 2. HomeScreen (`Home`)

모든 세션 목록 표시. SQLite `sessions` + `subjects` 테이블 조회.

```
  ├─▶ 과목 탭 바 (수평 스크롤):
  │     [전체] [미분류] [과목1] [과목2] ... [과목 추가]
  │     탭 선택 → 해당 과목 세션만 필터링
  │     [과목 추가] 탭 → 과목 이름 입력 모달
  ├─▶ 세션 카드 탭 → StudyNotesScreen (status === 'ready'인 경우)
  │     세션 카드에 과목 배지(컬러 점 + 이름) 표시
  ├─▶ 복습 예정 카운터 (SM-2 due_date <= 오늘)
  ├─▶ FAB (+) → UploadScreen
  └─▶ 헤더 설정(⚙) 아이콘 → PlanSelectionScreen (플랜 변경)
```

### 3. UploadScreen (`Upload`)

PDF 선택 → 과목 선택 → 업로드 → 생성 → StudyNotes.

```
  └─▶ 동의 확인 (최초 1회):
        SQLite user_settings 'upload_consent_given' 조회
        미동의 시 바텀 시트 모달 표시 → 동의 기록
  └─▶ expo-document-picker로 PDF 선택 (최대 20MB)
  └─▶ [과목 선택 단계 — subject_select]:
        기존 과목 칩 목록 (탭 선택)
        [+ 새 과목] 칩 탭 → 이름 입력창 노출
        [생성 시작] 버튼 → 과목 ID 확정
          - 새 과목 이름 입력됨 → createSubject() 후 ID 사용
          - 기존 과목 선택 → 해당 ID 사용
          - 미분류 선택 → subject_id = NULL
  └─▶ createSession({ ..., subject_id }) 로컬 저장
  └─▶ POST /upload → POST /generate → GET /status 폴링
  └─▶ GET /result → SQLite study_content 저장
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

### 테이블 구조 (7개)

| 테이블 | 주요 컬럼 | 설명 |
|--------|-----------|------|
| `subjects` | id, name, color, created_at | 과목 분류 (v2 추가) |
| `sessions` | id, pdf_name, status, subject_id, created_at | PDF 메타데이터 + 과목 FK (v2 추가) |
| `study_content` | session_id, notes_json, mcq_json, fill_json | AI 생성 콘텐츠 (JSON 블롭) |
| `attempts` | id, session_id, quiz_type, score_pct, completed_at | 퀴즈 시도 기록 |
| `answers` | attempt_id, question_id, user_answer, is_correct, time_spent_ms | 문제별 답변 |
| `review_schedule` | concept_id, interval, ease_factor, repetitions, due_date | SM-2 복습 스케줄 |
| `user_settings` | key, value | 앱 설정값 — `upload_consent_given`, `db_version` |

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
├── screens/                   화면 9개
│   ├── PlanSelectionScreen.tsx  (서비스·모델·API키 통합 설정)
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
│   ├── ProgressBar.tsx        퀴즈 진행 표시
│   └── SubjectTabBar.tsx      과목 수평 탭 필터 (HomeScreen)
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

| 프로파일 | 용도 | 배포 방식 | EAS Update 채널 | APP_ENVIRONMENT |
|----------|------|-----------|------------------|------------------|
| `development` | 로컬 개발, 시뮬레이터 | 내부 배포 | `development` | dev (default) |
| `preview` | QA 테스트 (develop 브랜치 OTA 대상) | 내부 배포 (APK) | `preview` | `staging` (별도 bundle ID) |
| `production` | 스토어 배포 | App Bundle | `production` | `production` |

`runtimeVersion` 정책은 `appVersion` (네이티브 호환성 키 = `version` 필드). `app.config.ts`에 `updates.url` (`https://u.expo.dev/<projectId>`) 설정됨.

---

## CI/CD

`.github/workflows/ci.yml` (모바일 레포) — `main` / `develop` push 및 PR 시 실행:

```
공통 (모든 push/PR):
  test  → lint + tsc --noEmit + Jest coverage + Codecov 업로드

develop push 시:
  eas-update  → eas update --branch preview --non-interactive
                (OTA, 30초~2분 — 네이티브 빌드 없음)

main push 시:
  eas-build   → eas build --profile production --platform all --non-interactive --no-wait
                (네이티브 빌드 15~30분, 백그라운드 트리거)
```

| 브랜치 | 트리거 | 결과 |
|--------|--------|------|
| `develop` push | EAS Update → `preview` 채널 | 이미 설치된 preview 빌드 사용자에게 OTA 반영 |
| `main` push | EAS Build → `production` 프로파일 | 새 네이티브 바이너리 (스토어 업로드용) |
| PR | test job만 | 머지 전 검증 |

필요한 GitHub Secrets:

| Secret | 설명 |
|--------|------|
| `EXPO_TOKEN` | Expo 계정 토큰 (`expo.dev` → Account Settings → Access Tokens) |
