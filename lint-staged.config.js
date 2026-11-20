/** @type {import("lint-staged").Configuration} */
export default {
  '*.{js,jsx,ts,tsx}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,md,html,css}': ['oxfmt --write']
};
