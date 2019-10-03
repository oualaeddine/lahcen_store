var db = firebase.firestore();


// Get products List
db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td>" + data.price + "</td><td>" + data.buyPrice + "</td><td>" +
            data.quantity +
            "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#exampleModal' data-book-id="+data.id+">Modifier</button> <button class='btn-danger btn'>Suprimer</button>" 
 
            "</td></tr>";
        console.log(mrow);

        $("#all_prod").append(mrow)

    });
});

$('#exampleModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("products").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('input[name="product_name"]').val(data.name);
           $(e.currentTarget).find('input[name="product_price"]').val(data.price);
           $(e.currentTarget).find('input[name="buy_price"]').val(data.buyPrice);
           $(e.currentTarget).find('input[name="quantity"]').val(data.quantity);
           $('.modal-footer').append("<button class='btn btn-primary'  data-book-id="+id+" onclick='upload("+id+")'>Save</button>");
    
});
});
function upload(id) {
   
    var new_quantity = $('#quantity').val();
    var new_buyPrice = $('#buyPrice').val();
    let setDoc = db.collection('products').doc(""+id).update({
        quantity: new_quantity,
        buyPrice: new_buyPrice
    });
    $('#exampleModal').modal('hide');

}


