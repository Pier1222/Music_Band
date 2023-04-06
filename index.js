var playerImage  = null;
var playerTitle  = null;
var playerAuthor = null;
var playerLenght = null;

var idMusic        = -1;
var audioPreview   = null;
var footerPlayer   = null;
var polygonPlay    = null;
var rectPlay_1     = null;
var rectPlay_2     = null;
var intervalPlayer = null;



function initialisation() {
	//Initialisation des variables utilisées dans plusieurs fonctions
	playerImage   = document.getElementById("img_player");
	playerTitle   = document.getElementById("div_title_player");
	playerAuthor  = document.getElementById("span_author_player");
	playerLenght  = document.getElementById("div_lenght_player");

	footerPlayer = document.getElementById("footer_player");
	polygonPlay  = document.getElementById("polygon_svg_music_play");
	rectPlay_1   = document.getElementById("rect_1_svg_music_play");
	rectPlay_2   = document.getElementById("rect_2_svg_music_play");

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



function changePlayer(imageURL, title, author, lenght, newIdMusic) {
	stopAudioPreview();

	playerImage.src          = imageURL;
	playerTitle.textContent  = title;
	playerAuthor.textContent = author;

	//Ne donne pas la vraie longueur comme on ne peux que charger des previews
	//playerLenght.textContent = lenght;
	idMusic                  = newIdMusic;
	getNewMusic();

}

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

function getTimeMinutes(timeSeconds) {
    return "PATATE";
}

function getNewMusic() {
	if(idMusic < 0) {
		alert("Musique non initialisée !");
	}

	xmlhttp_new_music = new XMLHttpRequest();

    //var url = new URL(urlMusic);

    xmlhttp_new_music.open("GET", "others_php/music.php?id="+idMusic, true);
    //xmlhttp_new_music.responseType = 'json';
   	xmlhttp_new_music.responseType = 'text';
    xmlhttp_new_music.send();


    xmlhttp_new_music.onload = function() {
    	var urlPreview = xmlhttp_new_music.response;
    	console.log("Réponse de la requête getNewMusic: " + urlPreview);

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
    		//playerLenght.textContent = previewDurationMinutes;

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
  					playerLenght.textContent = timeMinutes + "/" + previewDurationMinutes;
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