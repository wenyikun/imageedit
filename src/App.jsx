import { useState } from 'react'
import ImageEditor from './components/ImageEditor'
import ImageProcessing from './components/ImageProcessing'

function App() {
  const [activeTab, setActiveTab] = useState('watermark') // watermark, processing

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">玩玩图吧</h1>
          <p className="mt-1 text-sm text-gray-500">去除水印、图像编辑一站式解决方案</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('watermark')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'watermark'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  图像去水印
                </button>
                <button
                  onClick={() => setActiveTab('processing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'processing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  高级图像处理
                </button>
              </nav>
            </div>

            {activeTab === 'watermark' ? (
              <div>
                <h2 className="text-xl font-semibold mb-6">图像去水印</h2>
                <ImageEditor />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-6">高级图像处理</h2>
                <ImageProcessing />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
