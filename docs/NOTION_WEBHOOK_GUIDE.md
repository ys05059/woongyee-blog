# Notion Webhook 설정 가이드

이 가이드는 Notion에서 페이지가 업데이트될 때 자동으로 블로그 콘텐츠를 재검증하는 webhook 시스템을 설정하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [환경 변수 설정](#환경-변수-설정)
3. [Notion Integration Webhook 설정](#notion-integration-webhook-설정)
4. [테스트 및 확인](#테스트-및-확인)
5. [문제 해결](#문제-해결)

---

## 개요

### 작동 원리

```
Notion 페이지 업데이트
  → Notion Webhook 트리거
  → /api/webhook/notion 호출
  → 페이지 ID로 slug 조회
  → /api/revalidate 호출
  → 해당 블로그 포스트 캐시 갱신
```

### 장점

- **실시간 업데이트**: Notion에서 콘텐츠를 수정하면 즉시 블로그에 반영
- **자동화**: 수동으로 재배포하거나 캐시를 지울 필요 없음
- **효율적**: 변경된 페이지만 선택적으로 재검증

---

## 환경 변수 설정

### 1. 필수 환경 변수

프로젝트 루트의 `.env.local` 파일에 다음 변수들을 추가하세요:

```bash
# 기존 필수 변수들
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 선택적 환경 변수

보안을 강화하려면 webhook 서명 검증을 활성화하세요:

```bash
# Webhook 서명 검증용 (선택사항이지만 권장)
# Notion webhook 생성 시 제공되는 verification token 사용
NOTION_WEBHOOK_SECRET=your_verification_token_here
```

**중요**: `NOTION_WEBHOOK_SECRET`은 Notion Integration의 `NOTION_API_KEY`와 다릅니다:
- `NOTION_API_KEY`: Integration의 Secret Key - API 호출에 사용
- `NOTION_WEBHOOK_SECRET`: Webhook의 Verification Token - webhook 요청 검증에 사용

### NOTION_WEBHOOK_SECRET 획득 방법

Notion webhook을 생성할 때 자동으로 제공되는 verification token을 사용합니다. 별도로 생성할 필요가 없으며, Notion Integration 설정 페이지의 webhook 섹션에서 확인할 수 있습니다.

---

## Notion Integration Webhook 설정

### Step 1: Notion Integration 페이지 접속

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. 기존에 사용 중인 Integration을 선택 (또는 새로 생성)

### Step 2: Capabilities 확인

**Capabilities** 섹션에서 다음 권한이 활성화되어 있는지 확인:

- ✅ **Read content**: 페이지 내용을 읽을 수 있는 권한
- ✅ **Read user information** (선택사항): 작성자 정보 읽기

### Step 3: Webhook 추가

#### 3-1. Webhooks 섹션으로 이동

Integration 설정 페이지 하단의 **Webhooks** 섹션을 찾습니다.

#### 3-2. Webhook 생성

**Add webhook** 버튼을 클릭하고 다음 정보를 입력:

##### Endpoint URL
```
https://yourdomain.com/api/webhook/notion
```

- **로컬 개발**: 로컬에서 테스트하려면 [ngrok](https://ngrok.com/)이나 [localtunnel](https://localtunnel.github.io/www/) 같은 터널링 서비스 사용
  ```bash
  # ngrok 사용 예시
  ngrok http 3000
  # 생성된 URL 사용: https://abc123.ngrok.io/api/webhook/notion
  ```

##### Event Subscriptions

다음 이벤트들을 선택 (모두 권장):

- ✅ **Page created**: 새 페이지가 생성될 때
- ✅ **Page content updated**: 페이지 내용이 업데이트될 때
- ✅ **Page deleted**: 페이지가 삭제될 때

**참고**: Notion UI에서는 "Page updated"라는 단일 옵션으로 표시될 수 있습니다. 이 경우 해당 옵션을 선택하면 생성/수정/삭제 이벤트를 모두 받을 수 있습니다.

##### Event Filter

webhook 생성 후, 특정 데이터베이스의 이벤트만 받도록 설정:

1. Webhook 설정 화면에서 **Filter** 섹션 찾기
2. **Add filter** 클릭
3. 블로그 데이터베이스를 선택

이렇게 하면 블로그 데이터베이스의 페이지만 webhook을 트리거합니다.

##### Verification Token (권장)

보안을 위해 webhook 서명 검증 활성화:

1. Webhook 생성 시 Notion이 자동으로 **verification token** 생성
2. 이 token을 복사
3. `.env.local` 파일에 `NOTION_WEBHOOK_SECRET`로 저장

**중요**: 이 토큰은 Notion Integration의 API Key와는 다른 별도의 값입니다. Webhook 요청을 HMAC-SHA256으로 검증하는데 사용됩니다.

#### 3-3. Webhook 저장

**Save** 버튼을 클릭하여 webhook을 활성화합니다.

### Step 4: Integration을 데이터베이스에 연결

webhook이 작동하려면 Integration이 데이터베이스에 연결되어 있어야 합니다:

1. Notion에서 블로그 데이터베이스 페이지 열기
2. 우측 상단 **⋯** (더보기) 메뉴 클릭
3. **Connections** → **Add connections** 선택
4. 생성한 Integration 선택

---

## 테스트 및 확인

### 1. Webhook 엔드포인트 상태 확인

브라우저나 curl로 GET 요청:

```bash
curl https://yourdomain.com/api/webhook/notion
```

**예상 응답:**
```json
{
  "status": "ok",
  "configured": true,
  "message": "Notion webhook endpoint is ready.",
  "requiredEnvVars": {
    "NOTION_API_KEY": true,
    "NOTION_WEBHOOK_SECRET": true
  }
}
```

### 2. 실제 업데이트 테스트

#### 테스트 1: 페이지 수정 (page_content_updated)

1. Notion 블로그 데이터베이스에서 **Published** 상태의 포스트 선택
2. 제목이나 내용을 수정하고 저장
3. Vercel 로그 확인 (Vercel 대시보드 → Logs 탭):
   ```
   Signature verification: { match: true }
   Received Notion webhook: { type: "page.content_updated", ... }
   Page content updated: <page_id>
   Page <page_id>: Status = Published, Published = true
   Processing published page: your-post-slug
   Successfully revalidated /blog/your-post-slug
   Successfully revalidated posts tag
   Webhook processing complete: 1 successful, 0 skipped (Draft), 0 failed
   ```
4. 블로그 페이지에서 변경사항 즉시 반영 확인

#### 테스트 2: Draft 상태 편집 (Skip 확인)

1. Notion에서 **Draft** 상태의 페이지 선택
2. 내용 수정
3. Vercel 로그 확인:
   ```
   Page content updated: <page_id>
   Page <page_id>: Status = Draft, Published = false
   Page <page_id> is not published (Draft) - skipping revalidation
   Webhook processing complete: 0 successful, 1 skipped (Draft), 0 failed
   ```
4. **재검증되지 않음** - Vercel Function 호출 최소화 ✅

#### 테스트 3: Draft → Published 전환

1. Draft 페이지의 Status를 "Published"로 변경
2. Vercel 로그 확인:
   ```
   Page properties updated: <page_id>
   Page <page_id>: Status = Published, Published = true
   Processing published page: new-post-slug
   Successfully revalidated /blog/new-post-slug
   ```
3. 블로그 목록에 새 포스트 나타남

#### 테스트 4: 페이지 삭제 (page_deleted)

1. Notion 블로그 데이터베이스에서 테스트 페이지 삭제
2. Vercel 로그 확인:
   ```
   Page deleted: <page_id> - revalidating blog list
   Successfully revalidated posts tag
   ```
3. 블로그 목록에서 해당 포스트 제거됨

### 3. 로컬 개발 환경에서 테스트

로컬에서 테스트하려면:

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 다른 터미널에서 ngrok 실행
ngrok http 3000

# 3. ngrok URL을 Notion webhook 설정에 입력
# 예: https://abc123.ngrok.io/api/webhook/notion

# 4. Notion에서 페이지 업데이트
# 5. 로컬 서버 콘솔에서 로그 확인
```

---

## 문제 해결

### Webhook이 트리거되지 않음

**원인과 해결책:**

1. **Integration이 데이터베이스에 연결되지 않음**
   - Notion 데이터베이스 → Connections → Integration 추가

2. **Event Filter가 잘못 설정됨**
   - Webhook 설정에서 올바른 데이터베이스가 선택되었는지 확인

3. **Webhook URL이 잘못됨**
   - HTTPS 사용 확인 (HTTP는 작동하지 않음)
   - 엔드포인트 경로 확인: `/api/webhook/notion`

### 401 Unauthorized 에러

**원인과 해결책:**

1. **Webhook Verification Token 불일치**
   - Notion webhook 설정에서 제공된 verification token
   - `.env.local`의 `NOTION_WEBHOOK_SECRET`
   - 두 값이 정확히 일치하는지 확인 (HMAC-SHA256 검증 사용)

2. **헤더 이름 오류**
   - Notion은 `X-Notion-Signature` 헤더로 서명 전송
   - 코드에서 올바른 헤더명 사용 확인

3. **Secret을 설정했지만 환경 변수가 없음**
   - 환경 변수를 설정하지 않으면 서명 검증을 건너뜀 (권장하지 않음)
   - 프로덕션에서는 반드시 설정 권장

### 500 Internal Server Error

**원인과 해결책:**

1. **환경 변수 누락**
   - GET 요청으로 `/api/webhook/notion` 확인
   - 모든 필수 환경 변수가 `true`인지 확인

2. **NOTION_API_KEY 누락**
   - `.env.local`에 `NOTION_API_KEY` 추가
   - 프로덕션 환경에도 설정 확인 (Vercel 환경 변수 등)

### Revalidation 실패

**서버 로그에서 확인:**

```
Revalidation error: ...
```

**원인과 해결책:**

1. **Slug를 찾을 수 없음**
   - 페이지에 slug 속성이 있는지 확인
   - Slug가 비어있지 않은지 확인
   - `blog.config.ts`의 `propertyMapping.slug` 설정 확인

2. **페이지가 발행되지 않음**
   - Status가 "Published"인지 확인
   - `blog.config.ts`의 `publishedStatus` 설정 확인

### 로그 확인 방법

#### Vercel
1. Vercel 대시보드 → 프로젝트 선택
2. **Logs** 탭 클릭
3. 실시간 로그 또는 필터링된 로그 확인

#### 로컬 개발
터미널에서 `npm run dev`를 실행한 콘솔 출력 확인

---

## 추가 정보

### Webhook 이벤트 구조

Notion이 전송하는 webhook 이벤트 예시:

#### 페이지 생성 이벤트
```json
{
  "events": [
    {
      "type": "page_created",
      "page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "workspace_id": "12345678-90ab-cdef-1234-567890abcdef"
    }
  ]
}
```

#### 페이지 업데이트 이벤트
```json
{
  "events": [
    {
      "type": "page_content_updated",
      "page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "workspace_id": "12345678-90ab-cdef-1234-567890abcdef"
    }
  ]
}
```

#### 페이지 삭제 이벤트
```json
{
  "events": [
    {
      "type": "page_deleted",
      "page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "workspace_id": "12345678-90ab-cdef-1234-567890abcdef"
    }
  ]
}
```

**참고**: 여러 이벤트가 동시에 발생하면 `events` 배열에 여러 항목이 포함될 수 있습니다.

### 보안 고려사항

1. **Verification Token 사용**: HMAC-SHA256 서명 검증으로 외부의 악의적인 요청 방지
2. **HTTPS 필수**: Notion은 HTTPS 엔드포인트만 지원
3. **Rate Limiting**: 필요시 webhook 엔드포인트에 rate limiting 추가 고려
4. **환경 변수 보안**:
   - `NOTION_WEBHOOK_SECRET`는 절대 코드에 하드코딩하지 말 것
   - Git에 커밋하지 않도록 `.env.local`은 `.gitignore`에 추가
5. **서명 검증**: 프로덕션 환경에서는 반드시 서명 검증 활성화 권장

### 성능 최적화

- **Draft 필터링**: Published가 아닌 페이지는 재검증 skip → Vercel Function 호출 최소화 🚀
- **선택적 재검증**: 변경된 페이지만 재검증
- **태그 기반 재검증**: `posts` 태그로 목록 페이지 일괄 갱신
- **이벤트별 최적화**:
  - `page.created`, `page.content_updated`, `page.properties_updated`: Published면 특정 페이지 + 목록 재검증
  - Draft 상태면 skip (로그만 출력)
  - `page.deleted`: 목록만 재검증
- **직접 호출 방식**: HTTP 요청 대신 `revalidatePath`/`revalidateTag` 직접 호출 → Deployment Protection 우회
- **캐시 전략**: `blog.config.ts`의 `revalidate` 설정으로 기본 캐시 시간 조정
- **병렬 처리**: 여러 이벤트 동시 처리

---

## 참고 자료

- [Notion API 문서](https://developers.notion.com/)
- [Next.js On-Demand Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
- [Notion Webhooks 가이드](https://developers.notion.com/docs/webhooks)

---

**문제가 계속되면 GitHub Issues에서 도움을 요청하세요!**
