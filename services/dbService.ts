
import { YogaClass, YogaCategory } from "../types.ts";
import { INITIAL_ALLOWED_EMAILS, YOGA_CLASSES as DEFAULT_CLASSES } from "../constants.ts";

const KEYS = {
  CLASSES: 'zenyoga_db_classes',
  ALUNOS: 'zenyoga_db_allowed_emails'
};

export const db = {
  // Gerenciamento de Aulas
  getClasses: (): YogaClass[] => {
    const data = localStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : DEFAULT_CLASSES;
  },
  
  saveClass: (newClass: YogaClass) => {
    const classes = db.getClasses();
    const updated = [newClass, ...classes];
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },
  
  deleteClass: (id: string) => {
    const classes = db.getClasses();
    const updated = classes.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },

  // Gerenciamento de Alunos
  getAlunos: (): string[] => {
    const data = localStorage.getItem(KEYS.ALUNOS);
    return data ? JSON.parse(data) : INITIAL_ALLOWED_EMAILS;
  },
  
  saveAluno: (email: string) => {
    const emails = db.getAlunos();
    const cleanEmail = email.toLowerCase().trim();
    if (emails.includes(cleanEmail)) return emails;
    const updated = [...emails, cleanEmail];
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(updated));
    return updated;
  },
  
  deleteAluno: (email: string) => {
    const emails = db.getAlunos();
    const updated = emails.filter(e => e !== email);
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(updated));
    return updated;
  },

  // Backup
  exportBackup: () => {
    const data = {
      classes: db.getClasses(),
      alunos: db.getAlunos(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_zenyoga_${new Date().toLocaleDateString()}.json`;
    a.click();
  }
};
