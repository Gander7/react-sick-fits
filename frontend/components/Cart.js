import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { adopt } from 'react-adopt'

import User from './User'
import CartItem from './CartItem'
import calcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
})

const Cart = () => {
  return (
    <Composed>
      {({ user, toggleCart, localState }) => {
        if (!user.data.me) return null
        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton title="close" onClick={toggleCart}>
                &times;
              </CloseButton>
              <Supreme>{user.data.me.name}'s Cart</Supreme>
              <p>
                You have {user.data.me.cart.length} Item
                {user.data.me.cart.length === 1 ? '' : 's'} in your carts.
              </p>
            </header>
            <ul>
              {user.data.me.cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ul>
            <footer>
              <p>{formatMoney(calcTotalPrice(user.data.me.cart))}</p>
              <SickButton>Checkout</SickButton>
            </footer>
          </CartStyles>
        )
      }}
    </Composed>
  )
}

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }
