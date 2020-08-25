// ATTRIBUTES
let state = null;
let neuralNet;
let webcam;
let poseNet;
let pose;
let poseLabel = "";

let poseTarget = ["head_tilt_left_with_hand", 
					"head_tilt_right_with_hand"];
let currentPose = 0;
let currentPoseScore = 0;





// MAIN
function setup() {
	createCanvas(windowWidth, windowHeight);

	loadWebcam();
	loadPoseNet();
	loadNeuralNetwork();
}

function draw() {
	gameLogic();
	drawMenu();
}





// STATES MENU
// Change states
function changeState(newState) {
	poseLabel = "";
	state = newState;
}

// Draw the correct menu
function drawMenu() {
	switch(state) {
		case "startMenu":
			drawStartMenu();
			break;
		
		case "classify":
			drawClassifyMenu();
			break;

		default:
			drawStateNotRecognizedMenu();
			break;
	}
}

// Draw start menu
function drawStartMenu() {
	push();

	background(127);
	textAlign(CENTER);
	textSize(50);
	text("Press S to start", windowWidth / 2, windowHeight / 2);

	pop();
}

// Draw classifying menu
function drawClassifyMenu() {
	push();

	background(255);
			
	drawWebcam();
	drawPose();

	textSize(50);
	textAlign(CENTER);
	text(poseTarget[currentPose], windowWidth / 2, webcam.height + 50);
	text("Score: " + currentPoseScore, windowWidth / 2, webcam.height + 100);

	pop();
}

// Draw no state menu
function drawStateNotRecognizedMenu() {
	push();

	background(127);
	textAlign(CENTER);
	textSize(50);
	text("State not recognized", windowWidth / 2, windowHeight / 2);
	text("Press any key to return to start menu", windowWidth / 2, windowHeight / 2 + 50);

	pop();
}





// WEBCAM
// Load the webcam
function loadWebcam() {
	webcam = createCapture(VIDEO);
	webcam.hide();
}

// Draw the webcam
function drawWebcam() {
	push();

	translate(canvas.width, 0);
	scale(-1, 1);

	let webcamX = canvas.width / 2 - webcam.width / 2;
	image(webcam, webcamX, 0);

	pop();
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

// Draw pose
function drawPose() {
	push();

	translate(canvas.width, 0);
	scale(-1, 1);

	if(pose) {
		for(let i in pose) {
			if(pose[i].confidence > 0.80) {
				let webcamX = canvas.width / 2 - webcam.width / 2;

				let x = pose[i].x + webcamX;
				let y = pose[i].y;

				ellipse(x, y, 10);
			}
		}
	}

	pop();
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

	let modelDetails = {
		model: 'model/test_model/model.json',
		metadata: 'model/test_model/model_meta.json',
		weights: 'model/test_model/model.weights.bin'
	}

	neuralNet.load(modelDetails, modelLoaded);
}

function modelLoaded() {
	console.log("model loaded");
	// state = "classify";
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





// Key pressed
function keyPressed() {
	switch(state) {
		case "startMenu":
			if(key.toUpperCase() == "S") {
				changeState("classify");
			}
			break;

		case "classify":
			break;

		default:
			if(key) {
				changeState("startMenu");
			}
			break;
	}
}




// Game Logic
function gameLogic() {
	if(poseLabel == poseTarget[currentPose]) {
		currentPoseScore++;
	}

	if(currentPoseScore > 100) {
		currentPoseScore = 0;
		currentPose++;

		if(currentPose >= poseTarget.length) {
			currentPose = 0;
			changeState("finishedPlaying");
		}
	}
}