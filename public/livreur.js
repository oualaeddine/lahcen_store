var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.displayName);
    }
     else window.location = 'login.html'; 
  });
// Get Commands List
var cpt=0;
db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        
        var data = doc.data();
        if(data.isDeleted != 1){
        var mrow = "<tr class='row"+cpt+"'><td class='name"+cpt+"'>" + data.name + "</td><td class='phone"+cpt+"'>" + data.phone + "</td><td class='email"+cpt+"'>" + data.email + "</td><td class='address"+cpt+"'>" +
            data.address + "</td><td class='city"+cpt+"'>" + data.city +
            "</td><td> <button class='btn btn-info  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+doc.id+" data-cell-id="+cpt+"><i class='fa fa-edit'></i></button> "+
            " <button class='btn btn-danger btn-sm' data-book-id='"+doc.id+"' data-row-id='"+cpt+"' data-toggle='modal' data-target='#confirmationModal' ><i class='fa fa-trash'></i></button> "+
            "<button class='btn btn-success btn-sm' data-book-id='"+doc.id+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i></button> "+
            "<button class='btn btn-primary btn-sm' onclick=loadDetailsPage('"+doc.id+"') ><i class='fa fa-info'></i></button></td></tr>";
       

        $("#all_livreur").append(mrow)
        cpt++;
        }
    });
    
});
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
           $(e.currentTarget).find('#livreur_address').val(data.address);
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
    var new_address= $('#livreur_address').val();
    var new_city= $('#livreur_city').val();

    // INSERT UPDATED VALUES
    db.collection('delivery_men').doc(""+id).update({
       name: new_name,
       phone: new_phone,
       email : new_email,
       address : new_address,
       city : new_city
    });

    //Update data table Cell
    $(".name"+cellId).html(""+new_name);
    $(".phone"+cellId).html(""+new_phone);
    $(".email"+cellId).html(""+new_email);
    $(".address"+cellId).html(""+new_address);
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

}


function delete_livreur(id,rowId) {

  // Delete from database
    db.collection('delivery_men').doc(""+id).update({
        isDeleted:1
    });

    //Delete row 
    $(".row"+rowId).remove();
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

/********* ADD DELIVERY MAN  ********/
function addLivreur(){

    // Get inputs Values
    var new_name= $('#livreurName').val();
    var new_phone= $('#livreurPhone').val();
    var new_email= $('#livreurEmail').val();
    var new_address= $('#livreurAddress').val();
    var new_city= document.getElementById("livreurCity").value;
    var new_password= $('#livreurPassword').val();
    
    // Insert new Firebase User
    firebase.auth().createUserWithEmailAndPassword(new_email, new_password).then(function(data){
    var userId = data.user.uid;
  
    // Insert new data in database
    let livreurRef = db.collection('delivery_men');
    livreurRef.doc(""+userId).set({
        name: new_name,
        phone: new_phone,
        email : new_email,
        address : new_address,
        city : new_city
     });
   
  // Close Modal and reset the inputs
    Annuler('addModal'); 
    $('#livreurName').val("");
    $('#livreurPhone').val("");
    $('#livreurPassword').val("");
    $('#livreurEmail').val("");
    $('#livreurAddress').val("");
    $('#livreurCity').val("");

    // Append the new row
    var mrow = "<tr><td>" + new_name + "</td><td>" + new_phone + "</td><td>" + new_email + "</td><td>" +
    new_address + "</td><td>" + new_city +
    "</td><td> <button class='btn btn-info  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+userId+" data-cell-id="+cpt+"><i class='fa fa-edit'></i></button> "+
    " <button class='btn btn-danger btn-sm' data-book-id='"+userId+"' data-toggle='modal' data-target='#confirmationModal' ><i class='fa fa-trash'></i></button> "+
    "<button class='btn btn-success btn-sm' data-book-id='"+userId+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i></button> "+
    "<button class='btn btn-primary btn-sm' onclick=loadDetailsPage('"+userId+"') ><i class='fa fa-info'></i></button></td></tr>";

    $("#all_livreur").append(mrow)
   
});
}
function Annuler(modalId) {
    $('#'+modalId).modal('hide');
}

/********* ADD Payment for a DELIVERY MAN  ********/
function addPayment(livreurId) {

    // Get inputs Values
    var montant =  $('#montant').val();
    var date = $('#datePayment').val();

    // Insert new data in database
    let livreurRef = db.collection('paiements');
    livreurRef.doc(""+livreurId).collection('paiementId').add({
            montant: montant,
            date : date
        
    
    });
    //Add row in payment table
    $('#paiementList').append("<tr><td>"+montant+"</td><td>"+date+"</td></tr>");
   var oldMontant = $('#totalPayment').html();
   console.log(oldMontant);
    $('#totalPayment').html(parseFloat(montant)+parseFloat(oldMontant)+" DZD");
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