import {GetServerSideProps} from 'next'
import {useRouter} from 'next/router'

import {getUser} from 'lib/auth0'
import {IUser, useFetchUser} from 'lib/user'
import LoadingScreen from 'lib/components/loading-screen'

export default function IndexPage() {
  const {isValidating, user} = useFetchUser()
  const router = useRouter()
  if (!isValidating) {
    router.push(`/${user.accessGroup}`)
  }
  return <LoadingScreen />
}

/**
 * Take additional steps to attempt a fast page load since this is the first page most people will see.
 * Comment out to disable. Page load should still work.
 */
export const getServerSideProps: GetServerSideProps = async ({req}) => {
  let user: IUser = null
  try {
    user = await getUser(req)
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: '/api/login'
      }
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: `/${user.accessGroup}`
    }
  }
}
