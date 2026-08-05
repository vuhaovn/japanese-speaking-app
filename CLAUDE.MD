# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong dự án này. Đọc kỹ trước khi sinh code.

## Tổng quan dự án

Web app **luyện NÓI tiếng Nhật** cho người học trình độ **N3–N2**.
Trọng tâm là kỹ năng nói (không phải đọc/viết), theo vòng lặp cốt lõi:
**nghe mẫu → nói theo → tự nghe lại giọng mình → so sánh → lặp lại.**

Ba chế độ luyện tập hiện hoạt động:
1. **Shadowing** — nghe và lặp lại tức thì, bám nhịp và ngữ điệu. *(✅ DONE)*
2. **Nghe & nói lại** — có nhịp nghỉ để lặp từng câu, ghi âm + nhận dạng giọng. *(✅ DONE)*
3. **Roleplay hội thoại** — hội thoại theo kịch bản scripted (5 tình huống), không dùng LLM. *(✅ DONE)*

> Tab **Cao độ (高低アクセント)** đã bị xoá — dữ liệu pitch accent thật chưa có, hiển thị fake data gây hiểu nhầm.

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Ngôn ngữ:** TypeScript strict
- **Hosting:** Vercel (tự deploy qua Git push lên `main`)
- **Database:** Postgres trên **Neon** (serverless)
- **DB access:** Drizzle ORM + `@neondatabase/serverless` (driver HTTP, hợp với môi trường serverless của Vercel)
- **Styling:** Tailwind CSS + custom CSS classes trong `globals.css` (không có dark mode — thiết kế cố định)
- **TTS:** Google Cloud Text-to-Speech API (Neural2) qua route `/api/tts` — fallback về Web Speech API nếu `GOOGLE_TTS_API_KEY` chưa cấu hình
- **Ghi âm:** MediaRecorder + SpeechRecognition (client-side)

## Lệnh thường dùng

```bash
npm run dev            # chạy dev server (thường localhost:3000, hoặc 3001 nếu 3000 bị chiếm)
npm run build          # build production
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit (chạy trước khi commit)

# Database (Drizzle)
npm run db:generate    # sinh migration từ schema
npm run db:migrate     # áp migration lên Neon
npm run db:seed        # seed câu luyện vào DB (xóa rồi insert lại)
npm run db:studio      # mở Drizzle Studio xem dữ liệu
```

> `drizzle.config.ts` dùng `loadEnvConfig` từ `@next/env` để tải `.env.local` khi chạy CLI — không cần export thủ công.

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `GOOGLE_TTS_API_KEY` | Tuỳ chọn | Google Cloud TTS Neural2. Nếu thiếu, app fallback về Web Speech API |

## Ràng buộc trình duyệt — RẤT QUAN TRỌNG

Các API giọng nói **chỉ chạy ở phía client**. Tuân thủ nghiêm để tránh lỗi build/runtime:

- **Mọi component dùng `SpeechRecognition`, `MediaRecorder`, `AudioContext` phải là Client Component** (`'use client'`). Không bao giờ gọi các API này trong Server Component, Server Action, hay route handler.
- **`SpeechRecognition` chỉ hỗ trợ tốt trên Chrome/Edge** — dùng `window.SpeechRecognition ?? window.webkitSpeechRecognition`. Luôn **feature-detect** và có fallback rõ ràng.
- **TTS** nay dùng Google Cloud qua fetch (`/api/tts`) — trả về MP3 blob, play bằng `new Audio()`. Không còn dùng `window.speechSynthesis` trực tiếp trong component (chỉ dùng làm fallback bên trong `tts.ts`).
- **`MediaRecorder`**: cần quyền micro (`getUserMedia`) — luôn bọc `try/catch`. Gọi `stream.getTracks().forEach(t => t.stop())` khi dừng để tắt đèn micro.
- **`window`/`navigator` không tồn tại khi SSR.** Truy cập trong `useEffect` hoặc sau khi kiểm tra `typeof window !== 'undefined'`.

## Design System

Thiết kế dựa trên file tham chiếu `src/html-layout/japanese-speaking-practice.html`. Tuân thủ khi thêm UI mới.

