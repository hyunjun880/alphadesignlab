# Vercel 배포 가이드

이 가이드는 호스팅 만료일 추적 시스템을 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

1. [Vercel 계정](https://vercel.com) 생성
2. PostgreSQL 데이터베이스 준비 (아래 옵션 중 선택)
   - [Neon](https://neon.tech) (무료 플랜 제공, 권장)
   - [Supabase](https://supabase.com) (무료 플랜 제공)
   - [Railway](https://railway.app)
   - [Heroku Postgres](https://www.heroku.com/postgres)

## 1단계: PostgreSQL 데이터베이스 생성

### Neon 사용 (권장)

1. [Neon](https://neon.tech)에 가입
2. 새 프로젝트 생성
3. 데이터베이스 연결 문자열 복사
   - 형식: `postgresql://user:password@host/database?sslmode=require`

### Supabase 사용

1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. Settings > Database > Connection String > URI 복사
   - "Session pooler" 모드 선택
   - 연결 문자열 복사

## 2단계: Vercel에 프로젝트 배포

### 방법 1: GitHub 연동 (권장)

1. GitHub에 코드 푸시 (이미 완료됨)
2. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
3. "Add New" > "Project" 클릭
4. GitHub 저장소 선택: `hyunjun880/alphadesignlab`
5. 브랜치 선택: `claude/hosting-expiry-tracker-011CUMxfhbma2WYre2pnZTf6`

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel
```

## 3단계: 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가하세요:

### Settings > Environment Variables

1. **DATABASE_URL**
   - Value: PostgreSQL 연결 문자열
   - 예: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require`

2. **NEXTAUTH_SECRET**
   - Value: 강력한 랜덤 문자열
   - 생성 방법: `openssl rand -base64 32` 실행
   - 또는 온라인 생성기: https://generate-secret.vercel.app/32

3. **NEXTAUTH_URL**
   - Value: Vercel 배포 URL
   - 예: `https://your-project.vercel.app`
   - 커스텀 도메인 사용 시 해당 도메인 입력

### 환경 변수 설정 예시

```
DATABASE_URL = postgresql://neondb_owner:xxx@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET = your-generated-secret-key-here
NEXTAUTH_URL = https://alphadesignlab.vercel.app
```

> **중요**: 모든 환경 변수를 "Production", "Preview", "Development" 모두에 체크하세요.

## 4단계: 데이터베이스 마이그레이션

환경 변수 설정 후 로컬에서 프로덕션 데이터베이스에 마이그레이션을 실행하세요:

```bash
# .env 파일에 프로덕션 DATABASE_URL 임시 설정
DATABASE_URL="your-production-database-url"

# 마이그레이션 실행
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate

# 초기 데이터 시드 (선택)
npm run db:seed
```

또는 Vercel에서 직접 실행:

1. Vercel 프로젝트 > Settings > Functions
2. "Bash" 탭에서 다음 명령어 실행:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

## 5단계: 배포 확인

1. Vercel 대시보드에서 "Deploy" 버튼 클릭 또는 GitHub에 푸시
2. 배포가 완료되면 URL 클릭하여 확인
3. `/login` 페이지로 이동하여 로그인 테스트

### 초기 로그인 계정

시드 데이터를 실행했다면:
- **관리자**: admin@example.com / admin123
- **클라이언트 1**: client1@example.com / client123
- **클라이언트 2**: client2@example.com / client123

## 6단계: 커스텀 도메인 설정 (선택)

1. Vercel 프로젝트 > Settings > Domains
2. 도메인 추가 (예: hosting.yourdomain.com)
3. DNS 레코드 설정 (Vercel이 안내)
4. `NEXTAUTH_URL` 환경 변수를 새 도메인으로 업데이트

## 문제 해결

### 1. 데이터베이스 연결 오류

```
Error: P1001: Can't reach database server
```

**해결 방법:**
- DATABASE_URL이 올바른지 확인
- 데이터베이스가 외부 연결을 허용하는지 확인
- SSL 모드 확인: `?sslmode=require` 추가

### 2. Prisma Client 생성 오류

```
Error: @prisma/client did not initialize yet
```

**해결 방법:**
- `postinstall` 스크립트가 package.json에 있는지 확인
- Vercel에서 재배포

### 3. 환경 변수 미적용

**해결 방법:**
- Vercel 대시보드에서 환경 변수 확인
- "Production", "Preview", "Development" 모두 체크되었는지 확인
- 재배포

### 4. 마이그레이션 오류

```
Error: Migration failed
```

**해결 방법:**
```bash
# 로컬에서 프로덕션 DB에 직접 연결하여 마이그레이션
DATABASE_URL="production-db-url" npx prisma migrate deploy
```

## 배포 후 할 일

1. **초기 관리자 계정 생성**
   - 시드 데이터 실행 또는 수동 생성
   - 기본 비밀번호 변경

2. **보안 설정**
   - 강력한 NEXTAUTH_SECRET 사용
   - HTTPS 강제 (Vercel 자동)
   - 환경 변수 보안 관리

3. **모니터링 설정**
   - Vercel Analytics 활성화
   - 에러 로깅 설정

4. **백업 설정**
   - 데이터베이스 자동 백업 설정 (Neon/Supabase 제공)

## Vercel 빌드 설정

프로젝트가 자동으로 감지하지만, 필요시 수동 설정:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 성능 최적화

1. **Edge Functions** (선택)
   - API Routes를 Edge Runtime으로 변경 가능
   - 더 빠른 응답 속도

2. **이미지 최적화**
   - Next.js Image 컴포넌트 사용 (자동)

3. **캐싱**
   - Vercel이 자동으로 처리

## 비용 고려사항

### 무료 플랜

- **Vercel**: Hobby 플랜 무료
  - 무제한 배포
  - 100GB 대역폭/월
  - Serverless Functions

- **Neon**: 무료 플랜
  - 0.5 CPU
  - 1 프로젝트
  - 10GB 스토리지

### 프로덕션 권장

- **Vercel Pro**: $20/월
- **Neon Scale**: $19/월 (사용량 기반)

## 자동 배포 설정

GitHub 연동 시 자동 배포:
- `main` 브랜치 푸시 → 프로덕션 배포
- 다른 브랜치 푸시 → 프리뷰 배포

## 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Prisma Vercel 가이드](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon 문서](https://neon.tech/docs/introduction)

## 지원

배포 중 문제가 발생하면:
1. Vercel 로그 확인
2. Database 연결 테스트
3. 환경 변수 재확인
