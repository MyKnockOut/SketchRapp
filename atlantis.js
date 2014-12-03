//If isFlickr == true, open Flickr panel
var isFlickr= false;
$(document).ready(function(){

	

	//Swith Button
	
	$("#switchBtn").on("click", function() {
		
		if(!isFlickr){
			$("#sketchup").fadeOut();
			$("#flickr").fadeIn(1000);
			isFlickr=true;
			//We change the image in the SWITCH btn:
			$(this).prop("src","sketchupLOGO.png");
		}
		else{
			$("#flickr").fadeOut();
			$("#sketchup").fadeIn(1000);
			isFlickr=false;
			$(this).prop("src","flickrLOGO.png");
		}
		localStorage.setItem("openWithFlickr", isFlickr);
		
			
	});



	//Sketch
	function sketch(){
		var isErasing = false;

		var myCanvas = document.getElementById("myCanvas");
		var context = myCanvas.getContext("2d");
		context.lineJoin = context.lineCap = 'round';

		var canvasW = myCanvas.width;
		var canvasH = myCanvas.height;

		myCanvas.onmousemove = move;
		myCanvas.onmousedown = down;
		myCanvas.onmouseup = up;
		myCanvas.onmouseout= out;

		var coords = findPos(myCanvas);
		var offsetx = coords[0];
		var offsety = coords[1];

		var isDrawing = false;

		//MouseX MouseY
		var mx, my;

		function move (e) {
			// windows stores the event in the window.event variable
			// so we check for that first
			if (!e) var e = window.event;
			
			var posx = 0;
			var posy = 0;
			// check if the browser supports the pageX and pageY properties.
			if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
			}
			/* .. if not use clientX and clientY which are relative to the
			viewport (adding the amount the page may have scrolled */
			else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
			}
			
			//... your code goes here

			mx = posx - offsetx;
			my = posy - offsety;

			if (!isDrawing) {
			  context.beginPath();
			  context.moveTo(mx, my);
			} else {
			  context.lineTo(mx, my);
			  context.stroke();
			  if (e.shiftKey)
			  context.fill();
			}
			
		}

		function down(e){
			isDrawing = true;
			context.moveTo(mx,my);
		}

		function up(e){
			isDrawing = false;
		}

		function out(e){
			isDrawing = false;
		}

		//from quirksmode.org
		//returns added offset of all containing elements
		function findPos(obj) {
			var curleft = curtop = 0;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} while (obj = obj.offsetParent);
				
				return [curleft,curtop];
			}
		} 
		
		$("#clearCanvas").on("click", function(e){
			context.clearRect ( 0 , 0 , canvasW , canvasH );
			
		});

		$("#colourPicker").on("change", function (e){
			context.strokeStyle = $(this).val();
			if(isErasing){
				$("#eraser").css({"backgroundColor":"EEE","boxShadow":"0 0px 0px black inset"});
				context.fillStyle = currentFill;
				isErasing=false;
			}
		});

		$("#fillColour").on("change", function (e){
			context.fillStyle = $(this).val();
			if(isErasing){
				$("#eraser").css({"backgroundColor":"EEE","boxShadow":"0 0px 0px black inset"});
				context.strokeStyle = currentColour;
				isErasing=false;
			}
		});

		$("#penWidth").on("change", function (e){
			context.strokeStyle = $(this).val();
			switch($(this).val())
			{
				case "hulk":
					context.lineWidth=100;
					break;
				case "veryThick":
					context.lineWidth=40;
					break;
				case "thick":
				  context.lineWidth= 20;
				  break;
				case "medium":
				  context.lineWidth = 5;
				  break;
				default:
				  context.lineWidth = 1;
			}
		});

		
		var currentColour;
		var currentFill;
		$("#eraser").on("click", function (e){
			if (!isErasing){
				currentColour = context.strokeStyle;
				currentFill = context.fillStyle;
				context.strokeStyle = "white";
				context.fillStyle ="white";
				isErasing = true;
				$(this).css({"backgroundColor":"DDD","boxShadow":"0 1px 2px black inset"});
			}
			else{
				isErasing = false;
				context.strokeStyle = currentColour;
				context.fillStyle = currentFill;
				$(this).css({"backgroundColor":"EEE","boxShadow":"0 0px 0px black inset"});
			}
			
		});

	}





	//
	// FLICKR
	function flickr(){

		//Clear localStorage
		$('#BTNLocalStorage').on("click", function (){

			txt = "";
			for (i=0; i<localStorage.length; i++)
			{
				txt += localStorage.key(i) + ":"+ localStorage[	localStorage.key(i)	] + " ---  ";
			}
			$("#localStorageContent").html(""+txt);
		});


		var isfirstTag = true;
		//First, we look at localStorage for tags
		for (var i=0; i < localStorage.length; i ++){
			if( tagI = localStorage.getItem("tag"+i))
			{
				var tag = localStorage.getItem("tag"+i);
				if(isfirstTag){
					$("#firstTag").val(tag);
					isfirstTag= false;
				}
				else{
					
					var newTag = "<div class='row rowTag'><div class='col-xs-10'><div><input class='tags form-control' type='textbox' value='"+tag+"'/></div></div><div class='col col-xs-2'> <button class='btn btn-danger removeTag'><span class='glyphicon glyphicon-trash removeTag'></span></button></div>";
					$("#tagsContainer").append(newTag);
					addEventOnRemoveTag();
				}				
			}
		}

		//To Add A Tag
		$("#addTag").on("click", function(e){
			
			var newTag = "<div class='row rowTag'><div class='col-xs-10'><div><input class='tags form-control' type='textbox'/></div></div><div class='col col-xs-2'> <button class='btn btn-danger removeTag'><span class='glyphicon glyphicon-trash removeTag'></span></button></div>";

			$("#tagsContainer").append(newTag);

			addEventOnRemoveTag();
		});
		

		document.getElementById('flickrButton').onclick = getPhotos;
		function getPhotos()
		{
			var myArray = new Array();
			var oneOrMoreTags = false;
			//Get all tags and remove empty inputs:
			$('.tags').each(function() {
				if($(this).val() != ""){
					myArray.push($(this).val());
					oneOrMoreTags=true;
				}
				else{
					if(!$(this).is("#firstTag")) //We leave the first input
					$(this).parent().parent().parent().remove();
				}
			});

			if(oneOrMoreTags)
			{
				newScript = document.createElement('script');
				request = "https://api.flickr.com/services/rest/?";
				request += "method=flickr.photos.search";
				request += "&per_page=21";
				request += '&api_key=73ffb533c0d85850f76efdd8ce6cac41';
				request += "&format=json";
				request += "&tag_mode=any";
				String_tags = "";
				for (var i = 0; i< myArray.length - 1; i++)
				{
					String_tags += myArray[i] + ",";
				}
				String_tags += myArray[myArray.length-1];
				request += "&tags=" + String_tags;
				requestEncoded = encodeURI(request);
				newScript.setAttribute('src',requestEncoded);
				document.getElementsByTagName('head')[0].appendChild(newScript);
				document.getElementById('imgContainer').innerHTML = "Loading . . .";
				document.getElementById('flickrButton').innerHTML = "Loading . . .";

				
				//We update the localStorage:
				var panelLastOn = localStorage.openWithFlickr;
				localStorage.clear();
				for ( var i = 0; i < myArray.length; i++){
					localStorage.setItem("tag"+i, myArray[i]);
				}
				localStorage.setItem("openWithFlickr", panelLastOn);
			}
			else if (!oneOrMoreTags){
				$('#imgContainer').html("<span id='iconAlert' class='glyphicon glyphicon-info-sign'></span>Please enter a tag");
				$('#nbResults').html("");
				localStorage.clear();
			}
		}

	} //end of Flickr function


	sketch();
	flickr();

	//Open with the correct panel:
	if(localStorage.openWithFlickr == "true"){
		$("#switchBtn").prop("src","sketchupLOGO.png");
		$("#sketchup").css({"display":"none"});
		$("#flickr").css({"display":"block"});
		isFlickr = true;
	}
	


}); // end of document.ready


//Call-back funtion for Flickr
function jsonFlickrApi(images)	{
	$('#flickrButton').html("Find Images");
	$('#nbResults').html(" <span id='iconSuccess' class='glyphicon glyphicon-ok-sign'></span> " + images.photos.photo.length + " results");
		newStr ="";
		if(images.photos.photo.length != 0){
			for (i = 0; i <	images.photos.photo.length; i++ )
			{
				url = "http://farm" + images.photos.photo[i].farm;
				url += ".static.flickr.com/";
				url += images.photos.photo[i].server + "/";
				url += images.photos.photo[i].id + "_";
				url += images.photos.photo[i].secret;
				url += "_s.jpg";
				newStr += " <img src = " + url + " class='img-thumbnail resImg'> ";
			}
		} else {
			newStr = "<span id='iconNoRes' class='glyphicon glyphicon-remove-circle'></span> Sorry, no results.";
			$('#nbResults').html("");
		}
	document.getElementById('imgContainer').innerHTML = newStr;
}


function addEventOnRemoveTag(){
	$(".removeTag").on("click", function(e){
		var e = e || window.event;
		$(e.target).parent().parent().remove();
	});
}
