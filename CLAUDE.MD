# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong dự án này. Đọc kỹ trước khi sinh code.

## Tổng quan dự án

Web app **luyện NÓI tiếng Nhật** cho người học trình độ **N3–N2**.
Trọng tâm là kỹ năng nói (không phải đọc/viết), theo vòng lặp cốt lõi:
**nghe mẫu → nói theo → tự nghe lại giọng mình → so sánh → lặp lại.**

Bốn phương pháp, làm theo **giai đoạn** (đừng làm hết cùng lúc):
1. **Shadowing** — nghe và lặp lại tức thì, bám nhịp và ngữ điệu. *(Giai đoạn 1 — ✅ DONE)*
2. **Nghe & nói lại** — cùng vòng lặp nhưng có nhịp nghỉ để lặp từng câu. *(Giai đoạn 1 — ✅ DONE)*
3. **Pitch accent (高低アクセント)** — hiển thị đường cao độ H/L theo mora. *(Giai đoạn 2 — ✅ DONE, chờ dữ liệu OJAD thật)*
4. **Roleplay hội thoại** — người dùng đóng vai trong tình huống, cần logic hội thoại động / LLM. *(Giai đoạn 3 — chưa làm)*

Khi được giao một task mơ hồ, ưu tiên phạm vi của giai đoạn hiện tại; hỏi lại nếu task thuộc giai đoạn sau.

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Ngôn ngữ:** TypeScript strict
- **Hosting:** Vercel (tự deploy qua Git push lên `main`)
- **Database:** Postgres trên **Neon** (serverless)
- **DB access:** Drizzle ORM + `@neondatabase/serverless` (driver HTTP, hợp với môi trường serverless của Vercel)
- **Styling:** Tailwind CSS + custom CSS classes trong `globals.css` (không có dark mode — thiết kế cố định)
- **Giọng nói:** Web Speech API + MediaRecorder (client-side, xem phần Ràng buộc trình duyệt)

## Lệnh thường dùng

```bash
npm run dev            # chạy dev server (thường localhost:3000, hoặc 3001 nếu 3000 bị chiếm)
npm run build          # build production
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit (chạy trước khi commit)

# Database (Drizzle)
npm run db:generate    # sinh migration từ schema
npm run db:migrate     # áp migration lên Neon
npm run db:seed        # seed 24 câu N3-N2 vào DB (xóa rồi insert lại)
npm run db:studio      # mở Drizzle Studio xem dữ liệu
```

> `drizzle.config.ts` dùng `loadEnvConfig` từ `@next/env` để tải `.env.local` khi chạy CLI — không cần export thủ công.

> Nếu script chưa tồn tại trong `package.json`, tạo mới thay vì đoán lệnh.

## Ràng buộc trình duyệt — RẤT QUAN TRỌNG

Các API giọng nói **chỉ chạy ở phía client**. Tuân thủ nghiêm để tránh lỗi build/runtime:

- **Mọi component dùng `SpeechSynthesis`, `SpeechRecognition`, `MediaRecorder`, `AudioContext` phải là Client Component** (`'use client'`). Không bao giờ gọi các API này trong Server Component, Server Action, hay route handler.
- **`SpeechRecognition` chỉ hỗ trợ tốt trên Chrome/Edge** — dùng `window.SpeechRecognition ?? window.webkitSpeechRecognition`. Luôn **feature-detect** và có fallback rõ ràng.
- **`SpeechSynthesis`**: danh sách giọng load bất đồng bộ — luôn xử lý `speechSynthesis.addEventListener('voiceschanged', ...)`. Chất lượng giọng ja-JP phụ thuộc OS người dùng.
- **`MediaRecorder`**: cần quyền micro (`getUserMedia`) — luôn bọc `try/catch`. Gọi `stream.getTracks().forEach(t => t.stop())` khi dừng để tắt đèn micro.
- **`window`/`navigator` không tồn tại khi SSR.** Truy cập trong `useEffect` hoặc sau khi kiểm tra `typeof window !== 'undefined'`.

## Dữ liệu Pitch Accent — KHÔNG ĐƯỢC BỊA

