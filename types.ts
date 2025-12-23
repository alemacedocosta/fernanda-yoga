/**
 * FERNANDA YOGA - MVP 1.0 (Stable)
 * Centralização de tipos e Enums
 */

export enum YogaCategory {
  HATHA = 'Hatha Yoga',
  VINYASA = 'Vinyasa Flow',
  YIN = 'Yin Yoga',
  MEDITATION = 'Meditação',
  PRANAYAMA = 'Pranayama',
  FLEXIBILITY = 'Flexibilidade'
}

export interface YogaClass {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: YogaCategory;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  thumbnailUrl: string;
}

export interface User {
  email: string;
  name: string;
  isLoggedIn: boolean;
  completedClasses?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
