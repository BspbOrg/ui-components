function ensureDependencyDeclaration (declaration) {
  if (!(declaration instanceof Array)) throw new Error('Dependency declaration must be array')
  if (!declaration.every(function (item) { return typeof item === 'string'})) throw new Error('Dependency declaration must contain only strings')
}

module.exports = function normalizeInjectable (injectable) {
  if (injectable instanceof Array) {
    if (injectable.length <= 0) throw new Error('Empty array is not valid injectable')
    var callable = injectable[ injectable.length - 1 ]
    if (!(callable instanceof Function)) throw new Error('Last item should be function. Instead got', typeof callable)
    if (callable.$inject) throw new Error('Mixed dependency annotations! Both [] and $inject found')
    ensureDependencyDeclaration(injectable.slice(0, -1))
    return injectable
  }
  if (injectable instanceof Function) {
    if (!injectable.$inject) throw new Error('Implicit annotation detected!')
    var $inject = injectable.$inject
    ensureDependencyDeclaration($inject)
    delete injectable.$inject
    return $inject.concat([ injectable ])
  }
  throw new Error('Unsupported injectable', typeof injectable)
}
