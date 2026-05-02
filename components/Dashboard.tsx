import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Trophy, Star, Target, Zap, Clock, Shield } from 'lucide-react';
import { UserData } from '@/types/userData';
import { useSound } from '@/hooks/useSound';

type DashboardProps = {
  userData: UserData;
  onBack: () => void;
};

export const Dashboard: React.FC<DashboardProps> = ({ userData, onBack }) => {
  const { playClick } = useSound();
  const { profile, stats, tactics, skills } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex items-center bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-sm border-2 border-white">
          <button 
            onClick={() => { playClick(); onBack(); }}
            className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full text-indigo-700 transition"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-4xl font-black text-indigo-900 drop-shadow-sm">My Journey</h1>
          </div>
          <div className="w-14"></div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
            {profile.avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-800">{profile.displayName || "Chess Explorer"}</h2>
            <p className="text-gray-500 font-bold mb-4">CUZO Academy Student ({profile.ageRange})</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-indigo-50 px-4 py-2 rounded-2xl border-2 border-indigo-100 flex items-center gap-2">
                <Trophy className="text-indigo-500" size={20} />
                <span className="font-bold text-indigo-900">Rating: {Math.round(stats.estimatedRating)}</span>
              </div>
              <div className="bg-orange-50 px-4 py-2 rounded-2xl border-2 border-orange-100 flex items-center gap-2">
                <Zap className="text-orange-500" size={20} />
                <span className="font-bold text-orange-900">Win Rate: {Math.round(stats.winRate)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Overview */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100">
            <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" /> Game Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Games Played" value={stats.gamesPlayed} color="bg-blue-50 text-blue-900 border-blue-200" />
              <StatBox label="Wins" value={stats.gamesWon} color="bg-green-50 text-green-900 border-green-200" />
              <StatBox label="Current Streak" value={stats.currentWinStreak} icon="🔥" color="bg-orange-50 text-orange-900 border-orange-200" />
              <StatBox label="Longest Streak" value={stats.longestWinStreak} color="bg-purple-50 text-purple-900 border-purple-200" />
            </div>
          </div>

          {/* Weaknesses / Mentor Feedback */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100">
            <h3 className="text-xl font-black text-pink-900 mb-6 flex items-center gap-2">
              <Target className="text-pink-500" /> Mentor Advice
            </h3>
            {userData.weaknesses.mostCommonMistakes.length > 0 ? (
              <ul className="space-y-3">
                {userData.weaknesses.mostCommonMistakes.map((mistake, i) => (
                  <li key={i} className="bg-pink-50 text-pink-800 p-3 rounded-xl border border-pink-200 font-medium">
                    ⚠️ {mistake.type} (Seen {mistake.count} times)
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
                <Shield size={40} className="text-gray-300" />
                <p className="font-medium">Play more games to get personalized advice!</p>
              </div>
            )}
          </div>
        </div>

        {/* Level Progress Overview */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100">
          <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
            <Clock className="text-indigo-500" /> Level Mastery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => {
               const worldId = i + 1;
               // simple summary, this is just for show
               return (
                 <div key={worldId} className="bg-gray-50 border-2 border-gray-100 p-3 rounded-xl text-center">
                   <div className="text-sm font-bold text-gray-500 mb-1">World {worldId}</div>
                   <div className="flex justify-center text-yellow-400">
                     <Star size={16} fill="currentColor" />
                     <Star size={16} fill="currentColor" />
                     <Star size={16} />
                   </div>
                 </div>
               )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, icon }: any) => (
  <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center items-center text-center ${color}`}>
    <span className="text-sm font-bold opacity-80">{label}</span>
    <span className="text-2xl font-black">{value} {icon}</span>
  </div>
);
