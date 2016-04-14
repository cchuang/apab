var pdf_path = null;
var pdf_obj = null;
var stat = null;

var changePDFPage = function(pdf, n, prefix) {
	var slideid = "#" + prefix + "-slide";
	var textid = "#" + prefix + "-text-layer";
		
	pdf.getPage(n).then(function (page) {
		var jqcanvas = $(slideid);
	    var vp_norm = page.getViewport(1);
	    var scale =  jqcanvas.width() / vp_norm.width;
	    var viewport = page.getViewport(scale);

	    // Prepare canvas using PDF page dimensions.
		var canvas = jqcanvas.get(0);
	    canvas.height = viewport.height;
	    canvas.width = viewport.width;

	    // Render PDF page into canvas context.
	    var renderContext = {
	        canvasContext: canvas.getContext('2d'),
	        viewport: viewport
	    };
	    page.render(renderContext);

		// Format text-layer position
        var canvasOffset = jqcanvas.offset();
        var $textLayerDiv = $(textid).css({
            height : viewport.height+'px',
            width : viewport.width+'px',
        });

        page.getTextContent().then(function(textContent){
            var textLayer = new TextLayerBuilder({
                textLayerDiv : $textLayerDiv.get(0),
                pageIndex : n - 1,
                viewport : viewport
            });

            textLayer.setTextContent(textContent);
            textLayer.render();
        });
	});
}

var changePages = function(pdf, n) {
	changePDFPage(pdf, n-1, 'prev');
	changePDFPage(pdf, n, 'curr');
	changePDFPage(pdf, n+1, 'next');
}

var loadPDFSlides = function(pdfpath, n) {
	PDFJS.workerSrc = 'js/pdf.worker.min.js';

	// Fetch the PDF document from the URL using promises.
	PDFJS.getDocument(pdfpath).then(function (pdf) {
		pdf_obj = pdf;
		changePages(pdf, n);
	});
}

var genList = function(stat) {
	$.getJSON( "assessment.php", {action: "ls_items", opt_type: stat.opt_type}, function( data ) { 
		//console.log(data);
		$("#options").empty();
		$.each(data, function(i, item) {
			var aobj = $("<a>");
			aobj.attr("href", "#").text(item.option);
			aobj.attr("class", "btn btn-primary btn-lg active navbar-btn");
			aobj.get(0).addEventListener('click', function(e){sendAssessment(item.id);e.preventDefault();}, false);
			$("<li>").append(aobj).appendTo("#options");
		});
	});
}

var sendAssessment = function(id) {
	feedback = { 
		action: 'do', 
		opt_id: id, 
		slideno: stat.slideno, 
		event_id: stat.event_id, 
		opt_type: stat.opt_type, 
		seatno: Cookies.get('seat'), 
	};
	$.ajax("assessment.php", {
		data: feedback 
	});
}

var validateSession = function() {
	if (Cookies.get('seat') == undefined) {
		return false;
	}
	return true;
}

var createSession = function() {
	//check input value here. 
	var patt = /[A-F][0-9]/i;
	if (!patt.test($('#seat').val())) {
		return false;
	}
	Cookies.set('seat', $('#seat').val(), {expires: 1});
	$('#seatview').val(Cookies.get('seat'));
}

var sendWinEvent = function(val){
	if (!validateSession() || stat == null) {
		return;
	}
	feedback = { 
		action: 'winevent', 
		event_id: stat.event_id, 
		seatno: Cookies.get('seat'), 
		'event': val, 
	};
	$.ajax("assessment.php", {
		data: feedback 
	});
}

$(window).load(function(){
	$('#alert-modal').on('hidden.bs.modal', function (e) {
		$('#myModal').modal('show');
   	})
	$('#myModal').on('hidden.bs.modal', function (e) {
		if (!validateSession()) {
			$('#alert-modal').modal('show');
		}
   	})

	// you cannot focus on an object without seeing it. 
	$('#myModal').on('shown.bs.modal', function (e) {
		$('#seat').focus();
   	})
	$('#agreement-seat').on('submit', function(e){
		createSession();
		$('#myModal').modal('hide');
		e.preventDefault();
	});

	$('#seatview').focus(function(e) {
		$('#myModal').modal('show');
	});

	$(window).on("focus", function(event) { sendWinEvent("focus"); });
	$(window).on("blur", function(event) { sendWinEvent("blur"); });


	if (!validateSession()) {
		$('#myModal').modal('show');
	} else {
		$('#seat').val(Cookies.get('seat'));
		$('#seatview').val(Cookies.get('seat'));
	}	

	var ws = new WebSocket("ws://skyrim2.iis.sinica.edu.tw/apabws/");
	ws.onmessage = function (event) {
		stat = JSON.parse(event.data);
		if (pdf_path != stat.path) {
			pdf_path = stat.path;
			loadPDFSlides(pdf_path, stat.slideno);
		}
		if (pdf_obj != null) {
			changePages(pdf_obj, stat.slideno);
		}
		genList(stat);
	};

});

