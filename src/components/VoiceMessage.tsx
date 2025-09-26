import React from 'react'
import VoiceVisualizer from './VoiceVisualizer'

interface VoiceMessageProps {
  audioUrl: string
  isLight?: boolean
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ audioUrl, isLight }) => {
  return (
    <div className="voice-message">
      <VoiceVisualizer audioUrl={audioUrl} />
    </div>
  )
}

export default VoiceMessage
