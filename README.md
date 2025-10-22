# 호스팅 만료일 추적 시스템

웹 에이전시를 위한 호스팅 관리 및 클라이언트 포털 시스템입니다.

## 주요 기능

### 관리자 기능
- ✅ 모든 사이트 및 클라이언트 관리
- ✅ 사이트별 호스팅 정보 등록 및 수정
- ✅ 만료일 추적 및 알림 대시보드
- ✅ 클라이언트 계정 생성 및 관리
- ✅ 호스팅 비용 통계 및 현황

### 클라이언트 기능
- ✅ 자신의 사이트 정보 조회
- ✅ 호스팅 비용 및 만료일 확인
- ✅ 만료 임박 알림
- ✅ 호스팅 상세 정보 확인

## 기술 스택

- **Frontend/Backend**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: 커스텀 JWT 기반 인증
- **UI**: Tailwind CSS
- **Language**: TypeScript

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 수정하여 데이터베이스 URL을 설정하세요:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hosting_tracker?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 마이그레이션을 실행하세요:

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# 초기 데이터 시드 (관리자 및 샘플 데이터 생성)
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 초기 계정

시드 스크립트 실행 후 다음 계정으로 로그인할 수 있습니다:

### 관리자 계정
- **이메일**: admin@example.com
- **비밀번호**: admin123

### 클라이언트 계정 1
- **이메일**: client1@example.com
- **비밀번호**: client123

### 클라이언트 계정 2
- **이메일**: client2@example.com
- **비밀번호**: client123

## 데이터베이스 스키마

### User (사용자)
- id, email, password, name, role (ADMIN/CLIENT)

### Site (사이트)
- id, name, domain, description, clientId

### HostingInfo (호스팅 정보)
- id, siteId, provider, plan, monthlyCost, yearlyTotal
- startDate, expiryDate, status, autoRenewal, notes

## 주요 페이지

- `/` - 홈 (자동 리다이렉트)
- `/login` - 로그인 페이지
- `/dashboard` - 대시보드 (역할에 따라 관리자/클라이언트 뷰)

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/register` - 사용자 등록 (관리자 전용)
- `GET /api/auth/me` - 현재 사용자 정보

### 사이트
- `GET /api/sites` - 사이트 목록 조회
- `POST /api/sites` - 사이트 생성
- `GET /api/sites/[id]` - 사이트 상세 조회
- `PATCH /api/sites/[id]` - 사이트 수정
- `DELETE /api/sites/[id]` - 사이트 삭제

### 호스팅 정보
- `POST /api/hosting` - 호스팅 정보 생성
- `PATCH /api/hosting/[id]` - 호스팅 정보 수정
- `DELETE /api/hosting/[id]` - 호스팅 정보 삭제

### 사용자
- `GET /api/users` - 사용자 목록 조회 (관리자 전용)

## 프로덕션 배포

### 1. 빌드

```bash
npm run build
```

### 2. 실행

```bash
npm start
```

### 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수를 설정해야 합니다:

- `DATABASE_URL`: PostgreSQL 데이터베이스 URL
- `NEXTAUTH_SECRET`: 강력한 랜덤 문자열 (예: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: 프로덕션 도메인 URL

## 보안 고려사항

1. **비밀번호**: bcrypt로 해시화하여 저장
2. **인증**: HTTP-only 쿠키 사용
3. **권한 관리**: 역할 기반 접근 제어 (RBAC)
4. **환경 변수**: 민감한 정보는 환경 변수로 관리

## 개발 도구

### Prisma Studio
데이터베이스를 시각적으로 관리하려면:

```bash
npx prisma studio
```

### 데이터베이스 리셋
개발 중 데이터베이스를 초기화하려면:

```bash
npx prisma migrate reset
```

## 라이센스

MIT

## 지원

문의사항이 있으시면 관리자에게 연락하세요.
