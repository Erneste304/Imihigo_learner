import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, Circle, Trophy, Target } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  type: string
  completed: boolean
  score?: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  progress: number
  modules: Module[]
}

export default function LearningPath() {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pathRes, recRes] = await Promise.all([
        api.get('/learning/path'),
        api.get('/learning/recommendations')
      ])
      setLearningPath(pathRes.data)
      setRecommendations(recRes.data)
    } catch (error) {
      console.error('Failed to fetch learning data', error)
      // If path fetch fails because it does not exist, that's fine.
    } finally {
      setLoading(false)
    }
  }

  const generatePath = async () => {
    try {
      const response = await api.post('/learning/path/generate')
      setLearningPath(response.data)
      fetchData() // to get recommendations updated
    } catch (error) {
      console.error('Failed to generate path', error)
    }
  }

  const completeModule = async (moduleId: string, score: number) => {
    try {
      await api.put('/learning/progress', { moduleId, score })
      fetchData()
    } catch (error) {
      console.error('Failed to update progress', error)
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">Loading your learning path...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Your AI-Powered Learning Path</h1>
        <p className="text-blue-100">Personalized recommendations based on your skill gaps</p>
      </div>

      {/* Skill Gaps */}
      {recommendations?.skillGaps?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Target className="text-blue-600" /> Skill Gaps Identified
          </h2>
          <div className="space-y-4">
            {recommendations.skillGaps.map((gap: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{gap.skill}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Current Level: {gap.currentLevel} → Required: {gap.requiredLevel}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    gap.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    gap.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {gap.priority} Priority
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2 transition-all"
                      style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Recommendations:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {gap.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Practice */}
      {recommendations?.dailyPractice?.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Today's Practice</h2>
          <div className="space-y-2">
            {recommendations.dailyPractice.map((practice: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{practice.activity}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{practice.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {learningPath ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{learningPath.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">{learningPath.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(learningPath.progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8">
            <div 
              className="bg-blue-600 rounded-full h-3 transition-all"
              style={{ width: `${learningPath.progress}%` }}
            />
          </div>

          <div className="space-y-4">
            {learningPath.modules.map((module, index) => (
              <div key={module.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {module.completed ? (
                      <CheckCircle className="text-green-600 mt-1" size={24} />
                    ) : (
                      <Circle className="text-gray-400 mt-1" size={24} />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">Module {index + 1}</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs">{module.type}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                      {module.score && (
                        <p className="text-sm text-blue-600 mt-1">Score: {module.score}%</p>
                      )}
                    </div>
                  </div>
                  {!module.completed && (
                    <button
                      onClick={() => completeModule(module.id, 85)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
          <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Learning Path Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Take assessments to generate your personalized learning path</p>
          <button
            onClick={generatePath}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Generate Learning Path
          </button>
        </div>
      )}
    </div>
  )
}
