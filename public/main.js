var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.displayName);
    }
     else window.location = 'login.html'; 
  });


var cpt=0;
/* Get Commands List
var first = db.collection("orders")
    .orderBy("date_ordered","desc")
    .limit(10);
first.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
    
       
        var data = doc.data();

        //Test status classes
        var statusClass = data.status;
        if(statusClass == "No want to buy") {
            statusClass = "NoToBuy";
        }
        if( (statusClass == "Ne repond pas 1 fois") || (statusClass == "Ne repond pas 2 fois") || (statusClass == "Ne repond pas 3 fois")) {
            statusClass = "Npr";
        }
        var feeValue=data.fee;
        if (feeValue == null) {
            feeValue=0;
        }
        var mrow = "<tr><td>" + data.name + "</td><td > <button  class='btn  statut"+cpt+" btn-"+statusClass+"'>" + data.status + "</button></td><td>" + data.client + "</td><td>" +
        data.address + "</td><td>" + data.phone + "</td><td>" + data.total_price  + "</td><td class='delPrice"+cpt+"'>" + data.shipping_price +
        "</td><td class='fee"+cpt+"'>" + feeValue + "</td><td>" + data.total_price +
        "</td><td> <button class='btn-primary btn btn-sm' data-toggle='modal' data-target='#updateCommandModal' data-book-id="+doc.id+" data-cell-id="+cpt+"><i class='fa fa-edit'></i></button>"
        +" <button class='btn btn-primary btn-sm' data-toggle='modal' data-book-id="+doc.id+" data-cell-id="+cpt+" data-target='#statusModal'><i class='fa fa-shopping-cart'></i></button>"+
        " <button onclick='loadOrderPage("+doc.id+")'  id='orderLink"+cpt+"' class=' btn btn-primary btn-sm orderLink'  data-rowid="+cpt+" data-id="+doc.id+"><i class='fa fa-info'></i></button></td></tr>";
      
    
       
        $("#all_tb").append(mrow)
        cpt++;
    });
});
*/

function signOut() {
    firebase.auth().signOut();
} 
 
// Update Modal
$('#updateCommandModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("orders").doc(""+id);
    docRef.get().then(function(doc) {
           var data = doc.data();
         
           $(e.currentTarget).find('input[name="client_name"]').val(data.client);
           $(e.currentTarget).find('input[name="client_telephone"]').val(data.phone);
           $(e.currentTarget).find('input[name="client_address"]').val(data.address);
           $(e.currentTarget).find('input[name="subTotal"]').val(data.total_price);
           $(e.currentTarget).find('input[name="livraison"]').val(data.shipping_price);
           $(e.currentTarget).find('input[name="total"]').val(data.total_price);
           $(e.currentTarget).find('input[name="fee"]').val(data.fee);


         $('#saveButtonProduct').attr('onClick', 'upload("'+id+'");');
});
});

// Change status Modal
$('#statusModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("orders").doc(""+id);
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find("#statusForm").val(data.status);
    $('#changeStatus').attr('onClick', 'uploadStatut("'+id+'");');
});
});

// Send Data to orderDetails page
function loadOrderPage(idOrder) {
    localStorage.setItem("orderId",idOrder);
    window.location.href = 'orderDetails.html';
}

function uploadStatut(id) {

 var new_statut = document.getElementById("statusForm").value;
 if(new_statut == "Ne repond pas 1 fois") {
     // INSERT NEW VALUES
    db.collection('orders').doc(""+id).update({
        status: new_statut,
        date_NRP1: firebase.firestore.Timestamp.now().toDate()

        });
    }
    if(new_statut == "Ne repond pas 2 fois") {
        // INSERT NEW VALUES
       db.collection('orders').doc(""+id).update({
           status: new_statut,
           date_NRP2: firebase.firestore.Timestamp.now().toDate()
   
           });
       }
      else if(new_statut == "Ne repond pas 3 fois") {
        // INSERT NEW VALUES
       db.collection('orders').doc(""+id).update({
           status: new_statut,
           date_NRP3: firebase.firestore.Timestamp.now().toDate()
   
           });
       }
   else if(new_statut == "No want to buy") {
         // INSERT NEW VALUES
        db.collection('orders').doc(""+id).update({
        status: new_statut,
        date_NoToBuy: firebase.firestore.Timestamp.now().toDate()

        });
    }
 else {
    // INSERT NEW VALUES
    db.collection('orders').doc(""+id).update({
        status: new_statut,
        ['date_'+new_statut ]: firebase.firestore.Timestamp.now().toDate()

        });
    }

 //Close Modal
 $('#statusModal').modal('hide');
}


function upload(id) {
   
    // GET INPUT VALUES
    var new_delPrice = $('#delPrice').val();
    var new_fee = $('#fee').val();

    // INSERT NEW VALUES
    let setDoc = db.collection('orders').doc(""+id).update({
        shipping_price: new_delPrice,
        fee: new_fee
    });


    //Close Modal
    $('#updateCommandModal').modal('hide');
}