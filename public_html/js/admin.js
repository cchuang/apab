var pdf_path = null;
var pdf_obj = null;

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
			renderPDFPages(pdf, i, $('#slide-' + i));
		}
		highlightCurrentSlide(n);
	});
}

var highlightCurrentSlide = function (n) {
	$('#slide-' + n).parent().css("background-color", "#80ff80");

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
			//renderPDFPages(pdf_obj, stat.slideno);
			highlightCurrentSlide(stat.slideno);
		}
	};

});

