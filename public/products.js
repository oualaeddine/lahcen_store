var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.displayName);
    }
     else window.location = 'login.html'; 
  });

/* Get products List
var cpt=0;
db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
       
        var data = doc.data();
        var mrow = "<tr class='rowNumber"+cpt+"'><td >" + data.name + "</td><td>" + data.price + "</td><td class='buyPrice"+cpt+"'>" + data.buyPrice + "</td><td class='quantity"+cpt+"'>" +
            data.quantity +
            "</td><td> <button class='btn-info btn btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+data.id+" data-cell-id="+cpt+"><i class='fa fa-edit'></i></button>"+
            " <button data-book-id="+data.id+" data-row-id='"+cpt+"' data-toggle='modal' data-target='#confirmationModal' class='btn-danger btn btn-sm'><i class='fa fa-trash'></i></button>" 
 
            "</td></tr>";

        $("#all_prod").append(mrow);
        cpt++;

    });
});
*/
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


