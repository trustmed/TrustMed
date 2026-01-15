export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'imperative-tense': (parsed) => {
          const { subject } = parsed;
          if (!subject) return [true];

          // Get the first word of the subject
          const firstWord = subject.split(' ')[0].toLowerCase();

          // Blacklist: Words that are NOT imperative
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
    // Enable custom rule (2 = error, 'always' = enforce it)
    'imperative-tense': [2, 'always'],
    
    // Standard rules needed to be checked
    'subject-case': [2, 'always', 'lower-case'], // strict lowercase
  },
};