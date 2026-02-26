export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'imperative-tense': (parsed) => {
          const { subject } = parsed;
          if (!subject) return [true];

          const firstWord = subject.split(' ')[0].toLowerCase();

          const forbiddenWords = [
            'added', 'adding',
            'fixed', 'fixing',
            'removed', 'removing',
            'updated', 'updating',
            'changed', 'changing',
            'created', 'creating',
            'deleted', 'deleting',
            'refactored', 'refactoring',
            'merged', 'merging',
            'improved', 'improving',
            'corrected', 'correcting',
            'used', 'using',
            'makes', 'making' 
          ];

          if (forbiddenWords.includes(firstWord)) {
            return [
              false, 
              `⚠️  Imperative Mood Rule: Start subject with a verb like 'add', 'fix', or 'update'. Do not use '${firstWord}'.`
            ];
          }

          return [true];
        },
      },
    },
  ],
  rules: {
    // Keep your custom rule
    'imperative-tense': [2, 'always'],
    
    // Allow sentence-case ("Add feature"), lower-case ("add feature"), and upper-case ("ADD FEATURE")
    'subject-case': [
      2, 
      'always', 
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case']
    ],
  },
};