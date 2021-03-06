
var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.email);
    }
     else window.location = 'login.html'; 
  });
// Get Commands List
var cpt=0;

function signOut() {
    firebase.auth().signOut();
} 
// Confirmation Delete Modal
$('#confirmationModal').on('show.bs.modal', function(e) {
  var id = $(e.relatedTarget).data('book-id');
  var rowId = $(e.relatedTarget).data('row-id');
  $('#deleteButton').attr('onClick', 'delete_livreur("'+id+'","'+rowId+'");');
});
// Update Modal
$('#exampleModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var cellId = $(e.relatedTarget).data('cell-id');
    var docRef = db.collection("delivery_men").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('#livreur_name').val(data.name);
           $(e.currentTarget).find('#livreur_phone').val(data.phone);
           $(e.currentTarget).find('#livreur_email').val(data.email);
           $(e.currentTarget).find('#livreur_city').val(data.city);
          $('#saveButton').attr('onClick', 'upload("'+id+'","'+cellId+'");');
         
});
});

// ADD PAYMENT Modal
$('#addPaymentModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("delivery_men").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('input[name="livreurName"]').val(data.name);
    });
    $('#addPaymentButton').attr('onClick', 'addPayment("'+id+'");');
});

/******** FUNCTIONS *********/
function upload(id, cellId) {
   
    //GET NEW VALUES
    var new_name= $('#livreur_name').val();
    var new_phone= $('#livreur_phone').val();
    var new_email= $('#livreur_email').val();
    var new_password= $('#livreur_password').val();
    var new_city= $('#livreur_city').val();

    // INSERT UPDATED VALUES
    db.collection('delivery_men').doc(""+id).update({
       name: new_name,
       phone: new_phone,
       email : new_email,
       city : new_city
    });

    //Update data table Cell
    $(".name"+cellId).html(""+new_name);
    $(".phone"+cellId).html(""+new_phone);
    $(".email"+cellId).html(""+new_email);
    $(".city"+cellId).html(""+new_city);

    //Update delivery man details
    $('#manInfo').html(new_name+" | "+new_city);
    Annuler('exampleModal');

    $.ajax({
        url: 'https://us-central1-lahcen-gestion.cloudfunctions.net/updateDeliveryManEmail',
        method: 'POST',
        data: {
            id: id,
            email: new_email
        },
        success: function(data){
          console.log('succes: '+data);
        }
      });

      if(new_password != null){

    $.ajax({
        url: 'https://us-central1-lahcen-gestion.cloudfunctions.net/updateDeliveryManPassword',
        method: 'POST',
        data: {
            id: id,
            password: new_password
        },
        success: function(data){
          console.log('succes: '+data);
        }
      });
      }

}


function delete_livreur(id,rowId) {

  // Delete from database
    db.collection('delivery_men').doc(""+id).update({
        isDeleted:1
    });
  
    //Delete row 
    $(".row"+rowId).css('background-color', '#ff000080');
    $(".action"+rowId).html('');
    Annuler('confirmationModal');

    $.ajax({
        url: 'https://us-central1-lahcen-gestion.cloudfunctions.net/deleteDeliveryMan ',
        method: 'POST',
        data: {
            id: id
        },
        success: function(data){
          console.log('succes: '+data);
        }
      });
}

$('#updatePasswordModal').on('show.bs.modal', function(e) {
    var user = firebase.auth().currentUser;
    $('#userEmail').val(user.email);
});
function updatePassword() {
    var user = firebase.auth().currentUser;
    email = user.email;
    password =$('#oldPassword').val();
   
    var credential=firebase.auth.EmailAuthProvider.credential(
        email,
        password
    );

user.reauthenticateWithCredential(credential).then(function() {
   var newPassword =  $('#userPassword').val();
  user.updatePassword(newPassword).catch(function(error) {
     console.log(error);
    });
}).catch(function(error) {
    console.log(error);
});

$('#updatePasswordModal').modal('hide');  
$('#oldPassword').val("");
$('#userPassword').val("");

}
/********* ADD DELIVERY MAN  ********/
function addLivreur(){

    // Get inputs Values
    var new_name= $('#livreurName').val();
    var new_phone= $('#livreurPhone').val();
    var new_email= $('#livreurEmail').val();
    var new_city= document.getElementById("livreurCity").value;
    var new_password= $('#livreurPassword').val();
    
    // Create new user and delivery man 
    $.ajax({
        url: 'https://us-central1-lahcen-gestion.cloudfunctions.net/createDeliveryMan',
        method: 'POST',
        data: {
            name: new_name,
            email: new_email,
            password : new_password,
            city : new_city,
            phone : new_phone
        },
        success: function(){
          console.log('succes' );
        }
      });
    
   
  // Close Modal and reset the inputs
    Annuler('addModal'); 
    $('#livreurName').val("");
    $('#livreurPhone').val("");
    $('#livreurPassword').val("");
    $('#livreurEmail').val("");
    $('#livreurCity').val("");

    $('#all_livreur').DataTable().ajax.reload(null,false);
}
function Annuler(modalId) {
    $('#'+modalId).modal('hide');
}

/********* ADD Payment for a DELIVERY MAN  ********/
function addPayment(livreurId) {

    // Get inputs Values
    var montant =  $('#montant').val();
    var date = $('#datePayment').val();
    db.collection("delivery_men").doc(""+livreurId).get().then(function(doc){
        var data = doc.data();
        if(parseFloat(montant)+ parseFloat(data.totalPaiement) > parseFloat(data.totalOrders)){
            $('#paymentAlertModal').modal('show');
            return;
        }
    else {   
    // Insert new data in database
    let livreurRef = db.collection('paiements');
    livreurRef.doc(""+livreurId).collection('paiementId').add({
            montant: montant,
            date : date
        
    
    });
    //Add row in payment table
    $('#paiementList').append("<tr><td>"+montant+"</td><td>"+date+"</td></tr>");
   var oldMontant = $('#totalPayment').html();
    $('#totalPayment').html(parseFloat(montant)+parseFloat(oldMontant)+" DZD");
}
});
    // Close Modal and reset the inputs
     Annuler('addPaymentModal'); 
     $('#montant').val("");
     $('#datePayment').val("");
}
// Send Data to orderDetails page
function loadDetailsPage(manId) {
    localStorage.setItem("manId",manId);
    window.location.href = 'deliveryManDetails.html';
}