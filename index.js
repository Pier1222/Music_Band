//Les éléments pour modifier graphiquement
var playerImage  = null;
var playerTitle  = null;
var playerAuthor = null;
var playerLength = null;

var footerPlayer = null;
var polygonPlay  = null;
var rectPlay_1   = null;
var rectPlay_2   = null;

var buttonToAlbum = null;

//Les éléments pour jouer de la musique
var idMusic             = -1;
var audioPreview        = null;
var intervalPlayer      = null;
var arrayPlaylistPlayer = null;
var indexPlaylistPlayer = -1;

var playlistPlayer      = null;
var jsonTrackListInfos  = null;



function initialisation() {
	//Initialisation des variables utilisées dans plusieurs fonctions
	playerImage   = document.getElementById("img_player");
	playerTitle   = document.getElementById("div_title_player");
	playerAuthor  = document.getElementById("span_author_player");
	playerLength  = document.getElementById("div_length_player");

	footerPlayer = document.getElementById("footer_player");
	polygonPlay  = document.getElementById("polygon_svg_music_play");
	rectPlay_1   = document.getElementById("rect_1_svg_music_play");
	rectPlay_2   = document.getElementById("rect_2_svg_music_play");

	buttonToAlbum = document.getElementById("div_footer_player_button_to_album");

	playlistPlayer = document.getElementById("playlist_player");

	//Détecte si on utilise la barre de scroll
	//window.onscroll = changePlayerPosition;


	//Pour détecter quand on arrête de scroller
	//Est la meilleure méthode mais ne fonctionne qu'avec Firefox car assez récent (janvier 2023)
	//document.onscrollend = changePlayerPosition;

	//Méthode qui fonctionne avec tous les navigateurs en avril 2023
	document.onscroll = event => {
  		clearTimeout(window.scrollEndTimer)
  		window.scrollEndTimer = setTimeout(changePlayerPosition, 100)
	}



	//Initalisation des caroussels via l'API Slick
	$('.div_caroussel_elements_list').slick({
		arrows: false,
	  	dots: true,
  		infinite: false,
  		speed: 300,
  		slidesToShow: 6,
  		slidesToScroll: 6,
  		//centerMode: true,
  		variableWidth: true,

  		autoplay: true,
  		autoplaySpeed: 5000,

  		responsive: [
  			{
  				breakpoint: 1350,
  				settings: {
  					variableWidth: true,
  					slidesToShow: 5,
  					slidesToScroll: 5
  				}
  			},

  			{
  				breakpoint: 1100,
  				settings: {
  					variableWidth: true,
  					slidesToShow: 4,
  					slidesToScroll: 4
  				}
  			},

  			{
  				breakpoint: 950,
  				settings: {
  					variableWidth: true,
  					slidesToShow: 3,
  					slidesToScroll: 3
  				}
  			},

  			{
  				breakpoint: 730,
  				settings: {
  					variableWidth: true,
  					slidesToShow: 2,
  					slidesToScroll: 2
  				}
  			},

  			{
  				breakpoint: 470,
  				settings: {
  					variableWidth: true,
  					slidesToShow: 1,
  					slidesToScroll: 1
  				}
  			}
  		]
	});
}

function changePlayerPosition() {
	var scrollBottom = window.innerHeight + window.scrollY;
	var pageHeight   = document.body.offsetHeight;
	var dectectEnd   = (footerPlayer.offsetHeight + 100);

	console.log("scrollBottom: " + scrollBottom + "\n" +
	"pageHeight: " + pageHeight + "\n" + 
	"detectEnd: " + dectectEnd);

	if ((scrollBottom + dectectEnd) >= pageHeight && footerPlayer.style.visibility == "visible") {
        footerPlayer.style.position = "static";
        footerPlayer.style.width    = "95%"; //Pour empêcher de dépasser un peu de la fenêtre sous certaines tailles
    } else {
    	footerPlayer.style.position = "fixed";
    	footerPlayer.style.width    = "100%";
    }
}

