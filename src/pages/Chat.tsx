import React, { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import type { User } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'

import { API_ENDPOINTS, API_BASE_URL } from '../lib/api'

import {
  Send,
  Globe,
  Smile,
  MoreVertical,
  Trash2,
  Reply,
  Copy,
  CheckCircle,
} from 'lucide-react'

interface Message {
  _id?: string
  localId?: string
  sender: {
    _id: string
    fullName: string
    email: string
    profilePicture?: string
  } | null
  content: string
  timestamp: Date
  room: string
  replyTo?: Message | null
}

const Chat: React.FC = () => {
  const { user, accessToken } = useAuth()
  const { theme } = useTheme()
  const isLight = theme.class.includes('text-gray-900')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [fullUserData, setFullUserData] = useState<any>(null)

  // Helper function to get user ID (handles both _id and id properties)
  const getUserId = (user: any): string => {
    return user?._id || user?.id || ''
  }

  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMenuDropdown, setShowMenuDropdown] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [scrollButtonVisible, setScrollButtonVisible] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  )
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Reply bar UI above input
  const ReplyBar = () => {
    if (!replyTo) return null
    return (
      <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-2 rounded mb-2">
        <div className="flex-grow text-sm text-gray-700 dark:text-gray-300 truncate">
          Replying to:{' '}
          {replyTo.sender ? replyTo.sender.fullName : 'Unknown sender'}:{' '}
          {replyTo.content || ''}
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
    // Fetch full user data
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (response.ok) {
          const data = await response.json()
          // Ensure user data is in expected format
          if (data.user) {
            setFullUserData(data.user)
          } else {
            setFullUserData(data)
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    if (accessToken) {
      fetchUserProfile()
    }
  }, [accessToken, user?._id])

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = API_BASE_URL.replace('/api', '')
    const newSocket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
    })
    setSocket(newSocket)
    newSocket.emit('joinRoom', 'public')
    // Fetch initial messages for public room
    fetchMessages('public')
    newSocket.on('chatMessage', (message: Message) => {
      if (!message.sender) return
      if (message.sender._id !== getUserId(user)) {
        setMessages((prev) => [...prev, message])
      } else {
        // Update the local message with the server-assigned _id
        setMessages((prev) =>
          prev.map((m) =>
            m.timestamp === message.timestamp &&
            m.sender &&
            message.sender &&
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
        setTypingUser('Someone is typing...')
        setTimeout(() => setTypingUser(null), 3000)
      }
    })
    return () => {
      newSocket.disconnect()
    }
  }, [accessToken, user?._id])

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

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreMessages()
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, loadingMore])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?._id || user?.id || ''
    console.log('[DEBUG] sendMessage called:', {
      currentMessage: currentMessage.trim(),
      user: user,
      userId: userId,
      userKeys: user ? Object.keys(user) : 'user is null',
      condition: currentMessage.trim() && userId,
    })

    if (currentMessage.trim() && userId && user && socket) {
      const messageData: any = {
        content: currentMessage,
        room: 'public',
        replyTo: replyTo ? replyTo._id : null,
        timestamp: new Date(),
      }
      console.log('[DEBUG] Sending message via socket:', messageData)

      // Add message locally for immediate display
      const localMessage: Message = {
        sender: {
          _id: user._id || '',
          fullName: user.fullName || '',
          email: user.email || '',
          profilePicture: user.profilePicture,
        },
        content: currentMessage,
        timestamp: new Date(),
        room: 'public',
        replyTo: replyTo,
      }
      setMessages((prev) => [...prev, localMessage])

      // Emit message via socket.io
      socket.emit('chatMessage', messageData)

      setCurrentMessage('')
      setReplyTo(null)
      inputRef.current?.focus()
    } else {
      console.log('[DEBUG] Message not sent - condition not met')
    }
  }

  const fetchMessages = async (room: string, before?: string) => {
    try {
      let url = `${API_ENDPOINTS.CHAT_MESSAGES}?room=${room}`
      if (before) url += `&before=${before}`
      console.log('[DEBUG] Fetching messages from:', url)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(
        '[DEBUG] Response status:',
        response.status,
        response.statusText
      )
      console.log(
        '[DEBUG] Response headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('[DEBUG] Invalid content-type:', contentType)
          throw new Error('Server returned invalid response format.')
        }

        const text = await response.text()
        console.log('[DEBUG] Raw response text length:', text.length)

        if (!text || text.trim() === '') {
          console.warn('[DEBUG] Empty response body received')
          if (!before) {
            setMessages([])
            setHasMore(false)
          }
          return
        }

        let data
        try {
          data = JSON.parse(text)
          console.log('[DEBUG] Successfully parsed JSON data')
        } catch (parseError) {
          console.error('[DEBUG] JSON parse error:', parseError)
          console.error(
            '[DEBUG] Raw text that failed to parse:',
            text.substring(0, 200)
          )
          throw new Error('Failed to parse server response as JSON')
        }

        console.log(
          '[DEBUG] Parsed data:',
          data.messages?.length || 0,
          'messages'
        )

        const messagesArray = Array.isArray(data.messages) ? data.messages : []
        console.log(
          '[DEBUG] Messages array type check passed, length:',
          messagesArray.length
        )

        if (before) {
          setMessages((prev) => [...messagesArray, ...prev])
          if (messagesArray.length < 50) setHasMore(false)
        } else {
          setMessages(messagesArray)
          setHasMore(messagesArray.length === 50)
        }

        console.log('[DEBUG] Messages state updated successfully')
      } else {
        let errorText = ''
        try {
          errorText = await response.text()
        } catch (e) {
          errorText = 'Could not read error response'
        }
        console.error('[DEBUG] HTTP error:', response.status, errorText)

        // On error, set messages to empty array to ensure UI updates
        if (!before) {
          setMessages([])
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('[DEBUG] Fetch request was aborted (timeout)')
        } else if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')
        ) {
          console.error('[DEBUG] Network error occurred')
        }
      }

      // On network error, set messages to empty array to ensure UI updates
      if (!before) {
        setMessages([])
        setHasMore(false)
      }
    }
  }

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const oldestMessage = messages[0]
    if (!oldestMessage) return
    const before = oldestMessage.timestamp.toISOString()
    await fetchMessages('public', before)
    setLoadingMore(false)
  }

  const renderMessageContent = (content: string) => {
    return <div className="break-words">{content}</div>
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
          socket.emit('deleteMessage', { messageId: id, room: 'public' })
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
    <div
      className={`flex min-h-screen ${theme} ${
        isSidebarOpen ? 'flex-col sm:flex-row' : 'flex-row'
      } overflow-x-hidden`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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
              <Globe className="w-6 h-6 text-violet-500" />
              <h2 className="text-xl font-bold">
                {isSelectionMode ? `${selectedMessages.size} selected` : 'Chat'}
              </h2>
              {!isSelectionMode && typingUser && (
                <span className="text-sm text-gray-500 italic">
                  {typingUser}
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
                        className="block w-full text-left p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
                      >
                        {isSelectionMode ? 'Exit selection' : 'Select messages'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div
            className="p-4 space-y-4 relative"
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
            {hasMore && !loadingMore && (
              <div ref={loadMoreRef} className="text-center py-2 text-gray-500">
                Loading more messages...
              </div>
            )}
            {messages.length === 0 && !loadingMore ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Globe className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Start the conversation by sending a message!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                if (!message.sender) return null
                const sender = message.sender
                const isOwnMessage =
                  sender._id === user?._id || sender.email === user?.email
                const isLeftAligned = !isOwnMessage
                const isSelected = message._id
                  ? selectedMessages.has(message._id)
                  : false
                return (
                  <div
                    key={message._id || index}
                    className={`flex gap-3 ${
                      isLeftAligned ? 'justify-start' : 'justify-end'
                    } relative`}
                  >
                    {isSelectionMode && isOwnMessage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newSelected = new Set(selectedMessages)
                          if (message._id) {
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
                            message._id && selectedMessages.has(message._id)
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    )}
                    {isLeftAligned && (
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center mt-1 relative">
                        <span className="text-sm font-bold text-white select-none">
                          {sender.fullName?.slice(0, 2)?.toUpperCase() || 'U'}
                        </span>
                        {sender.profilePicture && (
                          <img
                            src={sender.profilePicture}
                            alt={sender.fullName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm absolute top-0 left-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    )}
                    {!isLeftAligned && (
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center mt-1 relative">
                        <span className="text-sm font-bold text-white select-none">
                          {(fullUserData || user)?.fullName
                            ?.slice(0, 2)
                            ?.toUpperCase() || 'U'}
                        </span>
                        {(fullUserData || user).profilePicture && (
                          <img
                            src={(fullUserData || user).profilePicture}
                            alt={(fullUserData || user).fullName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm absolute top-0 left-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      } ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                          : isLight
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-gray-700 text-gray-100'
                      } relative ${!isOwnMessage ? 'pl-10' : ''}`}
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
                      {message.replyTo && message.replyTo.sender ? (
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
              })
            )}
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
                isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-700 text-white'
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
  )
}

export default Chat
