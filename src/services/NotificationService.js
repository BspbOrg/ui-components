module.exports = function NotificationServiceFactory (opts) {
  return /*@ngInject*/function NotificationService ($translate, ngToast) {
    $svc = this

    $svc.notifySuccess = function (content) {
      ngToast.create({
        className: 'success',
        content: content
      })
    }

    $svc.notifyError = function (error, message) {
      ngToast.create({
        className: 'danger',
        content: '<p>' + message + '</p>' +
        '<pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
      })
    }
  }
}
