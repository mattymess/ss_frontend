$(document).ready(function() {
	
	// Define globals
	var pageNum = 1;
	var maxPages = 0;
	var totalPictures = 0;
	var $photoCollection = $('#collection');
	var options = {};
	// Calculate the height of <header>. Use outerHeight() instead of height() to include padding
    var headerHeight = $('header').outerHeight();
	
	//Initialize App
	init();
	
	/** EVENT HANDLERS
	 * 
	 * These functions handle events such as click events
	 *
	 */
	
	$(document).on('click', '#load-more', function(event){
		
		options.page = pageNum;
		options.append = true;
				
		getPhotoCollection(options);

		return false;
	});
	
	// Choose category
	$(document).on('change', '#category', function(event){
	
		$('#category option:selected').attr("selected","selected"); 
				
		options.only = $('#category option:selected').html(); 
				
		getPhotoCollection(options);

		return false;
	});
	
	// Change photo size
	$(document).on('click', '#size-filter li a', function(event){
		
		var elem = $(this)
		elem.parent().siblings().find('a').removeClass('active');
		elem.addClass('active');
		
		options.imageSize = $(this).data('imagesize'); 			
		
		getPhotoCollection(options, function() {
			$photoCollection.removeClass('large').removeClass('normal');
			$photoCollection.addClass((elem.data('imagesize') == 4) ? 'large' : 'normal');
		});

		return false;
	});
	 
	// Get user's photos
	$(document).on('click', '.meta .posted-by a', function(event){
		
		options.userId = $(this).data('userid');
		options.feature = 'user';
						
		getPhotoCollection(options);

		return false;
	});
	
	// Get feature photos
	$(document).on('click', '#feature-filter a', function(event){
				
		$(this).parent().siblings().find('a').removeClass('active');
		$(this).addClass('active');
		
		options.feature = $(this).data('feature');
				
		getPhotoCollection(options);

		return false;
	});
	
	// when scroll
    $(window).on('scroll', function(){
 
        //if scrolled down more than the header's height
        if ($(window).scrollTop() > headerHeight){

	        // if yes, add class of “fixed”
	        $('#filter-container').addClass('fixed');
	        $('#collection').css('margin-top', '130px');
        } 
        else {

        	// when scroll up or less than headerHeight,
        	// remove the “fixed” class
        	$('#filter-container').removeClass('fixed');
        	$('#collection').css('margin-top', '0');
        }
    });
	
	/** General Helper fucntions
	 *
	 * These functions provide help for the app including AJAX, content building, and date formatting
	 *
	 */
	
	/**
	@param object containing options
	
	Helper function to get photos from 500px API
	*/
	function getPhotoCollection(options, func) {
						
		// set up the defaults;
	    var settings = {
	        'numPictures': 10,
	        'feature': '',
	        'imageSize': 3,
	        'only': '',
	        'userId': '',
	        'page': '',
	        'append': false
	    };
	    $.extend(settings,options);
	    
	    // Toggle classes for animation
   		$photoCollection.removeClass('loaded').addClass('loading');
	    	            
        // Using YQL as a proxy since the 500px API does not return data in JSONP format, which is needed for cross domain requests.
        var yqlURL ="http://query.yahooapis.com/v1/public/yql"; 
        $.ajax({
            type: "GET",
            url: yqlURL,
            data: {'q': 'SELECT * FROM json WHERE url="https://api.500px.com/v1/photos?rpp=' + settings.numPictures +'&feature=' + settings.feature + '&image_size=' + settings.imageSize + '&only=' + settings.only + '&user_id=' + settings.userId + '&page=' + settings.page + '&consumer_key=5m5ALqjAbzAL1Cnszfu0DMUIZRL4jY2crYnDlGgt"',
        		'format': 'json'},
            dataType: "jsonp",
            cache: false,
            contentType: "application/json",
            success: function(json) {
	            // Mark current page number
            	pageNum++;
            	
            	// Drill down to 500px results object
            	result = json.query.results.json;
            	
            	//Set variables for pagination
            	maxPages = result.total_pages;
            	totalPictures = result.total_items;
            	            	
            	// Build photo content and add to DOM            	
            	addPhotoCollectionContent(result.photos, settings);
            	
            	// Toggle classes for animation
            	$photoCollection.removeClass('loading').addClass('loaded');
            	
            	//Animate with jQuery if old browser
            	if (!Modernizr.csstransitions) {  
	            	$photoCollection.parent().animate({opacity:1},1000);
	            }
	            
	            if (typeof func == "function") func();
        }
        
       
            	
            	
            	
         });
         
         return false;

    }
   
	/**
	@param array of pictures
	
	Loop through each photo and display on UI
	*/
	function addPhotoCollectionContent(photos,settings) {
		
		var content='';
		// For each student apply the template
		$.each(photos, function(i, photo) {
			
			var imageFileExt = photo.image_url.substr(photo.image_url.lastIndexOf('.'));
			var largeImgUrl = photo.image_url.substr(0, photo.image_url.lastIndexOf('.')-1) + '4' + imageFileExt;
						
			// Store content for later use
			content += '<div class="photo"><figure> \
					<a class="fancy" href="' + largeImgUrl + '" title="' + photo.name + '"><img src="' + photo.image_url + '" alt="' + photo.name + '"></a> \
					<figcaption>' + photo.name + '</figcaption> \
				</figure> \
				<div class="meta"><span class="posted-by"><img class="thumb" src="' + photo.user.userpic_url + '" alt""><a href="#" title="View more from'+ photo.user.username +'" data-userid="' + photo.user.id + '">' + photo.user.username + ' </a> posted this \
				<time>' + relative_time(photo.created_at) + '</time></span></div></div>\n';
			
		});
		
		// Append or replace based on what element is triggering the function		
		if(settings.append) {
			$('#collection .inner-wrapper').append(content);
		}
		else {
			$('#collection .inner-wrapper').html(content);
		}
	
	}
   
    /**
	@param time
	
	Convert  Timestamp to "Time Ago"	
	*/
	function relative_time(time_value) {
		time_value = time_value.replace("T"," ");
		var parsed_date = Date.parse(time_value);
		var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
		var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
		delta = delta + (relative_to.getTimezoneOffset() * 60);
		
		var r = '';
		if (delta < 60) {
		    r = 'a minute ago';
		} else if(delta < 120) {
		    r = 'couple of minutes ago';
		} else if(delta < (45*60)) {
		    r = (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if(delta < (90*60)) {
		    r = 'an hour ago';
		} else if(delta < (24*60*60)) {
		    r = '' + (parseInt(delta / 3600)).toString() + ' hours ago';
		} else if(delta < (48*60*60)) {
		    r = '1 day ago';
		} else {
		    r = (parseInt(delta / 86400)).toString() + ' days ago';
		}
		
		return r;
	}
    
	// Initialize parts of the App
	function init() {
		
		// Get photos and add them to the collection container
		getPhotoCollection({'numPictures': 10, 'feature': 'popular'});
		
		// Initialize Fancybox
		$(".fancy").fancybox({
			helpers : {
		        overlay : {
		            opacity: .95,
		            css : {
		                'background-color' : '#000'
		            }
		        }
		    },
		    padding: 0
		});
    
	}

});