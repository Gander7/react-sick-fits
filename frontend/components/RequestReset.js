import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

export default class RequestReset extends Component {
  state = {
    email: '',
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(requestReset, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async (e) => {
                e.preventDefault()
                await requestReset()
                this.setState({ email: '' })
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Request Password Reset</h2>
                <Error error={error} />
                {!error && !loading && called && <p>Success! Check your email for a reset link!</p>}
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>

                <button type="submit">Request Reset!</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}
