# 클레임 관리 시스템 (Claim Management System)

게임 판매 상품과 관련된 클레임을 체계적으로 관리하는 웹 애플리케이션입니다.

## 주요 기능

- **주문 관리**: 쇼핑몰별 주문 정보 통합 관리
- **상태 추적**: 진행상황 및 처리내역 실시간 업데이트
- **Excel 연동**: Excel 파일 업로드 및 데이터 가져오기
- **필터링**: 신규, 진행중, 완료 등 다양한 상태별 필터
- **로그 시스템**: 모든 작업 내역 자동 기록
- **마켓 연동**: 각 쇼핑몰 관리 페이지 빠른 접근

## 기술 스택

### Frontend
- React + TypeScript
- Vite (빌드 도구)
- TanStack Query (데이터 fetching)
- Shadcn UI + Tailwind CSS (스타일링)
- Wouter (라우팅)

### Backend
- Express.js + TypeScript
- Drizzle ORM (데이터베이스)
- PostgreSQL (데이터베이스)
- Multer (파일 업로드)
- XLSX (Excel 파일 처리)

## 설치 및 실행

### 필요 환경
- Node.js 18 이상
- PostgreSQL 12 이상

### 1. 저장소 클론
```bash
git clone https://github.com/patrickpark252/claim-management-system.git
cd claim-management-system
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
export DATABASE_URL="postgresql://username:password@localhost:5432/claim_management"
export SESSION_SECRET="your-secret-key-here"
export HOST="0.0.0.0"
```

### 4. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb claim_management

# 테이블 생성
npm run db:push
```

### 5. 애플리케이션 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 서버 배포 (우분투)

### 1. 서버 환경 준비
```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# 데이터베이스 사용자 생성
sudo -u postgres createuser --interactive --pwprompt
sudo -u postgres createdb claim_management
```

### 2. 애플리케이션 배포
```bash
# 프로젝트 클론
git clone https://github.com/patrickpark252/claim-management-system.git
cd claim-management-system

# 의존성 설치
npm install

# 환경 변수 설정
export DATABASE_URL="postgresql://dbuser:password@localhost:5432/claim_management"
export SESSION_SECRET="production-secret-key"
export HOST="0.0.0.0"
export PORT="5000"

# 데이터베이스 초기화
npm run db:push

# 프로덕션 빌드
npm run build

# PM2로 프로세스 관리 (선택사항)
npm install -g pm2
pm2 start dist/index.js --name claim-management
pm2 startup
pm2 save
```

### 3. 방화벽 설정
```bash
sudo ufw allow 5000
sudo ufw enable
```

## 사용법

### 기본 워크플로우
1. **Excel 업로드**: 기존 데이터를 Excel 파일로 가져오기
2. **주문 선택**: 좌측 목록에서 처리할 주문 클릭
3. **상태 업데이트**: 진행상황/처리내역 버튼으로 상태 변경
4. **메모 작성**: 고객 문의 내용 및 처리 과정 기록
5. **로그 확인**: 우측 패널에서 작업 이력 확인

### 필터 기능
- **신규 컴플레인**: 진행상황, 처리내역 모두 공란
- **진행상태**: 처리내역만 공란
- **재판매내역**: 진행상황에 '재판매중' 포함
- **반품확인**: '사용여부' 또는 '반품절차' 포함
- **거부내역**: 처리내역에 '거부완료' 포함

### 상태 버튼
**진행상황**
- 사용여부전달 → "사용여부"
- 반품절차전달 → "반품절차" 
- 재판매진행 → "재판매중"
- 반품거부예정 → "거부예정"
- 반품예정 → "반품예정"

**처리내역**
- 반품완료 → "반품완료"
- 거부처리 → "거부완료"

## 지원 쇼핑몰

- **지마켓**: https://signin.esmplus.com/login
- **11번가**: https://www.11st.co.kr/
- **스마트스토어**: https://sell.smartstore.naver.com/

## 개발자 정보

- **개발자**: patrickpark252
- **이메일**: qkrckstn22@naver.com
- **저장소**: https://github.com/patrickpark252/claim-management-system

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.