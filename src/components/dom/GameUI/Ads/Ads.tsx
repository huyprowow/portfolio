import React from 'react'
import { RiAdvertisementLine } from 'react-icons/ri'
const Ads = () => {
  return (
    <div className='pointer-events-auto cursor-pointer  '>
      <RiAdvertisementLine
        className='text-white text-2xl bold cursor-pointer '
        onClick={() => {
          // window.adsbygoogle.push(
          //   window.adBreak({
          //     type: 'next',
          //     name: 'restart-game',
          //   }),
          // )
          adBreak({
            type: 'next',
            name: 'restart-game',
            beforeAd: () => {
              console.log('popup ad')
            },
            afterAd: () => {
              console.log('close ad')
            },
          })
        }}
      />
    </div>
  )
}

export default Ads
