// Phonegap
document.addEventListener("deviceready", onDeviceReady, false);
var pgReady = false;
function onDeviceReady(){
	pgReady = true;
}

// Global variables
var server = "http://10.42.33.110/PhotoUpload";
var photoList;
var photoId;
var user;
var imageURI = null;

// Page change functions
$("#listPage").on("pagebeforeshow", function(event){
	getList();
});
function gotoPhoto(id){
	photoId = id;
	$.mobile.changePage("#viewPage");
}
$("#viewPage").on("pagebeforeshow", function(event){
	var photo = photoList[photoId];
	$("#date").html(photo.date);
	$("#name").html(photo.name);
	$("#image").attr('src', server + '/img/' + photo.path);
	$("#comment").html(photo.comment);
});

// loginPage functions
function login(option){
	if(!testLogin()) return;
	var ajaxSettings = {
		type: 'GET',
		dataType: 'jsonp',
		data: {
			user: $("#user").val(),
			pass: $("#pass").val()
		},
		success: loginSuccess,
		error: function(xhr, textStatus, errorThrown){
			console.log("Error fetching data\nStatus code: " + xhr.status + "\nStatus text: " + textStatus + "\nError thrown: " + errorThrown);
			$("#message").html("Connection error");
		}
	};
	if(option == 1){
		ajaxSettings.url = server + "/login.php";
		$("#message").html("Logging in...");
	} else if(option == 2){
		ajaxSettings.url = server + "/register.php";
		$("#message").html("Registering...");
	}
	$.ajax(ajaxSettings);
}
function testLogin(){
	if( !$("#user").val() ){
		$("#message").html("Enter a username");
		return false;
	}
	if( !$("#pass").val() ){
		$("#message").html("Enter a password");
		return false;
	}
	return true;
}
function loginSuccess(data){
	if(data.success) {
		user = data.id;
		$("#message").html("");
		$.mobile.changePage("#listPage");
	} else {
		$("#message").html(data.error);
	}
}

// listPage functions
function getList(){
	$.ajax({
		url: server + "/getlist.php",
		dataType: 'jsonp',
		success: function(result){
			photoList = result;
			updateList();
		},
		error: function(xhr, textStatus, errorThrown){
			console.log("Error fetching data\nStatus code: " + xhr.status + "\nStatus text: " + textStatus + "\nError thrown: " + errorThrown);
		}
	});
}
function updateList(){
	$("#list").empty();
	for(var key in photoList){
		var photo = photoList[key];
		$("#list").append('<li><a href="javascript:gotoPhoto(' + key + ')"><img src="' + server + "/thumb/" + photo.path + '"><h2>' + photo.date + '</h2><h2>' + photo.name + '</h2></a></li>');
	}
	$('#list').listview('refresh');
}

// uploadPage functions
function captureImage(){
	var optionsCam = { 					// Adjust camera options
		quality: 75,
		destinationType: Camera.DestinationType.FILE_URI, 
		correctOrientation: true, 
		targetWidth: 500,					// Aspect ratio is kept
		targetHeight: 500
	};
	if(pgReady)
		navigator.camera.getPicture(onSuccessCam, onFail, optionsCam);
}
function onSuccessCam(imageURI){
	$("#preview").attr('src', imageURI);
	$("#newComment").val('');
	window.imageURI = imageURI;
}
function onFail(message){
	alert('Failed because: ' + message);
}
function upload(){
	if(imageURI == null) return;
	var options = new FileUploadOptions();
    options.fileKey = "photo";
    options.mimeType = "image/jpeg";
    options.params = {
		userID: user,
		comment: $("#newComment").val()};
    var ft = new FileTransfer();
	ft.upload(imageURI, encodeURI(server + "/saveimage.php"),
		function(){ //Success
			alert('success');
			$("#preview").attr('src', '');
			$("#newComment").val('');
			imageURI = null;
			window.history.back();
		},
		function(){ //Fail
			alert('fail');
		},
		options);
}

