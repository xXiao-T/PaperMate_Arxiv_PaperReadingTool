import { BookOpen, FileText, Search, MessageCircle, Bookmark, History, Settings } from 'lucide-react'

const menuItems = [
  { icon: BookOpen, label: '论文库', active: true },
  { icon: FileText, label: '结构化解析', active: false },
  { icon: Search, label: '知识检索', active: false },
  { icon: MessageCircle, label: '智能问答', active: false },
  { icon: Bookmark, label: '我的收藏', active: false },
  { icon: History, label: '阅读历史', active: false },
  { icon: Settings, label: '设置', active: false },
]

export default function Sidebar({ categories, onCategoryChange, selectedCategory }) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">导航</h2>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                item.active ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">学科分类</h2>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange('')}
              className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === '' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onCategoryChange(category)}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>抓取新论文</span>
        </button>
      </div>
    </aside>
  )
}