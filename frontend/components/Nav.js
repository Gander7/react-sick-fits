import Link from 'next/link'
import NavStyles from './styles/NavStyles'

const Nav = () => {
  const links = [ 
    { label: 'Shop', target: 'items' },
    { label: 'Sell', target: 'sell' },
    { label: 'Signup', target: 'signup' },
    { label: 'Orders', target: 'orders' },
    { label: 'Account', target: 'me' }
  ]

  return (
    <NavStyles>
      {links.map(link => (
        <Link key={link.label} href={`/${link.target}`}>
          <a>{link.label}</a>
        </Link>
      ))}
    </NavStyles>
  )
}

export default Nav;