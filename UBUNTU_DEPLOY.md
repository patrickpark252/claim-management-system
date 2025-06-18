# 우분투 서버 배포 가이드

## 자동 설치 (권장)

```bash
# 프로젝트 다운로드
git clone https://github.com/patrickpark252/claim-management-system.git
cd claim-management-system

# 자동 설치 스크립트 실행
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

## 수동 설치

### 1. 시스템 준비
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js 20 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. PostgreSQL 설치
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. 데이터베이스 설정
```bash
sudo -u postgres psql
```

PostgreSQL 콘솔에서:
```sql
CREATE USER claimuser WITH PASSWORD 'claim123456';
CREATE DATABASE claim_management OWNER claimuser;
GRANT ALL PRIVILEGES ON DATABASE claim_management TO claimuser;
\q
```

### 5. 프로젝트 설정
```bash
git clone https://github.com/patrickpark252/claim-management-system.git
cd claim-management-system
npm install
```

### 6. 환경 변수 설정
```bash
cat > .env << EOF
DATABASE_URL=postgresql://claimuser:claim123456@localhost:5432/claim_management
SESSION_SECRET=claim-management-super-secret-key-2024
HOST=0.0.0.0
PORT=5000
NODE_ENV=production
EOF
```

### 7. 데이터베이스 초기화
```bash
npm run db:push
```

### 8. 빌드 및 실행
```bash
npm run build
npm run start
```

## PM2 사용 (프로덕션 권장)

```bash
# PM2 설치
sudo npm install -g pm2

# 애플리케이션 시작
pm2 start dist/index.js --name claim-management

# 시스템 부팅시 자동 시작 설정
pm2 startup
pm2 save
```

## 방화벽 설정

```bash
sudo ufw allow 5000
sudo ufw enable
```

## 접속 확인

- 웹 브라우저에서 `http://서버IP:5000` 접속
- 로컬에서는 `http://localhost:5000` 접속

## 문제 해결

### 포트 5000이 이미 사용 중인 경우
```bash
# 다른 포트 사용 (예: 3000)
export PORT=3000
pm2 restart claim-management
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

### 로그 확인
```bash
# PM2 로그
pm2 logs claim-management

# 시스템 로그
journalctl -f -u claim-management
```