var moduleName = 'bspb.ui-templates'
var bulk = require('bulk-require')

require('angular')
  .module(moduleName, [])
  .service('notificationService', require('./src/services/NotificationService')())
  .directive('listTable', require('./src/directives/ListTableDirective')({ name: 'listTable' }))
  .directive('listSorting', require('./src/directives/ListSortingDirective')({
    name: 'listSorting',
    tableName: 'listTable'
  }))
  .directive('pageHeader', require('./src/directives/PageHeaderDirective')())
  .directive('pageFilters', require('./src/directives/PageFiltersDirective')())
  // .controller('ListController', require('./src/controllers/ListController'))
  .run(require('./src/utils/registerViews')(bulk(__dirname + '/views', [ '**/*.html' ]), {
    prefix: '/views'
  }))
module.exports = moduleName
