import React, { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { API_ENDPOINTS, API_BASE_URL } from '../lib/api'

import {
  Send,
  Lock,
  Globe,
  MessageCircle,
  Smile,
  MoreVertical,
  Trash2,
  Reply,
  Copy,
  CheckCircle,
} from 'lucide-react'

interface Message {
  _id?: string
  sender: {
    _id: string
    fullName: string
    email: string
    profilePicture?: string
  }
  content: string
  timestamp: Date
  room: string
  isPrivate: boolean
  recipients?: string[]
  replyTo?: Message | null
}

const Chat: React.FC = () => {
  const { user, accessToken } = useAuth()
  const { theme } = useTheme()
  const isLight = theme.class.includes('text-gray-900')

  // Helper function to get user ID (handles both _id and id properties)
  const getUserId = (user: any): string => {
    return user?._id || user?.id || ''
  }

  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentRoom, setCurrentRoom] = useState<'public' | 'private'>('public')
  const [privateRecipients, setPrivateRecipients] = useState<string[]>([])
  const [showPrivateModal, setShowPrivateModal] = useState(false)
  const [allUsers, setAllUsers] = useState<
    { _id: string; fullName: string; email: string }[]
  >([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMenuDropdown, setShowMenuDropdown] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [scrollButtonVisible, setScrollButtonVisible] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  )
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Reply bar UI above input
  const ReplyBar = () => {
    if (!replyTo) return null
    return (
      <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-2 rounded mb-2">
        <div className="flex-grow text-sm text-gray-700 dark:text-gray-300 truncate">
          Replying to: {replyTo.sender.fullName}: {replyTo.content || ''}
        </div>
        <button
          onClick={() => setReplyTo(null)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
          aria-label="Cancel reply"
        >
          ✕
        </button>
      </div>
    )
  }

  const emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🤩',
    '🥳',
    '😏',
    '😒',
    '😞',
    '😔',
    '😟',
    '😕',
    '🙁',
    '☹️',
    '😣',
    '😖',
    '😫',
    '😩',
    '🥺',
    '😢',
    '😭',
    '😤',
    '😠',
    '😡',
    '🤬',
    '🤯',
    '😳',
    '🥵',
    '🥶',
    '😱',
    '😨',
    '😰',
    '😥',
    '😓',
    '🤗',
    '🤔',
    '🤭',
    '🤫',
    '🤥',
    '😶',
    '😐',
    '😑',
    '😬',
    '🙄',
    '😯',
    '😦',
    '😧',
    '😮',
    '😲',
    '🥱',
    '😴',
    '🤤',
    '😪',
    '😵',
    '🤐',
    '🥴',
    '🤢',
    '🤮',
    '🤧',
    '😷',
    '🤒',
    '🤕',
    '🤑',
    '🤠',
    '😈',
    '👿',
    '👹',
    '👺',
    '🤡',
    '💩',
    '👻',
    '💀',
    '☠️',
    '👽',
    '👾',
    '🤖',
    '🎃',
    '😺',
    '😸',
    '😹',
    '😻',
    '😼',
    '😽',
    '🙀',
    '😿',
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐽',
    '🐸',
    '🐵',
    '🙈',
    '🙉',
    '🙊',
    '🐒',
    '🐔',
    '🐧',
    '🐦',
    '🐤',
    '🐣',
    '🐥',
    '🦆',
    '🦅',
    '🦉',
    '🦇',
    '🐺',
    '🐗',
    '🐴',
    '🦄',
    '🐝',
    '🐛',
    '🦋',
    '🐌',
    '🐞',
    '🐜',
    '🦗',
    '🕷️',
    '🦂',
    '🐢',
    '🐍',
    '🦎',
    '🦖',
    '🦕',
    '🐙',
    '🦑',
    '🦐',
    '🦞',
    '🦀',
    '🐡',
    '🐠',
    '🐟',
    '🐬',
    '🐳',
    '🐋',
    '🦈',
    '🐊',
    '🐅',
    '🐆',
    '🦓',
    '🦍',
    '🦧',
    '🐘',
    '🦛',
    '🦏',
    '🐪',
    '🐫',
    '🦒',
    '🦘',
    '🐃',
    '🐂',
    '🐄',
    '🐎',
    '🐖',
    '🐏',
    '🐑',
    '🦙',
    '🐐',
    '🦌',
    '🐕',
    '🐩',
    '🦮',
    '🐕‍🦺',
    '🐈',
    '🐓',
    '🦃',
    '🦚',
    '🦜',
    '🦢',
    '🦩',
    '🕊️',
    '🐇',
    '🦝',
    '🦨',
    '🦡',
    '🦦',
    '🦥',
    '🐁',
    '🐀',
    '🐿️',
    '🦔',
    '🐾',
    '🐉',
    '🍎',
    '🍐',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🫐',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
    '🥬',
    '🥒',
    '🌶️',
    '🫑',
    '🌽',
    '🥕',
    '🫒',
    '🧄',
    '🧅',
    '🥔',
    '🍠',
    '🥐',
    '🥖',
    '🍞',
    '🥨',
    '🥯',
    '🧀',
    '🥚',
    '🍳',
    '🧈',
    '🥞',
    '🧇',
    '🥓',
    '🥩',
    '🍗',
    '🍖',
    '🦴',
    '🌭',
    '🍔',
    '🍟',
    '🍕',
    '🫓',
    '🥙',
    '🌮',
    '🌯',
    '🫔',
    '🥗',
    '🥘',
    '🫕',
    '🍝',
    '🍜',
    '🍲',
    '🍛',
    '🍣',
    '🍱',
    '🥟',
    '🦪',
    '🍤',
    '🍙',
    '🍚',
    '🍘',
    '🍥',
    '🥠',
    '🥮',
    '🍢',
    '🍡',
    '🍧',
    '🍨',
    '🍦',
    '🥧',
    '🧁',
    '🍰',
    '🎂',
    '🍮',
    '🍭',
    '🍬',
    '🍫',
    '🍿',
    '🍩',
    '🍪',
    '🌰',
    '🥜',
    '🍯',
    '🥛',
    '🍼',
    '☕',
    '🫖',
    '🍵',
    '🧃',
    '🥤',
    '🧋',
    '🍶',
    '🍺',
    '🍻',
    '🥂',
    '🍷',
    '🥃',
    '🍸',
    '🍹',
    '🧉',
    '🍾',
    '🧊',
    '🥄',
    '🍴',
    '🍽️',
    '🥣',
    '🥡',
    '🥢',
    '🧂',
    '⚽',
    '🏀',
    '🏈',
    '⚾',
    '🥎',
    '🎾',
    '🏐',
    '🏉',
    '🥏',
    '🎱',
    '🪀',
    '🏓',
    '🏸',
    '🏒',
    '🏑',
    '🥍',
    '🏏',
    '🪃',
    '🥅',
    '⛳',
    '🪁',
    '🏹',
    '🎣',
    '🤿',
    '🥊',
    '🥋',
    '🎽',
    '🛹',
    '🛷',
    '⛸️',
    '🥌',
    '🎿',
    '⛷️',
    '🏂',
    '🪂',
    '🏋️',
    '🤸',
    '⛹️',
    '🤺',
    '🤾',
    '🏌️',
    '🧘',
    '🏃',
    '🚶',
    '🧎',
    '🧍',
    '🤳',
    '💃',
    '🕺',
    '👯',
    '👩‍🦰',
    '👨‍🦰',
    '👩‍🦱',
    '👨‍🦱',
    '👩‍🦳',
    '👨‍🦳',
    '👩‍🦲',
    '👨‍🦲',
    '🧔',
    '👱',
    '👨‍🦳',
    '👩‍🦳',
    '🧑‍🦱',
    '👨‍🦱',
    '👩‍🦱',
    '🧑‍🦰',
    '👨‍🦰',
    '👩‍🦰',
    '👱‍♀️',
    '👱‍♂️',
    '🧓',
    '👴',
    '👵',
    '🙍',
    '🙎',
    '🙅',
    '🙆',
    '💁',
    '🙋',
    '🧏',
    '🙇',
    '🤦',
    '🤷',
    '👮',
    '🕵️',
    '💂',
    '🥷',
    '👷',
    '🤴',
    '👸',
    '👳',
    '👲',
    '🧕',
    '🤵',
    '🤰',
    '🤱',
    '👼',
    '🎅',
    '🤶',
    '🦸',
    '🦹',
    '🧙',
    '🧚',
    '🧛',
    '🧜',
    '🧝',
    '🧞',
    '🧟',
    '💆',
    '💇',
    '🚶‍♀️',
    '🚶‍♂️',
    '🧎‍♀️',
    '🧎‍♂️',
    '👨‍🦯',
    '👩‍🦯',
    '👨‍🦼',
    '👩‍🦼',
    '👨‍🦽',
    '👩‍🦽',
    '🏃‍♀️',
    '🏃‍♂️',
    '👨‍⚕️',
    '👩‍⚕️',
    '👨‍🎓',
    '👩‍🎓',
    '👨‍🏫',
    '👩‍🏫',
    '👨‍⚖️',
    '👩‍⚖️',
    '👨‍🌾',
    '👩‍🌾',
    '👨‍🍳',
    '👩‍🍳',
    '👨‍🔧',
    '👩‍🔧',
    '👨‍🏭',
    '👩‍🏭',
    '👨‍💼',
    '👩‍💼',
    '👨‍🔬',
    '👩‍🔬',
    '👨‍💻',
    '👩‍💻',
    '👨‍🎤',
    '👩‍🎤',
    '👨‍🎨',
    '👩‍🎨',
    '👨‍✈️',
    '👩‍✈️',
    '👨‍🚀',
    '👩‍🚀',
    '👨‍🚒',
    '👩‍🚒',
    '👮‍♀️',
    '👮‍♂️',
    '🕵️‍♀️',
    '🕵️‍♂️',
    '💂‍♀️',
    '💂‍♂️',
    '🥷',
    '👷‍♀️',
    '👷‍♂️',
    '🤴',
    '👸',
    '👳‍♀️',
    '👳‍♂️',
    '👲',
    '🧕',
    '🤵‍♀️',
    '🤵‍♂️',
    '👰‍♀️',
    '👰‍♂️',
    '🤰',
    '🤱',
    '👼',
    '🎅',
    '🤶',
    '🦸‍♀️',
    '🦸‍♂️',
    '🦹‍♀️',
    '🦹‍♂️',
    '🧙‍♀️',
    '🧙‍♂️',
    '🧚‍♀️',
    '🧚‍♂️',
    '🧛‍♀️',
    '🧛‍♂️',
    '🧜‍♀️',
    '🧜‍♂️',
    '🧝‍♀️',
    '🧝‍♂️',
    '🧞‍♀️',
    '🧞‍♂️',
    '🧟‍♀️',
    '🧟‍♂️',
    '💆‍♀️',
    '💆‍♂️',
    '💇‍♀️',
    '💇‍♂️',
    '🕴️',
    '💃',
    '🕺',
    '👯‍♀️',
    '👯‍♂️',
    '🧖‍♀️',
    '🧖‍♂️',
    '🧗‍♀️',
    '🧗‍♂️',
    '🏇',
    '⛹️‍♀️',
    '⛹️‍♂️',
    '🏌️‍♀️',
    '🏌️‍♂️',
    '🏄‍♀️',
    '🏄‍♂️',
    '🚣‍♀️',
    '🚣‍♂️',
    '🏊‍♀️',
    '🏊‍♂️',
    '🏋️‍♀️',
    '🏋️‍♂️',
    '🚴‍♀️',
    '🚴‍♂️',
    '🚵‍♀️',
    '🚵‍♂️',
    '🤸‍♀️',
    '🤸‍♂️',
    '🤼‍♀️',
    '🤼‍♂️',
    '🤽‍♀️',
    '🤽‍♂️',
    '🤾‍♀️',
    '🤾‍♂️',
    '🤹‍♀️',
    '🤹‍♂️',
    '🧘‍♀️',
    '🧘‍♂️',
    '🧑‍🤝‍🧑',
    '👭',
    '👫',
    '👬',
    '💏',
    '👩‍❤️‍💋‍👨',
    '👨‍❤️‍💋‍👨',
    '👩‍❤️‍💋‍👩',
    '💑',
    '👩‍❤️‍👨',
    '👨‍❤️‍👨',
    '👩‍❤️‍👩',
    '👨‍👩‍👧',
    '👨‍👩‍👧‍👦',
    '👨‍👩‍👦‍👦',
    '👨‍👩‍👧‍👧',
    '👨‍👨‍👦',
    '👨‍👨‍👧',
    '👨‍👨‍👧‍👦',
    '👨‍👨‍👦‍👦',
    '👨‍👨‍👧‍👧',
    '👩‍👩‍👦',
    '👩‍👩‍👧',
    '👩‍👩‍👧‍👦',
    '👩‍👩‍👦‍👦',
    '👩‍👩‍👧‍👧',
    '👨‍👦',
    '👨‍👦‍👦',
    '👨‍👧',
    '👨‍👧‍👦',
    '👨‍👧‍👧',
    '👩‍👦',
    '👩‍👦‍👦',
    '👩‍👧',
    '👩‍👧‍👦',
    '👩‍👧‍👧',
    '🗣️',
    '👤',
    '👥',
    '🫂',
    '👣',
    '🦰',
    '🦱',
    '🦳',
    '🦲',
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = API_BASE_URL.replace('/api', '')
    const newSocket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
    })
    setSocket(newSocket)
    newSocket.emit('joinRoom', currentRoom)
    // Fetch initial messages for the current room
    fetchMessages(currentRoom)
    newSocket.on('chatMessage', (message: Message) => {
      if (message.sender._id !== getUserId(user)) {
        setMessages((prev) => [...prev, message])
      } else {
        // Update the local message with the server-assigned _id
        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === message.timestamp &&
            m.sender._id === message.sender._id
              ? message
              : m
          )
        )
      }
    })
    newSocket.on('messageDeleted', (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
    })
    newSocket.on('userTyping', (userId: string) => {
      if (userId !== user?._id) {
        const typingUser = allUsers.find((u) => u._id === userId)
        setTypingUser(typingUser ? typingUser.fullName : 'Someone')
        setTimeout(() => setTypingUser(null), 3000)
      }
    })
    // Fetch all users for private chat selection
    fetch(API_ENDPOINTS.CHAT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredUsers = (data.users || []).filter(
          (u: any) => getUserId(u) !== getUserId(user)
        )
        setAllUsers(filteredUsers)
      })
      .catch(() => setAllUsers([]))
    return () => {
      newSocket.disconnect()
    }
  }, [accessToken, currentRoom, user?._id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?._id || user?.id || ''
    console.log('[DEBUG] sendMessage called:', {
      socket: !!socket,
      currentMessage: currentMessage.trim(),
      user: user,
      userId: userId,
      userKeys: user ? Object.keys(user) : 'user is null',
      condition: socket && currentMessage.trim() && userId,
    })

    if (socket && currentMessage.trim() && userId && user) {
      const messageData: Message = {
        _id: undefined,
        content: currentMessage,
        room: currentRoom,
        sender: {
          _id: userId,
          fullName: user.fullName || '',
          email: user.email,
          profilePicture: user.profilePicture,
        },
        isPrivate: currentRoom === 'private',
        recipients: currentRoom === 'private' ? privateRecipients : undefined,
        replyTo: replyTo,
        timestamp: new Date(),
      }
      console.log('[DEBUG] Sending message:', messageData)
      socket.emit('chatMessage', messageData)
      setMessages((prev) => [
        ...prev,
        { ...messageData, replyTo: replyTo || null },
      ])
      // Save message to DB
      if (accessToken) {
        fetch(API_ENDPOINTS.CHAT_MESSAGES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(messageData),
        })
          .then((response) => {
            if (response.ok) {
              return response.json()
            } else {
              throw new Error('Failed to save message to DB')
            }
          })
          .then((data) => {
            // Update the local message with the server-assigned _id
            setMessages((prev) =>
              prev.map((m) =>
                m.timestamp === messageData.timestamp &&
                m.sender._id === messageData.sender._id
                  ? { ...m, _id: data.message._id }
                  : m
              )
            )
          })
          .catch((error) =>
            console.error('Failed to save message to DB:', error)
          )
      }
      setCurrentMessage('')
      setReplyTo(null)
      inputRef.current?.focus()
    } else {
      console.log('[DEBUG] Message not sent - condition not met')
    }
  }

  const fetchMessages = async (room: 'public' | 'private') => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CHAT_MESSAGES}?room=${room}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const joinRoom = (roomType: 'public' | 'private') => {
    if (socket) {
      socket.emit('leaveRoom', currentRoom)
      socket.emit('joinRoom', roomType)
      setCurrentRoom(roomType)
      setMessages([])
      if (roomType === 'private') {
        // Show private modal first, do not fetch messages yet
        setShowPrivateModal(true)
      } else {
        // For public room, fetch messages immediately
        fetchMessages(roomType)
      }
    }
  }

  const renderMessageContent = (content: string) => {
    return <span>{content}</span>
  }

  // Removed file upload handler as per requirements

  const handleDeleteMessage = async (id: string) => {
    try {
      console.log('[DEBUG] Client delete request:', {
        messageId: id,
        endpoint: API_ENDPOINTS.DELETE_MESSAGE(id),
      })
      const response = await fetch(API_ENDPOINTS.DELETE_MESSAGE(id), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        console.log('[DEBUG] Delete successful for message:', id)
        setMessages((prevMessages) => prevMessages.filter((m) => m._id !== id))
        // Emit socket event to notify other users
        if (socket) {
          socket.emit('deleteMessage', { messageId: id, room: currentRoom })
        }
      } else {
        const errorText = await response.text()
        console.error(
          'Failed to delete message:',
          response.status,
          response.statusText,
          errorText
        )
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Private Chat Modal */}
      {showPrivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${
              isLight ? 'bg-white' : 'bg-gray-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-4">
              Select Recipients for Private Chat
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allUsers.map((user) => (
                <label key={user._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={privateRecipients.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPrivateRecipients([...privateRecipients, user._id])
                      } else {
                        setPrivateRecipients(
                          privateRecipients.filter((id) => id !== user._id)
                        )
                      }
                    }}
                    className="rounded"
                  />
                  <span>
                    {user.fullName} ({user.email})
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowPrivateModal(false)
                  setPrivateRecipients([])
                  setCurrentRoom('public')
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPrivateModal(false)
                  if (privateRecipients.length > 0) {
                    // After recipients selected, fetch private messages
                    fetchMessages('private')
                    setCurrentRoom('private')
                  } else {
                    setCurrentRoom('public')
                  }
                }}
                disabled={privateRecipients.length === 0}
                className="px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 disabled:opacity-50"
              >
                Start Private Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Chat Mode Sidebar */}
        <div
          className={`w-80 border-r ${
            isLight
              ? 'border-gray-200 bg-white'
              : 'border-gray-700 bg-gray-800/50'
          } backdrop-blur-xl shadow-xl`}
        >
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold flex items-center gap-2 ml-12">
              <MessageCircle className="animate-spin-slow" />
              Chat Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-12">
              Choose Public or Private chat
            </p>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => joinRoom('public')}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                currentRoom === 'public'
                  ? 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 border-2 border-violet-300 dark:border-violet-600 shadow-lg'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent border-gray-200 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-violet-500 animate-pulse" />
                <span className="font-semibold text-lg">Public Chat</span>
                {currentRoom === 'public' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Everyone can see your messages
              </div>
            </button>
            <button
              onClick={() => joinRoom('private')}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                currentRoom === 'private'
                  ? 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-300 dark:border-orange-600 shadow-lg'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent border-orange-200 bg-orange-50 dark:bg-orange-900/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="font-semibold text-lg">Private Chat</span>
                {currentRoom === 'private' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Messages are private to selected users
              </div>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div
            className={`p-4 border-b sticky top-0 z-10 ${
              isLight
                ? 'border-gray-200 bg-white'
                : 'border-gray-700 bg-gray-800/50'
            } backdrop-blur-xl shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentRoom === 'public' ? (
                  <Globe className="w-6 h-6 text-violet-500" />
                ) : (
                  <Lock className="w-6 h-6 text-orange-500" />
                )}
                <h2 className="text-xl font-bold">
                  {isSelectionMode
                    ? `${selectedMessages.size} selected`
                    : currentRoom === 'public'
                    ? 'Public Chat'
                    : 'Private Chat'}
                </h2>
                {!isSelectionMode && typingUser && (
                  <span className="text-sm text-gray-500 italic">
                    {typingUser} is typing...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSelectionMode ? (
                  <>
                    <button
                      onClick={async () => {
                        const deletePromises = Array.from(selectedMessages).map(
                          (messageId) => handleDeleteMessage(messageId)
                        )
                        await Promise.all(deletePromises)
                        setSelectedMessages(new Set())
                        setIsSelectionMode(false)
                      }}
                      disabled={selectedMessages.size === 0}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsSelectionMode(false)
                        setSelectedMessages(new Set())
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showMenuDropdown && (
                      <div className="absolute top-full right-0 bg-white dark:bg-gray-800 border rounded shadow p-2 z-50">
                        <button
                          onClick={() => {
                            setIsSelectionMode(!isSelectionMode)
                            setSelectedMessages(new Set())
                            setShowMenuDropdown(false)
                          }}
                          className="block w-full text-left p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {isSelectionMode
                            ? 'Exit selection'
                            : 'Select messages'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            ref={messagesContainerRef}
            onScroll={() => {
              if (messagesContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } =
                  messagesContainerRef.current
                if (scrollTop + clientHeight < scrollHeight - 100) {
                  setScrollButtonVisible(true)
                } else {
                  setScrollButtonVisible(false)
                }
              }
            }}
          >
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === user?._id
              const isSelected = message._id
                ? selectedMessages.has(message._id)
                : false
              return (
                <div
                  key={message._id || index}
                  className={`flex gap-3 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  } relative`}
                >
                  {isSelectionMode && isOwnMessage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newSelected = new Set(selectedMessages)
                        if (message._id !== undefined) {
                          if (newSelected.has(message._id)) {
                            newSelected.delete(message._id)
                          } else {
                            newSelected.add(message._id)
                          }
                          setSelectedMessages(newSelected)
                        }
                      }}
                      className="mt-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <CheckCircle
                        className={`w-5 h-5 ${
                          selectedMessages.has((message._id as string) || '')
                            ? 'text-green-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  )}
                  {!isOwnMessage && message.sender.profilePicture && (
                    <img
                      src={message.sender.profilePicture}
                      alt={message.sender.fullName}
                      className="w-8 h-8 rounded-full mt-1"
                    />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    } ${
                      isOwnMessage
                        ? 'bg-violet-500 text-white'
                        : isLight
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-gray-700 text-gray-100'
                    } relative ${!isOwnMessage ? 'pl-8' : ''}`}
                  >
                    <div
                      className={`absolute top-1 ${
                        isOwnMessage ? 'right-1' : 'left-1'
                      } flex flex-col space-y-1 z-20`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setReplyTo(message)
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(message.content)
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {message.replyTo ? (
                      <div className="text-xs opacity-70 mb-1 border-l-2 border-current pl-2">
                        Replying to: {message.replyTo.sender.fullName}:{' '}
                        {renderMessageContent(
                          (message.replyTo as Message).content
                        )}
                      </div>
                    ) : null}
                    {renderMessageContent(message.content)}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
            {scrollButtonVisible && (
              <button
                onClick={() => {
                  messagesContainerRef.current?.scrollTo({
                    top: messagesContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  })
                }}
                className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white rounded-full p-2 shadow-lg hover:bg-violet-600 z-50"
                title="Scroll to latest message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 15l-7-7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Input Area */}
          <div
            className={`p-4 border-t sticky bottom-0 ${
              isLight
                ? 'border-gray-200 bg-white'
                : 'border-gray-700 bg-gray-800/50'
            } backdrop-blur-xl`}
          >
            <ReplyBar />
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                placeholder="Type a message..."
                className={`flex-1 p-2 rounded-lg ${
                  isLight
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-gray-700 text-white'
                }`}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Smile className="w-5 h-5" />
              </button>
              {/* Removed Paperclip and Mic buttons as per user request */}
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="p-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border rounded-lg p-2 shadow-lg max-h-40 overflow-y-auto"
              >
                <div className="grid grid-cols-8 gap-1">
                  {emojis.slice(0, 24).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setCurrentMessage((prev) => prev + emoji)
                        setShowEmojiPicker(false)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
