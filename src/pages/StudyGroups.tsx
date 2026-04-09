import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Users, Plus, MessageCircle, BookOpen, Search, ArrowRight } from 'lucide-react'

interface StudyGroup {
  id: string
  name: string
  topic: string
  description: string
  ownerId: string
  membersCount: number
  isPublic: boolean
  createdAt: string
}

export default function StudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/study-groups')
      .then(res => setGroups(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const joinGroup = async (groupId: string) => {
    try {
      const res = await api.post(`/study-groups/join/${groupId}`)
      if (res.data.success) {
        alert('Joined successfully!')
        // Refresh count
        setGroups(groups.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g))
      }
    } catch (err) {
      alert('Failed to join group.')
    }
  }

  const createGroup = async () => {
    const name = prompt('Group Name:')
    if (!name) return
    const topic = prompt('Topic:')
    const description = prompt('Description:')
    
    try {
      const res = await api.post('/study-groups/create', { name, topic, description })
      if (res.data.success) {
        setGroups([res.data.data, ...groups])
      }
    } catch (err) {
      alert('Failed to create group.')
    }
  }

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.topic.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold dark:text-white mb-2 tracking-tight">Virtual Study Groups</h1>
          <p className="text-gray-500 text-lg">Learn together, succeed together. Join a squad and master new skills.</p>
        </div>
        <button 
          onClick={createGroup}
          className="btn btn-primary shadow-lg shadow-blue-500/30 flex items-center gap-2 self-start"
        >
          <Plus size={20} /> Create New Group
        </button>
      </header>

      <div className="mb-10 relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Filter by topic (e.g. Frontend, AI)..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white dark:bg-gray-900 rounded-3xl p-8 border dark:border-gray-800 hover:border-blue-500 transition-all group shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                  {group.topic}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Users size={16} /> {group.membersCount}
                </div>
              </div>

              <h3 className="text-2xl font-bold dark:text-white mb-3 group-hover:text-blue-600 transition">{group.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 flex-1 leading-relaxed">
                {group.description}
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => joinGroup(group.id)}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                >
                  Join Group
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-blue-600 transition">
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
