function initialisation() {

	$('.div_caroussel_elements_list').slick({
		arrows: false,
	  	dots: true,
  		infinite: false,
  		speed: 300,
  		slidesToShow: 1,
  		slidesToScroll: 6,
  		//centerMode: true,
  		variableWidth: true,

  		autoplay: true,
  		autoplaySpeed: 5000,

  		responsive: [
  			{
  				breakpoint: 1350,
  				settings: {
  					slidesToScroll: 5
  				}
  			},

  			{
  				breakpoint: 1100,
  				settings: {
  					slidesToScroll: 4
  				}
  			},

  			{
  				breakpoint: 850,
  				settings: {
  					slidesToScroll: 3
  				}
  			},

  			{
  				breakpoint: 730,
  				settings: {
  					slidesToScroll: 2
  				}
  			},

  			{
  				breakpoint: 470,
  				settings: {
  					slidesToScroll: 1
  				}
  			}
  		]
	});
}

function test() {
	alert("CLICK !");
}