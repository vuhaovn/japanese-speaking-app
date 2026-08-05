# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong dự án này. Đọc kỹ trước khi sinh code.

## Tổng quan dự án

Web app **luyện NÓI tiếng Nhật** cho người học trình độ **N3–N2**.
Trọng tâm là kỹ năng nói (không phải đọc/viết), theo vòng lặp cốt lõi:
**nghe mẫu → nói theo → tự nghe lại giọng mình → so sánh → lặp lại.**

Bốn phương pháp, làm theo **giai đoạn** (đừng làm hết cùng lúc):
1. **Shadowing** — nghe và lặp lại tức thì, bám nhịp và ngữ điệu. *(Giai đoạn 1)*
2. **Nghe & nói lại** — cùng vòng lặp nhưng có nhịp nghỉ để lặp từng câu. *(Giai đoạn 1)*
3. **Pitch accent (高低アクセント)** — hiển thị đường cao độ H/L theo mora. *(Giai đoạn 2)*
4. **Roleplay hội thoại** — người dùng đóng vai trong tình huống, cần logic hội thoại động / LLM. *(Giai đoạn 3)*

Khi được giao một task mơ hồ, ưu tiên phạm vi của giai đoạn hiện tại; hỏi lại nếu task thuộc giai đoạn sau.

## Tech stack

- **Framework:** Next.js (App Router)
- **Ngôn ngữ:** TypeScript
- **Hosting:** Vercel (tự deploy qua Git)
- **Database:** Postgres trên **Neon** (serverless)
- **DB access:** Drizzle ORM + `@neondatabase/serverless` (driver HTTP, hợp với môi trường serverless của Vercel)
- **Styling:** Tailwind CSS + custom CSS classes trong `globals.css` (không có dark mode — thiết kế cố định)
- **Giọng nói:** Web Speech API + MediaRecorder (client-side, xem phần Ràng buộc trình duyệt)

## Lệnh thường dùng

```bash
npm run dev            # chạy dev server (localhost:3000)
npm run build          # build production
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit (chạy trước khi commit)

# Database (Drizzle)
npm run db:generate    # sinh migration từ schema
npm run db:migrate     # áp migration lên Neon
npm run db:studio      # mở Drizzle Studio xem dữ liệu
```

> Nếu script chưa tồn tại trong `package.json`, tạo mới thay vì đoán lệnh.

## Ràng buộc trình duyệt — RẤT QUAN TRỌNG

Các API giọng nói **chỉ chạy ở phía client**. Tuân thủ nghiêm để tránh lỗi build/runtime:

- **Mọi component dùng `SpeechSynthesis`, `SpeechRecognition`, `MediaRecorder`, `AudioContext` phải là Client Component** (`'use client'`). Không bao giờ gọi các API này trong Server Component, Server Action, hay route handler.
- **`SpeechRecognition` chỉ hỗ trợ tốt trên Chrome/Edge** (dùng `window.SpeechRecognition || window.webkitSpeechRecognition`). Luôn **feature-detect** và có fallback rõ ràng (thông báo cho người dùng), không giả định API tồn tại.
- **`SpeechSynthesis`**: danh sách giọng load bất đồng bộ — luôn xử lý `speechSynthesis.onvoiceschanged`. Chất lượng giọng ja-JP phụ thuộc OS người dùng, không kiểm soát được.
- **`MediaRecorder`**: cần quyền micro (`getUserMedia`) — luôn bọc `try/catch` và xử lý trường hợp bị từ chối. Nhớ `stream.getTracks().forEach(t => t.stop())` khi dừng để tắt đèn micro.
- **`window`/`navigator` không tồn tại khi SSR.** Truy cập chúng trong `useEffect` hoặc sau khi kiểm tra `typeof window !== 'undefined'`, không ở top-level module.

## Dữ liệu Pitch Accent — KHÔNG ĐƯỢC BỊA

- Pitch accent tiếng Nhật là dữ liệu ngôn ngữ chính xác, **không được để TTS tự sinh rồi coi là đúng**, và **không được tự đoán**.
- Nguồn chuẩn: **OJAD** (Online Japanese Accent Dictionary), từ điển **NHK 日本語発音アクセント辞典**, hoặc bộ dữ liệu Kanjium.
- Lưu pitch dạng **mảng H/L theo từng mora**, khớp độ dài với danh sách mora của câu.
- Nếu chưa có dữ liệu thật cho một câu, **đánh dấu rõ là placeholder/demo** trên UI — không hiển thị như dữ liệu chuẩn để người học tập theo.
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
| `--accent` | `#d64933` | Nút ghi âm, đường pitch, cảnh báo |
| `--accent-soft` | `#f7ded8` | Background badge pitch demo |
| `--good` | `#2f7d64` | Trạng thái khớp / đúng |
| `--good-soft` | `#dcefe8` | Background feedback tốt |
| `--radius` | `14px` | Border-radius mặc định |
| `--jp-serif` | Yu Mincho / Hiragino / fallback serif | Văn bản tiếng Nhật |

**Không có dark mode.** Thiết kế dùng màu cố định.

### CSS classes chính (dùng trực tiếp trong JSX)

