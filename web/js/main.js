var pdf_path = null;
var pdf_obj = null;

var changePDFPage = function(pdf, n) {
	pdf.getPage(n).then(function (page) {
	  var scale = 0.8;
	  var viewport = page.getViewport(scale);

	  // Prepare canvas using PDF page dimensions.
	  var canvas = document.getElementById('the-canvas');
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

var loadPDFSlides = function(pdfpath, n) {
	PDFJS.workerSrc = 'js/pdf.worker.min.js';

	// Fetch the PDF document from the URL using promises.
	PDFJS.getDocument(pdfpath).then(function (pdf) {
		pdf_obj = pdf;
		changePDFPage(pdf, n);
	});
}

var genList = function(handle, slideno) {
	$.getJSON( handle, {action: "ls_items"}, function( data ) { 
		//console.log(data);
		$("#options").empty();
		$.each(data, function(i, item) {
			$("<li>").append($("<a>").attr("href", handle + "?action=do&val=" + encodeURIComponent(item) + "&slideno=" + slideno)
					.text(item))
				.appendTo("#options");
		});
	});
}

$(window).load(function(){
	var ws = new WebSocket("ws://skyrim3.iis.sinica.edu.tw:5678/");
	ws.onmessage = function (event) {
		stat = JSON.parse(event.data);
		if (pdf_path != stat.path) {
			pdf_path = stat.path;
			loadPDFSlides(pdf_path, stat.slideno);
		}
		if (pdf_obj != null) {
			changePDFPage(pdf_obj, stat.slideno);
		}
		//$('#slides').attr("src", stat.path);
		genList(stat.handle, stat.slideno);
	};

});

