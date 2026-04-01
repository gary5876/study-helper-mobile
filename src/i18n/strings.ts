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

    // ModelSelection (ApiKeySetupScreen)
    modelSelectLabel: '모델 선택',
    modelSelectDefault: '(기본값)',
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

    // ModelSelection (ApiKeySetupScreen)
    modelSelectLabel: 'Select Model',
    modelSelectDefault: '(default)',
  },
} as const;

export type Strings = typeof STRINGS['ko'];
