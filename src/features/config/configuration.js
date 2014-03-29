angular.module( 'core9Dashboard.feature.config', [
  'core9Dashboard.config',
  'ui.bootstrap'
])

.config(function ($stateProvider) {
  $stateProvider.state('features.settings', {
    url: '/config/features/settings',
    controller: 'FeaturesConfigurationCtrl',
    templateUrl: 'features/config/configuration.tpl.html',
    data:{
      context: 'back'
    }
  });
})

.controller("FeaturesConfigurationCtrl", function ($scope, ConfigFactory, $http, $modal) {
  $scope.publicrepos = ConfigFactory.query({configtype: 'featuresrepo_public'});
  $scope.privaterepos = ConfigFactory.query({configtype: 'featuresrepo_private'});

  $scope.add = function (configtype, repositories) {
    var newRepo = new ConfigFactory();
    newRepo.configtype = configtype;
    if(configtype === 'featuresrepo_public') {
      $scope.publicrepos.push(newRepo);
    } else {
      $scope.privaterepos.push(newRepo);
    }
    $scope.edit(newRepo);
  };

  $scope.edit = function (repository) {
    var modalInstance = $modal.open({
      templateUrl: 'features/config/edit.tpl.html',
      controller: 'FeaturesConfigurationEditRepoCtrl',
      resolve: {
        repo: function() {
          return repository;
        }
      }
    });
    modalInstance.result.then(function (updated) {
      repository = updated;
    });
  };

  $scope.download = function (repository) {
    $http.post("/admin/featurerepository/" + repository._id + "?pull")
    .success(function(data) {
      alert("Success");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

  $scope.upload = function (repository) {
    $http.post("/admin/featurerepository/" + repository._id + "?push")
    .success(function(data) {
      alert("Success");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

  $scope.delete = function (repository, list, index) {
    repository.$remove(function () {
      list.splice(index, 1);
    });
  };
})

.controller("FeaturesConfigurationEditRepoCtrl", function ($scope, $modalInstance, repo) {
  $scope.repo = repo;

  $scope.save = function () {
    if($scope.repo._id === undefined) {
      $scope.repo.$save(function (data) {
        $modalInstance.close(data);
      });
    } else {
      $scope.repo.$update(function (data) {
        $modalInstance.close(data);
      });
    }
  };
})
;