import type { ReactNode } from 'react'

export type Blob = { color: string; x: string; y: string; size: string }

export type CardSpec = {
  base: string
  blobs: Blob[]
  dark?: boolean // dark ink on a light card
  eyebrow: string
  value: ReactNode
  label: string
  step: number // which story bar is active
}

// Demo numbers only — never real export data.
export const CARDS: CardSpec[] = [
  {
    base: '#1b2a6b',
    blobs: [
      { color: '#2340ff', x: '20%', y: '25%', size: '90%' },
      { color: '#ff9ad5', x: '85%', y: '70%', size: '75%' },
      { color: '#7cf5c4', x: '15%', y: '95%', size: '55%' },
    ],
    eyebrow: 'Likes',
    value: '48,112',
    label: 'posts you double-tapped',
    step: 1,
  },
  {
    base: '#f4f1ea',
    dark: true,
    blobs: [
      { color: '#ff5b3a', x: '80%', y: '20%', size: '80%' },
      { color: '#ffb199', x: '20%', y: '60%', size: '70%' },
      { color: '#ffe066', x: '70%', y: '100%', size: '60%' },
    ],
    eyebrow: 'Your #1 person',
    value: '@sam.k',
    label: '9,804 messages',
    step: 2,
  },
  {
    base: '#06231b',
    blobs: [
      { color: '#d4ff3a', x: '75%', y: '30%', size: '75%' },
      { color: '#7cf5c4', x: '15%', y: '55%', size: '80%' },
      { color: '#2340ff', x: '80%', y: '105%', size: '60%' },
    ],
    eyebrow: 'Night owl',
    value: '2 a.m.',
    label: 'your busiest hour',
    step: 3,
  },
  {
    base: '#2a0e2e',
    blobs: [
      { color: '#ff8a00', x: '25%', y: '20%', size: '80%' },
      { color: '#ff5b3a', x: '90%', y: '55%', size: '70%' },
      { color: '#ff9ad5', x: '30%', y: '100%', size: '65%' },
    ],
    eyebrow: 'Streak',
    value: '112 days',
    label: 'in a row with one person',
    step: 4,
  },
  {
    base: '#e9ecff',
    dark: true,
    blobs: [
      { color: '#9aa8ff', x: '20%', y: '30%', size: '85%' },
      { color: '#7cf5c4', x: '85%', y: '15%', size: '60%' },
      { color: '#ff9ad5', x: '70%', y: '90%', size: '70%' },
    ],
    eyebrow: 'Saved',
    value: '1,207',
    label: 'posts for "later"',
    step: 0,
  },
]
