var db = firebase.firestore();
product_table = $('#all_products').DataTable({
    "processing": true,
     "responsive":true,
     "serverSide": true,
     searching: false,
     "pageLength": 20,
    "lengthChange": false,
    "ajax": {
        "url": "https://us-central1-lahcen-gestion.cloudfunctions.net/getProducts",
        "method": 'POST',
        "dataSrc": "data"
    }
    });
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.email);
    }
     else window.location = 'login.html'; 
  });


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

function signOut() {
    firebase.auth().signOut();
} 
// Confirmation delete Modal
$('#confirmationModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    
    $('#deleteButton').attr('onClick', 'delete_product("'+id+'");');
  });

// Update Modal
$('#exampleModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');


    var docRef = db.collection("products").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('input[name="product_name"]').val(data.name);
           $(e.currentTarget).find('input[name="product_price"]').val(data.price);
           $(e.currentTarget).find('input[name="buy_price"]').val(data.buyPrice);
           $(e.currentTarget).find('input[name="quantity"]').val(data.quantity);

           $('#saveButtonProduct').attr('onClick', 'upload("'+id+'");');
});
});
function upload(id) {
   
    // GET INPUT VALUES
    var new_quantity = $('#quantity').val();
    var new_buyPrice = $('#buyPrice').val();

    // INSERT NEW VALUES
    let setDoc = db.collection('products').doc(""+id).update({
        quantity: new_quantity,
        buyPrice: new_buyPrice
    });

    $('#all_products').DataTable().ajax.reload(null,false);
    Annuler('exampleModal');

}
function delete_product (id) {
db.collection('products').doc(""+id).update({
    isDeleted:1
});
$('#all_products').DataTable().ajax.reload(null,false);
Annuler('confirmationModal');
}

function Annuler(modalId) {
    $('#'+modalId).modal('hide');
}


