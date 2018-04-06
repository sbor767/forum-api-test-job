import React, { Component } from 'react'
import { Route, withRouter } from 'react-router-dom'
import AsyncComponent from './AsyncComponent'
// import LoginContainer from './LoginContainer'
// import ChatContainer from './ChatContainer'
// import UserContainer from './UserContainer'
import NotificationResource from '../resources/NotificationResource'
import './app.css'

const loadLogin = () => import('./LoginContainer').then(module => module.default)
const loadChat = () => import('./ChatContainer').then(module => module.default)
const loadUser = () => import('./UserContainer').then(module => module.default)

const LoginContainer = AsyncComponent(loadLogin)
const UserContainer = AsyncComponent(loadUser)
const ChatContainer = AsyncComponent(loadChat)

class App extends Component {
  state = { user: null, messages: [], messagesLoaded: false }
  deferredPrompt = null

  componentDidMount() {
    this.notifications = new NotificationResource(
      firebase.messaging(),
      firebase.database()
    )
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user })
        // this.listenForMessages()
        this.notifications.changeUser(user)
      } else {
        // This fired in any case - also when the first entry have place.
        this.props.history.push('/login')
      }
    })

    firebase.database().ref('/messages').on('value', snapshot => {
      this.onMessage(snapshot)
      if (!this.state.messagesLoaded) this.setState({ messagesLoaded: true })
    })
    this.listenForInstallBanner()
    loadChat()
    loadLogin()
    loadUser()
  }

  listenForInstallBanner = () => {
    window.addEventListener('beforeinstallprompt', e => {
      console.log('beforeinstallprompt Event fired.')
      e.preventDefault()
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e
    })
  }

  onMessage = snapshot => {
    const messages = Object.keys(snapshot.val()).map(key => {
      const msg = snapshot.val()[key]
      msg.id = key
      return msg
    })
    this.setState({ messages })
  }

  handleSubmitMessage = msg => {
    const data = {
      msg,
      author: this.state.user.email,
      user_id: this.state.user.uid,
      timestamp: Date.now()
    }
    firebase
      .database()
      .ref('messages/')
      .push(data)
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt()
      this.deferredPrompt.userChoice.then(choice => {
        console.log(choice)
      })
      this.deferredPrompt = null
    }
  }

  render() {
    return (
      <div id='container'>
        <Route path="/login" component={LoginContainer} />
        <Route
          exact path="/"
          render={() => (
            <ChatContainer
              messagesLoaded={this.state.messagesLoaded}
              onSubmit={this.handleSubmitMessage}
              user={this.state.user}
              messages={this.state.messages}
            />
          )}
        />
        <Route
          path="/users/:id"
          render={({ history, match }) => (
            <UserContainer
              messages={this.state.messages}
              messagesLoaded={this.state.messagesLoaded}
              userID={match.params.id}
            />
          )}
        />
      </div>
    )
  }
}

export default withRouter(App)