- `.card` — white surface, border, shadow nhẹ, `border-radius: var(--radius)`
- `.btn` — nút cơ bản (border, surface background)
- `.btn-primary` — nút tối (`--ink` background, trắng text)
- `.btn-rec` — nút ghi âm (`--accent` background); thêm class `recording` để kích hoạt animation pulse
- `.tabs` / `.tab` / `.tab.active` — tab bar trong pill trắng
- `.jp` — text tiếng Nhật (font serif, 27px, letter-spacing)
- `.meaning` / `.meaning.hidden` — nghĩa tiếng Việt (có thể blur)
- `.pitch-demo-tag` — badge cảnh báo dữ liệu pitch là demo
- `.heard` / `.warn` — feedback sau ghi âm
- `.settings` / `.row` — panel cài đặt

### Layout tổng thể

Trang chính (`/`) là **single-page với tabs** (Shadowing | Nghe & nói lại | Roleplay).  
Không dùng nhiều route riêng cho từng chế độ — toàn bộ logic nằm trong `PracticeApp.tsx`.

## Cấu trúc thư mục (thực tế hiện tại)

```
src/
  app/
    page.tsx              # import PracticeApp — single-page experience
    layout.tsx            # metadata, font Geist
    globals.css           # design tokens + custom CSS classes
    (practice)/           # routes phụ (shadowing/, repeat/) — vẫn hoạt động qua URL
  components/
    practice/
      PracticeApp.tsx     # 'use client' — toàn bộ app (tabs, state, TTS, recorder)
      ShadowingPlayer.tsx # dùng bởi route /shadowing
      RepeatPlayer.tsx    # dùng bởi route /repeat
      SentenceCard.tsx    # display component
  data/
    sentences.ts          # 10 câu N3-N2 (jp, kana, meaning_vi, level, grammar_point)
  lib/
    speech/
      tts.ts              # speak(), stopSpeech(), isSpeechAvailable()
      recorder.ts         # startRecording(), isRecordingSupported()
    db/                   # Drizzle: schema.ts, index.ts, migrations (chưa tạo)
  types/
    speech-recognition.d.ts  # type stubs cho SpeechRecognition / webkitSpeechRecognition
  html-layout/
    japanese-speaking-practice.html  # file tham chiếu thiết kế — KHÔNG XÓA
```

Tách logic Web Speech vào `lib/speech/` để component không lặp code và dễ test.

## Database (Neon + Drizzle)

- Connection string đọc từ `process.env.DATABASE_URL` (Neon pooled connection). **Không hardcode.**
- Dùng driver `@neondatabase/serverless` cho serverless của Vercel; tránh giữ connection pool kiểu long-lived.
- Sửa schema ở `lib/db/schema.ts` rồi chạy `db:generate` + `db:migrate`, **không sửa SQL migration bằng tay**.

Schema tối thiểu gợi ý (điều chỉnh theo giai đoạn):

- `sentences` — câu luyện: `id`, `jp`, `kana`, `meaning_vi`, `level`, `pitch` (jsonb: mảng H/L), `method` (shadow/repeat...)
- `users` — nếu có đăng nhập
- `practice_sessions` — lịch sử luyện: `user_id`, `sentence_id`, `match_score`, `created_at`
- `progress` — tiến độ theo người dùng

> Không lưu file ghi âm giọng người dùng lên DB. Nếu cần lưu, dùng blob storage riêng và cân nhắc quyền riêng tư — hỏi trước khi thêm.

## Deploy (Vercel)

- Deploy tự động khi push lên nhánh chính.
- **Biến môi trường** đặt trong Vercel Project Settings (và `.env.local` khi dev): `DATABASE_URL`, và các key khác khi phát sinh.
- **Không commit** `.env*` chứa secret. Giữ `.env.example` làm mẫu.
- Migration DB không tự chạy khi deploy — chạy `db:migrate` chủ động trước/sau khi deploy.

## Quy ước code

- TypeScript strict; ưu tiên Server Component, chỉ `'use client'` khi thật sự cần tương tác/audio.
- Đặt tên component tiếng Anh; copy hiển thị cho người dùng bằng tiếng Việt.
- Trước khi coi task là xong: chạy `npm run lint` và `npm run typecheck`, sửa hết lỗi.
- Comment giải thích *tại sao*, nhất là ở phần Web Speech API và xử lý bất đồng bộ giọng.

## Việc NÊN và KHÔNG NÊN cho Claude

**NÊN**
- Feature-detect mọi API trình duyệt và có fallback rõ ràng.
- Đánh dấu dữ liệu pitch giả là placeholder cho tới khi có nguồn thật.
- Hỏi lại khi task thuộc giai đoạn chưa tới (ví dụ roleplay).

**KHÔNG NÊN**
- Gọi API audio/micro trong Server Component hoặc lúc SSR.
- Bịa pitch accent hoặc coi kết quả TTS là chuẩn phát âm.
- Coi độ khớp văn bản (Levenshtein) là "chấm phát âm" — nó chỉ kiểm tra đúng *từ*, không đánh giá phát âm/pitch. Muốn chấm phát âm thật cần dịch vụ chuyên biệt (ví dụ Azure Pronunciation Assessment) + backend.
- Hardcode secret hoặc connection string.