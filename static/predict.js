let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

let model;
let modelLoaded = false;
$( document ).ready(async function () {
	modelLoaded = false;
	$('.progress-bar').show();
    console.log( "Loading model..." );
    model = await tf.loadLayersModel('models/model.json');
	console.log(model);
    console.log( "Model loaded." );
	$('.progress-bar').hide();
	modelLoaded = true;
});

let tensor;
let image;
let predictions;
let result_predict;
$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("The model must be loaded first"); return; }
	if (!imageLoaded) { alert("Please select an image first"); return; }
	
	image = $('#selected-image').get(0);
	
	// Pre-process the image
	console.log( "Loading image..." );
	tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([150, 150]) // change the image size
		.expandDims()
		.toFloat()
		.reverse(-1); // RGB -> BGR

	predictions = await model.predict(tensor).data();
	console.log(predictions);
	console.log(Array.from(predictions));
	result_predict = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			console.log(p);
			return {
				probability: p,
				className: TARGET_CLASSES[i] // we are selecting the value from the obj
			};
		});
		// .sort(function (a, b) {
		// 	return b.probability - a.probability;
		// }).slice(0, 2);

	$("#prediction-list").empty();
	result_predict.forEach(function (p) {
		if (p.probability === 0 ){
			$("#prediction-list").append(`<li> Normal : 99.99% </li>`);
			$("#prediction-list").append(`<li> Pneuomia : 0.01% </li>`);
		}else{
			$("#prediction-list").append(`<li> Pneuomia : 99.99% </li>`);
			$("#prediction-list").append(`<li> Normal : 0.01% </li>`);
		}
		
		});
});
