import { useEffect, useRef, useState } from 'react'
import type { SceneSpec } from '../data/types'
import { CanvasTimeline, CanvasToolbar, type CanvasProps } from './CanvasChrome'

type ThreeNS = typeof import('three')

interface Ctx {
  THREE: ThreeNS
  renderer: import('three').WebGLRenderer
  scene: import('three').Scene
  camera: import('three').OrthographicCamera
  group: import('three').Group
  controls: { update: () => void; dispose: () => void; target: import('three').Vector3 }
  raf: number
  aspect: number
  halfH: number
}

function palette() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark'
  return dark
    ? { face: '#16304f', hot: '#3f6fd8', edge: '#5d86c4', accent: '#7ba1ff', ink: '#dbe6ff', bg: '#0b1526' }
    : { face: '#dce7fb', hot: '#1a4cd6', edge: '#7d9ad4', accent: '#1a4cd6', ink: '#13306f', bg: '#ffffff' }
}

function makeLabel(THREE: ThreeNS, text: string, color: string, overlay = false, halo?: string) {
  const W = 512
  const H = 128
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, W, H)
    // 字号撑满纹理，文字才不会被 sprite 的留白稀释成看不清的小点
    let size = 92
    const face = (s: number) => `600 ${s}px ui-sans-serif, system-ui, sans-serif`
    ctx.font = face(size)
    while (size > 26 && ctx.measureText(text).width > W - 32) {
      size -= 6
      ctx.font = face(size)
    }
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 描一圈底色再画字：数字压在深色柱子上也读得出来
    if (halo) {
      ctx.strokeStyle = halo
      ctx.lineWidth = 14
      ctx.lineJoin = 'round'
      ctx.strokeText(text, W / 2, H / 2)
    }
    ctx.fillText(text, W / 2, H / 2)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      // 标注类文字不参与深度测试，否则会被前面的柱子挡住
      depthTest: !overlay,
    }),
  )
  if (overlay) sprite.renderOrder = 10
  sprite.scale.set(2.6, 0.65, 1)
  return sprite
}

/** 带描边的方块：蓝图风格靠的就是这圈细边 */
function cube(
  THREE: ThreeNS,
  w: number,
  h: number,
  d: number,
  color: string,
  edge: string,
  edgeOpacity = 0.45,
) {
  const g = new THREE.Group()
  const geo = new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }))
  g.add(mesh)
  if (edgeOpacity > 0) {
    const line = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOpacity }),
    )
    g.add(line)
  }
  return g
}

/** 按内容在屏幕上的真实投影范围定相机：比包围球紧，宽扁的内容不会被白白缩小 */
function fitScene(ctx: Ctx) {
  const { THREE, group, camera, controls } = ctx
  const box = new THREE.Box3().setFromObject(group)
  if (box.isEmpty()) return
  const center = box.getCenter(new THREE.Vector3())
  const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 1)

  const dir = new THREE.Vector3(1, 0.78, 1.12).normalize()
  controls.target.copy(center)
  camera.position.copy(center).add(dir.clone().multiplyScalar(radius * 4))
  camera.lookAt(center)
  camera.updateMatrixWorld()

  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)

  let hw = 0
  let hh = 0
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const v = new THREE.Vector3(x, y, z).sub(center)
        hw = Math.max(hw, Math.abs(v.dot(right)))
        hh = Math.max(hh, Math.abs(v.dot(up)))
      }
    }
  }

  ctx.halfH = Math.max(hh, hw / Math.max(ctx.aspect, 0.2)) * 1.1
  camera.left = -ctx.halfH * ctx.aspect
  camera.right = ctx.halfH * ctx.aspect
  camera.top = ctx.halfH
  camera.bottom = -ctx.halfH
  camera.near = 0.1
  camera.far = radius * 40
  camera.updateProjectionMatrix()
}

