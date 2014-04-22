angular.module( 'core9Dashboard.features', [
  'core9Dashboard.feature',
  'templates-module-cms-features'
]);

angular.module('core9Dashboard.admin.dashboard').requires.push('core9Dashboard.features');