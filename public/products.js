var db = firebase.firestore();
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
    var rowId = $(e.relatedTarget).data('row-id');
    $('#deleteButton').attr('onClick', 'delete_product("'+id+'","'+rowId+'");');
  });

// Update Modal
$('#exampleModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var cellId = $(e.relatedTarget).data('cell-id');

    var docRef = db.collection("products").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('input[name="product_name"]').val(data.name);
           $(e.currentTarget).find('input[name="product_price"]').val(data.price);
           $(e.currentTarget).find('input[name="buy_price"]').val(data.buyPrice);
           $(e.currentTarget).find('input[name="quantity"]').val(data.quantity);

           $('#saveButtonProduct').attr('onClick', 'upload("'+id+'","'+cellId+'");');
});
});
function upload(id, cellId) {
   
    // GET INPUT VALUES
    var new_quantity = $('#quantity').val();
    var new_buyPrice = $('#buyPrice').val();

    // INSERT NEW VALUES
    let setDoc = db.collection('products').doc(""+id).update({
        quantity: new_quantity,
        buyPrice: new_buyPrice
    });

    //Update data table Cell
    $(".buyPrice"+cellId).html(""+new_buyPrice);
    $(".quantity"+cellId).html(""+new_quantity);

    Annuler('exampleModal');

}
function delete_product (id, rowId) {
    db.collection('products').doc(""+id).delete();  

     //Delete row 
     $(".rowNumber"+rowId).remove();

    Annuler('confirmationModal');
}

function Annuler(modalId) {
    $('#'+modalId).modal('hide');
}


