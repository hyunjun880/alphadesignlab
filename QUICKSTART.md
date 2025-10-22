# 빠른 시작 가이드 ⚡

이 가이드는 5분 안에 프로젝트를 실행할 수 있도록 도와줍니다.

## 로컬 개발 환경 (5분)

### 1. 저장소 클론
```bash
git clone https://github.com/hyunjun880/alphadesignlab.git
cd alphadesignlab
git checkout claude/hosting-expiry-tracker-011CUMxfhbma2WYre2pnZTf6
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 데이터베이스 준비

#### 옵션 A: Docker (권장)
```bash
# PostgreSQL 컨테이너 실행
docker run --name hosting-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=hosting_tracker \
  -p 5432:5432 \
  -d postgres:15

# .env 파일 생성
cp .env.example .env
# DATABASE_URL은 이미 설정되어 있음
```

#### 옵션 B: 로컬 PostgreSQL
```bash
# PostgreSQL 설치 후
createdb hosting_tracker

# .env 파일 수정
DATABASE_URL="postgresql://localhost:5432/hosting_tracker?schema=public"
```

### 4. 데이터베이스 설정
```bash
# 마이그레이션 실행
npx prisma migrate dev --name init

# 초기 데이터 생성
npm run db:seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

### 6. 브라우저에서 확인
http://localhost:3000

**로그인 계정:**
- 관리자: admin@example.com / admin123
- 클라이언트: client1@example.com / client123

## Vercel 배포 (10분)

### 1. Neon 데이터베이스 생성
1. [Neon](https://neon.tech) 가입
2. New Project 클릭
3. 프로젝트 이름: `hosting-tracker`
4. Connection string 복사

### 2. Vercel 배포
1. [Vercel](https://vercel.com) 가입
2. "Add New Project" 클릭
3. GitHub 저장소 연동: `hyunjun880/alphadesignlab`
4. 브랜치 선택: `claude/hosting-expiry-tracker-011CUMxfhbma2WYre2pnZTf6`

### 3. 환경 변수 설정
Vercel 프로젝트 설정에서:

```
DATABASE_URL = [Neon에서 복사한 연결 문자열]
NEXTAUTH_SECRET = [아래 명령어로 생성]
NEXTAUTH_URL = [Vercel이 제공하는 URL]
```

비밀 키 생성:
```bash
openssl rand -base64 32
```

또는 온라인: https://generate-secret.vercel.app/32

### 4. 배포 및 마이그레이션
```bash
# 로컬에서 프로덕션 DB에 마이그레이션
DATABASE_URL="[Neon 연결 문자열]" npx prisma migrate deploy

# 초기 데이터 생성
DATABASE_URL="[Neon 연결 문자열]" npm run db:seed
```

### 5. 완료!
Vercel 대시보드에서 배포된 URL로 접속

## 문제 해결

### "Can't reach database server"
```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# 데이터베이스 연결 테스트
npx prisma db push
```

### "Module not found"
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

## 다음 단계

- 📖 [전체 README](./README.md) - 상세 문서
- 🚀 [배포 가이드](./DEPLOYMENT.md) - Vercel 배포 상세
- 🔧 개발자 도구: `npx prisma studio` - 데이터베이스 GUI

## 도움이 필요하신가요?

이슈 생성: https://github.com/hyunjun880/alphadesignlab/issues
