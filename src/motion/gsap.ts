import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Register once; every module imports GSAP from here.
gsap.registerPlugin(SplitText, useGSAP)

export { gsap, SplitText, useGSAP }
