import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Register once; every module imports GSAP from here.
gsap.registerPlugin(SplitText, useGSAP)
// Slides tween optional parts (a second runner, extra bubbles) that some exports don't render.
gsap.config({ nullTargetWarn: false })

export { gsap, SplitText, useGSAP }
