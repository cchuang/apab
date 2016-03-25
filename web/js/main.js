var pdf_path = null;
var pdf_obj = null;

var changePDFPage = function(pdf, n) {
	pdf.getPage(n).then(function (page) {
	    var vp_norm = page.getViewport(1);
	    var scale =  $('.holder').width() / vp_norm.width;
	    var viewport = page.getViewport(scale);

	    // Prepare canvas using PDF page dimensions.
	    var canvas = document.getElementById('the-canvas');
	    var context = canvas.getContext('2d');
	    canvas.height = viewport.height;
	    canvas.width = viewport.width;

		// Format text-layer position
        var canvasOffset = $(canvas).offset();
        var $textLayerDiv = $('#text-layer').css({
            height : viewport.height+'px',
            width : viewport.width+'px',
            //top : canvasOffset.top,
            //left : canvasOffset.left
        });

	    // Render PDF page into canvas context.
	    var renderContext = {
	        canvasContext: context,
	        viewport: viewport
	    };
	    page.render(renderContext);

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
		genList(stat.handle, stat.slideno);
	};

});

