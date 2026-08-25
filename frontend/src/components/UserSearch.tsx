import { useState, useRef, useEffect } from 'react'
import { useSearchUsersQuery, useSendRequestMutation } from '../store/api/friendsApi'
import { cn } from '../lib/utils'

function UserSearch() {
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: results = [], isLoading, error, refetch } = useSearchUsersQuery(query, {
    skip: query.length < 2,
  })

  const [sendRequest, { isLoading: isSending }] = useSendRequestMutation()

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      refetch()
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, refetch])

  const handleSendRequest = async (username: string) => {
    try {
      const result = await sendRequest({ username }).unwrap()
      alert(result.friendship ? 'Friend request accepted automatically!' : 'Friend request sent!')
      refetch()
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } }
      alert(error.data?.error || 'Failed to send request')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add Friend</h2>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username (min 2 characters)..."
          className={cn(
            'w-full max-w-xs px-4 py-3 text-base',
            'border rounded-lg outline-none transition-colors',
            'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          )}
        />
        {isLoading && <span className="ml-4 text-gray-500">Searching...</span>}
      </div>

      {error && <div className="text-red-500 mb-4">{String(error)}</div>}

      {results.length === 0 && query.length >= 2 && !isLoading ? (
        <p className="text-gray-500">No users found</p>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-4">
          {results.map((user) => (
            <div
              key={user.id}
              className={cn(
                'border rounded-lg p-4 flex items-center justify-between gap-4',
                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'text-xl font-bold text-white bg-blue-500'
                  )}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Click to add as friend</div>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(user.name)}
                disabled={isSending}
                className={cn(
                  'px-4 py-2 rounded text-sm font-medium transition-colors',
                  'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSending ? 'Sending...' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default UserSearch