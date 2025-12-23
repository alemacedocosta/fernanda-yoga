
import React from 'react';
import { YogaClass } from '../types';

interface VideoCardProps {
  yogaClass: YogaClass;
  isCompleted: boolean;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onClick: (yogaClass: YogaClass) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ yogaClass, isCompleted, onToggleComplete, onClick }) => (
  <div 
    onClick={() => onClick(yogaClass)} 
    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#efe9e0] cursor-pointer"
  >
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={yogaClass.thumbnailUrl} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        alt={yogaClass.title}
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl border border-white/30">▶</div>
      </div>
      <button 
        onClick={(e) => onToggleComplete(yogaClass.id, e)} 
        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isCompleted ? 'bg-[#4a6741] text-white border-[#4a6741]' : 'bg-white/70 text-gray-400 border-white/50 hover:bg-white'}`}
      >
        {isCompleted ? '✓' : ''}
      </button>
      <div className="absolute bottom-4 left-4">
        <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-[10px] font-bold rounded-full uppercase tracking-tighter text-[#2d3a2a]">
          {yogaClass.level}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{yogaClass.category}</span>
        <span className="text-[10px] font-bold text-gray-400">{yogaClass.duration}</span>
      </div>
      <h3 className="text-lg font-bold serif leading-tight group-hover:text-[#e67e22] transition-colors">{yogaClass.title}</h3>
    </div>
  </div>
);

export default VideoCard;
