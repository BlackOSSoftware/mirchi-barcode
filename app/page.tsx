'use client'
import { useEffect, useState, useRef } from 'react'
import ProductForm from '../components/ProductForm'
import Barcode from '../components/Barcode'
import localforage from 'localforage'
import { Product } from '../type/types'

const STORE_KEY = 'mirchi_products_v1'
localforage.config({ name: 'mirchi_barcode' })

export default function Page(){
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{ load() }, [])

  async function load(){
    const p = await localforage.getItem<Product[]>(STORE_KEY)
    setProducts(p || [])
  }

  async function saveProduct(prod: Product){
    const list = [...products.filter(x=>x.sku !== prod.sku), prod]
    await localforage.setItem(STORE_KEY, list)
    setProducts(list)
    setSelected(prod)
  }

  function deleteProduct(sku: string){
    if(!confirm('Delete product?')) return
    const list = products.filter(p=>p.sku!==sku)
    localforage.setItem(STORE_KEY, list)
    setProducts(list)
    if(selected?.sku===sku) setSelected(null)
  }

  function preview(p: Product){ setSelected(p) }

 function printLabel() {
  if (!selected) return alert('Select a product to print')

  const w = window.open('', '_blank', 'width=400,height=300')
  if (!w) return

  const html = `
    <html>
      <head>
        <title>Print Label</title>
        <style>
          body{ font-family: Arial, sans-serif; padding:0; margin:0;}
          .label { width: 70mm; height: 30mm; display:flex; flex-direction:column; justify-content:center; align-items:center; border:1px dashed #000; text-align:center;}
          .name{ font-size:14px; font-weight:700; }
          .gram, .price{ font-size:12px; color:#222; margin-top:2px; }
          #barcode{ margin-top:2mm; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="name">${selected.name}</div>
          <div class="gram">${selected.gram}</div>
          <div class="price">₹${selected.price}</div>
          <svg id="barcode"></svg>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.addEventListener('load', () => {
            JsBarcode("#barcode", "${selected.sku}", { format: "code128", width: 1.2, height: 28, displayValue: false, margin: 2 });
            window.print();
          });
        </script>
      </body>
    </html>
  `

  w.document.write(html)
  w.document.close()
}


  function startScanner() {
  setScanning(true)
  if (typeof window === 'undefined') return
  import('quagga').then((QuaggaModule) => {
    const Quagga = (QuaggaModule as any).default || (window as any).Quagga || QuaggaModule
    if (!Quagga) return alert('Quagga not available')
    
    Quagga.init({
      inputStream: { 
        name: 'Live', 
        type: 'LiveStream', 
        target: scannerRef.current, 
        constraints: { facingMode: 'environment' } 
      },
      decoder: { readers: ['code_128_reader','ean_reader','ean_8_reader','code_39_reader'] }
    }, function (err: any) {
      if (err) { console.error(err); alert('Camera init failed'); setScanning(false); return }
      Quagga.start()
    })

    Quagga.onDetected(function (result: any) {
      const code = result.codeResult.code
      const product = products.find(p => p.sku === code)
      
      if (product) {
        Quagga.stop()
        setScanning(false)
        setSelected(product)

        // Modal showing full product details
        const modal = document.createElement('div')
        modal.style.position = 'fixed'
        modal.style.top = '0'
        modal.style.left = '0'
        modal.style.right = '0'
        modal.style.bottom = '0'
        modal.style.background = 'rgba(0,0,0,0.5)'
        modal.style.display = 'flex'
        modal.style.alignItems = 'center'
        modal.style.justifyContent = 'center'
        modal.innerHTML = `
          <div style="background:white;padding:20px;border-radius:12px;min-width:250px;text-align:center;font-family:Arial;">
            <h2 style="font-size:20px;font-weight:700;margin-bottom:10px;">${product.name}</h2>
            <p><strong>Weight/Gram:</strong> ${product.gram}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><strong>SKU:</strong> ${product.sku}</p>
            <div id="barcode-modal" style="margin-top:10px;"></div>
            <button id="okbtn" style="margin-top:15px;background:#4f46e5;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">OK</button>
          </div>
        `
        document.body.appendChild(modal)

        // Render barcode inside modal
        import('jsbarcode').then((JsBarcodeModule) => {
          const JsBarcode = (JsBarcodeModule as any).default || (window as any).JsBarcode
          if (JsBarcode) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            modal.querySelector('#barcode-modal')?.appendChild(svg)
            JsBarcode(svg, product.sku, { format: "code128", width: 2, height: 50, displayValue: true })
          }
        })

        modal.querySelector('#okbtn')?.addEventListener('click', () => modal.remove())
      }
    })
  }).catch(e => { console.error(e); alert('Scanner load failed'); setScanning(false) })
}

