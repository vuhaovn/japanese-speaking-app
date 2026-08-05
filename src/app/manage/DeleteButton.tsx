'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSentence } from '@/app/actions'

export default function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('Xoá câu này? Không thể khôi phục.')) return
    startTransition(async () => {
      await deleteSentence(id)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="btn"
      style={{ fontSize: 13, color: 'var(--accent)', borderColor: 'var(--accent)' }}
    >
      {isPending ? 'Đang xoá...' : 'Xoá'}
    </button>
  )
}
