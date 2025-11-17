import { useEffect, useMemo, useRef, useState } from 'react'

function App() {
  // Parameters for quadratic ax^2 + bx + c
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  const [xEval, setXEval] = useState(1)

  const canvasRef = useRef(null)

  const disc = useMemo(() => b * b - 4 * a * c, [a, b, c])
  const vertex = useMemo(() => {
    const xv = -b / (2 * a)
    const yv = a * xv * xv + b * xv + c
    return { x: xv, y: yv }
  }, [a, b, c])
  const roots = useMemo(() => {
    if (disc < 0) return []
    if (disc === 0) {
      const r = -b / (2 * a)
      return [r]
    }
    const sqrtD = Math.sqrt(disc)
    return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)]
  }, [a, b, c, disc])

  const yAtX = useMemo(() => a * xEval * xEval + b * xEval + c, [a, b, c, xEval])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Determine view window
    const xs = [vertex.x, ...roots, 0]
    // Sample some points to estimate Y range
    const sampleXs = []
    for (let i = -5; i <= 5; i++) sampleXs.push(i + vertex.x)
    const sampleYs = sampleXs.map((x) => a * x * x + b * x + c)
    const minX = Math.min(-5 + vertex.x, ...sampleXs) - 1
    const maxX = Math.max(5 + vertex.x, ...sampleXs) + 1
    const minY = Math.min(...sampleYs, c) - 2
    const maxY = Math.max(...sampleYs, c) + 2

    const toScreenX = (x) => ((x - minX) / (maxX - minX)) * W
    const toScreenY = (y) => H - ((y - minY) / (maxY - minY)) * H

    // Draw background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    const gridStepX = (maxX - minX) / 10
    const gridStepY = (maxY - minY) / 10
    ctx.beginPath()
    for (let gx = Math.ceil(minX); gx <= Math.floor(maxX); gx++) {
      const sx = toScreenX(gx)
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, H)
    }
    for (let gy = Math.ceil(minY); gy <= Math.floor(maxY); gy++) {
      const sy = toScreenY(gy)
      ctx.moveTo(0, sy)
      ctx.lineTo(W, sy)
    }
    ctx.stroke()

    // Axes
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    ctx.beginPath()
    // y-axis (x=0)
    const yAxisX = toScreenX(0)
    ctx.moveTo(yAxisX, 0)
    ctx.lineTo(yAxisX, H)
    // x-axis (y=0)
    const xAxisY = toScreenY(0)
    ctx.moveTo(0, xAxisY)
    ctx.lineTo(W, xAxisY)
    ctx.stroke()

    // Parabola
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 3
    ctx.beginPath()
    let first = true
    for (let i = 0; i <= W; i++) {
      const x = minX + (i / W) * (maxX - minX)
      const y = a * x * x + b * x + c
      const sx = toScreenX(x)
      const sy = toScreenY(y)
      if (first) {
        ctx.moveTo(sx, sy)
        first = false
      } else {
        ctx.lineTo(sx, sy)
      }
    }
    ctx.stroke()

    // Key points
    const drawPoint = (x, y, color, label) => {
      const sx = toScreenX(x)
      const sy = toScreenY(y)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(sx, sy, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111827'
      ctx.font = '12px Inter, system-ui, sans-serif'
      ctx.fillText(label, sx + 6, sy - 6)
    }
    drawPoint(vertex.x, vertex.y, '#ef4444', 'Vertex')
    if (roots.length > 0) {
      roots.forEach((r, idx) => drawPoint(r, 0, '#10b981', idx === 0 ? 'x₁' : 'x₂'))
    }
    drawPoint(0, c, '#f59e0b', 'y-intercept')
  }, [a, b, c, disc, vertex, roots])

  // Quiz data
  const questions = useMemo(() => [
    {
      id: 1,
      q: 'Which of the following is the standard form of a quadratic function?',
      options: ['y = mx + b', 'y = ax^2 + bx + c', 'y = a(x - h)^2 + k', 'y = a/x'],
      answer: 1,
      explanation: 'Quadratic standard form is y = ax^2 + bx + c with a ≠ 0.'
    },
    {
      id: 2,
      q: 'If y = 2x^2 - 8x + 6, what are the coordinates of the vertex?',
      options: ['(2, -2)', '(2, -2)', '(4, 2)', '(2, -2)'],
      answer: 1,
      explanation: 'x_v = -b/(2a) = 8/4 = 2. y_v = 2(2)^2 - 8(2) + 6 = 8 - 16 + 6 = -2.'
    },
    {
      id: 3,
      q: 'The graph of y = -x^2 opens:',
      options: ['Upward', 'Downward', 'Sideways', 'It is a line'],
      answer: 1,
      explanation: 'a = -1 < 0, so the parabola opens downward.'
    },
    {
      id: 4,
      q: 'For y = x^2 + 6x + 9, how many real x-intercepts are there?',
      options: ['0', '1', '2', 'Infinitely many'],
      answer: 1,
      explanation: 'Discriminant D = b^2 - 4ac = 36 - 36 = 0, so one real intercept (a repeated root).'
    },
    {
      id: 5,
      q: 'Which expression gives the axis of symmetry of y = ax^2 + bx + c?',
      options: ['x = -c/b', 'x = -b/(2a)', 'x = a/(2b)', 'x = 2a/b'],
      answer: 1,
      explanation: 'The axis of symmetry is x = -b/(2a).'
    },
    {
      id: 6,
      q: 'If a > 0 in y = ax^2 + bx + c, the vertex represents:',
      options: ['A maximum', 'A minimum', 'Neither', 'It depends on b'],
      answer: 1,
      explanation: 'For a > 0 the parabola opens up, so the vertex is the minimum point.'
    },
  ], [])

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    return questions.reduce((acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc), 0)
  }, [answers, questions])

  const handleDownload = () => {
    const exportHtml = buildExportHtml({ a, b, c, questions })
    const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.download = 'quadratic-functions-grade10.html'
    document.body.appendChild(aTag)
    aTag.click()
    aTag.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 text-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">Quadratic Functions • Grade 10</h1>
          <div className="flex gap-2">
            <a href="#quiz" className="px-3 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Practice</a>
            <button onClick={handleDownload} className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Download HTML</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Overview</h2>
            <p className="mb-3">A quadratic function is any function that can be written in the form y = ax^2 + bx + c where a, b, and c are real numbers and a ≠ 0. Its graph is a U-shaped curve called a parabola.</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><span className="font-semibold">Opens up</span> if a &gt; 0; <span className="font-semibold">opens down</span> if a &lt; 0.</li>
              <li>The <span className="font-semibold">axis of symmetry</span> is x = -b/(2a).</li>
              <li>The <span className="font-semibold">vertex</span> is (h, k). In standard form, h = -b/(2a) and k is the function value at h.</li>
              <li>Intercepts: y-intercept at (0, c); x-intercepts depend on the discriminant D = b^2 - 4ac.</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Parabola</h3>
            <div className="flex gap-3 mb-3">
              <label className="flex-1">a
                <input type="range" min={-5} max={5} step={0.1} value={a} onChange={(e)=>setA(parseFloat(e.target.value))} className="w-full" />
                <span className="text-sm text-gray-600">{a.toFixed(1)}</span>
              </label>
              <label className="flex-1">b
                <input type="range" min={-10} max={10} step={0.1} value={b} onChange={(e)=>setB(parseFloat(e.target.value))} className="w-full" />
                <span className="text-sm text-gray-600">{b.toFixed(1)}</span>
              </label>
              <label className="flex-1">c
                <input type="range" min={-10} max={10} step={0.1} value={c} onChange={(e)=>setC(parseFloat(e.target.value))} className="w-full" />
                <span className="text-sm text-gray-600">{c.toFixed(1)}</span>
              </label>
            </div>
            <canvas ref={canvasRef} width={600} height={300} className="w-full rounded border border-gray-200"/>
            <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
              <div className="p-3 rounded bg-indigo-50">
                <div><span className="font-semibold">Vertex:</span> ({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})</div>
                <div><span className="font-semibold">Axis:</span> x = {-b.toFixed(2)}/(2×{a.toFixed(2)}) = {(-b/(2*a)).toFixed(2)}</div>
                <div><span className="font-semibold">Opens:</span> {a > 0 ? 'Upward' : 'Downward'}</div>
              </div>
              <div className="p-3 rounded bg-green-50">
                <div><span className="font-semibold">Discriminant:</span> {disc.toFixed(2)}</div>
                <div><span className="font-semibold">Roots:</span> {roots.length===0 ? 'None (complex)' : roots.map(r=>r.toFixed(2)).join(', ') || 'Double root'}</div>
                <div><span className="font-semibold">y-intercept:</span> (0, {c.toFixed(2)})</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid md:grid-cols-3 gap-6">
          <ArticleCard title="Standard Form" points={["y = ax^2 + bx + c", "Axis x = -b/(2a)", "Vertex at x = -b/(2a)", "y-intercept at c"]}/>
          <ArticleCard title="Vertex Form" points={["y = a(x - h)^2 + k", "Vertex (h, k)", "Complete the square to convert", "h = -b/(2a), k = f(h)"]}/>
          <ArticleCard title="Factored Form" points={["y = a(x - r1)(x - r2)", "x-intercepts r1 and r2", "Use when roots are easy", "Area models help factor"]}/>
        </section>

        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Discriminant and Roots</h3>
            <p className="mb-2">The discriminant D = b^2 - 4ac tells you how many real solutions the equation ax^2 + bx + c = 0 has:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>D &gt; 0: Two distinct real roots.</li>
              <li>D = 0: One real root (double root).</li>
              <li>D &lt; 0: No real roots (two complex roots).</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Evaluate f(x)</h3>
            <div className="flex items-end gap-3">
              <label className="flex-1">x
                <input type="number" value={xEval} onChange={(e)=>setXEval(parseFloat(e.target.value||0))} className="w-full border rounded px-3 py-2" />
              </label>
              <div className="flex-1 p-3 rounded bg-blue-50">
                <div className="text-sm">f(x) = {a}x^2 + {b}x + {c}</div>
                <div className="text-lg font-semibold">f({xEval}) = {yAtX.toFixed(3)}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="quiz" className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Multiple-Choice Practice</h2>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <ol className="space-y-5 list-decimal ml-5">
              {questions.map((q, idx)=> (
                <li key={q.id} className="">
                  <div className="font-semibold mb-2">{idx+1}. {q.q}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, i)=> (
                      <label key={i} className={`flex items-center gap-2 p-2 rounded border ${submitted ? (answers[q.id]===i ? (i===q.answer? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300') : 'border-gray-200') : 'border-gray-200 hover:border-indigo-300'}`}>
                        <input type="radio" name={`q_${q.id}`} checked={answers[q.id]===i} onChange={()=>setAnswers({...answers, [q.id]: i})} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {submitted && (
                    <div className={`mt-2 text-sm ${answers[q.id]===q.answer? 'text-green-700' : 'text-red-700'}`}>
                      {answers[q.id]===q.answer? 'Correct! ' : 'Not quite. '}<span className="text-gray-700">{q.explanation}</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={()=>setSubmitted(true)} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Check Answers</button>
              <button onClick={()=>{setAnswers({}); setSubmitted(false)}} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Reset</button>
              {submitted && (
                <div className="ml-auto font-semibold">Score: {score} / {questions.length}</div>
              )}
            </div>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 py-8">
          © {new Date().getFullYear()} Quadratic Functions Study Pack
        </footer>
      </main>
    </div>
  )
}

function ArticleCard({ title, points }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <ul className="list-disc ml-6 space-y-1">
        {points.map((p, i)=> <li key={i}>{p}</li>)}
      </ul>
    </div>
  )
}

function buildExportHtml({ a, b, c, questions }) {
  const initial = { a, b, c }
  const qData = JSON.stringify(questions)
  const style = `*{box-sizing:border-box}body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;color:#111827;background:linear-gradient(to bottom,#eef2ff,white,#eff6ff)}.container{max-width:1024px;margin:0 auto;padding:24px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,.06);padding:16px}.btn{background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:10px 14px;cursor:pointer}.btn:hover{background:#4338ca}.row{display:grid;gap:16px}.grid-2{grid-template-columns:1fr 1fr}.grid-3{grid-template-columns:repeat(3,1fr)}label{font-weight:600;font-size:14px}input[type=range]{width:100%}input[type=number]{width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px}.badge{display:inline-block;padding:4px 8px;border-radius:8px;background:#eef2ff;color:#3730a3;font-weight:600}`

  const script = `(()=>{const state={a:${initial.a},b:${initial.b},c:${initial.c},answers:{},submitted:false};const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));const canvas=$('#graph');const ctx=canvas.getContext('2d');const info=()=>{const a=state.a,b=state.b,c=state.c;const D=b*b-4*a*c;const xv=-b/(2*a);const yv=a*xv*xv+b*xv+c;let roots=[];if(D>0){const s=Math.sqrt(D);roots=[(-b-s)/(2*a),(-b+s)/(2*a)]}else if(D===0){roots=[-b/(2*a)]}return {D,xv,yv,roots}};const draw=()=>{const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);const {a,b,c}=state;const iv=info();const sampleXs=[];for(let i=-5;i<=5;i++)sampleXs.push(i+iv.xv);const sampleYs=sampleXs.map(x=>a*x*x+b*x+c);const minX=Math.min(-5+iv.xv,...sampleXs)-1;const maxX=Math.max(5+iv.xv,...sampleXs)+1;const minY=Math.min(...sampleYs,c)-2;const maxY=Math.max(...sampleYs,c)+2;const sx=x=>((x-minX)/(maxX-minX))*W;const sy=y=>H-((y-minY)/(maxY-minY))*H;ctx.strokeStyle='#e5e7eb';ctx.lineWidth=1;ctx.beginPath();for(let gx=Math.ceil(minX);gx<=Math.floor(maxX);gx++){const x=sx(gx);ctx.moveTo(x,0);ctx.lineTo(x,H)}for(let gy=Math.ceil(minY);gy<=Math.floor(maxY);gy++){const y=sy(gy);ctx.moveTo(0,y);ctx.lineTo(W,y)}ctx.stroke();ctx.strokeStyle='#9ca3af';ctx.lineWidth=2;ctx.beginPath();const yAxisX=sx(0);ctx.moveTo(yAxisX,0);ctx.lineTo(yAxisX,H);const xAxisY=sy(0);ctx.moveTo(0,xAxisY);ctx.lineTo(W,xAxisY);ctx.stroke();ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.beginPath();let first=true;for(let i=0;i<=W;i++){const x=minX+(i/W)*(maxX-minX);const y=a*x*x+b*x+c;const X=sx(x),Y=sy(y);if(first){ctx.moveTo(X,Y);first=false}else{ctx.lineTo(X,Y)}}ctx.stroke();const point=(x,y,color,label)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx(x),sy(y),4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111827';ctx.font='12px Inter, system-ui, sans-serif';ctx.fillText(label,sx(x)+6,sy(y)-6)};point(iv.xv,iv.yv,'#ef4444','Vertex');iv.roots.forEach((r,i)=>point(r,0,'#10b981',i===0?'x1':'x2'));point(0,state.c,'#f59e0b','y-int');$('#vertex').textContent='('+iv.xv.toFixed(2)+', '+iv.yv.toFixed(2)+')';$('#axis').textContent=iv.xv.toFixed(2);$('#disc').textContent=iv.D.toFixed(2);$('#roots').textContent=iv.roots.length?iv.roots.map(r=>r.toFixed(2)).join(', '):'None (complex)';$('#yint').textContent=state.c.toFixed(2)};['a','b','c'].forEach(k=>{const el=$('#'+k);el.value=state[k];el.addEventListener('input',e=>{state[k]=parseFloat(e.target.value);$('#val_'+k).textContent=Number(state[k]).toFixed(1);draw()})});const qData=${qData};const list=$('#q-list');qData.forEach((q,qi)=>{const li=document.createElement('li');li.style.marginBottom='12px';const title=document.createElement('div');title.style.fontWeight='600';title.textContent=(qi+1)+'. '+q.q;li.appendChild(title);const grid=document.createElement('div');grid.style.display='grid';grid.style.gridTemplateColumns='1fr 1fr';grid.style.gap='8px';q.options.forEach((opt,i)=>{const label=document.createElement('label');label.style.display='flex';label.style.alignItems='center';label.style.gap='8px';label.style.border='1px solid #e5e7eb';label.style.borderRadius='8px';label.style.padding='8px';const input=document.createElement('input');input.type='radio';input.name='q_'+q.id;input.addEventListener('change',()=>{state.answers[q.id]=i});label.appendChild(input);label.appendChild(document.createTextNode(opt));grid.appendChild(label)});li.appendChild(grid);const exp=document.createElement('div');exp.className='explain';exp.style.marginTop='6px';exp.style.fontSize='14px';li.appendChild(exp);list.appendChild(li)});$('#check').addEventListener('click',()=>{$$('.explain').forEach((exp,idx)=>{const q=qData[idx];const chosen=state.answers[q.id];if(chosen===q.answer){exp.style.color='#065f46';exp.textContent='Correct! '+q.explanation}else{exp.style.color='#7f1d1d';exp.textContent='Not quite. '+q.explanation}});const s=qData.reduce((acc,q)=>acc+(state.answers[q.id]===q.answer?1:0),0);$('#score').textContent='Score: '+s+' / '+qData.length});$('#reset').addEventListener('click',()=>{state.answers={};$('#score').textContent='';$$('input[type=radio]').forEach(i=>i.checked=false);$$('.explain').forEach(e=>e.textContent='')});draw();})();`

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Quadratic Functions • Grade 10</title><style>${style}</style></head><body><header style="position:sticky;top:0;background:#ffffffaa;backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb"><div class="container" style="display:flex;justify-content:space-between;align-items:center;padding:14px 24px"><h1 style="color:#4338ca;margin:0;font-size:22px;font-weight:800">Quadratic Functions • Grade 10</h1><span class="badge">Standalone HTML</span></div></header><main class="container"><div class="row grid-2" style="align-items:start;margin-top:16px"><section><h2 style="font-size:22px;margin:0 0 8px 0">Overview</h2><p>A quadratic function is any function that can be written in the form y = ax^2 + bx + c where a, b, and c are real numbers and a ≠ 0. Its graph is a U-shaped curve called a parabola.</p><ul><li>Opens up if a > 0; opens down if a < 0.</li><li>Axis of symmetry is x = -b/(2a).</li><li>Vertex: in standard form, x = -b/(2a), y = f(x).</li><li>Intercepts: y-intercept at (0, c); x-intercepts depend on the discriminant D = b^2 - 4ac.</li></ul></section><section class="card"><h3 style="margin:0 0 8px 0">Interactive Parabola</h3><div class="row grid-3"><label>a<input id="a" type="range" min="-5" max="5" step="0.1"/><div style="font-size:12px;color:#4b5563">Value: <span id="val_a">${initial.a.toFixed(1)}</span></div></label><label>b<input id="b" type="range" min="-10" max="10" step="0.1"/><div style="font-size:12px;color:#4b5563">Value: <span id="val_b">${initial.b.toFixed(1)}</span></div></label><label>c<input id="c" type="range" min="-10" max="10" step="0.1"/><div style="font-size:12px;color:#4b5563">Value: <span id="val_c">${initial.c.toFixed(1)}</span></div></label></div><canvas id="graph" width="800" height="360" style="width:100%;border:1px solid #e5e7eb;border-radius:8px"></canvas><div class="row grid-2"><div class="card" style="background:#eef2ff"><div><b>Vertex:</b> <span id="vertex"></span></div><div><b>Axis:</b> x = <span id="axis"></span></div><div><b>Opens:</b> <span id="opens">Auto</span></div></div><div class="card" style="background:#ecfdf5"><div><b>Discriminant:</b> <span id="disc"></span></div><div><b>Roots:</b> <span id="roots"></span></div><div><b>y-intercept:</b> (0, <span id="yint"></span>)</div></div></div></section></div><section class="card" style="margin-top:16px"><h2 style="margin:0 0 8px 0">Multiple-Choice Practice</h2><ol id="q-list" style="padding-left:18px"></ol><div style="display:flex;gap:8px;align-items:center"><button id="check" class="btn">Check Answers</button><button id="reset" class="btn" style="background:#e5e7eb;color:#111827">Reset</button><div id="score" style="margin-left:auto;font-weight:700"></div></div></section></main><footer style="text-align:center;color:#6b7280;font-size:12px;padding:24px">© ${new Date().getFullYear()} Quadratic Functions Study Pack</footer><script>${script}</script></body></html>`
}

export default App
