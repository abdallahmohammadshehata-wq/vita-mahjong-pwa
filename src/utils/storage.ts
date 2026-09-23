import { LevelProgress, GameTheme, BoardBackground } from '../types/mahjong';

const STORAGE_KEYS = {
  CAMPAIGN_PROGRESS: 'vita_mahjong_campaign_v1',
  PLAYER_NAME: 'vita_mahjong_player_name',
  PLAYER_AVATAR: 'vita_mahjong_player_avatar',
  PLAYER_COLOR: 'vita_mahjong_player_color',
  THEME: 'vita_mahjong_theme',
  BACKGROUND: 'vita_mahjong_bg',
  DIM_BLOCKED: 'vita_mahjong_dim_blocked',
  SOUND_ENABLED: 'vita_mahjong_sound',
  CURRENT_LEVEL: 'vita_mahjong_cur_level'
};

// Default Player Profile
export function getSavedPlayerProfile(): { name: string; avatar: string; color: string } {
  return {
    name: localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || `Player ${Math.floor(100 + Math.random() * 900)}`,
    avatar: localStorage.getItem(STORAGE_KEYS.PLAYER_AVATAR) || '🀄',
    color: localStorage.getItem(STORAGE_KEYS.PLAYER_COLOR) || '#2D6A4F'
  };
}

export function savePlayerProfile(profile: { name: string; avatar: string; color: string }) {
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, profile.name);
  localStorage.setItem(STORAGE_KEYS.PLAYER_AVATAR, profile.avatar);
  localStorage.setItem(STORAGE_KEYS.PLAYER_COLOR, profile.color);
}

// Campaign Progress (500 Levels)
export function getCampaignProgress(): Record<number, LevelProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGN_PROGRESS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  // Level 1 is unlocked by default
  return {
    1: {
      levelId: 1,
      unlocked: true,
      completed: false,
      stars: 0,
      bestTime: 0,
      bestScore: 0,
      highCombo: 0
    }
  };
}

export function saveLevelResult(
  levelId: number,
  timeSeconds: number,
  score: number,
  combo: number
): { stars: number; isNewRecord: boolean } {
  const progress = getCampaignProgress();
  const existing = progress[levelId] || {
    levelId,
    unlocked: true,
    completed: false,
    stars: 0,
    bestTime: 0,
    bestScore: 0,
    highCombo: 0
  };

  // Calculate Stars: 3 stars < 120s, 2 stars < 240s, 1 star otherwise
  let earnedStars = 1;
  if (timeSeconds <= 120) earnedStars = 3;
  else if (timeSeconds <= 240) earnedStars = 2;

  const isNewRecord = score > existing.bestScore;

  progress[levelId] = {
    levelId,
    unlocked: true,
    completed: true,
    stars: Math.max(existing.stars, earnedStars),
    bestTime: existing.bestTime > 0 ? Math.min(existing.bestTime, timeSeconds) : timeSeconds,
    bestScore: Math.max(existing.bestScore, score),
    highCombo: Math.max(existing.highCombo, combo)
  };

  // Unlock next level (up to 500)
  if (levelId < 500) {
    if (!progress[levelId + 1]) {
      progress[levelId + 1] = {
        levelId: levelId + 1,
        unlocked: true,
        completed: false,
        stars: 0,
        bestTime: 0,
        bestScore: 0,
        highCombo: 0
      };
    } else {
      progress[levelId + 1].unlocked = true;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGN_PROGRESS, JSON.stringify(progress));
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, String(Math.min(500, levelId + 1)));
  } catch (e) {}

  return { stars: earnedStars, isNewRecord };
}

export function getSavedTheme(): GameTheme {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as GameTheme) || 'ivory';
}

export function saveTheme(theme: GameTheme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function getSavedSound(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
}

export function saveSound(enabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
}

export function getSavedBackground(): BoardBackground {
  return (localStorage.getItem(STORAGE_KEYS.BACKGROUND) as BoardBackground) || 'zen-felt';
}

export function saveBackground(bg: BoardBackground) {
  localStorage.setItem(STORAGE_KEYS.BACKGROUND, bg);
}

export function getSavedDimBlocked(): boolean {
  return localStorage.getItem(STORAGE_KEYS.DIM_BLOCKED) !== 'false';
}

export function saveDimBlocked(dim: boolean) {
  localStorage.setItem(STORAGE_KEYS.DIM_BLOCKED, String(dim));
}