//Permet de générer une playlist via la tracklist d'un album ou d'une playlist du top playlist
function createPlaylist_Album_TopPlaylist(tracklistrequest, artistPicture = "") {
	changeVisibilityButtonToAlbum(false);
	var newPlaylist = new Array();

	xmlhttp_tracklist = new XMLHttpRequest();

	//De base Deezer limite le nombre de données à 25 pour une tracklist, il faut donc annuler en plaçant la limite à -1
	var finalRequest = tracklistrequest + "?limit=-1";

    xmlhttp_tracklist.open("GET", "others_php/tracklist.php?tracklistURL="+finalRequest, true);
    xmlhttp_tracklist.responseType = 'json';
    xmlhttp_tracklist.send();


    xmlhttp_tracklist.onload = function() {
    	jsonTrackListInfos = xmlhttp_tracklist.response["data"];
    	var nbMusics = Object.keys(jsonTrackListInfos).length;

    	//console.log("Réponse de la requête createPlaylist : " + JSON.stringify(jsonTrackListInfos));
    	console.log("NB musiques dans " + finalRequest + ": " + nbMusics);
    	console.log("Première musique: " + jsonTrackListInfos[0]['title']);

    	for (var i = 0; i < nbMusics; i++) {
    		newPlaylist.push(jsonTrackListInfos[i]['id']);

    		//Dans la tracklist de l'album il n'y a pas d'image de l'artiste (contrairement aux singles et aux playlists, par exemple)
    		if(artistPicture != "")
    			jsonTrackListInfos[i]["artist"]["picture"] = artistPicture;
    	}

    	//Joue la première musique
		loadPlaylist(newPlaylist, 0);
    }
}

function createPlaylist_Top10(newPlaylist, firstIndex) {
	changeVisibilityButtonToAlbum(true);
	jsonTrackListInfos  = null; //On peut déjà voir la liste des musiques via le top en question
	loadPlaylist(newPlaylist, firstIndex);
}

function changeVisibilityButtonToAlbum(visible) {
    /*if(visible) {
    	buttonToAlbum.style.visibility = "visible";
    	buttonToAlbum.style.position = "static"
    } else {
    	buttonToAlbum.style.visibility = "hidden";
    	buttonToAlbum.style.position = "fixed";
    }*/
}


//Charge la playlist (directement pour le top single, après sa création dans les autres cas)
function loadPlaylist(newPlaylist, firstIndex) {
	arrayPlaylistPlayer = newPlaylist;

	//Vide la playlist actuelle
	removeAllToPlaylistPlayer();

	//Ajoute la playlist dans l'HTML
	for(var i = 0; i < arrayPlaylistPlayer.length; i++) {
		addToPlaylistPlayer(arrayPlaylistPlayer[i], i);
	}

	indexPlaylistPlayer = firstIndex;
	playMusicInPlaylist();
}

function removeAllToPlaylistPlayer() {
	playlistPlayer.innerHTML = '';
}

