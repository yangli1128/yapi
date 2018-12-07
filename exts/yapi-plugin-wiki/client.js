import WikiPage from './wikiPage/index';
// const WikiPage = require('./wikiPage/index')
const Directory=JSON.parse(localStorage.getItem('directory')).dir;

module.exports = function() {
  this.bindHook('sub_nav', function(app) {
    app.wiki = {
      name: 'Wiki',
      path: Directory+'/project/:id/wiki',
      component: WikiPage
    };
  });
};
