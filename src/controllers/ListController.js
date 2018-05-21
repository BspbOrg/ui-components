var angular = require('angular')

/**
 * Generate a list controller
 * @param {Object} opts
 * @param {String} opts.translationPrefix
 * @param {string} opts.modelName
 * @param {Object[]} opts.columns
 * @param {string} [opts.columns[].sorting]
 * @param {Boolean} opts.canExport
 * @param {int} [opts.limit=50]
 * @param {string} [opts.headerUrl='/views/list/header.html']
 * @param {string} [opts.filtersUrl='/views/list/filters.html']
 * @param {string} [opts.contentUrl='/views/list/content.html']
 * @param {string} [opts.tableHeaderUrl='/views/list/tableHeader.html']
 * @param {string} [opts.tableBodyUrl='/views/list/tableBody.html']
 * @returns {ListController}
 */
module.exports = function ListControllerProvider (opts) {
  if (!opts) throw new Error('opts is required')
  if (!opts.modelName) throw new Error('opts.modelName is required')
  if (!opts.columns) throw new Error('opts.columns is required')
  opts.limit = opts.limit || 50
  opts.headerUrl = opts.headerUrl || '/views/list/header.html'
  opts.filtersUrl = opts.filtersUrl || '/views/list/filters.html'
  opts.contentUrl = opts.contentUrl || '/views/list/content.html'
  opts.tableHeaderUrl = opts.tableHeaderUrl || '/views/list/tableHeader.html'
  opts.tableBodyUrl = opts.tableBodyUrl || '/views/list/tableBody.html'

  var $inject = ['$q', '$state', '$stateParams', '$translate', 'notificationService', 'Raven', opts.modelName]
  var ListController = function ListController ($q, $state, $stateParams, $translate, notificationService, Raven, model) {
    var $ctrl = this

    $ctrl.columns = opts.columns
    $ctrl.translationPrefix = opts.translationPrefix || ''
    $ctrl.filter = Object.assign({}, $stateParams)
    $ctrl.headerUrl = opts.headerUrl
    $ctrl.filtersUrl = opts.filtersUrl
    $ctrl.contentUrl = opts.contentUrl
    $ctrl.tableHeaderUrl = opts.tableHeaderUrl
    $ctrl.tableBodyUrl = opts.tableBodyUrl

    $ctrl.updateFilter = function () {
      var filter = JSON.parse(JSON.stringify($ctrl.filter))
      if (angular.equals(filter, $stateParams)) { return }

      angular.extend($stateParams, filter)
      $state.go('.', $stateParams, { notify: false })
      $ctrl.requestRows()
    }

    $ctrl.selectedRows = []
    $ctrl.toggleSelected = function (row) {
      if (!row) {
        var selected = !$ctrl.allSelected
        $ctrl.rows.forEach(function (row) {
          row.$selected = selected
        })
        $ctrl.allSelected = selected
        $ctrl.selectedRows = selected ? [].concat($ctrl.rows) : []
      } else {
        if (row.$selected) {
          row.$selected = false
          var idx = $ctrl.selectedRows.indexOf(row)
          if (idx !== -1) {
            $ctrl.selectedRows = $ctrl.selectedRows.slice(0, idx).concat($ctrl.selectedRows.slice(idx + 1))
          }
        } else {
          row.$selected = true
          $ctrl.selectedRows = [ row ].concat($ctrl.selectedRows)
        }
        $ctrl.allSelected = $ctrl.selectedRows.length === $ctrl.rows.length
      }
    }

    $ctrl.successHandler = function (messageId, interpolateParams) {
      return function (res) {
        $translate($ctrl.translationPrefix + messageId, interpolateParams)
          .then(notificationService.notifySuccess)
        return res
      }
    }

    $ctrl.errorHandler = function (messageId, interpolateParams) {
      return function (error) {
        Raven.captureMessage(JSON.stringify(error))
        $translate($ctrl.translationPrefix + messageId, interpolateParams)
          .then(notificationService.notifyError.bind(null, error))
        return $q.reject(error)
      }
    }

    $ctrl.deleteRows = function (rows) {
      $q
        .all(rows.map(function (row) {
          var isSelected = row.$selected
          return row.$delete().then(function (res) {
            var idx = $ctrl.rows.indexOf(row)
            if (idx !== -1) {
              $ctrl.rows = $ctrl.rows.slice(0, idx).concat($ctrl.rows.slice(idx + 1))
            }
            if (isSelected) {
              row.$selected = true
              $ctrl.toggleSelected(row)
            }
            return res
          })
        }))
        .then($ctrl.successHandler('_SUCCESS_DELETE', { count: rows.length }))
        .catch($ctrl.errorHandler('_ERROR_DELETE', { count: rows.length }))
    }

    $ctrl.prepareQuery = function (query) {
      return Object.assign({}, query)
    }

    $ctrl.fetch = function (query) {
      $ctrl.loading = true
      query = $ctrl.prepareQuery(query)
      return model.query(query)
        .$promise
        .then(function (rows) {
          if (rows.$$response) {
            $ctrl.count = rows.$$response.data.$$response.count
          }
          $ctrl.rows = $ctrl.rows.concat(rows)
          $ctrl.endOfPages = !rows.length
          return $ctrl.rows
        })
        .catch($ctrl.errorHandler('_ERROR_FETCH', { query: query }))
        .finally(function () {
          $ctrl.loading = false
        })
    }

    $ctrl.prepareExportQuery = function (query) {
      return Object.assign({}, controller.filter, {
        limit: -1,
        offset: 0
      }, query)
    }

    $ctrl.canExport = opts.canExport
    $ctrl.export = function (outputType) {
      var selection
      if ($ctrl.selectedRows && $ctrl.selectedRows.length > 0 && !$ctrl.allSelected && $ctrl.canExport) {
        selection = $ctrl.selectedRows.map(function (row) { return row.id })
      }
      var query = $ctrl.prepareExportQuery({ outputType: outputType, selection: selection })
      return model
        .export(query).$promise
        .then($ctrl.successHandler('_EXPORT_SUCCESS', { query: query }))
        .catch($ctrl.errorHandler('_EXPORT_ERROR', { query: query }))
    }

    $ctrl.prepareRequestQuery = function () {
      return Object.assign({}, $ctrl.filter, {
        limit: opts.limit
      })
    }
    $ctrl.requestRows = function () {
      $ctrl.rows = []
      $ctrl.endOfPages = false
      return $ctrl.fetch($ctrl.prepareRequestQuery())
    }
    $ctrl.requestRows()

    $ctrl.prepareNextPageQuery = function (count) {
      return Object.assign({}, $ctrl.filter, {
        offset: $ctrl.rows.length,
        limit: count || opts.limit
      })
    }

    $ctrl.nextPage = function (count) {
      return $ctrl.fetch($ctrl.prepareNextPageQuery(count))
    }
  }

  ListController.$inject = $inject

  return ListController
}
