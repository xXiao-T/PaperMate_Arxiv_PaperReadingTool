import { Calendar, Users, Tag, ExternalLink } from 'lucide-react'

export default function PaperCard({ paper, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {paper.category}
        </span>
        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{paper.title}</h3>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{paper.abstractText}</p>
      
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Users className="h-4 w-4 mr-1" />
        <span className="line-clamp-1">{paper.authors}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{paper.publishedDate}</span>
        </div>
        {paper.isProcessed && (
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500">已解析</span>
          </div>
        )}
      </div>
    </div>
  )
}