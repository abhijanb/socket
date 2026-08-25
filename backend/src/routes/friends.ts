import { Router, Request, Response } from 'express';
import { authMiddleware, getSession } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const getParamId = (params: Request['params'], key: string): string => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

router.post('/request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username === session.user.name) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    const targetUser = await prisma.user.findFirst({
      where: { name: username },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId: targetUser.id,
        },
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    const reverseRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: targetUser.id,
          receiverId: session.user.id,
        },
      },
    });

    if (reverseRequest) {
      if (reverseRequest.status === 'PENDING') {
        await prisma.$transaction([
          prisma.friendRequest.update({
            where: { id: reverseRequest.id },
            data: { status: 'ACCEPTED' },
          }),
          prisma.friendship.createMany({
            data: [
              { userId: session.user.id, friendId: targetUser.id },
              { userId: targetUser.id, friendId: session.user.id },
            ],
          }),
        ]);
        return res.json({ message: 'Friend request accepted automatically', friendship: true });
      }
      if (reverseRequest.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'Already friends' });
      }
    }

    const existingFriendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: session.user.id,
          friendId: targetUser.id,
        },
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Already friends' });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUser.id,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/requests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/requests/sent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: session.user.id,
        status: 'PENDING',
      },
      include: {
        receiver: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get sent friend requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/requests/:id/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestId = getParamId(req.params, 'id');

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.receiverId !== session.user.id) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      prisma.friendship.createMany({
        data: [
          { userId: request.senderId, friendId: request.receiverId },
          { userId: request.receiverId, friendId: request.senderId },
        ],
      }),
    ]);

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/requests/:id/decline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestId = getParamId(req.params, 'id');

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.receiverId !== session.user.id) {
      return res.status(403).json({ error: 'Not authorized to decline this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'DECLINED' },
    });

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/requests/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestId = getParamId(req.params, 'id');

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.senderId !== session.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    await prisma.friendRequest.delete({
      where: { id: requestId },
    });

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendships = await prisma.friendship.findMany({
      where: { userId: session.user.id },
      include: {
        friend: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friends = friendships.map((f) => f.friend);
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:friendId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendId = getParamId(req.params, 'friendId');

    const friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: session.user.id,
          friendId,
        },
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    await prisma.$transaction([
      prisma.friendship.delete({
        where: {
          userId_friendId: {
            userId: session.user.id,
            friendId,
          },
        },
      }),
      prisma.friendship.delete({
        where: {
          userId_friendId: {
            userId: friendId,
            friendId: session.user.id,
          },
        },
      }),
    ]);

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();

    const existingFriendIds = await prisma.friendship.findMany({
      where: { userId: session.user.id },
      select: { friendId: true },
    });
    const friendIds = existingFriendIds.map((f) => f.friendId);

    const pendingRequestIds = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: session.user.id, status: 'PENDING' },
          { receiverId: session.user.id, status: 'PENDING' },
        ],
      },
      select: { senderId: true, receiverId: true },
    });
    const pendingIds = pendingRequestIds.flatMap((r) => [r.senderId, r.receiverId]);

    const excludeIds = [...new Set([...friendIds, ...pendingIds, session.user.id])];

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        id: { notIn: excludeIds },
      },
      select: { id: true, name: true, image: true },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;