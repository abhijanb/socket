import { useGetIncomingRequestsQuery, useGetSentRequestsQuery, useAcceptRequestMutation, useDeclineRequestMutation, useCancelRequestMutation } from '../store/api/friendsApi'
import { cn } from '../lib/utils'

type TabType = 'incoming' | 'outgoing'

interface Props {
  type: TabType
}

function PendingRequests({ type }: Props) {
  const isIncoming = type === 'incoming'

  const { data: incomingRequests = [], isLoading: loadingIncoming, refetch: refetchIncoming } = useGetIncomingRequestsQuery()
  const { data: sentRequests = [], isLoading: loadingSent, refetch: refetchSent } = useGetSentRequestsQuery()

  const [acceptRequest] = useAcceptRequestMutation()
  const [declineRequest] = useDeclineRequestMutation()
  const [cancelRequest] = useCancelRequestMutation()

  const requests = isIncoming ? incomingRequests : sentRequests
  const isLoading = isIncoming ? loadingIncoming : loadingSent
  const refetch = isIncoming ? refetchIncoming : refetchSent

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId).unwrap()
      refetch()
    } catch {
      alert('Failed to accept request')
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId).unwrap()
      refetch()
    } catch {
      alert('Failed to decline request')
    }
  }

  const handleCancel = async (requestId: string) => {
    try {
      await cancelRequest(requestId).unwrap()
      refetch()
    } catch {
      alert('Failed to cancel request')
    }
  }

  if (isLoading) return <div>Loading requests...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isIncoming ? 'Incoming Friend Requests' : 'Sent Friend Requests'} ({requests.length})
      </h2>
      {requests.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          {isIncoming ? 'No incoming friend requests' : 'No pending sent requests'}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => {
            const user = isIncoming ? request.sender : request.receiver
            if (!user) return null
            return (
              <div
                key={request.id}
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {isIncoming ? 'wants to be your friend' : 'Request sent'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isIncoming ? (
                    <>
                      <button
                        onClick={() => handleAccept(request.id)}
                        className={cn(
                          'px-4 py-2 rounded text-sm font-medium transition-colors',
                          'bg-green-500 text-white hover:bg-green-600'
                        )}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className={cn(
                          'px-4 py-2 rounded text-sm font-medium transition-colors',
                          'bg-red-500 text-white hover:bg-red-600'
                        )}
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className={cn(
                        'px-4 py-2 rounded text-sm font-medium transition-colors',
                        'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                      )}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PendingRequests