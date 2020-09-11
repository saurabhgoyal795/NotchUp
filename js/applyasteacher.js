var userEmail = getUrlParam("email","");
var courseCategoryList = [];

$(function(){
	if(userEmail == ""){
		firebase.auth().onAuthStateChanged(function(user) {
			console.log("onAuthStateChanged:",user);
		  if (user) {
			userEmail = firebase.auth().currentUser.email;
			onAuthenticated();
		  } else {
			$(".afterLogin").css("display","none");
			$(".beforeLogin").css("display","");
		  }
		});
	}else{
		onAuthenticated();
	}
});

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return decodeURI(urlparameter);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function authenticate(){
	
	var user = firebase.auth().currentUser;
	console.log("user",user);
	if (user) {
		console.log("authenticate if");
	  // User is signed in.
	  userEmail = firebase.auth().currentUser.email;
	  onAuthenticated();
	} else {
		console.log("authenticate else");
		$(".afterLogin").css("display","none");
		$(".beforeLogin").css("display","");
		$("#loginBoxFirestore").css("display","");
	 firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
	 //var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
	  var ui = new firebaseui.auth.AuthUI(firebase.auth());
		ui.start('#firebaseui-auth-container', {
		  signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		  ],
		  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
		  signInFlow: 'popup',
		  signInSuccessUrl: '',
		  callbacks: {
				signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				  console.log("authenticate success:",authResult);
				  //onAuthenticated();
				  return false;
				},
				uiShown: function() {
				  // The widget is rendered.
				  // Hide the loader.
				  //document.getElementById('loader').style.display = 'none';
				}
			},
		  // Other config options...
		});
		
	}
}

function signOut(){
	firebase.auth().signOut();
	location.reload();
}

function onAuthenticated(){
	//logEvents("assessment_dashboard",{"authenticated":true});
	$(".afterLogin").css("display","initial");
	$(".beforeLogin").css("display","none");
	$("#loginBoxFirestore").css("display","none");
	$(".userEmail").text(userEmail);
	console.log("onAuthenticated:"+userEmail);
	$('#repeatSelect').on('change', function() {
		repeatSelectChange();
	});
	getCourseCategory();
}

function getCourseCategory(){
	var listener = db_firestore.collection("categoryDetailsCollection")
	.onSnapshot(function(querySnapshot) {
		$(".courseListContainer").html("");
		querySnapshot.forEach(function (doc) {
			courseCategoryList.push(doc.id);
			$(".courseListContainer").append('<div class="md-checkbox" style="display: inline-block;margin-right: 16px;"><input type="checkbox" courseName="'+doc.id+'" class="md-check courseCheckBox" ><label style="max-width: 90%; vertical-align: middle; margin-left: 10px;"> <span></span> <span class="check"></span> <span class="box"></span>'+doc.id+'</label></div>')
		});
		console.log("categoryDetailsCollection",courseCategoryList);
		
		
		checkIfApplied();
		setTimeout(function(){
			listener();
		},1000);
	});
}

function checkIfApplied(){
	
	$("#newStudentForm_country").html("");
	for(var i=0;i<countryCodeMappingArray.length;i++){
		var selected = "";
		if(countryCodeMappingArray[i].name.toLowerCase() == "india"){
			selected = "selected";
			$("#form_number_prefix").text(countryCodeMappingArray[i].dial_code);
		}
		$("#newStudentForm_country").append('<option value="'+countryCodeMappingArray[i].name+'" '+selected+'>'+countryCodeMappingArray[i].name+'</option>');
	}
	$('#newStudentForm_country').on('change', function() {
		var country = this.value.trim();
		$("#form_number_prefix").text(countryCodeMappingObject[country].dial_code);
	});
	
	var listener = db_firestore.collection("teacherApplicationsCollection").doc(userEmail)
	.onSnapshot(function(doc) {
		console.log("teacherApplicationsCollection",doc.data());
		if(doc.data() != undefined){
			showProfile(doc);
		}else{
			$(".formScreen").show();
		}
		setTimeout(function(){
			listener();
		},1000);
	});
}

