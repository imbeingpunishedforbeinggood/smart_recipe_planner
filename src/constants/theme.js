export const THEME = Object.freeze({
  accent: '#FF6B35',
  accentBg: 'rgba(255,107,53,0.12)',
  background: '#FFFAF7',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  border: '#E8E0D8',

  cardShadow: Object.freeze({
    shadowColor: '#C4714A',
    shadowOffset: Object.freeze({ width: 0, height: 4 }),
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  }),

  radius: Object.freeze({
    card: 18,
    chip: 12,
    button: 36,
    badge: 10,
  }),

  type: Object.freeze({
    screenTitle: Object.freeze({ fontSize: 28, fontWeight: '700' }),
    cardTitle: Object.freeze({ fontSize: 20, fontWeight: '700' }),
    detailTitle: Object.freeze({ fontSize: 24, fontWeight: '700' }),
    sectionHeader: Object.freeze({ fontSize: 18, fontWeight: '700' }),
    body: Object.freeze({ fontSize: 15 }),
    meta: Object.freeze({ fontSize: 13 }),
    tag: Object.freeze({ fontSize: 12, fontWeight: '600' }),
  }),
});
