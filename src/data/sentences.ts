export interface Sentence {
  id: number
  jp: string
  kana: string
  meaning_vi: string
  level: 'N3' | 'N2'
  method: ('shadow' | 'repeat')[]
  grammar_point?: string
}

export const sentences: Sentence[] = [
  {
    id: 1,
    jp: '電車が遅れているので、会議に間に合わないかもしれません。',
    kana: 'でんしゃがおくれているので、かいぎにまにあわないかもしれません。',
    meaning_vi: 'Vì tàu điện bị trễ nên tôi có thể không kịp cuộc họp.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜かもしれません',
  },
  {
    id: 2,
    jp: 'この映画を見るたびに、子供の頃を思い出します。',
    kana: 'このえいがをみるたびに、こどものころをおもいだします。',
    meaning_vi: 'Mỗi khi xem bộ phim này, tôi lại nhớ về thời thơ ấu.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜たびに',
  },
  {
    id: 3,
    jp: '日本語が上手になりたければ、毎日練習するしかありません。',
    kana: 'にほんごがじょうずになりたければ、まいにちれんしゅうするしかありません。',
    meaning_vi: 'Nếu muốn giỏi tiếng Nhật, bạn chỉ còn cách luyện tập mỗi ngày.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜しかない',
  },
  {
    id: 4,
    jp: '会議が終わり次第、すぐに連絡します。',
    kana: 'かいぎがおわりしだい、すぐにれんらくします。',
    meaning_vi: 'Ngay khi cuộc họp kết thúc, tôi sẽ liên lạc ngay.',
    level: 'N2',
    method: ['shadow', 'repeat'],
    grammar_point: '〜次第',
  },
  {
    id: 5,
    jp: 'もう少し早く起きれば、朝ごはんを食べる時間があったのに。',
    kana: 'もうすこしはやくおきれば、あさごはんをたべるじかんがあったのに。',
    meaning_vi: 'Giá mà dậy sớm hơn một chút thì đã có thời gian ăn sáng rồi.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜のに（逆接）',
  },
  {
    id: 6,
    jp: '彼女は忙しそうに見えますが、実はあまり仕事をしていません。',
    kana: 'かのじょはいそがしそうにみえますが、じつはあまりしごとをしていません。',
    meaning_vi: 'Cô ấy trông có vẻ bận rộn nhưng thực ra không làm nhiều việc lắm.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜そうに見える',
  },
  {
    id: 7,
    jp: 'この問題は私だけでは解決できないと思います。',
    kana: 'このもんだいはわたしだけではかいけつできないとおもいます。',
    meaning_vi: 'Tôi nghĩ vấn đề này một mình tôi không thể giải quyết được.',
    level: 'N3',
    method: ['shadow', 'repeat'],
  },
  {
    id: 8,
    jp: 'その映画は怖いどころか、途中で眠くなってしまいました。',
    kana: 'そのえいがはこわいどころか、とちゅうでねむくなってしまいました。',
    meaning_vi: 'Bộ phim đó không những không đáng sợ mà còn khiến tôi buồn ngủ giữa chừng.',
    level: 'N2',
    method: ['shadow', 'repeat'],
    grammar_point: '〜どころか',
  },
  {
    id: 9,
    jp: '約束した以上、必ず守らなければなりません。',
    kana: 'やくそくしたいじょう、かならずまもらなければなりません。',
    meaning_vi: 'Đã hứa thì nhất định phải giữ lời.',
    level: 'N2',
    method: ['shadow', 'repeat'],
    grammar_point: '〜以上',
  },
  {
    id: 10,
    jp: '先生に褒められたおかげで、もっと頑張ろうという気持ちになりました。',
    kana: 'せんせいにほめられたおかげで、もっとがんばろうというきもちになりました。',
    meaning_vi: 'Nhờ được thầy khen mà tôi có động lực muốn cố gắng hơn nữa.',
    level: 'N3',
    method: ['shadow', 'repeat'],
    grammar_point: '〜おかげで',
  },
]

export function getSentencesByMethod(method: 'shadow' | 'repeat'): Sentence[] {
  return sentences.filter((s) => s.method.includes(method))
}
