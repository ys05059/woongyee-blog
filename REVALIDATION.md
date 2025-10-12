# 캐시 갱신 (Revalidation) 가이드

Notion에서 블로그 포스트를 수정했을 때 즉시 반영하는 방법을 설명합니다.

## 🔄 캐시 갱신 방법

### 1. ISR (Incremental Static Regeneration) - 자동 갱신

설정된 시간마다 자동으로 캐시를 갱신합니다.

**설정 위치:** `blog.config.ts`
```typescript
revalidate: {
  posts: 3600,     // 1시간 (포스트 상세 페이지)
  postList: 3600,  // 1시간 (포스트 목록 페이지)
}
```

**동작 방식:**
- 사용자가 페이지를 방문할 때 캐시가 만료되었으면 백그라운드에서 재생성
- 첫 번째 사용자는 오래된 캐시를 보지만, 이후 사용자는 새로운 내용을 봄

**장점:** 자동화, 서버 부담 적음
**단점:** 즉시 반영 안 됨 (최대 revalidate 시간만큼 지연)

---

### 2. On-Demand Revalidation - 수동 갱신

API를 호출하여 즉시 캐시를 갱신합니다.

#### 설정

1. `.env.local`에 토큰 설정:
```bash
REVALIDATE_TOKEN=your_secret_token_here
```

2. 토큰 생성 (터미널):
```bash
openssl rand -base64 32
```

#### 사용법

**curl로 호출:**
```bash
# 특정 경로 갱신
curl -X POST http://your-domain.com/api/revalidate \
  -H "x-revalidate-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/blog"}'

# 전체 갱신
curl -X POST http://your-domain.com/api/revalidate \
  -H "x-revalidate-token: YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**코드에서 호출:**
```typescript
import { triggerRevalidation } from '@/lib/utils';

// 특정 경로 갱신
await triggerRevalidation('/blog', process.env.REVALIDATE_TOKEN);

// 특정 포스트 갱신
await triggerRevalidation('/blog/my-post-slug', process.env.REVALIDATE_TOKEN);
```

---

### 3. Notion Webhook 연동 (권장)

Notion에서 콘텐츠가 변경될 때 자동으로 갱신되도록 설정할 수 있습니다.

#### 설정 단계

1. **Notion Integration 설정**
   - [Notion Integrations](https://www.notion.so/my-integrations) 접속
   - 해당 Integration 선택
   - "Capabilities" → "Webhook" 활성화

2. **Webhook URL 설정**
   ```
   https://your-domain.com/api/revalidate
   ```

3. **Headers 추가**
   ```
   x-revalidate-token: YOUR_REVALIDATE_TOKEN
   ```

4. **Subscribe to events**
   - `database.content_updated` ✅
   - `page.created` ✅
   - `page.updated` ✅

#### Webhook 페이로드 예시
```json
{
  "event": "page.updated",
  "page_id": "..."
}
```

---

## 🛠️ 개발 환경에서 테스트

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. API 상태 확인
```bash
curl http://localhost:3000/api/revalidate
```

**응답 예시:**
```json
{
  "status": "ok",
  "configured": true,
  "message": "Revalidation API is ready..."
}
```

### 3. 수동 갱신 테스트
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-revalidate-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/"}'
```

---

## 🚀 프로덕션 배포

### Vercel에서 환경변수 설정

1. Vercel 프로젝트 → Settings → Environment Variables
2. `REVALIDATE_TOKEN` 추가
3. Production, Preview, Development 모두 체크
4. Save

### 갱신 확인
```bash
curl https://your-domain.com/api/revalidate
```

---

## 💡 권장 전략

### 개발 단계
- ISR 시간: 짧게 (60초 ~ 300초)
- On-Demand: 개발 중 즉시 확인용

### 프로덕션
- ISR 시간: 3600초 (1시간)
- Notion Webhook: 즉시 갱신용
- On-Demand: 긴급 수정용

---

## 🔐 보안 주의사항

1. **토큰 노출 금지**
   - `.env.local`은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 `.env*.local` 포함 확인

2. **강력한 토큰 사용**
   ```bash
   # 안전한 랜덤 토큰 생성
   openssl rand -base64 32
   ```

3. **HTTPS 사용**
   - 프로덕션에서는 반드시 HTTPS 사용
   - HTTP에서는 토큰이 평문으로 전송됨

---

## 🐛 문제 해결

### "Invalid token" 에러
- `.env.local`의 `REVALIDATE_TOKEN` 확인
- 요청 헤더의 토큰 값 확인
- 공백이나 특수문자 인코딩 문제 확인

### 갱신이 안 됨
- ISR 시간 확인 (`blog.config.ts`)
- Vercel 로그 확인
- 캐시 완전 삭제 후 재시도

### Webhook이 작동 안 함
- Notion Integration 권한 확인
- Webhook URL이 HTTPS인지 확인
- Notion Integration 로그 확인