// Mobile-friendly scanner
async function startScannerMobile() {
  setScanning(true)
  if (typeof window === "undefined") return

  import("quagga").then((QuaggaModule) => {
    const Quagga = (QuaggaModule as any).default || (window as any).Quagga || QuaggaModule
    if (!Quagga) return alert("Quagga not available")

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: { facingMode: "environment", width: 640, height: 480 },
        },
        decoder: { readers: ["code_128_reader", "ean_reader"] },
        locate: true,
      },
      (err: any) => {
        if (err) {
          console.error(err)
          alert("Camera init failed")
          setScanning(false)
          return
        }
        Quagga.start()
      }
    )

    Quagga.onDetected((result: any) => {
      const code = result.codeResult.code
      const p = products.find((x) => x.sku === code)
      if (p) {
        Quagga.stop()
        setScanning(false)
        setSelected(p)
        alert(`Product: ${p.name}\nWeight: ${p.gram}\nPrice: ₹${p.price}`)
      }
    })
  })
}

  function stopScanner(){ 
    // @ts-ignore
    if((window as any).Quagga) try{ (window as any).Quagga.stop() }catch(e){} 
    setScanning(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🌶️ Mirchi Haldi Dhaniya — Barcode</h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <h2 className="font-semibold mb-2">Add product</h2>
            <ProductForm onSave={saveProduct}/>
          </div>

          <div className="p-4 bg-white rounded-xl shadow">
            <h2 className="font-semibold mb-2">Products</h2>
            <div className="space-y-3">
              {products.length===0 && <div className="text-sm text-gray-500">No products yet</div>}
              {products.map(p=>(
                <div key={p.sku} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.gram} • ₹{p.price} • SKU: {p.sku}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>preview(p)} className="px-3 py-1 rounded border">Label</button>
                    <button onClick={()=>deleteProduct(p.sku)} className="px-3 py-1 rounded border text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="p-4 bg-white rounded-xl shadow flex flex-col items-center gap-3">
            <h3 className="font-semibold">Label Preview</h3>
            {selected ? <>
              <div className="w-full p-3 border rounded">
                <div className="font-medium">{selected.name}</div>
                <div className="text-sm text-gray-600">{selected.gram} • ₹{selected.price} • SKU: {selected.sku}</div>
                <Barcode value={selected.sku}/>
              </div>
              <div className="flex w-full gap-2">
                <button onClick={printLabel} className="flex-1 px-3 py-2 rounded bg-gradient-to-r from-green-500 to-yellow-500 text-white">Print</button>
                <button onClick={()=>{ navigator.clipboard.writeText(selected.sku); alert('SKU copied') }} className="px-3 py-2 rounded border">Copy SKU</button>
              </div>
            </>:<div className="text-sm text-gray-500">Select a product to preview</div>}
          </div>

          {/* <div className="p-4 bg-white rounded-xl shadow">
            <h3 className="font-semibold mb-2">Scanner</h3>
            <div ref={scannerRef} className="w-full h-48 bg-gray-50 rounded border flex items-center justify-center">
              {!scanning ? <div className="text-sm text-gray-500">Camera stopped</div> : <div className="text-sm text-gray-500">Camera active</div>}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={startScanner} className="px-3 py-2 rounded border">Start</button>
              <button onClick={stopScanner} className="px-3 py-2 rounded border">Stop</button>
            </div>
          </div> */}
        </aside>
      </main>
    </div>
  )
}
