# 변경 요약

<!-- 무엇을 왜 바꿨는지 1~3줄로 -->

## 관련 이슈

<!-- closes #123, refs #456 / 없으면 "없음" -->

## 변경 유형

- [ ] feat — 새 기능
- [ ] fix — 버그 수정
- [ ] security — 보안 수정
- [ ] refactor — 동작 변경 없는 리팩터
- [ ] perf — 성능 개선
- [ ] docs — 문서만
- [ ] test — 테스트만
- [ ] chore — 설정·의존성·CI

## 테스트

- [ ] `npm test` 통과
- [ ] iOS 시뮬레이터 검증
- [ ] Android 에뮬레이터 검증
- [ ] Maestro E2E 영향 시나리오 재실행 (해당 시)

## 체크리스트

- [ ] 하드코딩 문자열 대신 `t()` (i18n) 사용
- [ ] API 키·토큰은 SecureStore (AsyncStorage 금지)
- [ ] `console.log`는 `__DEV__` 가드 안에만
- [ ] 큰 리스트는 FlatList + `keyExtractor`
- [ ] 백엔드 응답 스키마 호환 (필요 시 `study-helper-backend` PR 함께 링크)

## 비고

<!-- 리뷰어가 알아야 할 트레이드오프, 후속 작업 등 -->