### Design tokens (định nghĩa trong `globals.css`)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#e9edf2` | Background toàn trang |
| `--surface` | `#ffffff` | Card, tabs, settings |
| `--ink` | `#17233c` | Text chính, nút primary |
| `--ink-soft` | `#5a667f` | Text phụ, label |
| `--line` | `#d7dce4` | Border, divider |
| `--accent` | `#d64933` | Nút ghi âm, cảnh báo |
| `--accent-soft` | `#f7ded8` | Background error message |
| `--good` | `#2f7d64` | Trạng thái khớp / đúng / câu đã luyện |
| `--good-soft` | `#dcefe8` | Background feedback tốt |
| `--radius` | `14px` | Border-radius mặc định |
| `--jp-serif` | Yu Mincho / Hiragino / fallback serif | Văn bản tiếng Nhật |

**Không có dark mode.** Thiết kế dùng màu cố định.

### CSS classes chính (dùng trực tiếp trong JSX)

- `.card` — white surface, border, shadow nhẹ, `border-radius: var(--radius)`
- `.btn` — nút cơ bản (border, surface background)
- `.btn-primary` — nút tối (`--ink` background, trắng text)
- `.btn-rec` — nút ghi âm (`--accent` background); thêm class `recording` để kích hoạt animation pulse
- `.tabs` / `.tab` / `.tab.active` — tab bar trong pill trắng (3 tabs: Shadowing, Nghe & nói lại, Roleplay)
- `.jp` — text tiếng Nhật (font serif, 27px, letter-spacing)
- `.meaning` / `.meaning.hidden` — nghĩa tiếng Việt (có thể blur)
- `.heard` / `.warn` — feedback sau ghi âm
- `.settings` / `.row` — panel cài đặt
- `.dot` / `.dot.on` / `.dot.done` — progress dots (xám / đỏ hiện tại / xanh đã luyện); click để nhảy tới câu đó
- `.kbd-hint` / `.kbd` — gợi ý phím tắt ở cuối card

### Layout tổng thể

Trang chính (`/`) là **single-page với 3 tabs**: Shadowing | Nghe & nói lại | Roleplay.
Toàn bộ logic nằm trong `PracticeApp.tsx` — không dùng nhiều route riêng cho từng chế độ.

## Cấu trúc thư mục (thực tế hiện tại)

```
src/
  app/
    page.tsx              # Server Component, fetch sentences từ DB, render PracticeApp
                          # export const dynamic = 'force-dynamic' — bắt buộc để không cache
    actions.ts            # Server Actions: logSession, getSessionProgress, addSentence,
                          #   updateSentence, deleteSentence
    layout.tsx            # metadata, font Geist
    globals.css           # design tokens + custom CSS classes
    add/
      page.tsx            # Form thêm câu luyện mới → /add
    manage/
      page.tsx            # Danh sách câu luyện + Edit/Delete → /manage
      DeleteButton.tsx    # 'use client' — nút xoá câu với confirm dialog
      [id]/
        page.tsx          # Server Component fetch câu theo id, render EditForm
        EditForm.tsx      # 'use client' — form sửa câu luyện
    api/
      tts/
        route.ts          # GET /api/tts?text=...&rate=...&voice=... → MP3 từ Google Cloud TTS
  components/
    practice/
      PracticeApp.tsx     # 'use client' — toàn bộ app (tabs, state, TTS, recorder)
      RoleplayTab.tsx     # 'use client' — tab hội thoại kịch bản
  hooks/
    useSessionKey.ts      # trả về UUID từ localStorage (anonymous tracking, không cần auth)
  data/
    sentences.ts          # 10 câu N3-N2 cũ — CHỈ dùng bởi legacy routes (không dùng ở trang chính)
    roleplay-scenarios.ts # 5 kịch bản roleplay hardcode — xem hướng dẫn thêm kịch bản bên dưới
  lib/
    speech/
      tts.ts              # speak(), stopSpeech(), isSpeechAvailable()
                          # Gọi /api/tts để lấy MP3, fallback về Web Speech API nếu lỗi
      recorder.ts         # startRecording(), isRecordingSupported()
    db/
      schema.ts           # Drizzle schema: sentences + practice_sessions
      index.ts            # kết nối Neon: neon() + drizzle()
      seed.ts             # câu luyện N3-N2 — chạy: npm run db:seed
      migrations/         # SQL migrations (tự generate, không sửa tay)
  types/
    speech-recognition.d.ts  # type stubs cho SpeechRecognition / webkitSpeechRecognition
  html-layout/
    japanese-speaking-practice.html  # file tham chiếu thiết kế — KHÔNG XÓA
drizzle.config.ts         # cấu hình Drizzle Kit (dùng loadEnvConfig để đọc .env.local)
```

## Database (Neon + Drizzle)

