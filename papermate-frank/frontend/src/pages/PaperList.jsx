import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Filter } from 'lucide-react'
import PaperCard from '../components/PaperCard'
import { paperAPI } from '../services/api'

export default function PaperList({ onSelectPaper, category, searchResults }) {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [arxivIdInput, setArxivIdInput] = useState('')
  const [showFetchModal, setShowFetchModal] = useState(false)

  useEffect(() => {
    loadPapers()
  }, [category])

  useEffect(() => {
    if (searchResults) {
      setPapers(searchResults)
    } else {
      loadPapers()
    }
  }, [searchResults])

  const loadPapers = async () => {
    setLoading(true)
    try {
      const response = category 
        ? await paperAPI.getByCategory(category)
        : await paperAPI.getAll()
      setPapers(response.data)
    } catch (error) {
      console.error('Failed to load papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchPaper = async () => {
    if (!arxivIdInput.trim()) return
    
    try {
      await paperAPI.fetch(arxivIdInput.trim())
      setArxivIdInput('')
      setShowFetchModal(false)
      loadPapers()
    } catch (error) {
      console.error('Failed to fetch paper:', error)
    }
  }

  const handleBatchFetch = async () => {
    const ids = ['2301.00101', '2301.00202', '2301.00303', '2301.00404', '2301.00505']
    try {
      await paperAPI.batchFetch(ids)
      setShowFetchModal(false)
      loadPapers()
    } catch (error) {
      console.error('Failed to batch fetch:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">论文库</h2>
          <p className="text-gray-500 mt-1">
            {category ? `分类: ${category}` : '全部论文'} · {papers.length} 篇
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <Filter className="h-5 w-5" />
            <span>筛选</span>
          </button>
          <button 
            onClick={loadPapers}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-5 w-5" />
            <span>刷新</span>
          </button>
          <button 
            onClick={() => setShowFetchModal(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="h-5 w-5" />
            <span>抓取论文</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">暂无论文</div>
          <button 
            onClick={() => setShowFetchModal(true)}
            className="btn-primary"
          >
            抓取论文
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard 
              key={paper.id} 
              paper={paper} 
              onClick={() => onSelectPaper(paper)}
            />
          ))}
        </div>
      )}

      {showFetchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">抓取新论文</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ArXiv ID</label>
                <input
                  type="text"
                  value={arxivIdInput}
                  onChange={(e) => setArxivIdInput(e.target.value)}
                  placeholder="例如: 2301.00101"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchPaper()}
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleBatchFetch}
                  className="flex-1 btn-secondary"
                >
                  批量抓取示例
                </button>
                <button 
                  onClick={handleFetchPaper}
                  className="flex-1 btn-primary"
                >
                  抓取
                </button>
              </div>
              <button 
                onClick={() => setShowFetchModal(false)}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}