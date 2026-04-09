import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Trophy, Award, Coins, Flame, TrendingUp, Gift } from 'lucide-react'

interface GamificationData {
  profile: {
    level: number
    xp: number
    xpToNextLevel: number
    coins: number
    streak: number
    badges: any[]
    statistics: any
  }
  rank: number
  nextBadges: any[]
  achievements: any
}

export default function GamificationDashboard() {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/gamification/profile')
      setData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch gamification data', error)
    } finally {
      setLoading(false)
    }
  }

  const claimDailyReward = async () => {
    try {
      const response = await api.post('/gamification/claim-daily')
      alert(`🎉 You earned ${response.data.data.xp} XP and ${response.data.data.coins} coins!`)
      fetchData()
    } catch (error) {
      console.error('Failed to claim reward', error)
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">Loading your profile...</div>
  if (!data) return null

  const { profile, rank, nextBadges, achievements } = data
  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-md hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Level</p>
              <p className="text-3xl font-bold">{profile.level}</p>
            </div>
            <Trophy size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-md hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total XP</p>
              <p className="text-3xl font-bold">{profile.xp.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-md hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Coins</p>
              <p className="text-3xl font-bold">{profile.coins}</p>
            </div>
            <Coins size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white shadow-md hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Daily Streak</p>
              <p className="text-3xl font-bold">{profile.streak} days</p>
            </div>
            <Flame size={40} />
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">Progress to Level {profile.level + 1}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{profile.xp} / {profile.xpToNextLevel} XP</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-blue-600 rounded-full h-3 transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Daily Reward */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-8 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Daily Reward</h3>
            <p className="text-purple-100">Claim your daily bonus and keep your streak!</p>
          </div>
          <button
            onClick={claimDailyReward}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
          >
            <Gift size={20} /> Claim
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Badges Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Award className="text-blue-600" /> Your Badges
          </h2>
          {profile.badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {profile.badges.map((badge) => (
                <div key={badge.id} className="border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center hover:shadow-md transition">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{badge.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Complete assessments to earn badges!</p>
          )}

          {/* Next Badges */}
          {nextBadges && nextBadges.length > 0 && (
            <div className="mt-6 border-t dark:border-gray-600 pt-4">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Next Achievements Tracker</h3>
              <div className="space-y-3">
                {nextBadges.map((badge) => (
                  <div key={badge.id} className="border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{badge.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-blue-600 rounded-full h-1.5"
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300">Assessments Taken</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.statistics.totalAssessments}</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300">Perfect Scores</span>
              <span className="font-semibold text-green-600">{profile.statistics.perfectScores}</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300">Courses Completed</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.statistics.coursesCompleted}</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300">Certificates Earned</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.statistics.certificatesEarned}</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300">Jobs Applied</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.statistics.jobsApplied}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">Global Rank</span>
              <span className="font-semibold text-blue-600">#{rank}</span>
            </div>
          </div>

          {/* Achievement Progress */}
          <div className="mt-6 pt-4 border-t dark:border-gray-600">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Next Level Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">To Level {profile.level + 1}</span>
                <span className="text-gray-900 dark:text-white">{Math.round(achievements.nextLevel.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${achievements.nextLevel.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2 text-gray-900 dark:text-white">
          <Trophy className="text-blue-600" /> Top Learners This Week
        </h2>
        <button 
          onClick={() => window.location.href = '/leaderboard'}
          className="text-blue-600 font-medium hover:underline transition"
        >
          View Full Leaderboard →
        </button>
      </div>
    </div>
  )
}
