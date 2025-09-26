import React, { useEffect, useRef } from 'react'

interface RecordingVisualizerProps {
  stream: MediaStream
}

const RecordingVisualizer: React.FC<RecordingVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()

  useEffect(() => {
    if (!stream) return

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({} as any)
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    source.connect(analyser)
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
      audioCtx.close()
    }
  }, [stream])

  return (
    <canvas ref={canvasRef} width={200} height={40} className="border rounded" />
  )
}

export default RecordingVisualizer
