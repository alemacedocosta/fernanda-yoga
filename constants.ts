
import { YogaClass, YogaCategory } from './types';

export const ADMIN_EMAIL = 'admin@zenyoga.com';

export const INITIAL_ALLOWED_EMAILS = [
  ADMIN_EMAIL,
  'aluno@zenyoga.com'
];

export const YOGA_CLASSES: YogaClass[] = [
  {
    id: '1',
    title: 'Despertar Matinal: Vinyasa Suave',
    description: 'Uma prática fluida para começar o dia com energia e presença.',
    youtubeId: 'dQw4w9WgXcQ',
    category: YogaCategory.VINYASA,
    duration: '20 min',
    level: 'Iniciante',
    thumbnailUrl: 'https://picsum.photos/seed/yoga1/800/450'
  }
];
