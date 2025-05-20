import { useState, useEffect } from 'react'
import { processImage, checkTaskStatus } from '../services/api'

const ImageProcessing = () => {
  const [imageUrl, setImageUrl] = useState('')
  const [apiKey, setApiKey] = useState(() => {
    // 从本地存储中获取API密钥
    return localStorage.getItem('apiKey') || ''
  })
  const [taskId, setTaskId] = useState('')
  const [resultImage, setResultImage] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, polling, success, error
  const [error, setError] = useState('')
  const [pollingInterval, setPollingInterval] = useState(null)
  const [functionType, setFunctionType] = useState('remove_watermark')
  const [prompt, setPrompt] = useState('去除图像中的文字')

  // 当API密钥变化时，保存到本地存储
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey)
    }
  }, [apiKey])

  // 可用的图像处理功能
  const functionOptions = [
    { value: 'remove_watermark', label: '去水印', defaultPrompt: '去除图像中的文字', parameters: {} },
    { value: 'super_resolution', label: '图像放大', defaultPrompt: '图像超分。', parameters: { upscale_factor: 2 } },
  ]

  // 当功能类型改变时，更新默认提示词
  useEffect(() => {
    const selectedFunction = functionOptions.find((option) => option.value === functionType)
    if (selectedFunction) {
      setPrompt(selectedFunction.defaultPrompt)
    }
  }, [functionType])

  // 清除轮询定时器
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // 处理图片提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      setError('请输入图片链接')
      return
    }

    if (!apiKey.trim()) {
      setError('请输入API密钥')
      return
    }

    try {
      setStatus('loading')
      setError('')
      setResultImage('')

      const selectedFunction = functionOptions.find((option) => option.value === functionType)
      if (!selectedFunction) {
        setError('请选择图像处理功能')
        return
      }
      // 发送图像处理请求
      const response = await processImage(imageUrl, apiKey, functionType, selectedFunction.defaultPrompt, selectedFunction.parameters)

      if (response.output?.task_id) {
        setTaskId(response.output.task_id)
        setStatus('polling')
        startPolling(response.output.task_id)
      } else {
        throw new Error('未获取到任务ID')
      }
    } catch (err) {
      setStatus('error')
      setError(err.message || '处理请求失败')
    }
  }

  // 开始轮询任务状态
  const startPolling = (id) => {
    const interval = setInterval(async () => {
      try {
        const result = await checkTaskStatus(id, apiKey)
        const taskStatus = result.output?.task_status

        if (taskStatus === 'SUCCEEDED') {
          clearInterval(interval)
          setPollingInterval(null)
          setStatus('success')

          if (result.output?.results && result.output.results.length > 0) {
            setResultImage(result.output.results[0].url)
          }
        } else if (taskStatus === 'FAILED' || taskStatus === 'CANCELED') {
          clearInterval(interval)
          setPollingInterval(null)
          setStatus('error')
          setError(`任务${taskStatus === 'FAILED' ? '失败' : '已取消'}`)
        }
        // PENDING, RUNNING, UNKNOWN 状态继续轮询
      } catch (err) {
        clearInterval(interval)
        setPollingInterval(null)
        setStatus('error')
        setError(err.message || '状态查询失败')
      }
    }, 3000) // 每3秒查询一次

    setPollingInterval(interval)
  }

  // 重置表单
  const handleReset = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    setImageUrl('')
    setTaskId('')
    setResultImage('')
    setStatus('idle')
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
            API密钥
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="输入您的API密钥"
            disabled={status === 'loading' || status === 'polling'}
          />
        </div>

        <div>
          <label htmlFor="functionType" className="block text-sm font-medium mb-1">
            处理功能
          </label>
          <select
            id="functionType"
            value={functionType}
            onChange={(e) => setFunctionType(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            disabled={status === 'loading' || status === 'polling'}
          >
            {functionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            提示词
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="输入处理提示词"
            disabled={status === 'loading' || status === 'polling'}
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            图片链接
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="输入需要处理的图片链接"
            disabled={status === 'loading' || status === 'polling'}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={status === 'loading' || status === 'polling'}
          >
            {status === 'loading' ? '处理中...' : status === 'polling' ? '处理中...' : '开始处理'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            重置
          </button>
        </div>
      </form>

      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {status === 'polling' && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-md">
          正在处理图片，请稍候...
          <div className="mt-2 text-sm">任务ID: {taskId}</div>
        </div>
      )}

      {resultImage && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">处理结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">原图</h3>
              <img src={imageUrl} alt="原图" className="w-full h-auto border rounded-md" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">处理后图片</h3>
              <img src={resultImage} alt="处理后图片" className="w-full h-auto border rounded-md" />
              <div className="mt-2">
                <a 
                  href={resultImage} 
                  download="processed-image.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  下载图片
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageProcessing
