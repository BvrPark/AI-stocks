WAFER — 개인 투자 통합 대시보드 (v2 디자인)
사이드바 + KPI 카드 + 도넛차트 + 이슈리스트 형태의 엔터프라이즈 대시보드 스타일로 리뉴얼한 버전입니다. 빌드 과정 없이 바로 Netlify에 올릴 수 있습니다.
1. Netlify 배포 방법
방법 A — 드래그 앤 드롭
https://app.netlify.com 접속 후 로그인
"Add new site" → "Deploy manually"
이 폴더 전체를 드래그해서 업로드
방법 B — GitHub 연동
폴더를 GitHub 저장소에 push
Netlify에서 "Import an existing project" → 저장소 선택 → Build command 비움, Publish directory `/`
2. 실시간 시세 API 키 설정 (필수)
Finnhub 무료 API 키 발급 → 사이트 좌측 메뉴 "API 설정" 섹션에 입력 → 저장. 키는 브라우저 localStorage에만 저장됩니다.
3. 이번 리뉴얼에서 달라진 점
다크 터미널 테마 → 밝은 네이비/화이트 엔터프라이즈 대시보드 테마
좌측 고정 사이드바 내비게이션 + 상단 breadcrumb 추가
상단 KPI 카드 5종(관심종목 수 · 매수 시그널 · 목표 달성률 · 평가손익 · VIX)
AI 매매 추천을 도넛차트(시그널 분포) + 이슈리스트 카드 형태로 시각화
관심종목 등락률을 막대그래프로 한눈에 비교
목표 달성률을 원형 게이지(링 차트)로 표시
4. 알아두어야 할 제한사항
나스닥 선물(NQ=F)은 Finnhub 무료 플랜 미지원으로 QQQ 실시간가로 대체
VIX는 무료 플랜에서 조회 실패 시 수동 입력 가능
공포탐욕지수는 CNN 공식 무료 API가 없어 슬라이더 수동 입력
AI 매매 추천은 PER·ROE·부채비율·매출총이익률(버핏 스타일)과 EPS성장률·PEG·유동비율(린치 스타일) 규칙 기반 스코어링이며 투자 자문이 아님. 레버리지 ETP(SOXL/SOXS)는 재무데이터가 없어 분석 대상에서 제외
5. 파일 구조
```
site2/
├── index.html
├── css/style.css
├── js/app.js
└── README.md
```
