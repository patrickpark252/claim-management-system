#!/bin/bash

# 클레임 관리 시스템 우분투 서버 배포 스크립트
# 사용법: ./deploy-ubuntu.sh

set -e

echo "=== 클레임 관리 시스템 우분투 서버 배포 ==="

# 1. 시스템 업데이트
echo "1. 시스템 업데이트 중..."
sudo apt update && sudo apt upgrade -y

# 2. Node.js 20 설치
echo "2. Node.js 20 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js가 이미 설치되어 있습니다."
fi

# 3. PostgreSQL 설치
echo "3. PostgreSQL 설치 중..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo "PostgreSQL이 이미 설치되어 있습니다."
fi

# 4. 데이터베이스 사용자 및 데이터베이스 생성
echo "4. 데이터베이스 설정 중..."
sudo -u postgres psql -c "CREATE USER claimuser WITH PASSWORD 'claim123456';" || echo "사용자가 이미 존재합니다."
sudo -u postgres psql -c "CREATE DATABASE claim_management OWNER claimuser;" || echo "데이터베이스가 이미 존재합니다."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE claim_management TO claimuser;"

# 5. Git에서 프로젝트 클론
echo "5. 프로젝트 다운로드 중..."
if [ -d "claim-management-system" ]; then
    echo "기존 프로젝트 폴더 제거 중..."
    rm -rf claim-management-system
fi

git clone https://github.com/patrickpark252/claim-management-system.git
cd claim-management-system

# 6. 환경 변수 설정
echo "6. 환경 변수 설정 중..."
cat > .env << EOF
DATABASE_URL=postgresql://claimuser:claim123456@localhost:5432/claim_management
SESSION_SECRET=claim-management-super-secret-key-2024
HOST=0.0.0.0
PORT=5000
NODE_ENV=production
EOF

# 7. 의존성 설치
echo "7. 의존성 설치 중..."
npm install

# 8. 데이터베이스 테이블 생성
echo "8. 데이터베이스 테이블 생성 중..."
npm run db:push

# 9. 프로덕션 빌드
echo "9. 프로덕션 빌드 중..."
npm run build

# 10. PM2 설치 및 서비스 등록
echo "10. PM2 프로세스 매니저 설정 중..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 기존 프로세스 중지 (있는 경우)
pm2 delete claim-management 2>/dev/null || echo "기존 프로세스가 없습니다."

# PM2로 애플리케이션 시작
pm2 start dist/index.js --name claim-management
pm2 startup
pm2 save

# 11. 방화벽 설정
echo "11. 방화벽 설정 중..."
sudo ufw allow 5000
sudo ufw --force enable

# 12. 시스템 서비스 등록 (선택사항)
echo "12. 시스템 서비스 등록 중..."
sudo tee /etc/systemd/system/claim-management.service > /dev/null << EOF
[Unit]
Description=Claim Management System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://claimuser:claim123456@localhost:5432/claim_management
Environment=SESSION_SECRET=claim-management-super-secret-key-2024
Environment=HOST=0.0.0.0
Environment=PORT=5000
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable claim-management

echo ""
echo "=== 배포 완료! ==="
echo ""
echo "접속 정보:"
echo "- 웹 애플리케이션: http://$(hostname -I | awk '{print $1}'):5000"
echo "- 로컬 접속: http://localhost:5000"
echo ""
echo "관리 명령어:"
echo "- PM2 상태 확인: pm2 status"
echo "- 로그 확인: pm2 logs claim-management"
echo "- 재시작: pm2 restart claim-management"
echo "- 중지: pm2 stop claim-management"
echo ""
echo "시스템 서비스 명령어:"
echo "- 상태 확인: sudo systemctl status claim-management"
echo "- 시작: sudo systemctl start claim-management"
echo "- 중지: sudo systemctl stop claim-management"
echo "- 재시작: sudo systemctl restart claim-management"
echo ""
echo "배포가 성공적으로 완료되었습니다!"