function SubmitForm(){
	var form_name = $("#form_name").val();
	var form_number = $("#form_number").val().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	var form_number_prefix = $("#form_number_prefix").text().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	var form_aboutme = $("#form_aboutme").val();
	var country = $("#newStudentForm_country").val();
	var form_image = $("#form_image").val();
	var form_video = $("#form_video").val();
	var form_type = $("#form_type").val();
	var form_maxConsecutiveSlots = $("#form_maxConsecutiveSlots").val();
	var form_maxSlotsBookablePerDay = $("#form_maxSlotsBookablePerDay").val();
	var resume = [];
	var courseCategories = [];
	$(".courseCheckBox").each(function(){
		if($(this).is(":checked")){
			courseCategories.push($(this).attr("courseName"));
		}
	});
	if(form_name.length < 2 || form_type == "" || form_number == "" || form_aboutme == ""
		|| courseCategories.length == 0){
		return alert("Please fill all entries");
	}
	
	if(form_number == ""){
		return alert("Please enter number");
	}
	if(form_number.charAt(0) == "0"){
		form_number = form_number.slice(1);
	}
	if(form_number.length < 7 || form_number.length > 10){
		return alert("Phone number length must be 7 to 10");
	}
	
	$(".qualificationContainer .form-group").each(function(){
		var obj = {};
		var degree = $(this).find(".form_degree").val();
		var duration = $(this).find(".form_duration").val();
		var institute = $(this).find(".form_institute").val();
		if(degree != "" && duration != "" && institute != ""){
			obj.degree = degree;
			obj.duration = duration;
			obj.institute = institute;
			resume.push(obj);
		}
	});
	var response = {
		name:form_name,
		phoneNumber:form_number_prefix+form_number,
		countryCode : form_number_prefix,
		country : country,
		aboutMe:form_aboutme,
		imagePath:form_image,
		videoUrl:form_video,
		teacherType : form_type,
		courseCategories : courseCategories,
		maxConsecutiveSlots : form_maxConsecutiveSlots,
		maxSlotsBookablePerDay : form_maxSlotsBookablePerDay,
		resume:resume,
		status : "pending"
	}
	showLoading();
	db_firestore.collection('teacherApplicationsCollection').doc(userEmail.toLowerCase())
	.set(response, { merge: true })
	.then(function() {
		hideLoading();
		alert("Application submitted");
		window.location.reload();
	}).catch(function(error) {
		alert("Error!");
	});	
}

function showLoading(){
	$("#loadingDiv").show();
}
function hideLoading(){
	$("#loadingDiv").hide();
}


function addQualification(){
	$(".qualificationContainer").append($(".qualificationContainer .form-group:eq(0)")[0].outerHTML);
}

function showProfile(doc){
	var data = doc.data();
	console.log("showProfile doc",data);
	if(data.countryCode == undefined){
		data.countryCode = "";
	}
	var form_name = $("#form_name").val(data.name);
	var form_number = $("#form_number").val(data.phoneNumber.slice(data.countryCode.length));
	var form_number_prefix = $("#form_number").text(data.countryCode);
	var country = $("#newStudentForm_country").val(data.country);
	var form_aboutme = $("#form_aboutme").val(data.aboutMe);
	var form_image = $("#form_image").val(data.imagePath);
	var form_video = $("#form_video").val(data.videoUrl);
	var form_type = $("#form_type").val(data.teacherType);
	var form_maxConsecutiveSlots = $("#form_maxConsecutiveSlots").val(data.maxConsecutiveSlots);
	var form_maxSlotsBookablePerDay = $("#form_maxSlotsBookablePerDay").val(data.maxSlotsBookablePerDay);
	var resume = data.resume;
	var courseCategories = data.courseCategories;
	for(var i=0;i<courseCategories.length;i++){
		$(".courseCheckBox").each(function(){
			if(courseCategories[i] == $(this).attr("courseName")){
				$(this).prop("checked", true);
			}
		});
	}
	$(".qualificationContainer").html("");
	for(var i=0;i<resume.length;i++){
		$(".qualificationContainer").append('<div class="form-group row">'
							+'<div class="col-lg-4">'
							+'<label>Degree</label>'
							+'<input type="text" value="'+resume[i].degree+'" class="form_degree form-control" placeholder="Enter degree">' 
							+'<span class="form-text text-muted">Please enter degree</span> '
							+'</div>'
						+'<div class="col-lg-4">'
						+'<label>Duration</label>'
							+'<input type="text" value="'+resume[i].duration+'" class="form_duration form-control" placeholder="Enter duration">' 
							+'<span class="form-text text-muted">Please enter duration</span> '
							+'</div>'
						+'<div class="col-lg-4">'
						+'<label>Institute</label>'
							+'<input type="text" value="'+resume[i].institute+'" class="form_institute form-control" placeholder="Enter institute">' 
							+'<span class="form-text text-muted">Please enter institute</span> '
							+'</div>'
					+'</div>');
	}
	
	$(".formScreenTitle").text("You have already applied for Teacher");
	$(".formScreen .card-footer").hide();
	$(".addQualification").hide();
    $(".formScreen :input").prop("disabled", true);
	$(".formScreen").show();
	
}