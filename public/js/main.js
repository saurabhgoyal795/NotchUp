var demoSlotData = [];
$(function(){
	$('[data-loader="circle-side"]').fadeOut(); // will first fade out the loading animation
		$('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
		$('body').delay(350);
		getDemoSlotData();
})

function getDemoSlotData() {
	$.ajax({
		url : "https://us-central1-notchup-f203d.cloudfunctions.net/demoSlotData",
		type : "GET",
		dataType : "json",
		crossDomain:true,
		success : function(response) {
			demoSlotData = response.success;
			if(demoSlotData === undefined){
				alert("No demo slot available");
			} else {
				for(var i = 0 ; i< demoSlotData.length; i++){
					$("#courseName").append('<option value="'+demoSlotData[i]["course_id"]+'">'+demoSlotData[i]["course_name"]+'</option>');
				}
			}
		}
	});
}