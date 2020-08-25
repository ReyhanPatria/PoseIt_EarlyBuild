// ATTRIBUTES
let state = null;
let neuralNet;
let webcam;
let poseNet;
let pose;
let poseLabel = "";




// MAIN
function setup() {
	createCanvas(windowWidth, windowHeight);

	loadWebcam();
	loadPoseNet();
	loadNeuralNetwork();
}

function draw() {
	switch(state) {
		case null:
			background(127);
			break;
		
		case "classify":
			background(255);
			
			drawWebcam();
			drawPose();

			textSize(100);
			text(poseLabel, 700, 100);

			break;
	}
}





// WEBCAM
// Load the webcam
function loadWebcam() {
	webcam = createCapture(VIDEO);
	webcam.hide();
}

// Draw the webcam
function drawWebcam() {
	image(webcam, 0, 0);
}





// POSE NET
// Load PoseNet
function loadPoseNet() {
	poseNet = ml5.poseNet(webcam, function() {
		console.log("PoseNet loaded");
	});

	poseNet.on("pose", getPoses);
}

// Get pose from PoseNet
// Calls neuralNet.predict() when state is "classify"
function getPoses(result) {
	if(result[0]) {
		pose = result[0].pose;

		// Calls neuralNet.predict() when state is "classify"
		if(state == "classify") {
			let inputs = [];

			for (let i = 0; i < pose.keypoints.length; i++) {
				let x = pose.keypoints[i].position.x;
				let y = pose.keypoints[i].position.y;
				inputs.push(x);
				inputs.push(y);
			}

			neuralNet.predict(inputs, getOutput);
		}
	}
}

function drawPose() {
	if(pose) {
		for(let i in pose) {
			if(pose[i].confidence > 0.80) {
				let x = pose[i].x;
				let y = pose[i].y;

				ellipse(x, y, 10);
			}
		}
	}
}





// NEURAL NETWORK
// Load the neural network
function loadNeuralNetwork() {
	let neuralNetOptions = {
		inputs: 34,
		outputs: 1,
		task: "classification",
		debug: true
	}

	neuralNet = ml5.neuralNetwork(neuralNetOptions);
	neuralNet.loadData("data/testData.json", dataLoaded);
}

// Call back when data is loaded
function dataLoaded() {
	neuralNet.normalizeData();
	trainNeuralNet();
}

// Train the neural net
function trainNeuralNet() {
	let trainingOptions = {
		epochs: 100
		// batchSize: 10
	}

	neuralNet.train(trainingOptions, function() {
		console.log("done training");
		state = "classify";
	});
}

// Get neural network's pose prediction
function getOutput(error, result) {
	if(error) {
		console.log(error);
		return;
	}

	console.log(result[0].label);
	poseLabel = result[0].label;
}



function keyPressed() {
	if(key.toUpperCase() == "S") {
		neuralNet.save();
	}
}