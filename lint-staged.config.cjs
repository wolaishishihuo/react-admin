module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
  '*.{scss,less,styl,css}': ['stylelint --fix', 'prettier --write']
};
