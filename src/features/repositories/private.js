angular.module( 'core9Dashboard.feature.private', [
  'core9Dashboard.config'
])

.controller("ConfigFeaturesPrivateCtrl", function ($scope, $state, $http, ConfigFactory) {

  var error = function (error) {
    $scope.$emit("$error", error);
  };

  var success = function (id) {
    return function (features) {
      $scope.features[id] = features;
    };
  };

  $scope.repos = ConfigFactory.query({configtype: 'featuresrepo_private'}, function (data) {
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

  $scope.add = function (repo, feature) {
    $scope.edit($scope.repo._id, feature);
  };

  $scope.edit = function (repo, feature) {
    $state.go("features.edit", {repo: repo._id, feature: feature});
  };

  $scope.upload = function (repository) {
    $http.post("/admin/featurerepository/" + repository._id + "?push")
    .success(function(data) {
      alert("Repository uploaded");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

})

;