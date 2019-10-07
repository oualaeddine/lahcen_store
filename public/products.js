var db = firebase.firestore();


// Get products List
var cpt=0;
db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr class='rowNumber"+cpt+"'><td >" + data.name + "</td><td>" + data.price + "</td><td class='buyPrice"+cpt+"'>" + data.buyPrice + "</td><td class='quantity"+cpt+"'>" +
            data.quantity +
            "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#exampleModal' data-book-id="+data.id+" data-cell-id="+cpt+">Modifier</button>"+
            " <button data-book-id="+data.id+" onclick=delete_product('"+data.id+"','rowNumber"+cpt+"') class='btn-danger btn'>Suprimer</button>" 
 
            "</td></tr>";

        $("#all_prod").append(mrow);
        cpt++;

    });
});

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

    $('#exampleModal').modal('hide');

}
function delete_product (id, rowClass) {
    db.collection('products').doc(""+id).delete();  

     //Delete row 
     $("."+rowClass).remove();
}

