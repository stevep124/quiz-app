// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('quiz', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('start',
  {
    url : "/start",
    templateUrl : "partials/home.html",
    controller : "HomeCtrl"
  })
  .state('answers',
  {
      url: "/answers",
      controller : "QuizCtrl",
      templateUrl: "partials/answers.html",
      resolve : {
        questions:  function( QuestionSearch )
        {
          return QuestionSearch.getQuestionsForCategory('movies').success(
            function (data)
            {
                return data;
            });;
        }
      }
  })
  .state('/result',
  {
      url: "/result",
      controller : "ResultCtrl",
      templateUrl: "partials/result.html"
  })

  $urlRouterProvider.when('', '/start');


})

.service('QuestionSearch', function( $http ) {
  return {
      getNextQuestion: function( index )
      {
          var url = 'https://api.mongolab.com/api/1/databases/experryment/collections/quizapp?q={"order": "' + index + '" }&fo=true&apiKey=46TeLBX4VlEzNBdEXCK-mAfExUnPGXpk'
          return $http.get( url );
      },
      getQuestionsForCategory: function ( category )
      {
          var url = 'https://api.mongolab.com/api/1/databases/experryment/collections/quizapp?q={"category": "' + category + '" }&s={"order": 1}&&apiKey=46TeLBX4VlEzNBdEXCK-mAfExUnPGXpk'
          return $http.get( url );
      }

  }
})

.directive('answer', function()
{
  return{
    restrict : 'E',
    replace : true,
    template : '<button class="button button-block answer" tabindex="{{ $index + 1 }}" on-release="checkAnswer()">{{ answer.text }}</button>',
    link : function ( $scope, elem, attrs )
    {
      $scope.checkAnswer = function()
      {
       var answerIndex = ( angular.element( elem ).attr('tabIndex') )

        if ( answerIndex == $scope.question.correctAnswerID )
        {
            angular.element( elem ).addClass('icon-left ion-checkmark')

        } else {

            angular.element( elem ).addClass('icon-left ion-close')
        }

        $scope.onAnswerSelected( answerIndex )
      }




    }
  }
})

.directive('countdownTimer', function ($interval)
{
  return {
    restrict : 'E',
    templateUrl : 'partials/countdown.html',
    link : {
      pre: function(scope,elem,attr)
      {
        console.log( 'prelink')
      },
      post : function(scope,elem,attr)
      {
        console.log( 'postlink')
      }
    },
    controller : function( $scope, $element, $attrs )
    {
      console.log( 'countdown controller')



    }
    //controller : 'QuizCtrl'
  }
}).filter('doubleDigit', function ()
{
  return function ( input )
  {
    var format = input.toString();

    if ( parseInt( input ) < 10 )
    {
      format = '0' + input;
    }

    return format;
  }
})

.directive('totalScore', function ()
{
  return {
    restrict : 'E',
    templateUrl : 'partials/score.html',
  }
}).filter('min5digits', function ()
{
  return function ( input )
  {
    if ( input == 0 ) return '00000';
    var value = (input / 10000).toString().replace('.','');
    if ( value.length < 5 )
    {
      for (var i = value.length; i < 5; i++)
      {
        value += '0';
      };
    }
    return value;
  }
})

.controller('HomeCtrl', ['$scope', '$location', 'ScoreService', function( $scope, $location ,ScoreService )
{

    ScoreService.total = 0;

}])

.controller('QuizCtrl',['$scope', 'QuestionSearch', '$location', 'questions', '$interval', 'ScoreService', function( $scope, QuestionSearch, $location, questions, $interval, ScoreService )
{

      var timer;
      $scope.maxInterval = 30
      $scope.questions = angular.copy( questions.data );
      $scope.question = getNextQuestion();

      console.log( 'QuizCtrl controller' + $scope.time )

      $scope.totalScore = ScoreService.total;

      $scope.updateScore = function( value )
      {
        $scope.totalScore += value;
        ScoreService.total = $scope.totalScore
      }


      function getNextQuestion()
      {
          var currentIndex = -1

          if ( $scope.question )
          {
            currentIndex = parseInt( $scope.question.order ) -1
          }

          if ( ( currentIndex+1 ) <= $scope.questions.length )
          {
            return $scope.questions[ currentIndex+1 ]

          } else
          {
            return null;
          }

      }


      $scope.onAnswerSelected = function( index )
      {
        if ( index == $scope.question.correctAnswerID )
        {
            onCorrectAnswer();
        } else {
            onWrongAnswer();
        }
      }

      function onCorrectAnswer()
      {
        $scope.updateScore( ( $scope.maxInterval - $scope.getCurrentTime() ) * 100 )

        $scope.resetTimer();

        nextQuestion();
      }

      function nextQuestion()
      {

        $scope.question = getNextQuestion();

        if ( $scope.question )
        {
          $scope.startTimer()
        } else {
          $scope.resetTimer()
          endQuiz();
        }
      }

      function onWrongAnswer()
      {
        $scope.updateScore( -1000 )
      }

      function endQuiz()
      {
        $location.path('/result')
      }

      $scope.time = 0;
      $scope.maxInterval = 30

      function countdown()
      {
        $scope.time ++

        if ( $scope.time == $scope.maxInterval )
        {
          onTimeout();

        }
      }

      function onTimeout()
      {
        $scope.resetTimer();
        nextQuestion();
      }

      $scope.startTimer = function()
      {
        timer = $interval( countdown, 1000, $scope.maxInterval );
      }

      $scope.resetTimer = function()
      {
        $interval.cancel( timer );
        $scope.time  = 0;
      }

      $scope.getCurrentTime = function()
      {
        return $scope.time;
      }


      $scope.startTimer()

}])

.service('ScoreService', function(){
  return {
     total : 0

  };
})

.controller('ResultCtrl', ['$scope', 'ScoreService', function($scope, ScoreService)
{
    $scope.totalScore = ScoreService.total
    $scope.date = new Date();
}])

