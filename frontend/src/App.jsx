import { useState } from 'react'
import './App.css'
import ChatsPage from './ChatsPage'

function App() {
  const defaultUser = { username: 'User', secret: 'user123' }

  return <ChatsPage user={defaultUser} />
}

export default App