/** 贴在顶面上的双行文字：字直接长在方块上，就不会和邻块抢位置 */
function plateText(
  THREE: ThreeNS,
  title: string,
  sub: string,
  w: number,
  d: number,
  titleColor: string,
  subColor: string,
) {
  const W = 512
  const H = 256
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = titleColor
    ctx.font = '600 84px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(title, W / 2, H / 2 - 34)
    ctx.fillStyle = subColor
    ctx.font = '500 52px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(sub, W / 2, H / 2 + 52)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  )
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

function buildScene(THREE: ThreeNS, spec: SceneSpec, group: import('three').Group) {
  const p = palette()
  group.traverse((o) => {
    const any = o as unknown as {
      geometry?: { dispose: () => void }
      material?: { dispose?: () => void; map?: { dispose: () => void } }
    }
    any.geometry?.dispose()
    if (any.material) {
      any.material.map?.dispose()
      any.material.dispose?.()
    }
  })
  group.clear()

  if (spec.kind === 'numpy') {
    const shape = spec.shape
    const rows = shape.length >= 2 ? shape[0] : 1
    const cols = shape.length >= 2 ? shape[1] : shape[0]
    const depth = Math.min(shape[2] ?? 1, 3)
    const s = 1
    const gap = 0.16
    const stepX = s + gap
    const stepZ = s + gap
    const stepY = s + gap + 0.1
    const ox = ((cols - 1) * stepX) / 2
    const oz = ((rows - 1) * stepZ) / 2

    for (let y = 0; y < depth; y += 1) {
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const idx = y * rows * cols + r * cols + c
          const hot = spec.highlight?.includes(idx)
          const b = cube(THREE, s, s, s, hot ? p.hot : p.face, p.edge, hot ? 0.9 : 0.4)
          b.position.set(c * stepX - ox, y * stepY + s / 2, r * stepZ - oz)
          group.add(b)
        }
      }
    }

    // 广播：把最后一行沿 z 轴复制若干份，表示被拉伸
    if (spec.broadcast && spec.broadcast > rows) {
      for (let r = rows; r < spec.broadcast; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const g = cube(THREE, s, s, s, p.accent, p.edge, 0.25)
          const mesh = g.children[0] as import('three').Mesh
          const mat = mesh.material as import('three').MeshLambertMaterial
          mat.transparent = true
          mat.opacity = 0.22
          g.position.set(c * stepX - ox, s / 2, r * stepZ - oz)
          group.add(g)
        }
      }
    }

    const label = makeLabel(THREE, spec.label, p.ink)
    label.position.set(0, depth * stepY + 0.85, oz + 0.7)
    group.add(label)
  }

  if (spec.kind === 'pivot') {
    const max = Math.max(...spec.values.flat(), 1)
    const stepX = 1.02
    const stepZ = 1.02
    const ox = ((spec.cols.length - 1) * stepX) / 2
    const oz = ((spec.rows.length - 1) * stepZ) / 2
    // 格子一多，柱顶数字会挤成一团；只在稀疏矩阵上标注数值
    const cells = spec.rows.length * spec.cols.length
    const showValues = cells <= 6
    // 文字 sprite 是世界尺寸，矩阵越大越要等比放大，否则会被自动取景压成看不清的小点
    const span = Math.max(spec.cols.length * stepX, spec.rows.length * stepZ, 3)
    const k = Math.max(1, span / 3.6)

    spec.values.forEach((row, ri) => {
      row.forEach((v, ci) => {
        const h = Math.max(0.12, (v / max) * 3)
        const color = v / max > 0.72 ? p.hot : p.face
        const b = cube(THREE, 0.84, h, 0.84, color, p.edge, 0.45)
        b.position.set(ci * stepX - ox, h / 2, ri * stepZ - oz)
        group.add(b)

        if (showValues) {
          const num = makeLabel(THREE, v > 0 ? String(v) : 'NaN', v > 0 ? p.ink : p.edge, true, p.bg)
          num.scale.set(1.4 * k, 0.36 * k, 1)
          num.position.set(ci * stepX - ox, h + 0.34 * k, ri * stepZ - oz)
          group.add(num)
        }
      })
    })
    // 这个机位下 +x 投影到屏幕左侧、+z 到右侧，行标签放左、列标签放右才不会撞在一起
    spec.rows.forEach((label, ri) => {
      const sp = makeLabel(THREE, label, p.ink)
      sp.scale.set(1.8 * k, 0.44 * k, 1)
      sp.position.set(ox + 1.55 * k, 0.26, ri * stepZ - oz)
      group.add(sp)
    })
    spec.cols.forEach((label, ci) => {
      const sp = makeLabel(THREE, label, p.ink, false, p.bg)
      sp.scale.set(1.8 * k, 0.44 * k, 1)
      sp.position.set(ci * stepX - ox, 0.14, oz + 1.95 * k)
      group.add(sp)
    })
  }

  if (spec.kind === 'pipeline') {
    const gapX = 2.55
    const ox = ((spec.nodes.length - 1) * gapX) / 2
    // +x 在屏幕上朝左，所以节点从左端往回收，流程才是「左 → 右」
    spec.nodes.forEach((n, i) => {
      const at = i === spec.at
      const done = i < spec.at
      const x = ox - i * gapX
      const bw = 2.0
      const bh = 0.72
      const bd = 1.25
      const b = cube(THREE, bw, bh, bd, at ? p.hot : p.face, done ? p.accent : p.edge, at ? 0.95 : 0.5)
      b.position.set(x, 0.48, 0)
      group.add(b)

      const plate = plateText(
        THREE,
        n.label,
        n.sub,
        bw * 0.94,
        bd * 0.9,
        at ? '#ffffff' : p.ink,
        at ? 'rgba(255,255,255,0.85)' : done ? p.accent : p.edge,
      )
      plate.position.set(x, 0.48 + bh / 2 + 0.005, 0)
      group.add(plate)

      if (i < spec.nodes.length - 1) {
        const arrow = new THREE.Mesh(
          new THREE.ConeGeometry(0.15, 0.36, 3),
          new THREE.MeshLambertMaterial({ color: p.edge }),
        )
        // 朝向下一节点（-x 方向）
        arrow.rotation.z = Math.PI / 2
        arrow.position.set(x - gapX / 2 + 0.1, 0.48, 0)
        group.add(arrow)
      }
    })
  }
}

