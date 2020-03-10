import React, { Component } from 'react';
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { ALL_ITEMS_QRY } from './Items'

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

class DeleteItem extends Component {
  update = (cache,payload) => {
    //manuall update cache so it matches server
    // read cache for items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QRY })
    // Filter delete item out
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id)
    // Put items back
    cache.writeQuery({ query: ALL_ITEMS_QRY, data })
  }

  render() {
    return (
      <Mutation 
        mutation={DELETE_ITEM_MUTATION} 
        variables={{ id: this.props.id}}
        update={this.update}
      >
        {(deleteItem, {error}) => (
          <button onClick={() => { 
            console.log('here')
            if(confirm('Are you sure you want to delete this item?')) {
              deleteItem()
            }
          }}>
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}

export default DeleteItem;