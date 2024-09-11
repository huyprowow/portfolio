'use client'
import { Layout } from '@/components/dom/Layout'
import '@/global.css'
import { Controls } from '@/helpers/constants'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useMemo } from 'react'

export const metadata = {
  title: 'Huyprowow',
  description: 'Huyprowow 3d profile',
}

export default function RootLayout({ children }) {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.changeCamera, keys: ['KeyC'] },
    ],
    [],
  )
  return (
    <KeyboardControls map={map}>
      <html lang='en' className='antialiased'>
        {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
        <head />
        <body>
          {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
          <Layout>{children}</Layout>
        </body>
      </html>
    </KeyboardControls>
  )
}
