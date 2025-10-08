'use client'
import { useState } from 'react'
import { Product } from '../type/types'

type Props = { onSave: (p: Product) => void }

export default function ProductForm({ onSave }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(5)
  const [sku, setSku] = useState('')
  const [gram, setGram] = useState('')

  function makeSku(priceNum: number) {
    const now = Date.now().toString().slice(-6)
    return (priceNum === 5 ? '05' : '10') + now
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return alert('Enter product name')
    if (!gram) return alert('Enter weight/gram')
    const finalSku = sku || makeSku(price)
    onSave({ name, price, sku: finalSku, gram })
    setName('')
    setSku('')
    setGram('')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Product name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2"
          placeholder="e.g. Mirchi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
        <select
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          className="mt-1 block w-full rounded-lg border px-3 py-2"
        >
          <option value={5}>₹5</option>
          <option value={10}>₹10</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Weight/Gram</label>
        <input
          value={gram}
          onChange={e => setGram(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2"
          placeholder="e.g. 5g or 10g"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">SKU (optional)</label>
        <input
          value={sku}
          onChange={e => setSku(e.target.value)}
          className="mt-1 block w-full rounded-lg border px-3 py-2"
          placeholder="leave blank to auto-generate"
        />
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-yellow-500 text-white font-semibold"
          type="submit"
        >
          Save Product
        </button>
        <button
          type="button"
          onClick={() => { setName(''); setSku(''); setGram('') }}
          className="px-4 py-2 rounded-lg border"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