function addToPlaylistPlayer(idToAdd, indexActu) {
	/* Méthode 1: avec des requêtes ajax (ne fonctionne pas car les requêtes se chevauchent et qu'on risque de dépasser la limite des 50 requêtes en 5 secondes de Deezer)
	xmlhttp_addToPlaylist = new XMLHttpRequest();
	console.log(idToAdd);

    xmlhttp_addToPlaylist.open("GET", "others_php/music.php?id="+idToAdd, true);
    xmlhttp_addToPlaylist.responseType = 'json';
    xmlhttp_addToPlaylist.send();

    xmlhttp_addToPlaylist.onload = function() {
    	var jsonMusicInfos = xmlhttp_addToPlaylist.response;


    	playlistPlayer.innerHTML += 
    	'<div class="div_top_10_element div_music_element" onclick="changeIndexPlaylistAbsolute(' + indexActu + ')"'
        +	'<span class="number_top_10">'+ indexActu + '</span>'
        +	'<img src=' + jsonMusicInfos["artist"]["picture"] + ' class="img_music">'

        +   '<div class="div_music_title_author">'
        +    	jsonMusicInfos["title_short"] + '<br>'
        +    	'<span class="blue_text author">' + jsonMusicInfos["artist"]["name"] + '</span>'
        +    '</div>'

        +	'<div class="div_music_length">'
        +    	'Coin'
        +	'</div>'
        +'</div>'

    }
    */

    //Méthode 2: avec les données récupérés par les requêtes précédentes
    if(jsonTrackListInfos == null)
    	return;

    var jsonMusicActu = jsonTrackListInfos[indexActu];

    //Besoin de réaliser la conversion pour 
    xmlhttp_getTimeMusicActu = new XMLHttpRequest();

    /* La requête xmlhttp est SYNCHRONE, ce qui se voit par le false, cela veut dire que le programme met en pause
    son exécution jusqu'à avoir la réponse du send (contrairement à un asynchrone où la requête est en arrière-plan et
    le programme principal tourne encore.
    Dans le cadre d'une requête synchrone, la réponse est forcément un texte et
    on a pas besoin d'un onload. J'en utilise une ici sinon, le calcul des durées en minutes peut se faire dans le désordre 
    et ainsi complètement boulverser l'ordre de la playlist */
	xmlhttp_getTimeMusicActu.open("GET", "others_php/get_time_minutes.php?timeSeconds="+jsonMusicActu["duration"], false);
   	//xmlhttp_getTimeMusicActu.responseType = 'text';
    xmlhttp_getTimeMusicActu.send();

	var timeMusicActu = xmlhttp_getTimeMusicActu.response;

	//Intègre du code HTML via du Javascript
	playlistPlayer.innerHTML += 
		'<div class="div_top_10_element div_music_element" onclick="changeIndexPlaylistAbsolute(' + indexActu + ')">'
	    +	'<span class="number_top_10">'+ (indexActu+1) + '</span>'
	    +	'<img src=' + jsonMusicActu["artist"]["picture"] + ' class="img_music">'

	    +   '<div class="div_music_title_author">'
	    +    	jsonMusicActu["title_short"] + '<br>'
	    +    	'<span class="blue_text author">' + jsonMusicActu["artist"]["name"] + '</span>'
	    +    '</div>'

	    +	'<div class="div_music_length">'
	    +    	timeMusicActu
	    +	'</div>'
	    +'</div>'
    
}

function changeIndexPlaylistRelative(addToIndex) {
	indexPlaylistPlayer += addToIndex;
	playMusicInPlaylist();
}

function changeIndexPlaylistAbsolute(newIndex) {
	indexPlaylistPlayer = newIndex;
	playMusicInPlaylist();
}

function playMusicInPlaylist() {
	if (arrayPlaylistPlayer == null) {
		alert("Playlist non initialisée !");
		return;
	}

	//Change automatiquement l'index si il dépasse du tableau de playlist
	while(indexPlaylistPlayer < 0) {
		indexPlaylistPlayer += arrayPlaylistPlayer.length;
	}
	while(indexPlaylistPlayer >= arrayPlaylistPlayer.length) {
		indexPlaylistPlayer -= arrayPlaylistPlayer.length;
	}

	idMusic = arrayPlaylistPlayer[indexPlaylistPlayer];
	getNewMusic();
}

//Ancienne version avant la création du système de playlist
/*function changePlayer(imageURL, title, author, length, newIdMusic) {
	stopAudioPreview();

	playerImage.src          = imageURL;
	playerTitle.textContent  = title;
	playerAuthor.textContent = author;

	//Ne donne pas la vraie longueur comme on ne peux que charger des previews
	//playerLength.textContent = length;
	idMusic                  = newIdMusic;
	getNewMusic();

}*/

function playOrPausePreview() {
	if(audioPreview != null) {
		if(audioPreview.paused)
			playAudioPreview();
		else
			stopAudioPreview();
	}
}

function playAudioPreview() {
	if(audioPreview != null) {
		audioPreview.play();
		polygonPlay.style.visibility = "hidden";
		rectPlay_1.style.visibility  = "visible";
		rectPlay_2.style.visibility  = "visible";
	}
}	

