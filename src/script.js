import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { Vector3 } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Origin
 */
const origin = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial()
)
scene.add(origin)

/**
 * Grid
 */
const drawGridHorizontalLine = (length, positionY, positionZ = 0) => ([
    new THREE.Vector3(-length, positionY, positionZ),
    new THREE.Vector3(length, positionY, positionZ)
])
const drawGridVerticalLine = (positionX, length, positionZ = 0) => ([
    new THREE.Vector3(positionX, -length, positionZ),
    new THREE.Vector3(positionX, length, positionZ)
])
const drawGrid = (gridSize) => {
    let points = []
    for (let i = -gridSize; i <= gridSize; i++) {
        points = [
            ...points,
            ...drawGridHorizontalLine(gridSize, i),
            ...drawGridVerticalLine(i, gridSize)
        ]
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 })
    return new THREE.LineSegments(geometry, material)
}
const grid = drawGrid(3)
scene.add(grid)

/**
 * Arrow
 */
const drawVector = (vEnd, vStart) => {
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    // Cone
    const coneStart = new THREE.Vector3().lerpVectors(vStart, vEnd, 0.8)
    const arrowHeadL = new THREE.Vector3().subVectors(vEnd, coneStart).length()
    const arrowHeadG = new THREE.ConeGeometry(0.05, arrowHeadL, 16)
    arrowHeadG.translate(0, arrowHeadL / 2, 0)
    arrowHeadG.rotateX(Math.PI / 2)
    const arrowHead = new THREE.Mesh(arrowHeadG, arrowMaterial)
    arrowHead.position.copy(coneStart)
    arrowHead.lookAt(vEnd)
    // Cylinder
    const arrowBodyL = new THREE.Vector3().subVectors(coneStart, vStart).length()
    const radius = 0.02
    var arrowBodyG = new THREE.CylinderGeometry(radius, radius, arrowBodyL, 16)
    arrowBodyG.translate(0, arrowBodyL / 2, 0)
    arrowBodyG.rotateX(Math.PI / 2)
    var arrowBody = new THREE.Mesh(arrowBodyG, arrowMaterial)
    arrowBody.position.copy(vStart)
    arrowBody.lookAt(vEnd)
    // Arrow
    const arrow = new THREE.Group()
    arrow.add(arrowBody, arrowHead)
    return arrow
}

const vStart = new Vector3(0, 0, 0)
const vEnd = new Vector3(2, 1, 0)

const vector1 = drawVector(vEnd, vStart)
scene.add(vector1)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()