- Connection string đọc từ `process.env.DATABASE_URL` (Neon pooled connection). **Không hardcode.**
- Dùng driver `@neondatabase/serverless` cho serverless của Vercel; không giữ connection pool long-lived.
- Sửa schema ở `lib/db/schema.ts` rồi chạy `db:generate` + `db:migrate`, **không sửa SQL migration bằng tay**.

### Schema hiện tại (đã migrate và đang dùng)

```ts
// sentences
id serial PK, jp text, kana text, meaning_vi text,
level varchar(2), method text[], pitch jsonb (H/L[] | null),
grammar_point text, created_at timestamp

// practice_sessions
id serial PK, session_key varchar(64), sentence_id int FK→sentences,
mode varchar(20),   // 'shadow' | 'repeat'
match_score int,    // Levenshtein similarity 0-100, null cho shadow
created_at timestamp
```

> Cột `pitch` trong `sentences` vẫn tồn tại trong schema (cho furigana / pitch accent tương lai) nhưng không hiển thị trên UI hiện tại. Tất cả các câu hiện có `pitch = null`.

Chưa có bảng `users` hay `progress` — dùng `session_key` (localStorage UUID) để track anonymous.

## Quản lý câu luyện (CRUD)

Truy cập từ trang chính → Cài đặt → **"Quản lý câu luyện"** → `/manage`.

- **Thêm câu:** `/add` — điền JP, kana (tuỳ chọn, fallback về JP), nghĩa Việt, cấp độ, ngữ pháp
- **Sửa câu:** `/manage/[id]` — form pre-fill sẵn dữ liệu
- **Xoá câu:** nút Xoá trên `/manage` — có confirm dialog, xoá cascade cả `practice_sessions`

## Thêm kịch bản Roleplay

Roleplay scenarios được hardcode trong `src/data/roleplay-scenarios.ts`. **Không lưu trong DB.**

### Cách thêm kịch bản mới

1. Mở `src/data/roleplay-scenarios.ts`
2. Thêm một object mới vào mảng `SCENARIOS`:

```ts
{
  id: 'ten-id-duy-nhat',       // snake_case, không trùng với kịch bản khác
  title_jp: '郵便局で荷物を送る',  // tiêu đề tiếng Nhật
  title_vi: 'Gửi bưu kiện ở bưu điện',
  npc_label: '局員',            // vai NPC (hiển thị trên badge)
  user_label: 'お客様',          // vai người dùng
  setting_vi: 'Bạn cần gửi một gói hàng về Việt Nam.',
  turns: [
    {
      role: 'npc',
      jp: 'いらっしゃいませ。どのようなご用件でしょうか？',
      hint_vi: 'Xin chào. Tôi có thể giúp gì cho bạn?',
      // NPC turns không có example
    },
    {
      role: 'user',
      jp: 'ベトナムに荷物を送りたいんですが。',
      hint_vi: 'Nói bạn muốn gửi hàng đi Việt Nam.',
      example: 'ベトナムに荷物を送りたいんですが。', // câu mẫu hiển thị khi bấm "Xem câu mẫu"
    },
    // ... thêm turns xen kẽ npc / user
  ],
}
```

### Quy tắc viết turns

| Trường | NPC turn | User turn |
|---|---|---|
| `role` | `'npc'` | `'user'` |
| `jp` | Câu NPC nói (TTS sẽ đọc) | Câu mẫu người dùng nên nói |
| `hint_vi` | Bản dịch tiếng Việt | Gợi ý ngữ cảnh / cần nói gì |
| `example` | Không có | Câu mẫu (ẩn cho đến khi bấm "Xem câu mẫu") |

- Bắt đầu bằng NPC turn để NPC mở đầu hội thoại
- Xen kẽ NPC / user; kết thúc bằng NPC turn (cảm ơn, tạm biệt) là tự nhiên nhất
- Độ dài lý tưởng: 5–8 turns (~3–4 cặp hỏi-đáp)
- Cấp độ N3–N2: tránh N1 grammar, tránh quá đơn giản (N5)
- **Không bịa câu Nhật** — kiểm tra qua từ điển hoặc người bản ngữ trước khi thêm

### 5 kịch bản hiện có

| ID | Tiếng Nhật | Tiếng Việt |
|---|---|---|
| `restaurant` | レストランで注文する | Gọi món ở nhà hàng |
| `station` | 駅で切符を買う | Mua vé tàu ở ga |
| `convenience-store` | コンビニで買い物する | Mua đồ ở cửa hàng tiện lợi |
| `hospital` | 病院で診察を受ける | Khám bệnh ở bệnh viện |
| `self-intro` | 職場での自己紹介 | Tự giới thiệu ở công ty |