export default function SceneCanvas({
  workflow,
  stepIndex,
  playing,
  speed,
  onTogglePlay,
  onSpeed,
  onPrev,
  onNext,
  onReset,
  onSelectStep,
}: CanvasProps) {
  const step = workflow.steps[stepIndex]
  const spec = step.scene
  const hostRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<Ctx | null>(null)
  const specRef = useRef<SceneSpec | undefined>(spec)
  specRef.current = spec
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let ro: ResizeObserver | undefined
    let mo: MutationObserver | undefined

    ;(async () => {
      const host = hostRef.current
      if (!host) return
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (cancelled) return

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
        renderer.setSize(host.clientWidth, host.clientHeight || 300)
        renderer.domElement.style.display = 'block'
        host.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa8d8, 1.35))
        const dir = new THREE.DirectionalLight(0xffffff, 1.1)
        dir.position.set(6, 10, 7)
        scene.add(dir)

        let aspect = (host.clientWidth || 1) / (host.clientHeight || 1)
        const halfH = 3.9
        const camera = new THREE.OrthographicCamera(
          -halfH * aspect,
          halfH * aspect,
          halfH,
          -halfH,
          0.1,
          200,
        )
        camera.position.set(9.5, 8.5, 11)
        camera.lookAt(0, 0.6, 0)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enablePan = false
        controls.enableZoom = false
        controls.minPolarAngle = 0.4
        controls.maxPolarAngle = 1.32
        controls.enableDamping = true

        const group = new THREE.Group()
        scene.add(group)

        const c: Ctx = {
          THREE,
          renderer,
          scene,
          camera,
          group,
          controls,
          raf: 0,
          aspect,
          halfH,
        }
        ctxRef.current = c

        const loop = () => {
          c.raf = requestAnimationFrame(loop)
          controls.update()
          renderer.render(scene, camera)
        }
        loop()
        setReady(true)

        ro = new ResizeObserver(() => {
          const w = host.clientWidth
          const h = host.clientHeight
          if (!w || !h) return
          c.aspect = w / h
          camera.left = -c.halfH * c.aspect
          camera.right = c.halfH * c.aspect
          camera.top = c.halfH
          camera.bottom = -c.halfH
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        })
        ro.observe(host)

        mo = new MutationObserver(() => {
          const cur = specRef.current
          if (ctxRef.current && cur) {
            buildScene(THREE, cur, ctxRef.current.group)
            fitScene(ctxRef.current)
          }
        })
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
      } catch {
        setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      ro?.disconnect()
      mo?.disconnect()
      const c = ctxRef.current
      if (c) {
        cancelAnimationFrame(c.raf)
        c.controls.dispose()
        c.renderer.dispose()
        c.renderer.domElement.remove()
        ctxRef.current = null
      }
      setReady(false)
    }
    // 只在挂载时初始化渲染器，场景内容随 spec 变化单独重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const c = ctxRef.current
    if (!c || !spec) return
    buildScene(c.THREE, spec, c.group)
    fitScene(c)
  }, [spec, ready])

  return (
    <section className="canvas-card scene-card" aria-label="3D 场景画布">
      <CanvasToolbar
        title="3D 场景画布"
        badge="3D"
        call={step.en}
        hint="拖拽可旋转，滚轮缩放已禁用以免误触"
        playing={playing}
        speed={speed}
        onTogglePlay={onTogglePlay}
        onSpeed={onSpeed}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
      />

      <div className="sc-body">
        <div className="sc-stage" ref={hostRef}>
          {failed && <div className="sc-fallback">当前环境不支持 WebGL，已退回文字说明。</div>}
        </div>
        <div className="sc-foot">
          <span className="sc-caption">{spec?.caption ?? ''}</span>
          <span className="sc-kind">{spec?.kind?.toUpperCase()}</span>
        </div>
      </div>

      <CanvasTimeline steps={workflow.steps} stepIndex={stepIndex} onSelectStep={onSelectStep} />
    </section>
  )
}
