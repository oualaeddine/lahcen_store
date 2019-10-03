var db = firebase.firestore();


//let doc = db.collection('cities').doc('SF');

// Get Commands List
db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td>" + data.phone + "</td><td>" + data.email + "</td><td>" +
            data.address + "</td><td>" + data.city +
            "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#exampleModal' data-book-id="+doc.id+">Modifier</button> "+
            " <button class='btn-danger btn' data-book-id="+doc.id+" onclick='delete_livreur("+doc.id+")'>Suprimer</button></td></tr>";
        console.log(mrow);

        $("#all_livreur").append(mrow)

    });
});

$('#exampleModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).data('book-id');
    var docRef = db.collection("delivery_men").doc(""+id+"");
    docRef.get().then(function(doc) {
           var data = doc.data();
           $(e.currentTarget).find('#livreur_name').val(data.name);
           $(e.currentTarget).find('#livreur_phone').val(data.phone);
           $(e.currentTarget).find('#livreur_email').val(data.email);
           $(e.currentTarget).find('#livreur_address').val(data.address);
           $(e.currentTarget).find('#livreur_city').val(data.city);

           $('.modal-footer').append("<button class='btn btn-primary'  data-book-id="+id+" onclick='upload("+id+")'>Save</button>");
    
});
});
function upload(id) {
   
    var new_name= $('#livreur_name').val();
    var new_phone= $('#livreur_phone').val();
    var new_email= $('#livreur_email').val();
    var new_address= $('#livreur_address').val();
    var new_city= $('#livreur_city').val();
    db.collection('delivery_men').doc(""+id).update({
       name: new_name,
       phone: new_phone,
       email : new_email,
       address : new_address,
       city : new_city
    });
    $('#exampleModal').modal('hide');
}
function delete_livreur(id) {
    db.collection('delivery_men').doc(""+id).delete();
}