## Session tracking (anonymous, không cần auth)

- `useSessionKey()` (hook ở `src/hooks/useSessionKey.ts`) — trả về UUID từ localStorage key `jsa_session_key`. Trả `null` cho đến khi component mount (SSR-safe).
- `logSession(data)` — Server Action ghi vào `practice_sessions`. Gọi khi người dùng chuyển câu, nếu đã tương tác với câu hiện tại (`hasInteractedRef.current = true`).
- `getSessionProgress(sessionKey)` — Server Action trả về các `sentence_id` đã luyện hôm nay. Dùng để tô màu progress dots.
- **Optimistic update:** khi `maybeLog()` chạy, cập nhật `practicedIds` state ngay lập tức (không đợi DB) để dot chuyển xanh tức thì.

## Các pattern quan trọng trong PracticeApp.tsx

### Stale closure với event listener
Dùng **ref pattern**: tạo `keyHandlerRef` / `isLoopingRef` / `idxRef` v.v., cập nhật `.current` mỗi render, đăng ký event listener một lần trong `useEffect([], [])`.

```ts
const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})
keyHandlerRef.current = (e) => { /* dùng state/props mới nhất */ }
useEffect(() => {
  const h = (e: KeyboardEvent) => keyHandlerRef.current(e)
  window.addEventListener('keydown', h)
  return () => window.removeEventListener('keydown', h)
}, [])
```

### SSR guard cho browser API
```ts
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return <Skeleton />
```
Không truy cập `window` / `navigator` ngoài `useEffect`.

### TTS (speak function)
`speak(text, { rate, voice, onEnd })` trong `tts.ts`:
- Gọi `fetch('/api/tts?text=...&rate=...&voice=...')` → nhận MP3 blob → play bằng `new Audio()`
- Nếu fetch thất bại (API key chưa có, offline...) → fallback về `speechSynthesis`
- `stopSpeech()` dừng cả `currentAudio` lẫn `speechSynthesis`
- `voice` là string tên giọng Neural2, ví dụ `'ja-JP-Neural2-B'`

### Keyboard shortcuts (shadow/repeat mode)
| Phím | Tác dụng |
|---|---|
| `←` / `→` | Chuyển câu (disabled khi ở tab Roleplay) |
| `Space` | Phát/dừng TTS (shadow) hoặc nghe mẫu (repeat) |
| `R` | Ghi âm / dừng ghi (repeat) |

## Deploy (Vercel)

- Deploy tự động khi push lên `main`.
- **Biến môi trường** đặt trong Vercel Project Settings (và `.env.local` khi dev): `DATABASE_URL`, `GOOGLE_TTS_API_KEY`.
- **Không commit** `.env*` chứa secret. Giữ `.env.example` làm mẫu.
- Migration DB không tự chạy khi deploy — chạy `db:migrate` chủ động trước/sau khi deploy.
- `page.tsx` có `export const dynamic = 'force-dynamic'` — bắt buộc để route không bị static cache.

## Quy ước code

- TypeScript strict; ưu tiên Server Component, chỉ `'use client'` khi thật sự cần tương tác/audio.
- Đặt tên component tiếng Anh; copy hiển thị cho người dùng bằng tiếng Việt.
- Trước khi coi task là xong: chạy `npm run lint` và `npm run typecheck`, sửa hết lỗi.
- Comment giải thích *tại sao*, nhất là ở phần Web Speech API và xử lý bất đồng bộ.

## Việc NÊN và KHÔNG NÊN cho Claude

**NÊN**
- Feature-detect mọi API trình duyệt và có fallback rõ ràng.
- Dùng ref pattern khi cần tránh stale closure trong event listeners.
- Khi sửa TTS: nhớ cập nhật cả `PracticeApp.tsx` lẫn `RoleplayTab.tsx` vì cả hai đều gọi `speak()`.
- Khi thêm kịch bản roleplay: kiểm tra câu Nhật với người bản ngữ trước khi commit.

**KHÔNG NÊN**
- Gọi API audio/micro trong Server Component hoặc lúc SSR.
- Coi độ khớp văn bản (Levenshtein) là "chấm phát âm" — nó chỉ kiểm tra đúng *từ*, không đánh giá phát âm thật.
- Hardcode secret hoặc connection string.
- Sửa SQL migration bằng tay — luôn dùng `db:generate` + `db:migrate`.
- Dùng `data/sentences.ts` làm nguồn dữ liệu cho trang chính — trang chính đọc từ DB.
- Thêm kịch bản roleplay với câu Nhật chưa được kiểm chứng.
