import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Item from './Item'

const ALL_ITEMS_QRY = gql`
  query ALL_ITEMS_QRY {
    items {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`

const Center = styled.div`
  text-align: center;
`

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grip-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`

class Items extends Component {
  render() {
    return (
      <Center>
        <p>Items !!!!</p>
        <Query query={ALL_ITEMS_QRY}>
          {({ data, error, loading }) => {
            if (loading) return <p>Loading..</p>
            if (error) return <p>Error: {error.message}</p>
            return <ItemsList>
              {data.items.map(item => <Item key={item.id} item={item} />)}
            </ItemsList>
          }}
        </Query>
      </Center>
    );
  }
}

export default Items