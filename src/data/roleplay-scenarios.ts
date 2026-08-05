export interface Turn {
  role: 'npc' | 'user'
  jp: string
  hint_vi: string
  example?: string
}

export interface Scenario {
  id: string
  title_jp: string
  title_vi: string
  npc_label: string
  user_label: string
  setting_vi: string
  turns: Turn[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'restaurant',
    title_jp: 'レストランで注文する',
    title_vi: 'Gọi món ở nhà hàng',
    npc_label: '店員',
    user_label: 'お客様',
    setting_vi: 'Bạn vào nhà hàng Nhật một mình để ăn trưa.',
    turns: [
      {
        role: 'npc',
        jp: 'いらっしゃいませ。何名様でしょうか？',
        hint_vi: 'Xin chào quý khách. Quý khách mấy người ạ?',
      },
      {
        role: 'user',
        jp: '一人です。',
        hint_vi: 'Trả lời số người đi cùng.',
        example: '一人です。',
      },
      {
        role: 'npc',
        jp: 'かしこまりました。こちらのお席へどうぞ。ご注文がお決まりになりましたら、お申し付けください。',
        hint_vi: 'Vâng ạ. Mời quý khách ngồi đây. Khi quyết định xong xin báo cho tôi.',
      },
      {
        role: 'user',
        jp: 'すみません、ラーメンをひとつと餃子をふたつお願いします。',
        hint_vi: 'Gọi một tô ramen và hai đĩa gyoza.',
        example: 'すみません、ラーメンをひとつと餃子をふたつお願いします。',
      },
      {
        role: 'npc',
        jp: 'ありがとうございます。少々お待ちくださいませ。',
        hint_vi: 'Cảm ơn quý khách. Xin vui lòng chờ một chút.',
      },
    ],
  },
  {
    id: 'station',
    title_jp: '駅で切符を買う',
    title_vi: 'Mua vé tàu ở ga',
    npc_label: '駅員',
    user_label: '乗客',
    setting_vi: 'Bạn cần mua vé tàu đến Shibuya và hỏi thông tin.',
    turns: [
      {
        role: 'npc',
        jp: 'いらっしゃいませ。どちらまでですか？',
        hint_vi: 'Xin chào. Quý khách đi đến đâu ạ?',
      },
      {
        role: 'user',
        jp: '渋谷まで一枚ください。',
        hint_vi: 'Mua một vé đi Shibuya.',
        example: '渋谷まで一枚ください。',
      },
      {
        role: 'npc',
        jp: '二百十円になります。ありがとうございます。',
        hint_vi: '210 yên ạ. Cảm ơn quý khách.',
      },
      {
        role: 'user',
        jp: 'すみません、渋谷行きは何番線ですか？',
        hint_vi: 'Hỏi số sân ga đi Shibuya.',
        example: 'すみません、渋谷行きは何番線ですか？',
      },
      {
        role: 'npc',
        jp: '二番線です。あと三分で発車します。',
        hint_vi: 'Sân ga số 2. Còn 3 phút nữa tàu chạy.',
      },
      {
        role: 'user',
        jp: 'ありがとうございます。急ぎます。',
        hint_vi: 'Cảm ơn và tạm biệt vội.',
        example: 'ありがとうございます。急ぎます。',
      },
    ],
  },
  {
    id: 'convenience-store',
    title_jp: 'コンビニで買い物する',
    title_vi: 'Mua đồ ở cửa hàng tiện lợi',
    npc_label: '店員',
    user_label: 'お客様',
    setting_vi: 'Bạn vào cửa hàng tiện lợi để mua đồ và hỏi vị trí.',
    turns: [
      {
        role: 'npc',
        jp: 'いらっしゃいませ！',
        hint_vi: 'Nhân viên chào hỏi.',
      },
      {
        role: 'user',
        jp: 'すみません、おにぎりはどこですか？',
        hint_vi: 'Hỏi vị trí cơm nắm.',
        example: 'すみません、おにぎりはどこですか？',
      },
      {
        role: 'npc',
        jp: 'おにぎりはあちらの棚の右側にございます。',
        hint_vi: 'Cơm nắm ở bên phải kệ phía đó.',
      },
      {
        role: 'user',
        jp: 'ありがとうございます。温めてもらえますか？',
        hint_vi: 'Cảm ơn và nhờ hâm nóng đồ.',
        example: 'ありがとうございます。温めてもらえますか？',
      },
      {
        role: 'npc',
        jp: 'はい、少々お待ちください。袋はご利用になりますか？',
        hint_vi: 'Vâng, đợi tí. Quý khách có dùng túi không?',
      },
      {
        role: 'user',
        jp: 'はい、一枚ください。',
        hint_vi: 'Xin một túi.',
        example: 'はい、一枚ください。',
      },
    ],
  },
  {
    id: 'hospital',
    title_jp: '病院で診察を受ける',
    title_vi: 'Khám bệnh ở bệnh viện',
    npc_label: '医師',
    user_label: '患者',
    setting_vi: 'Bạn không khỏe và đến phòng khám Nhật Bản để được chẩn đoán.',
    turns: [
      {
        role: 'npc',
        jp: 'どうぞ。本日はどうされましたか？',
        hint_vi: 'Mời vào. Hôm nay bạn có vấn đề gì vậy?',
      },
      {
        role: 'user',
        jp: '昨日から頭が痛くて、少し熱もあります。',
        hint_vi: 'Kể triệu chứng: đau đầu từ hôm qua và hơi sốt.',
        example: '昨日から頭が痛くて、少し熱もあります。',
      },
      {
        role: 'npc',
        jp: 'そうですか。熱は何度ありますか？',
        hint_vi: 'Vậy à. Nhiệt độ của bạn là bao nhiêu?',
      },
      {
        role: 'user',
        jp: '三十七度八分です。',
        hint_vi: 'Thông báo nhiệt độ: 37 độ 8.',
        example: '三十七度八分です。',
      },
      {
        role: 'npc',
        jp: 'わかりました。アレルギーはありますか？',
        hint_vi: 'Hiểu rồi. Bạn có bị dị ứng gì không?',
      },
      {
        role: 'user',
        jp: 'いいえ、特にありません。',
        hint_vi: 'Không có dị ứng gì đặc biệt.',
        example: 'いいえ、特にありません。',
      },
      {
        role: 'npc',
        jp: 'では薬を三日分処方しますね。ゆっくり休んでください。',
        hint_vi: 'Tôi kê thuốc 3 ngày. Hãy nghỉ ngơi cho tốt.',
      },
    ],
  },
  {
    id: 'self-intro',
    title_jp: '職場での自己紹介',
    title_vi: 'Tự giới thiệu ở công ty',
    npc_label: '同僚',
    user_label: '新入社員',
    setting_vi: 'Ngày đầu đi làm, bạn gặp và tự giới thiệu với đồng nghiệp.',
    turns: [
      {
        role: 'npc',
        jp: 'はじめまして。営業部の田中です。よろしくお願いします。',
        hint_vi: 'Rất vui gặp bạn. Mình là Tanaka, phòng kinh doanh. Mong được hợp tác.',
      },
      {
        role: 'user',
        jp: 'はじめまして。グエンと申します。こちらこそよろしくお願いいたします。',
        hint_vi: 'Giới thiệu tên và chào hỏi lại một cách lịch sự.',
        example: 'はじめまして。グエンと申します。こちらこそよろしくお願いいたします。',
      },
      {
        role: 'npc',
        jp: 'グエンさんはどちらのご出身ですか？',
        hint_vi: 'Bạn Nguyễn quê ở đâu vậy?',
      },
      {
        role: 'user',
        jp: 'ベトナムのハノイ出身です。日本に来て三年になります。',
        hint_vi: 'Kể quê quán và thời gian sống ở Nhật.',
        example: 'ベトナムのハノイ出身です。日本に来て三年になります。',
      },
      {
        role: 'npc',
        jp: 'そうですか！日本語がとてもお上手ですね。',
        hint_vi: 'Vậy à! Tiếng Nhật của bạn giỏi quá.',
      },
      {
        role: 'user',
        jp: 'いいえ、まだまだです。わからないことがあれば教えていただけますか？',
        hint_vi: 'Khiêm tốn và nhờ đồng nghiệp chỉ bảo.',
        example: 'いいえ、まだまだです。わからないことがあれば教えていただけますか？',
      },
      {
        role: 'npc',
        jp: 'もちろんです！何でも聞いてください。一緒に頑張りましょう。',
        hint_vi: 'Tất nhiên rồi! Cứ hỏi nhé. Cùng cố gắng nào.',
      },
    ],
  },
]
