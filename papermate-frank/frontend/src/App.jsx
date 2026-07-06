import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import PaperList from './pages/PaperList'
import PaperDetail from './pages/PaperDetail'
import { paperAPI, searchAPI } from './services/api'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await paperAPI.getAllCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories(['cs.CL', 'cs.LG', 'cs.CV', 'stat.ML'])
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }
    
    try {
      const response = await searchAPI.byKeyword(searchQuery.trim())
      setSearchResults(response.data)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSearchResults(null)
  }

  const handleSelectPaper = (paper) => {
    setSelectedPaper(paper)
  }

  const handleBackToList = () => {
    setSelectedPaper(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex">
        <Sidebar 
          categories={categories}
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
        />
        
        <main className="flex-1">
          {selectedPaper ? (
            <PaperDetail 
              paper={selectedPaper}
              onBack={handleBackToList}
            />
          ) : (
            <PaperList 
              onSelectPaper={handleSelectPaper}
              category={selectedCategory}
              searchResults={searchResults}
            />
          )}
        </main>
      </div>
    </div>
  )
}