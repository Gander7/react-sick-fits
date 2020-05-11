import React from 'react'
import { Mutation } from 'react-apollo'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${(props) => props.theme.red};
    cursor: pointer;
  }
`

const RemoveFromCart = ({ id }) => {
  const update = (cache, payload) => {
    // read cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
    // remove item
    const cartItemId = payload.data.removeFromCart.id
    data.me.cart = data.me.cart.filter((item) => item.id !== cartItemId)
    // write cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }

  return (
    <Mutation
      mutation={REMOVE_FROM_CART_MUTATION}
      variables={{ id }}
      update={update}
      optimisticResponse={{
        __typename: 'Mutation',
        removeFromCart: {
          __typename: 'CartItem',
          id,
        },
      }}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {(removeFromCart, { loading, error }) => (
        <BigButton
          disabled={loading}
          onClick={() => removeFromCart().catch((err) => alert(err.message))}
          title="Delete Item"
        >
          &times;
        </BigButton>
      )}
    </Mutation>
  )
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired,
}

export default RemoveFromCart
