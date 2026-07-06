import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Users, ExternalLink, BookOpen, Lightbulb, MessageSquare, FileText, Edit2, Trash2, Save } from 'lucide-react'
import { analysisAPI, qaAPI, noteAPI } from '../services/api'

export default function PaperDetail({ paper, onBack }) {
  const [concepts, setConcepts] = useState([])
  const [questions, setQuestions] = useState([])
  const [notes, setNotes] = useState([])
  const [activeTab, setActiveTab] = useState('summary')
  const [questionInput, setQuestionInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [loading, setLoading] = useState({ concepts: false, qa: false, notes: false })
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (paper?.id) {
      loadConcepts()
      loadQAs()
      loadNotes()
    }
  }, [paper?.id])

  const loadConcepts = async () => {
    setLoading(prev => ({ ...prev, concepts: true }))
    try {
      const response = await analysisAPI.getConcepts(paper.id)
      setConcepts(response.data)
    } catch (error) {
      console.error('Failed to load concepts:', error)
    } finally {
      setLoading(prev => ({ ...prev, concepts: false }))
    }
  }

  const loadQAs = async () => {
    setLoading(prev => ({ ...prev, qa: true }))
    try {
      const response = await qaAPI.getByPaper(paper.id)
      setQuestions(response.data)
    } catch (error) {
      console.error('Failed to load QAs:', error)
    } finally {
      setLoading(prev => ({ ...prev, qa: false }))
    }
  }

  const loadNotes = async () => {
    setLoading(prev => ({ ...prev, notes: true }))
    try {
      const response = await noteAPI.getByPaper(paper.id)
      setNotes(response.data)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(prev => ({ ...prev, notes: false }))
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      await analysisAPI.analyze(paper.id)
      loadConcepts()
    } catch (error) {
      console.error('Failed to analyze:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) return
    
    try {
      const response = await qaAPI.ask(paper.id, questionInput)
      setQuestions(prev => [response.data, ...prev])
      setQuestionInput('')
    } catch (error) {
      console.error('Failed to ask question:', error)
    }
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    
    try {
      await noteAPI.create(paper.id, noteInput)
      setNoteInput('')
      loadNotes()
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await noteAPI.delete(noteId)
      loadNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  if (!paper) return null

  const tabs = [
    { id: 'summary', label: '摘要', icon: FileText },
    { id: 'concepts', label: '核心概念', icon: Lightbulb },
    { id: 'qa', label: '智能问答', icon: MessageSquare },
    { id: 'notes', label: '笔记', icon: Edit2 },
  ]

  return (
    <div className="p-6">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>返回列表</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {paper.category}
            </span>
            <div className="flex space-x-2">
              <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">PDF</span>
              </a>
              <a href={paper.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">arXiv</span>
              </a>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{paper.title}</h1>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Users className="h-4 w-4 mr-1" />
            <span>{paper.authors}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>发表于 {paper.publishedDate}</span>
            {paper.updatedDate && (
              <span className="ml-4">更新于 {paper.updatedDate}</span>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">摘要</h3>
                <p className="text-gray-600 leading-relaxed">{paper.abstractText}</p>
              </div>
              
              {paper.summary && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">结构化摘要</h3>
                  <p className="text-gray-600 leading-relaxed">{paper.summary}</p>
                </div>
              )}
              
              {paper.methods && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">研究方法</h3>
                  <p className="text-gray-600 leading-relaxed">{paper.methods}</p>
                </div>
              )}
              
              {paper.conclusions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">结论</h3>
                  <p className="text-gray-600 leading-relaxed">{paper.conclusions}</p>
                </div>
              )}
              
              {!paper.isProcessed && (
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-primary flex items-center space-x-2"
                >
                  {analyzing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Lightbulb className="h-4 w-4" />
                  )}
                  <span>{analyzing ? '解析中...' : '解析论文'}</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'concepts' && (
            <div className="space-y-4">
              {loading.concepts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : concepts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无概念数据
                </div>
              ) : (
                concepts.map((concept) => (
                  <div key={concept.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{concept.name}</h4>
                      <span className="text-xs text-gray-500">
                        重要度: {concept.importanceScore?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{concept.definition}</p>
                    {concept.relatedConcepts && (
                      <div className="flex flex-wrap gap-2">
                        {concept.relatedConcepts.split(', ').map((rel, idx) => (
                          <span key={idx} className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                            {rel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <textarea
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="输入您的问题，例如：这篇论文的核心贡献是什么？"
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleAskQuestion}
                    disabled={!questionInput.trim()}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>提问</span>
                  </button>
                </div>
              </div>
              
              {loading.qa ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无问答记录
                </div>
              ) : (
                questions.map((qa) => (
                  <div key={qa.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{qa.question}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-gray-600">{qa.answer}</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                      {qa.createdAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="添加您的笔记..."
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleAddNote}
                    disabled={!noteInput.trim()}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>保存笔记</span>
                  </button>
                </div>
              </div>
              
              {loading.notes ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无笔记
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{note.createdAt}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}