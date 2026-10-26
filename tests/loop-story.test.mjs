import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { PerspectiveCamera, Vector3 } from 'three'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { getLoopCameraPose, getLoopFinaleCameraPose, loopBeatAt, LOOP_CAMERA_POSES, LOOP_ANNOTATIONS, LOOP_BEATS } = await vite.ssrLoadModule('/src/pages/Loop/LoopCameraStory.ts')
  const { loopTracks } = await vite.ssrLoadModule('/src/pages/Loop/LoopTrackGraph.ts')
  assert.equal(LOOP_BEATS.length, 5)
  assert.equal(LOOP_CAMERA_POSES.at(-1).name, 'playground-overview')
  assert.deepEqual(LOOP_CAMERA_POSES.slice(2, 7).map(pose => pose.annotation), ['dualPath', 'portal', 'platform', 'chamber', 'return'])
  assert.equal(loopBeatAt(0), -1)
  assert.equal(loopBeatAt(1), -1)

  const position = new Vector3()
  const target = new Vector3()
  const first = new Vector3()
  const firstTarget = new Vector3()
  for (const width of [390, 820, 1280]) {
    for (const progress of [0, .1, .3, .46, .62, .78, .9, 1, .62, .3, 0]) {
      const fov = getLoopCameraPose(progress, width, position, target)
      assert([position.x, position.y, position.z, target.x, target.y, target.z, fov].every(Number.isFinite))
      assert(position.distanceTo(target) > 7, 'camera must not clip into the apparatus')
    }
    getLoopCameraPose(0, width, first, firstTarget)
    getLoopCameraPose(1, width, position, target)
    getLoopCameraPose(0, width, position, target)
    assert(position.equals(first) && target.equals(firstTarget), 'reverse scrolling restores the exact camera pose')
  }

  const camera = new PerspectiveCamera(27, 1280 / 706, .1, 50)
  for (const [progress, ids] of [[.3, ['dualPath']], [.46, ['portal']], [.62, ['platform']], [.78, ['chamber']], [.9, ['return']]]) {
    assert.deepEqual(LOOP_BEATS[loopBeatAt(progress)].annotations, ids)
    const fov = getLoopCameraPose(progress, 1280, position, target)
    camera.fov = fov
    camera.position.copy(position)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    for (const id of ids) {
      const point = LOOP_ANNOTATIONS[id].anchor.clone().project(camera)
      assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && point.z < 1, `${id} callout leaves the frame`)
    }
  }

  getLoopCameraPose(.9, 1280, position, target)
  camera.position.copy(position)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  for (const track of Object.values(loopTracks)) {
    for (const t of [0, .5, 1]) {
      const point = track.curve.getPointAt(t).project(camera)
      assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1, 'the final chapter must show the complete circulation route')
    }
  }

  getLoopCameraPose(1, 1280, position, target)
  camera.position.copy(position)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  for (const track of Object.values(loopTracks)) {
    for (const t of [0, .5, 1]) {
      const point = track.curve.getPointAt(t).project(camera)
      assert(Math.abs(point.x) < .6 && Math.abs(point.y) < .8, 'the playground overview must keep the complete route between its side controls')
    }
  }
  const playgroundPosition = position.clone()
  const playgroundTarget = target.clone()
  getLoopFinaleCameraPose(0, 1280, position, target)
  assert(position.equals(playgroundPosition) && target.equals(playgroundTarget), 'finale starts at the exact playground pose')
  getLoopFinaleCameraPose(1, 1280, position, target)
  camera.position.copy(position)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  for (const track of Object.values(loopTracks)) {
    for (const t of [0, .5, 1]) {
      const point = track.curve.getPointAt(t).project(camera)
      assert(Math.abs(point.x) < 1 && Math.abs(point.y) < 1, 'finale must show the complete route')
    }
  }
  getLoopFinaleCameraPose(0, 1280, position, target)
  assert(position.equals(playgroundPosition) && target.equals(playgroundTarget), 'reverse scrolling restores the playground camera')
  camera.aspect = 390 / 726
  for (const progress of [0, 1]) {
    camera.fov = getLoopCameraPose(progress, 390, position, target)
    camera.position.copy(position)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    for (const track of Object.values(loopTracks)) {
      for (const t of [0, .5, 1]) {
        const point = track.curve.getPointAt(t).project(camera)
        assert(Math.abs(point.x) < .95 && Math.abs(point.y) < .95, `mobile ${progress === 0 ? 'hero' : 'playground'} clips a track`)
      }
    }
  }
  for (const [width, height] of [[820, 706], [390, 726]]) {
    camera.aspect = width / height
    camera.fov = getLoopFinaleCameraPose(1, width, position, target)
    camera.position.copy(position)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    for (const track of Object.values(loopTracks)) {
      for (const t of [0, .5, 1]) {
        const point = track.curve.getPointAt(t).project(camera)
        assert(Math.abs(point.x) < .98 && Math.abs(point.y) < .98, `finale route leaves ${width}px viewport`)
      }
    }
  }
  console.log('LOOP camera story passed: five beats, projected callouts, reversible desktop/tablet/mobile poses')
} finally {
  await vite.close()
}
