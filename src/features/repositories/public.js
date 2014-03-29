angular.module( 'core9Dashboard.feature.public', [
  'core9Dashboard.config'
])

.controller("ConfigFeaturesPublicCtrl", function ($scope, $http, ConfigFactory) {
  var error = function (error) {
    $scope.$emit("$error", error);
  };

  var success = function (id) {
    return function (features) {
      $scope.features[id] = features;
    };
  };

  $scope.repos = ConfigFactory.query({configtype: 'featuresrepo_public'}, function (data) {
    $scope.features = {};
    for(var i = 0; i < data.length; i++) {
      if(data[i].current === undefined) {
        data[i].current = {};
      }
      $http.get("/admin/featurerepository/" + data[i]._id)
      .success(success(data[i]._id))
      .error(error);
    }
  });
})
;