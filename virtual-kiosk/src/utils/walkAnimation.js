import { soundFx } from './soundEffects'

/**
 * Clean Human Walking Step Animation
 * Swivels camera toward target position, performs sinusoidal footstep head-bobbing,
 * plays footstep sounds, and transitions to target scene cleanly without camera locking.
 */
export const walkToNode = async (
  viewerInstance,
  virtualTourPlugin,
  targetNodeId,
  targetPosition,
  options = {}
) => {
  if (!viewerInstance || !virtualTourPlugin) return

  const {
    totalSteps = 16,
    stepInterval = 40,
    bobAmount = 0.012,
    swivelSpeed = 1200
  } = options

  // Play motion whoosh sound
  soundFx.playWhoosh()

  // 1. Swivel camera to face target direction cleanly
  try {
    await viewerInstance.animate({
      yaw: targetPosition.yaw,
      pitch: targetPosition.pitch,
      speed: swivelSpeed
    })
  } catch (err) {
    // Ignore animation interruption if user clicks away
  }

  // 2. Simulate Head-Bobbing (Alternating Pitch) + Moving Forward
  for (let i = 0; i < totalSteps; i++) {
    const isLeftStep = i % 2 === 0
    const bobOffset = isLeftStep ? bobAmount : -bobAmount

    viewerInstance.rotate({
      yaw: targetPosition.yaw,
      pitch: targetPosition.pitch + bobOffset
    })

    if (i % 3 === 0) {
      soundFx.playFootstep()
    }

    await new Promise((resolve) => setTimeout(resolve, stepInterval))
  }

  // 3. Swap to next room node
  virtualTourPlugin.setCurrentNode(targetNodeId)
}
