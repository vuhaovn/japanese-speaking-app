import type { Sentence } from '@/data/sentences'

interface SentenceCardProps {
  sentence: Sentence
  currentIndex: number
  total: number
}

export default function SentenceCard({ sentence, currentIndex, total }: SentenceCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <span>Câu {currentIndex + 1} / {total}</span>
        <div className="flex gap-2 items-center">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              sentence.level === 'N2'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {sentence.level}
          </span>
          {sentence.grammar_point && (
            <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              {sentence.grammar_point}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-3xl font-bold text-neutral-900 dark:text-white leading-relaxed tracking-wide">
          {sentence.jp}
        </p>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light">
          {sentence.kana}
        </p>
      </div>

      <p className="text-base text-neutral-600 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-700 pt-3">
        {sentence.meaning_vi}
      </p>
    </div>
  )
}
