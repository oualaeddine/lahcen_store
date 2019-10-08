var db = firebase.firestore();

var cpt=0;
// Get Commands List
db.collection("orders").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var data = doc.data();

        //Test status classes
        var statusClass = data.status;
        if(statusClass == "No want to buy") {
            statusClass = "NoToBuy";
        }
        if( (statusClass == "Ne repond pas 1 fois") || (statusClass == "Ne repond pas 2 fois") || (statusClass == "Ne repond pas 3 fois")) {
            statusClass = "Npr";
        }
        var mrow = "<tr><td>" + data.name + "</td><td > <button  class='btn  statut"+cpt+" btn-"+statusClass+"'>" + data.status + "</button></td><td>" + data.client + "</td><td>" +
        data.address + "</td><td>" + data.phone + "</td><td>" + data.total_price  + "</td><td class='delPrice"+cpt+"'>" + data.shipping_price +
        "</td><td class='fee"+cpt+"'>" + data.fee + "</td><td>" + data.total_price +
        "</td><td> <button class='btn-info btn btn-sm' data-toggle='modal' data-target='#updateCommandModal' data-book-id="+doc.id+" data-cell-id="+cpt+">Modifier</button></td>"
        +"<td> <button class='btn btn-warning btn-sm' data-toggle='modal' data-book-id="+doc.id+" data-cell-id="+cpt+" data-target='#statusModal'>Status</button></td>"+
        " <td><button class=' btn btn-primary btn-sm'>Details</button></td></tr>";
      
    
       
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

// Change status Modal
$('#statusModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var cellId = $(e.relatedTarget).data('cell-id');

    $('#changeStatus').attr('onClick', 'uploadStatut("'+id+'","'+cellId+'");');
});

function uploadStatut(id, cellId) {

 var new_statut = document.getElementById("statusForm").value;
 if(new_statut == "Ne repond pas 1 fois") {
     // INSERT NEW VALUES
    db.collection('orders').doc(""+id).update({
        status: new_statut,
        Date_NRP1: firebase.firestore.Timestamp.now().toDate()

        });
    }
    if(new_statut == "Ne repond pas 2 fois") {
        // INSERT NEW VALUES
       db.collection('orders').doc(""+id).update({
           status: new_statut,
           Date_NRP2: firebase.firestore.Timestamp.now().toDate()
   
           });
       }
      else if(new_statut == "Ne repond pas 3 fois") {
        // INSERT NEW VALUES
       db.collection('orders').doc(""+id).update({
           status: new_statut,
           Date_NRP3: firebase.firestore.Timestamp.now().toDate()
   
           });
       }
   else if(new_statut == "No want to buy") {
         // INSERT NEW VALUES
        db.collection('orders').doc(""+id).update({
        status: new_statut,
        Date_NoToBuy: firebase.firestore.Timestamp.now().toDate()

        });
    }
 else {
    // INSERT NEW VALUES
    db.collection('orders').doc(""+id).update({
        status: new_statut,
        ['Date_'+new_statut ]: firebase.firestore.Timestamp.now().toDate()

        });
    }
 //Update data table Cell
 $(".statut"+cellId).html(""+new_statut);
 var statutClass = new_statut;
        if(statutClass == "No want to buy") {
            statutClass = "NoToBuy";
        }
        if( (statutClass == "Ne repond pas 1 fois") || (statutClass == "Ne repond pas 2 fois") || (statutClass == "Ne repond pas 3 fois")) {
            statutClass = "Npr";
        }
 $(".statut"+cellId).attr('class','btn btn-'+statutClass);

 //Close Modal
 $('#statusModal').modal('hide');
}


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