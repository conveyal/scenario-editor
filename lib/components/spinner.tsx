import {LoadingIcon} from './icons'

export default function Spinner(p) {
  return (
    <>
      <style global jsx>{`
        .animate-rotate {
          animation: animate-rotate 2s infinite linear;
        }
        @keyframes animate-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(359deg);
          }
        }
      `}</style>
      <LoadingIcon className='animate-rotate' {...p} />
    </>
  )
}
