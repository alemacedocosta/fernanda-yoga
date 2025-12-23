
import React from 'react';
import { YogaClass } from '../types';

interface VideoCardProps {
  yogaClass: YogaClass;
  isCompleted: boolean;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onClick: (yogaClass: YogaClass) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ yogaClass, isCompleted, onToggleComplete, onClick }) => (
  <div onClick={() => onClick(yogaClass)} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border cursor-pointer">
    <div className="relative aspect-video">
      <img src={yogaClass.thumbnailUrl} className="w-full h-full object-cover" />
      <button onClick={(e) => onToggleComplete(yogaClass.id, e)} className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-[#4a6741] text-white' : 'bg-white/80'}`}>✓</button>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-bold mb-1">{yogaClass.title}</h3>
      <p className="text-sm text-gray-500">{yogaClass.category} • {yogaClass.duration}</p>
    </div>
  </div>
);

export default VideoCard;
