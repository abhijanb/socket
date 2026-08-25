import { useGetFriendsQuery, useRemoveFriendMutation } from '../store/api/friendsApi'
import { cn } from '../lib/utils'

function FriendList() {
  const { data: friends = [], isLoading, error, refetch } = useGetFriendsQuery()
  const [removeFriend, { isLoading: isRemoving }] = useRemoveFriendMutation()

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return

    try {
      await removeFriend(friendId).unwrap()
      refetch()
    } catch {
      alert('Failed to remove friend')
    }
  }

  if (isLoading) return <div>Loading friends...</div>
  if (error) return <div className="text-red-500">Error: {String(error)}</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Friends ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No friends yet. Go to "Add Friend" to find people!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={cn(
                'border rounded-lg p-4 flex flex-col items-center gap-2',
                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  'text-2xl font-bold text-white bg-blue-500'
                )}
              >
                {friend.image ? (
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  friend.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-medium">{friend.name}</span>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                disabled={isRemoving}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendList