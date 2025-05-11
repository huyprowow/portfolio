import { useEffect, useState } from 'react'

export const useDebugMode = () => {
  return window.location.hash === '#debug' ? true : false
}
