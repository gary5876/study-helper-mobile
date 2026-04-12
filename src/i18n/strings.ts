export type Lang = 'ko' | 'en';

export const STRINGS = {
  ko: {
    // Navigation
    navGetStarted: '시작하기',
    navSetup: '설정',
    navNewSession: '새 세션',
    navStudyNotes: '학습 노트',
    navMCQ: '객관식',
    navFillBlank: '빈칸 채우기',
    navResults: '결과',
    navReviewMistakes: '오답 복습',
    navConceptReview: '개념 복습',
    navQuizMode: '학습 모드 선택',
    navPrivacy: '개인정보처리방침',

    // QuizModeScreen
    modeSelectTitle: '학습 모드를 선택하세요',
    modeSelectSubtitle: '목적에 맞는 난이도로 문제를 풀어보세요.',
    modeLight: '가볍게 공부',
    modeLightDesc: '기초 개념을 확인하는 부담 없는 문제입니다. 처음 접하는 내용이거나 빠르게 훑을 때 적합합니다.',
    modeExam: '시험 대비',
    modeExamDesc: '실전 시험 수준의 문제입니다. 개념 적용부터 복합 분석까지 골고루 출제됩니다.',
    modeMax: '최고난도',
    modeMaxDesc: '변별력 있는 최상위 문제만 모았습니다. 비판적 사고와 심화 이해가 필요합니다.',

    // Question type labels
    qtConcept: '개념',
    qtApplication: '실습',

    // HomeScreen
    homeNoSessions: '아직 세션이 없어요',
    homeNoSessionsDesc: '+ 버튼을 눌러 PDF를 업로드하고 학습을 시작하세요.',
    homeNewSession: '새 세션',
    homeDueReview: '복습 예정',
    homeStatusReady: '준비됨',
    homeStatusPending: '처리 중',
    homeStatusFailed: '실패',

    // UploadScreen
    uploadTitle: 'PDF 업로드',
    uploadDesc: '텍스트 기반 PDF를 선택하세요 (강의 슬라이드, 교재, 노트).\n최대 용량: 20MB · 최대 50페이지 처리 가능',
    uploadChoose: 'PDF 선택',
    uploadFileTooLarge: '파일이 너무 큽니다',
    uploadFileTooLargeDesc: '20MB 이하의 PDF를 선택해주세요.',
    uploadNoApiKey: 'API 키 없음',
    uploadNoApiKeyDesc: '설정에서 API 키를 먼저 입력해주세요.',
    uploadUploading: 'PDF 업로드 중…',
    uploadAnalyzing: 'PDF 분석 중…',
    uploadDone: '완료!',
    uploadError: '오류가 발생했습니다.',
    uploadFailed: '업로드 실패',
    uploadTryAgain: '다시 시도',

    // StudyNotesScreen
    studyNotesLoadError: '학습 노트를 불러올 수 없습니다.',
    studyNotesKeyConcepts: '핵심 개념',
    studyNotesSummaries: '요약',
    studyNotesGlossary: '용어집',
    studyNotesStartTest: '테스트 시작',

    // MCQScreen
    mcqLoadError: '문제를 불러오지 못했습니다. 뒤로 가서 다시 시도해주세요.',
    mcqNoQuestions: '문제가 없습니다.',
    mcqProgressLabel: '객관식',

    // FillBlankScreen
    fillLoadError: '문제를 불러오지 못했습니다. 뒤로 가서 다시 시도해주세요.',
    fillNoQuestions: '빈칸 문제가 없습니다.',
    fillProgressLabel: '빈칸 채우기',
    fillPlaceholder: '답을 입력하세요…',
    fillShowHint: '힌트 보기',
    fillHintPrefix: '💡 힌트: ',
    fillSubmit: '제출',
    fillCorrect: '정답입니다! 잘 했어요.',
    fillWrongPrefix: '정답: ',

    // ScoreScreen
    scoreLoading: '결과 불러오는 중…',
    scoreCorrect: '정답',
    scoreWeakAreas: '취약 영역',
    scoreQuestionsWrong: '문제 오답',
    scoreReviewMistakes: '오답 복습',
    scoreStudyNotesAgain: '학습 노트 다시 보기',
    scoreDone: '완료',

    // WrongAnswerScreen
    wrongLoading: '불러오는 중…',
    wrongNoMistakes: '오답이 없어요 — 훌륭합니다!',
    wrongBackHome: '홈으로',
    wrongIntro: '각 오답을 복습하고 현재 이해도를 표시해주세요.',
    wrongYourAnswer: '내 답변:',
    wrongCorrectAnswer: '정답:',
    wrongWhy: '설명:',
    wrongViewConcept: '관련 개념 보기',
    wrongHowDoYouFeel: '지금 이해도는?',
    wrongGotIt: '알겠어요 ✓',
    wrongNeedsHint: '힌트 필요',
    wrongStillConfused: '아직 헷갈려요',
    wrongRetryConfused: '헷갈리는 문제 재시도',
    wrongAllDone: '완료!',

    // ReviewConceptScreen
    reviewLoading: '불러오는 중…',
    reviewConceptNotFound: '개념을 찾을 수 없습니다.',
    reviewGoBack: '뒤로',
    reviewRelatedSections: '관련 섹션',
    reviewGlossary: '용어집',
    reviewBackToReview: '복습으로 돌아가기',
    reviewImportanceSuffix: ' 중요도',

    // FeedbackModal
    feedbackCorrect: '정답!',
    feedbackWrong: '틀렸어요',
    feedbackCorrectAnswer: '정답:',
    feedbackSeeResults: '결과 보기',
    feedbackNextQuestion: '다음 문제 →',

    // ConceptHighlight
    conceptClose: '닫기',

    // Subject management (HomeScreen + UploadScreen)
    subjectAll: '전체',
    subjectUncategorized: '미분류',
    subjectAdd: '과목 추가',
    subjectNamePlaceholder: '과목명 입력...',
    subjectCreate: '만들기',
    subjectCancel: '취소',
    subjectSelectStep: '어떤 과목인가요?',
    subjectSelectDesc: '과목을 선택하거나 새로 만드세요.',
    subjectNewLabel: '+ 새 과목',
    uploadStartBtn: '생성 시작',

    // ModelSelection (ApiKeySetupScreen)
    modelSelectLabel: '모델 선택',
    modelSelectDefault: '(기본값)',

    // PrivacyScreen
    privacyTitle: '개인정보처리방침',
    privacyEffectiveDate: '시행일: 2026년 4월 8일',
    privacyServiceName: '공부 도우미 (Study Helper)',
    privacyS1Title: '1. 총칙',
    privacyS1Body: '공부 도우미 (Study Helper)(이하 "서비스")는 사용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 서비스가 어떤 정보를 수집·이용·보관·파기하는지 설명합니다.',
    privacyS2Title: '2. 수집하는 정보',
    privacyS2Items: [
      '이메일 주소 — 회원가입/소셜 로그인 → 계정 식별 및 로그인',
      'IP 주소 — 서버 자동 수집 → 어뷰징 방지(Rate Limiting)',
      '업로드 PDF 텍스트 — 사용자 직접 제공 → AI 학습 자료 생성',
      'API 키 (선택) — 사용자 직접 입력 (기기 저장) → AI 서비스 호출',
      '학습 기록 — 앱 내 자동 생성 → 간격 반복 복습 스케줄 관리',
    ],
    privacyS2Note: 'API 키는 기기의 SecureStore에만 저장되며, 서버는 요청 처리 후 즉시 파기합니다.',
    privacyS3Title: '3. 개인정보의 이용 목적',
    privacyS3Items: [
      '서비스 제공 및 AI 학습 자료 생성',
      '비정상적인 접근 탐지 및 서비스 안정성 유지',
      '서비스 개선을 위한 익명 통계 분석',
    ],
    privacyS4Title: '4. 제3자 제공',
    privacyS4Body: '업로드된 PDF 텍스트는 사용자가 선택한 AI 서비스(Anthropic, OpenAI, TimelyGPT)의 서버로 전송되어 학습 자료 생성에 사용됩니다. 각 서비스의 개인정보처리방침이 적용됩니다.',
    privacyS4Note: '위 목적 외 제3자 제공은 하지 않습니다.',
    privacyS5Title: '5. 보유 및 파기',
    privacyS5Items: [
      '계정 정보 — 탈퇴 요청 시 즉시 DB 영구 삭제',
      'PDF 텍스트 (세션) — 생성 완료 후 2시간, Redis TTL 자동 만료',
      '생성된 문제 (문제은행) — 서비스 운영 기간, 서비스 종료 시 삭제',
      '서버 로그 (IP 포함) — 최대 30일, 자동 롤오버 삭제',
    ],
    privacyS6Title: '6. 사용자 권리',
    privacyS6Body: '사용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 계정 탈퇴는 앱 내 설정에서 가능하며, 탈퇴 시 개인정보는 즉시 파기됩니다.',
    privacyS7Title: '7. 보안 조치',
    privacyS7Items: [
      'API 키: 기기 내 암호화 저장 (Expo SecureStore), 서버 비저장',
      '통신: HTTPS 암호화',
      '접근 제어: IP당 분당 30회 Rate Limiting',
      '로그: API 키 등 민감 정보 마스킹 처리',
    ],
    privacyS8Title: '8. 쿠키 및 추적',
    privacyS8Body: '서비스는 로그인 세션 유지를 위해 Supabase 인증 쿠키를 사용합니다. 별도의 광고 추적 쿠키는 사용하지 않습니다.',
    privacyS9Title: '9. 방침 변경',
    privacyS9Body: '본 방침이 변경될 경우 시행 7일 전에 앱 공지 또는 이 페이지를 통해 안내합니다.',
    privacyS10Title: '10. 문의',
    privacyS10Body: '개인정보 관련 문의사항은 GitHub Issues를 통해 접수해 주세요.',
  },
  en: {
    // Navigation
    navGetStarted: 'Get Started',
    navSetup: 'Setup',
    navNewSession: 'New Session',
    navStudyNotes: 'Study Notes',
    navMCQ: 'Multiple Choice',
    navFillBlank: 'Fill in the Blank',
    navResults: 'Results',
    navReviewMistakes: 'Review Mistakes',
    navConceptReview: 'Concept Review',
    navQuizMode: 'Select Study Mode',
    navPrivacy: 'Privacy Policy',

    // QuizModeScreen
    modeSelectTitle: 'Choose a Study Mode',
    modeSelectSubtitle: 'Pick the difficulty that matches your goal.',
    modeLight: 'Light Study',
    modeLightDesc: 'Easy recall and comprehension questions. Great for a first pass or a quick review.',
    modeExam: 'Exam Prep',
    modeExamDesc: 'Exam-level questions ranging from application to complex analysis. The default mode for serious study.',
    modeMax: 'Maximum Difficulty',
    modeMaxDesc: 'Only the hardest questions. Requires critical thinking, synthesis, and deep understanding.',

    // Question type labels
    qtConcept: 'Concept',
    qtApplication: 'Application',

    // HomeScreen
    homeNoSessions: 'No sessions yet',
    homeNoSessionsDesc: 'Tap the + button to upload a PDF and start studying.',
    homeNewSession: 'New Session',
    homeDueReview: 'due for review',
    homeStatusReady: 'ready',
    homeStatusPending: 'pending',
    homeStatusFailed: 'failed',

    // UploadScreen
    uploadTitle: 'Upload a PDF',
    uploadDesc: 'Choose a text-based PDF (lecture slides, textbook chapters, notes).\nMaximum size: 20MB · Up to 50 pages processed.',
    uploadChoose: 'Choose PDF',
    uploadFileTooLarge: 'File too large',
    uploadFileTooLargeDesc: 'Please select a PDF under 20MB.',
    uploadNoApiKey: 'No API Key',
    uploadNoApiKeyDesc: 'Please enter your API key in settings first.',
    uploadUploading: 'Uploading PDF…',
    uploadAnalyzing: 'Analyzing PDF…',
    uploadDone: 'Ready!',
    uploadError: 'Something went wrong.',
    uploadFailed: 'Upload failed',
    uploadTryAgain: 'Try Again',

    // StudyNotesScreen
    studyNotesLoadError: 'Could not load study notes.',
    studyNotesKeyConcepts: 'Key Concepts',
    studyNotesSummaries: 'Summaries',
    studyNotesGlossary: 'Glossary',
    studyNotesStartTest: "I'm Ready to Test",

    // MCQScreen
    mcqLoadError: 'Failed to load questions. Please go back and try again.',
    mcqNoQuestions: 'No questions found.',
    mcqProgressLabel: 'Multiple Choice',

    // FillBlankScreen
    fillLoadError: 'Failed to load questions. Please go back and try again.',
    fillNoQuestions: 'No fill questions found.',
    fillProgressLabel: 'Fill in the Blank',
    fillPlaceholder: 'Type your answer…',
    fillShowHint: 'Show Hint',
    fillHintPrefix: '💡 Hint: ',
    fillSubmit: 'Submit',
    fillCorrect: 'Correct! Well done.',
    fillWrongPrefix: 'The correct answer is: ',

    // ScoreScreen
    scoreLoading: 'Loading results…',
    scoreCorrect: 'correct',
    scoreWeakAreas: 'Areas to Strengthen',
    scoreQuestionsWrong: 'questions wrong',
    scoreReviewMistakes: 'Review Mistakes',
    scoreStudyNotesAgain: 'Study Notes Again',
    scoreDone: 'Done',

    // WrongAnswerScreen
    wrongLoading: 'Loading…',
    wrongNoMistakes: 'No mistakes — great work!',
    wrongBackHome: 'Back to Home',
    wrongIntro: 'Review each mistake and mark how well you understand it now.',
    wrongYourAnswer: 'Your answer:',
    wrongCorrectAnswer: 'Correct answer:',
    wrongWhy: 'Why:',
    wrongViewConcept: 'View Related Concept',
    wrongHowDoYouFeel: 'How do you feel now?',
    wrongGotIt: 'Got It ✓',
    wrongNeedsHint: 'Needs Hint',
    wrongStillConfused: 'Still Confused',
    wrongRetryConfused: 'Retry Confused Items',
    wrongAllDone: 'All Done!',

    // ReviewConceptScreen
    reviewLoading: 'Loading…',
    reviewConceptNotFound: 'Concept not found.',
    reviewGoBack: 'Go Back',
    reviewRelatedSections: 'Related Sections',
    reviewGlossary: 'Glossary',
    reviewBackToReview: 'Back to Review',
    reviewImportanceSuffix: ' importance',

    // FeedbackModal
    feedbackCorrect: 'Correct!',
    feedbackWrong: 'Not quite',
    feedbackCorrectAnswer: 'Correct answer:',
    feedbackSeeResults: 'See Results',
    feedbackNextQuestion: 'Next Question →',

    // ConceptHighlight
    conceptClose: 'Close',

    // Subject management (HomeScreen + UploadScreen)
    subjectAll: 'All',
    subjectUncategorized: 'Unclassified',
    subjectAdd: 'Add Subject',
    subjectNamePlaceholder: 'Subject name...',
    subjectCreate: 'Create',
    subjectCancel: 'Cancel',
    subjectSelectStep: 'Which subject?',
    subjectSelectDesc: 'Select a subject or create a new one.',
    subjectNewLabel: '+ New Subject',
    uploadStartBtn: 'Start',

    // ModelSelection (ApiKeySetupScreen)
    modelSelectLabel: 'Select Model',
    modelSelectDefault: '(default)',

    // PrivacyScreen
    privacyTitle: 'Privacy Policy',
    privacyEffectiveDate: 'Effective: April 8, 2026',
    privacyServiceName: 'Study Helper',
    privacyS1Title: '1. General',
    privacyS1Body: 'Study Helper ("Service") values your privacy and complies with applicable data protection laws. This policy explains what information we collect, use, store, and delete.',
    privacyS2Title: '2. Information Collected',
    privacyS2Items: [
      'Email address — Sign-up / Social login → Account identification',
      'IP address — Automatic server collection → Abuse prevention (Rate Limiting)',
      'Uploaded PDF text — User-provided → AI study material generation',
      'API Key (optional) — User input (stored on device) → AI service calls',
      'Study records — Auto-generated in app → Spaced repetition scheduling',
    ],
    privacyS2Note: 'API keys are stored only in the device SecureStore. The server discards them immediately after processing.',
    privacyS3Title: '3. Purpose of Use',
    privacyS3Items: [
      'Providing the service and generating AI study materials',
      'Detecting abnormal access and maintaining service stability',
      'Anonymous statistical analysis for service improvement',
    ],
    privacyS4Title: '4. Third-Party Sharing',
    privacyS4Body: 'Uploaded PDF text is sent to the AI service selected by the user (Anthropic, OpenAI, TimelyGPT) for study material generation. Each service\'s privacy policy applies.',
    privacyS4Note: 'We do not share data with third parties for purposes other than the above.',
    privacyS5Title: '5. Retention & Deletion',
    privacyS5Items: [
      'Account info — Immediately upon withdrawal request, permanently deleted from DB',
      'PDF text (session) — 2 hours after generation, auto-expired via Redis TTL',
      'Generated questions (question bank) — During service operation, deleted when service ends',
      'Server logs (incl. IP) — Max 30 days, auto-rotated',
    ],
    privacyS6Title: '6. Your Rights',
    privacyS6Body: 'You may request access, correction, deletion, or suspension of processing at any time. Account deletion is available in app settings; all personal data is destroyed immediately.',
    privacyS7Title: '7. Security Measures',
    privacyS7Items: [
      'API keys: Encrypted on-device storage (Expo SecureStore), not stored on server',
      'Communication: HTTPS encryption',
      'Access control: 30 requests per minute per IP (Rate Limiting)',
      'Logs: Sensitive information masked',
    ],
    privacyS8Title: '8. Cookies & Tracking',
    privacyS8Body: 'The service uses Supabase authentication cookies for session management. No advertising tracking cookies are used.',
    privacyS9Title: '9. Policy Changes',
    privacyS9Body: 'Changes to this policy will be announced via the app or this page at least 7 days before taking effect.',
    privacyS10Title: '10. Contact',
    privacyS10Body: 'For privacy-related inquiries, please submit through GitHub Issues.',
  },
} as const;

export type Strings = typeof STRINGS['ko'];
