import { ChangeEvent, FormEvent, useState } from 'react'
import { UserFilterInterface } from '../types/common.model'
import { useConversationsContext } from '../context/ConversationContext'
import userServices from '../services/useUserServices'

export function useUserSearch() {
  const [searchUser, setSearchUser] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState([])
  const { setConversation } = useConversationsContext()
  const { searchUsers } = userServices()
  const [loading, setLoading] = useState(false)

  const changeConversation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const dataTarget = (e.target as HTMLElement).dataset
    if (dataTarget.id) {
      setConversation({ recipient: parseInt(dataTarget.id) })
    } else if (dataTarget.groupid) {
      setConversation({ group: parseInt(dataTarget.groupid) })
    } else {
      setConversation({})
      console.error('Błąd aplikacji')
    }
    setSearchResults([])
    setShowResults([])
    setSearchUser('')
  }

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setSearchUser(e.target.value)
    const length = e.target.value.length
    if (length === 1) {
      setLoading(true)
      const users = await searchUsers(e.target.value)
      setLoading(false)
      setSearchResults(users)
      setShowResults(users)
    } else if (length > 1) {
      const filteredResults = searchResults.filter((user: UserFilterInterface) =>
        `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()}`.includes(
          e.target.value.toLowerCase()
        )
      )
      setShowResults(filteredResults)
    } else {
      setSearchResults([])
      setShowResults([])
    }
  }

  return { searchUser, searchResults, showResults, handleChange, changeConversation, loading }
}
