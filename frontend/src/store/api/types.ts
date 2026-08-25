export interface Friend {
  id: string
  name: string
  image: string | null
}

export interface FriendRequest {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'
  createdAt: string
  sender?: Friend
  receiver?: Friend
  friendship?: boolean
}

export interface User {
  id: string
  name: string
  image: string | null
}