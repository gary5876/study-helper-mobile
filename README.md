# Fundamentals — Mobile App

PDF를 AI 학습 세션으로 변환하는 React Native 앱.
SM-2 간격 반복 알고리즘으로 장기 기억을 강화합니다.

## Features

- PDF 업로드 → AI 학습 노트 · MCQ · 빈칸 채우기 문제 자동 생성
- 즉각적인 정답 피드백 + 개념 설명
- 오답 복습 + 신뢰도 평가
- SM-2 간격 반복 스케줄링 (푸시 알림)
- 생성 후 100% 오프라인 — 모든 데이터 SQLite에 로컬 저장
- Sentry 크래시 리포팅

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator 또는 Expo Go 앱이 설치된 실기기
- 실행 중인 [fundamentals-backend](../fundamentals-backend) 인스턴스

## Quick Start

```bash
# 1. 설치
git clone https://github.com/gary5876/fundamentals-mobile.git
cd fundamentals-mobile
npm install

# 2. Expo 개발 서버 시작
npx expo start

# 3. QR 코드 스캔 (Expo Go) 또는 'i' (iOS) / 'a' (Android)
```

첫 실행 시 Anthropic API 키와 백엔드 URL을 입력합니다.

## Screen Flow

```
Onboarding (API 키) → Home → PDF 업로드 → 로딩 (생성 중)
  → Study Notes → MCQ 퀴즈 → 빈칸 채우기 → 점수
  → 오답 복습 → 재시도 / 간격 반복 스케줄
```

## Configuration

환경별 설정은 `app.config.ts`에서 관리하며, EAS Secrets 또는 `.env` 파일로 주입합니다.

| 환경변수 | 기본값 | 설명 |
|----------|--------|------|
| `BACKEND_URL` | `http://localhost:8000` | 백엔드 서버 URL |
| `SENTRY_DSN` | `""` | Sentry DSN (프로덕션에서 필수) |
| `APP_ENVIRONMENT` | `development` | `development` / `staging` / `production` |

앱 내 **Advanced Settings** 화면에서 백엔드 URL을 런타임에도 변경할 수 있습니다.

## API Communication

- **API 키 전달**: `X-API-Key` 헤더 (SecureStore에 저장)
- **재시도**: 네트워크 오류 및 5xx 응답 시 최대 3회 지수 백오프 재시도
- **타임아웃**: 요청당 120초

## Running Tests

```bash
# 전체 테스트
npm test

# 커버리지 포함
npm run test:coverage

# 린트
npm run lint
```

### 테스트 구조

```
src/__tests__/
├── scheduler.test.ts    # SM-2 알고리즘 (13개)
├── api.test.ts          # API 키·URL 헬퍼 (8개)
└── sessionStore.test.ts # Zustand 스토어 (6개)
```

## Project Structure

```
src/
├── config/
│   └── env.ts           환경별 설정 (BACKEND_URL, SENTRY_DSN 등)
├── screens/             앱 화면 (9개)
├── components/          공유 UI 컴포넌트 (QuestionCard, FeedbackModal 등)
├── services/
│   ├── api.ts           백엔드 HTTP 클라이언트 (axios + 재시도)
│   ├── storage.ts       SQLite CRUD
│   └── scheduler.ts     SM-2 간격 반복 알고리즘
├── store/               Zustand 전역 상태
├── db/                  SQLite 스키마 정의
├── navigation/          React Navigation 설정
└── __tests__/           Jest 단위 테스트
.maestro/                Maestro E2E 테스트 시나리오
```

## Data Storage

모든 사용자 데이터는 기기의 SQLite에만 저장됩니다 (서버 저장 없음):

| 테이블 | 내용 |
|--------|------|
| `sessions` | PDF 메타데이터, 생성 상태 |
| `study_content` | 노트 · MCQ · 빈칸 채우기 JSON |
| `attempts` | 퀴즈 시도 기록 |
| `answers` | 문제별 답변 기록 |
| `review_schedule` | SM-2 간격 반복 스케줄 |

## Building for Production

EAS Build를 사용합니다 (권장):

```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 빌드 (프로파일: development / preview / production)
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 빌드 프로파일 (`eas.json`)

| 프로파일 | 용도 | 배포 방식 |
|----------|------|-----------|
| `development` | 로컬 개발, 시뮬레이터 | 내부 배포 |
| `preview` | QA 테스트 | 내부 배포 (APK) |
| `production` | 스토어 배포 | App Bundle |

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

## E2E Tests (Maestro)

[Maestro](https://maestro.mobile.dev/) CLI로 실기기/시뮬레이터에서 E2E 테스트를 실행합니다.

```bash
# Maestro 설치
curl -Ls "https://get.maestro.mobile.dev" | bash

# 개별 시나리오 실행
maestro test .maestro/01_api_key_setup.yaml
maestro test .maestro/02_upload_flow.yaml
maestro test .maestro/03_mcq_quiz_flow.yaml
```

### 시나리오

| 파일 | 검증 내용 |
|------|-----------|
| `01_api_key_setup.yaml` | API 키 입력 검증 + 홈 화면 이동 |
| `02_upload_flow.yaml` | PDF 업로드 → 생성 → Study Notes 이동 |
| `03_mcq_quiz_flow.yaml` | MCQ 퀴즈 완료 → Fill in the Blank 이동 |
