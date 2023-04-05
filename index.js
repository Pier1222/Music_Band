var playerImage  = null;
var playerTitle  = null;
var playerAuthor = null;
var playerLenght = null;

var idMusic      = -1;
var audioPreview = null;
var footerPlayer = null;
var polygonPlay  = null;
var rectPlay_1  = null;
var rectPlay_2  = null;

function initialisation() {
	playerImage   = document.getElementById("img_player");
	playerTitle   = document.getElementById("div_title_player");
	playerAuthor  = document.getElementById("span_author_player");
	playerLenght  = document.getElementById("div_lenght_player");

	footerPlayer = document.getElementById("footer_player");
	polygonPlay  = document.getElementById("polygon_svg_music_play");
	rectPlay_1   = document.getElementById("rect_1_svg_music_play");
	rectPlay_2   = document.getElementById("rect_2_svg_music_play");

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

function changePlayer(imageURL, title, author, lenght, newIdMusic) {
	stopAudioPreview();

	playerImage.src          = imageURL;
	playerTitle.textContent  = title;
	playerAuthor.textContent = author;
	playerLenght.textContent = lenght;
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

function getNewMusic() {
	if(idMusic < 0) {
		alert("Musique non initialisée !");
	}

	xmlhttp = new XMLHttpRequest();

    //var url = new URL(urlMusic);

    //xmlhttp.open("GET", url, true);
    xmlhttp.open("GET", "music.php?id="+idMusic, true);
    //xmlhttp.responseType = 'json';
   	xmlhttp.responseType = 'text';
    xmlhttp.send();


    xmlhttp.onload = function() {
    	var urlPreview = xmlhttp.response;
    	//alert("Réponse: " + urlPreview);

    	/* Arrête l'ancienne musique */
    	stopAudioPreview();

    	/* Joue la nouvelle musique (et rend le player visible si ce n'est pas le cas) */
    	audioPreview = new Audio(urlPreview);
    	footerPlayer.style.visibility = "visible";
    	playAudioPreview();

    };
}

function test() {
	alert("CLICK !");
}