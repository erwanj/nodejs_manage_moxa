

function PorteController()
{

	console.log("porteController.js");

	// bind event listeners to button clicks //
	var that = this;

// handle user logout //
	$('#btn-logout').click(function(){ 
		console.log("clic btn-logout"); 
		that.attemptLogout(); 
	});

// gérer ouverture / fermeture de porte //
	$('#btn-ouvrir').click(function(){ 
		console.log("clic btn-ouvrir"); 
		that.ouvrir(); 
	});

	$('#btn-fermer').click(function(){ 
		console.log("clic btn-femer"); 
		that.fermer(); 
	});
	
/*
// confirm account deletion //
	$('#account-form-btn1').click(function(){$('.modal-confirm').modal('show')});


// handle account deletion //
	$('.modal-confirm .submit').click(function(){ that.deleteAccount(); });

	this.deleteAccount = function()
	{
		$('.modal-confirm').modal('hide');
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			data: { id: $('#userId').val()},
			success: function(data){
	 			that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}*/

	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: "/home",
			type: "POST",
			data: {logout : true},
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.ouvrir = function()
	{
		var that = this;
		$.ajax({
			url: "/ouvrir_porte",
			type: "POST",
			data: {ouvrir : true},
			success: function(data){
	 			//that.showOuverturePorte('La porte est ouverte.');
	 			var start = Date.now();
				// expecting something close to 500
				setTimeout(function(){ console.log(Date.now() - start); that.fermer();}, 5000);
	 			//console.log("a");
	 			//setTimeout(that.fermer(),30000);
	 			//console.log("b");
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.fermer = function()
	{
		var that = this;
		$.ajax({
			url: "/ouvrir_porte",
			type: "POST",
			data: {fermer : true},
			success: function(data){
	 			//that.showFermeturePorte('La porte est fermée.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}


	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}
	
	this.showOuverturePorte = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/ouvrir_porte';})
		setTimeout(function(){window.location.href = '/ouvrir_porte';}, 3000);
	}
	
	this.showFermeturePorte = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/ouvrir_porte';})
		setTimeout(function(){window.location.href = '/ouvrir_porte';}, 3000);
	}
}

PorteController.prototype.onUpdateSuccess = function()
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html('Your account has been updated.');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}
