import { ReactNode } from 'react'

declare module '@/components/canvas/View' {
  interface ViewProps {
    children?: ReactNode
    orbit?: boolean
    className?: string
  }

  export const View: React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<HTMLDivElement>>
  export const Common: React.FC<{ color?: string }>
}
