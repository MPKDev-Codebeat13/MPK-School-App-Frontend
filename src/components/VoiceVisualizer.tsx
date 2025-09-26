import React, { useEffect, useRef } from 'react'

interface VoiceVisualizerProps {
  audioUrl: string
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationIdRef = useRef<number>()

  useEffect(() => {
    if (!audioUrl) return

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    const source = audioCtx.createMediaElementSource(audio)
    const analyser = audioCtx.createAnalyser()
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const WIDTH = canvas.width
    const HEIGHT = canvas.height

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = '#222'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const barWidth = (WIDTH / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2
        ctx.fillStyle = `rgb(${barHeight + 100},50,150)`
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      audio.pause()
      audioCtx.close()
    }
  }, [audioUrl])

  return (
    <div>
      <audio controls src={audioUrl} ref={audioRef} />
      <canvas ref={canvasRef} width={300} height={60} />
    </div>
  )
}

export default VoiceVisualizer
