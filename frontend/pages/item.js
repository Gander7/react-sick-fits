import SingleItem from '../components/SingleItem'
import { Query } from 'react-apollo'

const Item = ({ query }) => (
  <SingleItem id={query.id} />
)

export default Item