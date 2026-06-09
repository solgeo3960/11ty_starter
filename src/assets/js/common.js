jQuery(document).ready(function($) {
    $("#sp-menu-btn").click(function() {
        $(this).toggleClass("active");
        $("#sp-menu-btn-ft").toggleClass("active");
        $('.header-menu, .sp-menu').toggleClass('active');
        $('body').toggleClass('nav-open');
    });
    $("#sp-menu-btn-ft").click(function() {
        $(this).toggleClass("active");
		$("#sp-menu-btn").toggleClass("active");
        $('.sp-menu').toggleClass('active sp-toggle');
        $('body').toggleClass('nav-open');
    });
    $('.header-menu .has-child p').click(function() {
        $(this).toggleClass("sub-open");
        $(this).next('.sub-menu').slideToggle();
    });

    // おすすめ物件スライ�?
    $('#recommendSlide').slick({
        infinite: true,
        dots: true,
        arrows: true,
        speed: 1000,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 769,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    dots: true
                }
            }
        ]
    });

    // footer
    //$(".footer-btn").hide();
    //$(window).on("scroll", function() {
    //    if ($(this).scrollTop() > 800) {
    //        $(".footer-btn").fadeIn("fast");
    //    } else {
    //        $(".footer-btn").fadeOut("fast");
//    }
    //});

    $(document).on('click', 'a[href^="#"]', function(event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top - 0
        }, 500);
    });

	// globalNav
	var PID=$('body').attr('id');
	$('.footer-menu li.'+PID+' a').addClass('current');

	openfraijo_off();
})

var fraijoSpeed = 300;

function openfraijo() {
	if($('#spfraijo').hasClass('open')){
		openfraijo_off();
	}else{
		openfraijo_on();
	}
}

function openfraijo_off(){
	$('#spfraijo').removeClass('open');
	$('#spfraijo').stop().animate({
		bottom:0,opacity:0
	},fraijoSpeed);
}

function openfraijo_on(){
	$('#spfraijo').addClass('open');
	$('#spfraijo').stop().animate({
		bottom:$('.fixed-btn').height(),opacity:1
	},fraijoSpeed);
}

//サイド�?�バナー
$(function() {
	var floBtn = $('.float-btn');	
	floBtn.hide();
	$(window).scroll(function () {
		if ($(this).scrollTop() > 900) {
			floBtn.fadeIn();
		} else {
			floBtn.fadeOut();
		}
	});
});