var db = firebase.firestore();

var cpt=0;
// Get Commands List
db.collection("orders").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td> <button  class='btn btn-success'>" + data.status + "</button></td><td>" + data.client + "</td><td>" +
            data.address + "</td><td>" + data.phone + "</td><td>" + data.total_price  + "</td><td class='delPrice"+cpt+"'>" + data.shipping_price +
            "</td><td class='fee"+cpt+"'>" + data.fee + "</td><td>" + data.total_price +
            "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#updateCommandModal' data-book-id="+doc.id+" data-cell-id="+cpt+">Modifier</button></td></tr>";
        console.log(mrow);

        $("#all_tb").append(mrow)
        cpt++;
    });
});

// Update Modal
$('#updateCommandModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var cellId = $(e.relatedTarget).data('cell-id');

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


         $('#saveButtonProduct').attr('onClick', 'upload("'+id+'","'+cellId+'");');
});
});

function upload(id, cellId) {
   
    // GET INPUT VALUES
    var new_delPrice = $('#delPrice').val();
    var new_fee = $('#fee').val();

    // INSERT NEW VALUES
    let setDoc = db.collection('orders').doc(""+id).update({
        shipping_price: new_delPrice,
        fee: new_fee
    });

    //Update data table Cell
    $(".delPrice"+cellId).html(""+new_delPrice);
    $(".fee"+cellId).html(""+new_fee);

    //Close Modal
    $('#updateCommandModal').modal('hide');
}