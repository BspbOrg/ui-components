/**
 * Register hierarchical list of views in $templateCache
 * @param {Object} views
 * @param {Object} opts
 * @param {string} [opts.prefix=/]
 * @param {string} [opts.suffix=.html]
 * @returns {registerViews}
 */
module.exports = function RegisterViewsFactory (views, opts) {
  opts = opts || {}
  opts.prefix = opts.prefix || '/'
  opts.suffix = opts.suffix || '.html'

  return /*@ngInject*/function registerViews ($log, $templateCache) {
    function register (prefix, views) {
      if (typeof views === 'object') {
        for (var key in views) {
          if (!views.hasOwnProperty(key)) continue

          register(prefix + '/' + key, views[ key ])
        }
      } else {
        $log.debug('registering template cache', prefix)
        $templateCache.put(prefix + opts.suffix, views)
      }
    }

    register(opts.prefix, views)
  }
}