function stopAudioPreview() {
	//Stop la musique en cours
    if(audioPreview != null) {
    	audioPreview.pause();
    	polygonPlay.style.visibility = "visible";
    	rectPlay_1.style.visibility  = "hidden";
    	rectPlay_2.style.visibility  = "hidden";
    }
}

function getNewMusic() {
	if(idMusic < 0) {
		alert("Musique non initialisée !");
		return
	}

	xmlhttp_new_music = new XMLHttpRequest();

    //var url = new URL(urlMusic);

    xmlhttp_new_music.open("GET", "others_php/music.php?id="+idMusic, true);
    xmlhttp_new_music.responseType = 'json';
   	//xmlhttp_new_music.responseType = 'text';
    xmlhttp_new_music.send();


    xmlhttp_new_music.onload = function() {
    	//Ancienne version où je recevais juste l'URL de la preview sous forme de texte
    	/*var urlPreview = xmlhttp_new_music.response;
    	console.log("Réponse de la requête getNewMusic: " + urlPreview);*/


    	var jsonMusicInfos = xmlhttp_new_music.response;
    	console.log("Réponse de la requête getNewMusic avec '" + idMusic + "': " + JSON.stringify(jsonMusicInfos));
    	//Il existe des musiques sans preview (comme "Man! I Feel Like A Woman!" (id: 7442363))
		var urlPreview = jsonMusicInfos['preview'];
		if(urlPreview == "") {
			alert("La musique: '" + jsonMusicInfos["title_short"] + "' (id: " + jsonMusicInfos["id"] + ") n'a pas de preview !");
			return;
		}

    	playerImage.src          = jsonMusicInfos["artist"]["picture"];
		playerTitle.textContent  = jsonMusicInfos["title_short"];
		playerAuthor.textContent = jsonMusicInfos["artist"]["name"];
    	
    	/* Arrête l'ancienne musique */
    	stopAudioPreview();
    	if(intervalPlayer != null)
    		clearInterval(intervalPlayer) 

    	/* Joue la nouvelle musique (et rend le player visible si ce n'est pas le cas) */
    	loadAudioPreview(urlPreview);
    };
}

function loadAudioPreview(urlPreview) {
	audioPreview = new Audio(urlPreview);

    //Attends que la musique soit chargée avant de lancer cette fonction
    audioPreview.onloadedmetadata = function() {
    	console.log(previewDurationSeconds);
    	var previewDurationSeconds = Math.floor(audioPreview.duration);

    	xmlhttp_load_1 = new XMLHttpRequest();
		xmlhttp_load_1.open("GET", "others_php/get_time_minutes.php?timeSeconds="+previewDurationSeconds, true);
   		xmlhttp_load_1.responseType = 'text';
    	xmlhttp_load_1.send();

    	//Première requête AJAX: obtenir la durée totale de la musique au bon format
    	xmlhttp_load_1.onload = function() {
    		var previewDurationMinutes = xmlhttp_load_1.response;
    		//playerLength.textContent = previewDurationMinutes;

    		//Place un interval qui met à jour le temps toutes les dixièmes de secondes
    		intervalPlayer = window.setInterval(function() {

    			var timeSeconds = Math.floor(audioPreview.currentTime);
    			xmlhttp_load_2 = new XMLHttpRequest();
				xmlhttp_load_2.open("GET", "others_php/get_time_minutes.php?timeSeconds="+timeSeconds, true);
   				xmlhttp_load_2.responseType = 'text';
    			xmlhttp_load_2.send();

    			//Prochaines requêtes qui permettent d'obtenir le bon format à la mise à jour de la durée
    			xmlhttp_load_2.onload = function() {
    				var timeMinutes = xmlhttp_load_2.response;
  					playerLength.textContent = timeMinutes + "/" + previewDurationMinutes;
  				}
			}, 100);
    	}

    	
    	footerPlayer.style.visibility = "visible";
    	playAudioPreview();

    	audioPreview.onended = function() {
    		//alert("The audio has ended");
    		audioPreview.currentTime = 0; //Est automatiquement prix en compte par l'interval
    		stopAudioPreview();
		};

	};

}

function test() {
	alert("CLICK !");
}