- Pitch accent tiếng Nhật là dữ liệu ngôn ngữ chính xác, **không được để TTS tự sinh rồi coi là đúng**, và **không được tự đoán**.
- Nguồn chuẩn: **OJAD** (Online Japanese Accent Dictionary), từ điển **NHK 日本語発音アクセント辞典**, hoặc bộ dữ liệu Kanjium.
- Lưu pitch dạng **mảng H/L theo từng mora** trong cột `pitch jsonb` của bảng `sentences`.
- Nếu chưa có dữ liệu thật cho một câu (`pitch = null`), **đánh dấu rõ là placeholder/demo** trên UI — không hiển thị như dữ liệu chuẩn để người học tập theo.
- **Hiện tại:** 24/24 câu có `pitch = null` → tab Cao độ hiển thị mẫu heiban với cảnh báo rõ ràng.
- **Workflow nhập dữ liệu thật:** Tra OJAD → nhập mảng H/L vào `src/lib/db/seed.ts` → `npm run db:seed`.
- Quy tắc tách mora: gộp âm nhỏ (ゃゅょ ぁぃぅぇぉ), tách riêng っ / ん / ー.

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
| `--accent` | `#d64933` | Nút ghi âm, đường pitch H, cảnh báo |
| `--accent-soft` | `#f7ded8` | Background badge pitch demo |
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
- `.tabs` / `.tab` / `.tab.active` — tab bar trong pill trắng (hiện có 4 tabs)
- `.jp` — text tiếng Nhật (font serif, 27px, letter-spacing)
- `.meaning` / `.meaning.hidden` — nghĩa tiếng Việt (có thể blur)
- `.pitch-demo-tag` — badge cảnh báo dữ liệu pitch là demo
- `.pitch-section` — container của PitchDiagram lớn trong tab Cao độ (bg, border, border-radius)
- `.heard` / `.warn` — feedback sau ghi âm
- `.settings` / `.row` — panel cài đặt
- `.dot` / `.dot.on` / `.dot.done` — progress dots (xám / đỏ hiện tại / xanh đã luyện)
- `.kbd-hint` / `.kbd` — gợi ý phím tắt ở cuối card

### Layout tổng thể

Trang chính (`/`) là **single-page với 4 tabs**: Shadowing | Nghe & nói lại | Cao độ | Roleplay (disabled).
Toàn bộ logic nằm trong `PracticeApp.tsx` — không dùng nhiều route riêng cho từng chế độ.

## Cấu trúc thư mục (thực tế hiện tại)

```
src/
  app/
    page.tsx              # Server Component, fetch sentences từ DB, render PracticeApp
                          # export const dynamic = 'force-dynamic' — bắt buộc để không cache
    actions.ts            # Server Actions: logSession(), getSessionProgress()
    layout.tsx            # metadata, font Geist
    globals.css           # design tokens + custom CSS classes
    (practice)/           # routes phụ (shadowing/, repeat/) — vẫn hoạt động qua URL trực tiếp
  components/
    practice/
      PracticeApp.tsx     # 'use client' — toàn bộ app (tabs, state, TTS, recorder, pitch)
                          # chứa cả PitchSVG (nhỏ) và PitchDiagram (lớn, tab Cao độ)
      ShadowingPlayer.tsx # dùng bởi route /shadowing (legacy)
      RepeatPlayer.tsx    # dùng bởi route /repeat (legacy)
      SentenceCard.tsx    # display component (legacy)
  hooks/
    useSessionKey.ts      # trả về UUID từ localStorage (anonymous tracking, không cần auth)
  data/
    sentences.ts          # 10 câu N3-N2 cũ — CHỈ dùng bởi legacy routes /shadowing /repeat
                          # trang chính đọc từ DB, KHÔNG dùng file này
  lib/
    speech/
      tts.ts              # speak(), stopSpeech(), isSpeechAvailable()
      recorder.ts         # startRecording(), isRecordingSupported()
    db/
      schema.ts           # Drizzle schema: sentences + practice_sessions
      index.ts            # kết nối Neon: neon() + drizzle()
      seed.ts             # 24 câu N3-N2 — chạy: npm run db:seed
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
mode varchar(20),   // 'shadow' | 'repeat' | 'pitch'
match_score int,    // Levenshtein similarity 0-100, null cho shadow
created_at timestamp
```

Chưa có bảng `users` hay `progress` — dùng `session_key` (localStorage UUID) để track anonymous.

> Không lưu file ghi âm giọng người dùng lên DB. Nếu cần lưu, dùng blob storage riêng và cân nhắc quyền riêng tư — hỏi trước khi thêm.

