'use client'
import { useEffect, useRef } from 'react'

type Props = { value: string, width?: number, height?: number, displayValue?: boolean }

export default function Barcode({ value, width = 1.2, height = 40, displayValue = false }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    async function render() {
      if (!ref.current) return
      const JsBarcode = (await import('jsbarcode')).default || (window as any).JsBarcode
      if (typeof JsBarcode === 'function') {
        JsBarcode(ref.current, value, { format: 'code128', width, height, displayValue })
      }
    }
    render()
  }, [value, width, height, displayValue])

  return <svg ref={ref} className="w-full h-[54px]" />
}
