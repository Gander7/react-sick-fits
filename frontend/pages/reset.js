import Reset from '../components/Reset'
import { responsePathAsArray } from 'graphql'

const ResetPage = (props) => (
  <div>
    <Reset resetToken={props.query.resetToken} />
  </div>
)

export default ResetPage