## Session tracking (anonymous, không cần auth)

- `useSessionKey()` (hook ở `src/hooks/useSessionKey.ts`) — trả về UUID từ localStorage key `jsa_session_key`. Trả `null` cho đến khi component mount (SSR-safe).
- `logSession(data)` — Server Action ghi vào `practice_sessions`. Gọi khi người dùng chuyển câu, nếu đã tương tác với câu hiện tại (`hasInteractedRef.current = true`).
- `getSessionProgress(sessionKey)` — Server Action trả về các `sentence_id` đã luyện hôm nay. Dùng để tô màu progress dots.
- **Optimistic update:** khi `maybeLog()` chạy, cập nhật `practicedIds` state ngay lập tức (không đợi DB) để dot chuyển xanh tức thì.

## Các pattern quan trọng trong PracticeApp.tsx

### Stale closure với event listener / setInterval
Dùng **ref pattern**: tạo `keyHandlerRef` / `isLoopingRef` / `idxRef` v.v., cập nhật `.current` mỗi render, đăng ký event listener một lần trong `useEffect([], [])`.

```ts
const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})
// Mỗi render: cập nhật ref để handler luôn dùng giá trị mới nhất
keyHandlerRef.current = (e) => { /* ... dùng state/props mới nhất ... */ }
// Effect chỉ chạy 1 lần:
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
Không truy cập `window` / `speechSynthesis` / `navigator` ngoài `useEffect`.

### Pitch components
- `PitchSVG` — nhỏ, chỉ đường + mora, dùng trong tab Shadowing/Repeat
- `PitchDiagram` — lớn, H=đỏ/L=xám, guide lines, H/L label, blur khi `hidden=true`, dùng trong tab Cao độ

### Keyboard shortcuts (toàn app)
| Phím | Tác dụng |
|---|---|
| `←` / `→` | Chuyển câu |
| `Space` | Phát/dừng TTS (shadow) hoặc nghe mẫu (repeat/pitch) |
| `R` | Ghi âm / dừng ghi (repeat + pitch) |
| `H` | Ẩn/hiện đường pitch (chỉ tab Cao độ) |

## Deploy (Vercel)

- Deploy tự động khi push lên `main`.
- **Biến môi trường** đặt trong Vercel Project Settings (và `.env.local` khi dev): `DATABASE_URL`.
- **Không commit** `.env*` chứa secret. Giữ `.env.example` làm mẫu.
- Migration DB không tự chạy khi deploy — chạy `db:migrate` chủ động trước/sau khi deploy.
- `page.tsx` có `export const dynamic = 'force-dynamic'` — bắt buộc để route không bị static cache, đảm bảo fetch DB mỗi request.

## Quy ước code

- TypeScript strict; ưu tiên Server Component, chỉ `'use client'` khi thật sự cần tương tác/audio.
- Đặt tên component tiếng Anh; copy hiển thị cho người dùng bằng tiếng Việt.
- Trước khi coi task là xong: chạy `npm run lint` và `npm run typecheck`, sửa hết lỗi.
- Comment giải thích *tại sao*, nhất là ở phần Web Speech API và xử lý bất đồng bộ.

## Việc NÊN và KHÔNG NÊN cho Claude

**NÊN**
- Feature-detect mọi API trình duyệt và có fallback rõ ràng.
- Đánh dấu dữ liệu pitch null là placeholder/demo — không hiển thị như dữ liệu chuẩn.
- Hỏi lại khi task thuộc giai đoạn chưa tới (ví dụ roleplay — Giai đoạn 3).
- Dùng ref pattern khi cần tránh stale closure trong event listeners.

**KHÔNG NÊN**
- Gọi API audio/micro trong Server Component hoặc lúc SSR.
- Bịa pitch accent hoặc coi kết quả TTS là chuẩn phát âm.
- Coi độ khớp văn bản (Levenshtein) là "chấm phát âm" — nó chỉ kiểm tra đúng *từ*, không đánh giá phát âm/pitch thật. Muốn chấm phát âm thật cần dịch vụ chuyên biệt (ví dụ Azure Pronunciation Assessment) + backend.
- Hardcode secret hoặc connection string.
- Sửa SQL migration bằng tay — luôn dùng `db:generate` + `db:migrate`.
- Dùng `data/sentences.ts` làm nguồn dữ liệu cho trang chính — trang chính đọc từ DB.
