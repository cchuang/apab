var pdf_path = null;
var pdf_obj = null;
var curr_slide = null;

var renderPDFPages = function(pdf, n, ctn) {
	pdf.getPage(n).then(function (page) {
	    var vp_norm = page.getViewport(1);
	    var scale =  ctn.width() / vp_norm.width;
	    var viewport = page.getViewport(scale);

	    // Prepare canvas using PDF page dimensions.
	    var canvas = ctn.get(0);
	    var context = canvas.getContext('2d');
	    canvas.height = viewport.height;
	    canvas.width = viewport.width;


	    // Render PDF page into canvas context.
	    var renderContext = {
	        canvasContext: context,
	        viewport: viewport
	    };
	    page.render(renderContext);

	});
}

var loadAllSlides = function(pdfpath, n) {
	PDFJS.workerSrc = 'js/pdf.worker.min.js';

	// Fetch the PDF document from the URL using promises.
	PDFJS.getDocument(pdfpath).then(function (pdf) {
		pdf_obj = pdf;
		for (i = 1; i <= pdf.numPages; i ++) {
			singleCtn = $('<div>');
			singleCtn.attr("class", "singleslide");
			singleCtn.append($('<canvas>').attr("id", "slide-" + i));
			singleCtn.append($('<div>').text(i));
			$('.holder').append(singleCtn);
			$('#slide-' + i).get(0).addEventListener('click', changeSlide, false);
			renderPDFPages(pdf, i, $('#slide-' + i));
		}
		highlightCurrentSlide(n);
	});
}

var highlightCurrentSlide = function (n) {
	if (curr_slide != null) {
		$('#slide-' + curr_slide).parent().css("background-color", "");
	} 
	curr_slide = n;
	$('#slide-' + n).parent().css("background-color", "#80ff80");

}

var changeSlide = function() {
	feedback = { 
		action: 'update_page', 
		slideno: $(this).attr("id").substring(6),
	};
	$.ajax("admin_util.php", {
		data: feedback 
	});
}

var loadIdleUsers = function(d) {
	feedback = { 
		action: 'get_idle_users', 
		duration: d,
	};
	$.getJSON( "admin_util.php", feedback, function( data ) { 
		$("#idle-users").empty();

		$.each(data.obs_users, function(i, item) {
			var is_idle = true;
			data.not_idle_users.forEach(function(atom) {
				if (atom[0] == item) {
					is_idle = false;
				}
			});
			if (is_idle) {
				var liobj = $("<li>");
				liobj.text(item);
				liobj.appendTo("#idle-users");
			}
		});
	});
}

var loadUnfocusedUsers = function(d) {
	feedback = { 
		action: 'get_unfocused_users', 
		duration: d,
	};
	$.getJSON( "admin_util.php", feedback, function( data ) { 
		$("#unfocused-users").empty();

		$.each(data, function(i, item) {
			var liobj = $("<li>");
			liobj.text(item[0] + "/" + item[1]);
			liobj.appendTo("#unfocused-users");
		});
	});
}

var poll = function() {
	var def_duration = 20;
	loadIdleUsers(def_duration);
	loadUnfocusedUsers(def_duration);
	setTimeout(poll, 1000);
}

$(window).load(function(){
	var ws = new WebSocket("ws://skyrim2.iis.sinica.edu.tw/apabws/");
	ws.onmessage = function (event) {
		stat = JSON.parse(event.data);
		if (pdf_path != stat.path) {
			pdf_path = stat.path;
			loadAllSlides(pdf_path, stat.slideno);
		}
		if (pdf_obj != null) {
			highlightCurrentSlide(stat.slideno);
		}
	};

	poll();
});

