import { loadEnvConfig } from '@next/env'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { sentences } from './schema'

loadEnvConfig(process.cwd())

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const SEED_DATA = [
  {
    jp: '電車が遅れているので、会議に間に合わないかもしれません。',
    kana: 'でんしゃがおくれているので、かいぎにまにあわないかもしれません。',
    meaning_vi: 'Vì tàu điện bị trễ nên tôi có thể không kịp cuộc họp.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜かもしれません',
    pitch: null,
  },
  {
    jp: 'この映画を見るたびに、子供の頃を思い出します。',
    kana: 'このえいがをみるたびに、こどものころをおもいだします。',
    meaning_vi: 'Mỗi khi xem bộ phim này, tôi lại nhớ về thời thơ ấu.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜たびに',
    pitch: null,
  },
  {
    jp: '日本語が上手になりたければ、毎日練習するしかありません。',
    kana: 'にほんごがじょうずになりたければ、まいにちれんしゅうするしかありません。',
    meaning_vi: 'Nếu muốn giỏi tiếng Nhật, bạn chỉ còn cách luyện tập mỗi ngày.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜しかない',
    pitch: null,
  },
  {
    jp: '会議が終わり次第、すぐに連絡します。',
    kana: 'かいぎがおわりしだい、すぐにれんらくします。',
    meaning_vi: 'Ngay khi cuộc họp kết thúc, tôi sẽ liên lạc ngay.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜次第',
    pitch: null,
  },
  {
    jp: 'もう少し早く起きれば、朝ごはんを食べる時間があったのに。',
    kana: 'もうすこしはやくおきれば、あさごはんをたべるじかんがあったのに。',
    meaning_vi: 'Giá mà dậy sớm hơn một chút thì đã có thời gian ăn sáng rồi.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜のに（逆接）',
    pitch: null,
  },
  {
    jp: '彼女は忙しそうに見えますが、実はあまり仕事をしていません。',
    kana: 'かのじょはいそがしそうにみえますが、じつはあまりしごとをしていません。',
    meaning_vi: 'Cô ấy trông có vẻ bận rộn nhưng thực ra không làm nhiều việc lắm.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜そうに見える',
    pitch: null,
  },
  {
    jp: 'この問題は私だけでは解決できないと思います。',
    kana: 'このもんだいはわたしだけではかいけつできないとおもいます。',
    meaning_vi: 'Tôi nghĩ vấn đề này một mình tôi không thể giải quyết được.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: null,
    pitch: null,
  },
  {
    jp: 'その映画は怖いどころか、途中で眠くなってしまいました。',
    kana: 'そのえいがはこわいどころか、とちゅうでねむくなってしまいました。',
    meaning_vi: 'Bộ phim đó không những không đáng sợ mà còn khiến tôi buồn ngủ giữa chừng.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜どころか',
    pitch: null,
  },
  {
    jp: '約束した以上、必ず守らなければなりません。',
    kana: 'やくそくしたいじょう、かならずまもらなければなりません。',
    meaning_vi: 'Đã hứa thì nhất định phải giữ lời.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜以上',
    pitch: null,
  },
  {
    jp: '先生に褒められたおかげで、もっと頑張ろうという気持ちになりました。',
    kana: 'せんせいにほめられたおかげで、もっとがんばろうというきもちになりました。',
    meaning_vi: 'Nhờ được thầy khen mà tôi có động lực muốn cố gắng hơn nữa.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜おかげで',
    pitch: null,
  },
  {
    jp: '先生に、もっとゆっくり話すように言われました。',
    kana: 'せんせいに、もっとゆっくりはなすようにいわれました。',
    meaning_vi: 'Tôi được thầy yêu cầu nói chậm hơn một chút.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜ように言われる',
    pitch: null,
  },
  {
    jp: '健康のために、毎朝ジョギングをするようにしています。',
    kana: 'けんこうのために、まいあさジョギングをするようにしています。',
    meaning_vi: 'Để giữ sức khỏe, tôi cố gắng tập jogging mỗi sáng.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜ようにする',
    pitch: null,
  },
  {
    jp: '日本語は練習すればするほど、上手になります。',
    kana: 'にほんごはれんしゅうすればするほど、じょうずになります。',
    meaning_vi: 'Tiếng Nhật càng luyện tập nhiều thì càng giỏi.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜ば〜ほど',
    pitch: null,
  },
  {
    jp: '雨にもかかわらず、試合は予定通りに行われました。',
    kana: 'あめにもかかわらず、しあいはよていどおりにおこなわれました。',
    meaning_vi: 'Bất chấp trời mưa, trận đấu vẫn diễn ra đúng kế hoạch.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜にもかかわらず',
    pitch: null,
  },
  {
    jp: '辞書さえあれば、この文章は読めます。',
    kana: 'じしょさえあれば、このぶんしょうはよめます。',
    meaning_vi: 'Chỉ cần có từ điển là tôi đọc được đoạn văn này.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜さえ〜ば',
    pitch: null,
  },
  {
    jp: '去年に比べて、今年の夏はずっと暑いです。',
    kana: 'きょねんにくらべて、ことしのなつはずっとあついです。',
    meaning_vi: 'So với năm ngoái, mùa hè năm nay nóng hơn nhiều.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜に比べて',
    pitch: null,
  },
  {
    jp: 'この製品は国によって値段が違います。',
    kana: 'このせいひんはくによってねだんがちがいます。',
    meaning_vi: 'Sản phẩm này có giá khác nhau tùy theo quốc gia.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜によって',
    pitch: null,
  },
  {
    jp: '英語が話せるからといって、仕事ができるわけではありません。',
    kana: 'えいごがはなせるからといって、しごとができるわけではありません。',
    meaning_vi: 'Nói được tiếng Anh không có nghĩa là làm được việc.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜わけではない',
    pitch: null,
  },
  {
    jp: '日本語に加えて、中国語も勉強しています。',
    kana: 'にほんごにくわえて、ちゅうごくごもべんきょうしています。',
    meaning_vi: 'Ngoài tiếng Nhật, tôi còn đang học cả tiếng Trung.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜に加えて',
    pitch: null,
  },
  {
    jp: '一度も休むことなく、マラソンを完走しました。',
    kana: 'いちどもやすむことなく、マラソンをかんそうしました。',
    meaning_vi: 'Tôi đã hoàn thành marathon mà không nghỉ một lần nào.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜ことなく',
    pitch: null,
  },
  {
    jp: 'テレビをつけたまま、寝てしまいました。',
    kana: 'テレビをつけたまま、ねてしまいました。',
    meaning_vi: 'Tôi đã ngủ quên trong khi TV vẫn đang bật.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜まま',
    pitch: null,
  },
  {
    jp: 'あの店は値段が安いというより、量が多いので人気です。',
    kana: 'あのみせはねだんがやすいというより、りょうがおおいのでにんきです。',
    meaning_vi: 'Quán đó nổi tiếng không phải vì rẻ mà vì phần ăn nhiều.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜というより',
    pitch: null,
  },
  {
    jp: '彼は日本に来たばかりにしては、日本語が上手ですね。',
    kana: 'かれはにほんにきたばかりにしては、にほんごがじょうずですね。',
    meaning_vi: 'Anh ấy mới đến Nhật mà tiếng Nhật đã khá nhỉ.',
    level: 'N3' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜にしては',
    pitch: null,
  },
  {
    jp: '失敗したからこそ、成功の大切さがわかります。',
    kana: 'しっぱいしたからこそ、せいこうのたいせつさがわかります。',
    meaning_vi: 'Chính vì đã thất bại nên mới hiểu được giá trị của thành công.',
    level: 'N2' as const,
    method: ['shadow', 'repeat'],
    grammar_point: '〜からこそ',
    pitch: null,
  },
]

async function seed() {
  console.log('Seeding sentences...')

  // Xóa dữ liệu cũ trước khi seed để tránh duplicate
  await db.delete(sentences)

  const inserted = await db.insert(sentences).values(SEED_DATA).returning({ id: sentences.id })

  console.log(`✓ Inserted ${inserted.length} sentences`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
