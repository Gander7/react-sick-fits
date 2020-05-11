import React from 'react'
import Downshift from 'downshift'
import Router from 'next/router'
import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($term: String!) {
    items(where: { OR: [{ title_contains: $term }, { description_contains: $term }] }) {
      id
      image
      title
    }
  }
`

class Autocomplete extends React.Component {
  state = {
    items: [],
    loading: false,
  }

  onChange = debounce(async (e, client) => {
    this.setState({ loading: true })
    // Manually Query Apollo Client
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { term: e.target.value },
    })
    this.setState({ items: res.data.items, loading: false })
  }, 400)

  render() {
    return (
      <SearchStyles>
        <Downshift>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {(client) => (
                  <input
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Search for an item',
                      id: 'search',
                      className: this.state.loading ? 'loading' : '',
                      onChange: (e) => {
                        e.persist()
                        this.onChange(e, client)
                      },
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item) => {
                    return (
                      <DropDownItem key={item.id}>
                        <img width="50" src={item.image} alt={item.title} />
                        {item.title}
                      </DropDownItem>
                    )
                  })}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    )
  }
}

export default Autocomplete
