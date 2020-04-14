import PleaseSignIn from '../components/PleaseSignIn'
import Permissions from '../components/Permissions'

const PermissionPage = (props) => {
  return (
    <div>
      <PleaseSignIn>
        <p>Permissions</p>
        <Permissions />
      </PleaseSignIn>
    </div>
  )
}

export default PermissionPage
