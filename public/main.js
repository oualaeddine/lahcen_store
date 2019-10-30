var db = firebase.firestore();
const all_commands_table = $('#all_table').DataTable({
    "processing": true,
      "responsive":true,
    "serverSide": true,
    searching: false,
    "pageLength": 20,
    "lengthChange": false,
    "ajax": {
            "url": "https://us-central1-lahcen-gestion.cloudfunctions.net/getOrders",
            "method": 'POST',
            "dataSrc": "data"
        },
    'columnDefs': [
        {    
            "targets": 1,                  
            "render": function ( data, type) {
                switch(data){
                    case "No want to buy":
                    return  '<button class="btn btn-NoToBuy">'+data+'</button>';
                    break;
                    case "pending":
                    return  '<button class="btn btn-pending">'+data+'</button>';
                    break; 
                    case "Delivered": 
                    return  '<button class="btn btn-Delivered">'+data+'</button>';
                    break;
                    case "Assigned": 
                    return  '<button class="btn btn-Assigned">'+data+'</button>';
                    break;
                    case "Canceled": 
                    return  '<button class="btn btn-Canceled">'+data+'</button>';
                    break;
                    case "Confirmed": 
                    return  '<button class="btn btn-Confirmed">'+data+'</button>';
                    break;
                    case "Ne repond pas 1 fois": 
                    return  '<button class="btn btn-Npr">'+data+'</button>';
                    break;
                    case "Ne repond pas 2 fois": 
                    return  '<button class="btn btn-Npr">'+data+'</button>';
                    break;
                    case "Ne repond pas 3 fois": 
                    return  '<button class="btn btn-Npr">'+data+'</button>';
                    break;
                }
                   
                
                
            }
        }
   ]
       
        });
        
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.email);
    }
     else window.location = 'login.html'; 
  });


var cpt=0;

function signOut() {
    firebase.auth().signOut();
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
// Update Modal
$('#updateCommandModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("orders").doc(""+id);
    docRef.get().then(function(doc) {
           var data = doc.data();
         
           $(e.currentTarget).find('input[name="client_name"]').val(data.client);
           $(e.currentTarget).find('input[name="client_telephone"]').val(data.phone);
           $(e.currentTarget).find('input[name="client_address"]').val(data.address);
           $(e.currentTarget).find('input[name="subTotal"]').val(data.subtotal_price);
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
 switch(new_statut){
    case "Ne repond pas 1 fois":
            db.collection('orders').doc(""+id).update({
                status: new_statut,
                date_NRP1: firebase.firestore.Timestamp.now().toDate()
        
                });
            break;
     case "Ne repond pas 2 fois":
            db.collection('orders').doc(""+id).update({
                status: new_statut,
                date_NRP2: firebase.firestore.Timestamp.now().toDate()
        
                });
        break;
    case "Ne repond pas 3 fois":
         // INSERT NEW VALUES
       db.collection('orders').doc(""+id).update({
        status: new_statut,
        date_NRP3: firebase.firestore.Timestamp.now().toDate()

        });
        break;
    case "No want to buy":
            db.collection('orders').doc(""+id).update({
                status: new_statut,
                date_NoToBuy: firebase.firestore.Timestamp.now().toDate()
        
                });
    break;
    default:
            db.collection('orders').doc(""+id).update({
                status: new_statut,
                ['date_'+new_statut ]: firebase.firestore.Timestamp.now().toDate()
        
                });
 }
 $('#all_table').DataTable().ajax.reload(null,false);
 //Close Modal
 $('#statusModal').modal('hide');
}


function upload(id) {
   
    // GET INPUT VALUES
    var new_delPrice = $('#delPrice').val();
    var new_fee = $('#fee').val();

    // INSERT NEW VALUES
    if(new_fee != null && new_fee != "") {
    let setDoc = db.collection('orders').doc(""+id).update({
        fee: new_fee
    });
    }
    if(new_delPrice != null && new_delPrice != "") {
    let setDoc = db.collection('orders').doc(""+id).update({
        shipping_price: new_delPrice
    });
}
    $('#all_table').DataTable().ajax.reload(null,false);
    //Close Modal
    $('#updateCommandModal').modal('hide');
   
}