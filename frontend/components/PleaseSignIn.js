import { Query } from 'react-apollo'
import { CURRENT_USER_QUERY } from './User'
import SignIn from './Signin'

const PleaseSignIn = (props) => {
  return (
    <Query query={CURRENT_USER_QUERY}>
      {({ data, loading }) => {
        if (loading) return <p>Loading...</p>
        if (!data.me)
          return (
            <div>
              <p>Please Sign In.</p>
              <SignIn />
            </div>
          )
        return props.children
      }}
    </Query>
  )
}

export default PleaseSignIn
