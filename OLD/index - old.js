var slidesContainer = null;
var slide = null;

var testText = null;

var mouseCarousselInitialised = false;
var initialMouseX = 0;

function initialisation() {
	slidesContainer = document.getElementById("caroussel_genre");
	slide = document.querySelector(".div_caroussel_one_element");

	testText = document.getElementById("genre_title");
}

function slideChange(toLeft) {
	//Permet d'obtenir le style du premier carré du caroussel
	var styleSlide = slide.currentStyle || window.getComputedStyle(slide);

	//On glisse de la largeur du carré + sa marge droite (qui reçoit un parseInt pour supprimer le "px" après sa valeur) 
	var slideWidth = slide.clientWidth + parseInt(styleSlide.marginRight, 10);

	if(toLeft) {
		slidesContainer.scrollLeft -= slideWidth;		
	} else {
		slidesContainer.scrollLeft += slideWidth;
	}

}

function checkMouseX(event) {
	if(mouseCarousselInitialised == false) {
		initialMouseX = event.clientX;
		mouseCarousselInitialised = true;
	}
}

function unCheckMouseX() {
	mouseCarousselInitialised = false;
	testText.textContent = "Genre";
}

function moveCarousselX(event) {
	if(mouseCarousselInitialised) {
		var slideWidth = initialMouseX - event.clientX;
		testText.textContent = slideWidth;
		slidesContainer.scrollLeft += slideWidth;
		//initialMouseX = event.clientX;
	}
}

function test() {
	alert("CLICK !");
}
