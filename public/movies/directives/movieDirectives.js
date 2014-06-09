function leftPopup(elem) {
	if ($(elem).find('.tooltip.hidden').hasClass('expanded'))
		$(elem).find('.tooltip').toggleClass('hidden');
}

function closePopup(elem) {
	$(elem).parent().parent().find('.tooltip').toggleClass('hidden')
}

function closePopups() {
	$('.tooltip.expanded:not(.hidden)').parent().find('.tooltip').toggleClass('hidden');
}

function registerPopupEvents() {
	$('#register-form').click(function(event) {
	  event.stopPropagation();
	});

	$('#register-wrapper').click(function() {
	  $('#register-wrapper').fadeOut(200);
	});

	$('#new-account-button').click(function() {
		$('#register-wrapper').fadeIn(200);
	});
}