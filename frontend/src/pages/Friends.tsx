import { useState } from 'react'
import { cn } from '../lib/utils'
import FriendList from '../components/FriendList'
import PendingRequests from '../components/PendingRequests'
import UserSearch from '../components/UserSearch'

function Friends() {
  const [activeTab, setActiveTab] = useState<'friends' | 'incoming' | 'outgoing' | 'add'>('friends')

  const tabButtonClass = (isActive: boolean) =>
    cn(
      'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
      isActive
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
    )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('friends')}
          className={tabButtonClass(activeTab === 'friends')}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={tabButtonClass(activeTab === 'incoming')}
        >
          Incoming Requests
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={tabButtonClass(activeTab === 'outgoing')}
        >
          Sent Requests
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={tabButtonClass(activeTab === 'add')}
        >
          Add Friend
        </button>
      </div>

      {activeTab === 'friends' && <FriendList />}
      {activeTab === 'incoming' && <PendingRequests type="incoming" />}
      {activeTab === 'outgoing' && <PendingRequests type="outgoing" />}
      {activeTab === 'add' && <UserSearch />}
    </div>
  )
}

export default Friends