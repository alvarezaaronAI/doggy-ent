// Explicitly fictional design data, never a verified customer-review source.
export const SAMPLE_REVIEWS = [
  ['Maya R.', 'A new favourite after our walks', 'Easy to break into a little reward. Scout now waits by the treat cupboard.', 'Chicken Breast Jerky', '6 oz', 5],
  ['Jordan L.', 'A cupboard staple', 'The resealable bag fits neatly into our weekend routine.', 'Beef Jerky', '18 oz', 5],
  ['Sam D.', 'Little rewards, big focus', 'The smaller pieces are convenient for our training breaks.', 'Training Bites', '6 oz', 4],
  ['Alex T.', 'A little variety', 'I like being able to look closely at the treat before choosing a size.', 'Salmon Bites', '6 oz', 5],
  ['Taylor M.', 'Ready for an adventure', 'A little selection to take along on a weekend away.', 'Weekend Bundle', '18 oz', 5],
  ['Casey B.', 'A little seasonal fun', 'A lovely autumn concept for our treat cupboard.', 'Pumpkin Bites', '6 oz', 4],
  ['Morgan S.', 'Thoughtful little details', 'Clear details and a choice of bag sizes make browsing straightforward.', 'Turkey Jerky', '6 oz', 5],
].map(([name, title, text, product, size, rating], index) => ({ name, title, text, product, size, rating, date: `2026-10-${String(index + 4).padStart(2, '0')}` }))
