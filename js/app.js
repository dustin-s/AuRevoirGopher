function popularitySort(a , b){
	if(a.popularity == b.popularity) return 0;
	return a.popularity > b.popularity ? 1 : -1;
}
function chronSort(a , b){
	var ard = new Date(a.release_date);
	var brd = new Date(b.release_date);
	if(ard == brd) return 0;
	return ard > brd ? 1 : -1;
}
function urlBuilder(){
	var baseurl = 'http://api.themoviedb.org/3/';
	var apikey = '4476544b5affc133ecd1d3f9ffd862f7';
	function urlCompiler(segment , params){
		var url = baseurl;
		url += segment;
		url += '?api_key=' + apikey;
		for(var p in params){
			url += '&' + p + '=' + params[p].toString();
		}
		return url;
	}
	return urlCompiler;
}

var getURL = urlBuilder();

AuRevoirGopher = Ember.Application.create();

/* forcing default to be 'home'*/
AuRevoirGopher.Router.reopen({
  rootURL: '/home/'
});

AuRevoirGopher.Router.map(function() {
  // put your routes here
  this.resource('home', { path: '/' });
  this.resource('home', { path: '/home/' });
  this.resource('actors', { path: '/actors/:actor_name' });
  this.resource('movies', { path: '/movies/:actor_id' });
});

AuRevoirGopher.ApplicationRoute = Ember.Route.extend({
	model:function(params){
		return $.getJSON(
			getURL('configuration' , {}),
			{format:'json'}
			).then(function(data){
				return {'configuration':data};
			} , function(data){
				return [];
			});
	}
});
AuRevoirGopher.HomeRoute = Ember.Route.extend({
	model:function(){
		return Ember.Object.extend({actor_name:"Bill Murray"});
	},
    setupController : function(controller, model){
        controller.set("model", model);
    },
	actions: {
		searchActors:function(actor_name){
			this.transitionTo('/actors/' + escape(actor_name));
		}
	}
});
AuRevoirGopher.ActorsRoute = Ember.Route.extend({
	model:function(params){
		var applicationModel = this.modelFor("application");
		var configs = applicationModel.configuration;
		return $.getJSON(
			getURL('search/person' , {'query':params.actor_name , 'include_adult':false}),
			{format:'json'}
			).then(function(data){
				var actors = data.results;
				var profile_url = configs.images.secure_base_url + configs.images.profile_sizes[1] + "/";
				for(var a = 0 ; actors.length > a ; a++){
					actors[a].profile_image = profile_url + actors[a].profile_path;
					actors[a].search_link = "movies";
				}
				return actors.sort(popularitySort);
			} , function(data){
				return [];
			});
	}
});
AuRevoirGopher.MoviesRoute = Ember.Route.extend({
	model:function(params){
		var applicationModel = this.modelFor("application");
		var configs = applicationModel.configuration;
		return $.getJSON(
			getURL('person/' + params.actor_id + '/movie_credits' , {}),
			{format:'json'}
			).then(function(data){
				var poster_url = configs.images.secure_base_url + configs.images.poster_sizes[1] + "/";
				var movies = data.cast;
				for(var m = 0 ; movies.length > m ; m++){
					movies[m].poster_image = poster_url + movies[m].poster_path;
				}
				return movies.sort(chronSort);
			} , function(data){
				return [];
			});
	}

});