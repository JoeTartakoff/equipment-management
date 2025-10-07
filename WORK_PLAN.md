# 암호기기 관리 시스템 개발

## 프로젝트 정보
- 프로젝트명: equipment-management
- 경로: C:\Users\ths10905\equipment-management
- 기술 스택: Next.js + Supabase + Vercel
- 참고: GAS로 만든 기존 시스템을 재구현

## 핵심 기능 분석

### 1. 데이터 구조
**기기 마스터 리스트 (50개 기기)**
- AM-38N: 01~10번
- MCF-10E: 01~10번
- KOF-09: 01~10번
- USB-12: 01~10번
- NCG-10R: 01~10번
- 초기 위치: 모두 22사단

**입출고 기록 로그**
- 증명서 번호 (자동 증가)
- 기기 ID
- 발행원 부대
- 수령처 부대
- 내용(사유)
- 기록자 이름
- 기록 일시

### 2. 주요 기능
1. 기기명 선택 → 시리얼 번호 선택
2. 선택한 기기의 현재 위치 자동 표시
3. 수령처 부대 선택
4. 입출고 기록 저장
5. 기기 위치 자동 업데이트
6. PDF 증명서 생성 및 출력

### 3. 필요한 Supabase 테이블
1. equipment_master (기기 마스터)
2. transaction_logs (입출고 기록)

## 오늘의 작업 단계
- [x] Phase 1: 분석 및 설계 (지금 진행 중)
- [ ] Phase 2: Supabase DB 구축
- [ ] Phase 3: Next.js 프로젝트 기본 설정
- [ ] Phase 4: 폼 UI 구현
- [ ] Phase 5: 백엔드 로직 구현
- [ ] Phase 6: PDF 생성 기능
- [ ] Phase 7: Vercel 배포
- [ ] Phase 8: 최종 테스트 및 마무리

## GAS vs Next.js 비교
| GAS 기능 | Next.js 대응 |
|---------|-------------|
| SpreadsheetApp | Supabase PostgreSQL |
| HTML Service | React 컴포넌트 |
| DriveApp | react-to-print |
| doGet() | app/page.js |
| google.script.run | Supabase Client |
