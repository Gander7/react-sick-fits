import Link from 'next/link'
import NavStyles from './styles/NavStyles'
import User from './User'
import Signout from './Signout'
import { TOGGLE_CART_MUTATION } from '../components/Cart'
import { Mutation } from 'react-apollo'
import CartCount from './CartCount'

const Nav = () => {
  const links = [
    { label: 'Shop', target: 'items', requiresAuth: false },
    { label: 'Sell', target: 'sell', requiresAuth: true },
    { label: 'Sign in', target: 'signup', requiresAuth: false },
    { label: 'Orders', target: 'orders', requiresAuth: true },
    { label: 'Account', target: 'me', requiresAuth: true },
  ]

  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles>
          <Link href="/items">
            <a>Shop</a>
          </Link>
          {me && (
            <>
              <Link href="/sell">
                <a>Sell</a>
              </Link>
              <Link href="/orders">
                <a>Orders</a>
              </Link>
              <Link href="/me">
                <a>Account</a>
              </Link>
              <Signout />
              <Mutation mutation={TOGGLE_CART_MUTATION}>
                {(toggleCart) => (
                  <a onClick={toggleCart}>
                    My Cart
                    <CartCount
                      count={me.cart.reduce((tally, item) => tally + item.quantity, 0)}
                    ></CartCount>
                  </a>
                )}
              </Mutation>
            </>
          )}
          {!me && (
            <Link href="/signup">
              <a>Sign In</a>
            </Link>
          )}
        </NavStyles>
      )}
    </User>
  )
}

export default Nav
