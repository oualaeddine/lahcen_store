var db = firebase.firestore();

// Get Commands List
var cpt=0;
db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr class='name"+cpt+"'><td ><span class='name"+cpt+"'>" + data.name + "</span></td><td><span class='changePhone'>" + data.phone + "</span></td><td>" + data.email + "</td><td>" +
            data.address + "</td><td>" + data.city +
            "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#exampleModal' data-book-id="+doc.id+">Modifier</button> "+
            " <button class='btn-danger btn' data-book-id='"+doc.id+"' onclick=delete_livreur('"+doc.id+"','name"+cpt+"')>Suprimer</button></td></tr>";
        console.log(mrow);

        $("#all_livreur").append(mrow)
        cpt++;
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

          $('#saveButton').attr('onClick', 'upload("'+id+'");');
         
});
});

function upload(id) {
   
    //GET NEW VALUES
    var new_name= $('#livreur_name').val();
    var new_phone= $('#livreur_phone').val();
    var new_email= $('#livreur_email').val();
    var new_address= $('#livreur_address').val();
    var new_city= $('#livreur_city').val();

    // INSERT UPDATED VALUES
    db.collection('delivery_men').doc(""+id).update({
       name: new_name,
       phone: new_phone,
       email : new_email,
       address : new_address,
       city : new_city
    });

    $('#exampleModal').modal('hide');

    //Update data table Cell
    $(".name"+cpt+"").html(new_name); 
    var UpdateName = $(".name"+cpt+"").parent('td');
    livreur_table.cell( UpdateName ).data(UpdateName.html()).draw();
   

    /*Phone
     $(".changePhone").html(new_phone); 
     var UpdatePhone = $(".changePhone").parent('td');
    livreur_table.cell( UpdatePhone ).data( UpdatePhone.html()).draw();
   */
}


function delete_livreur(id,rowClass) {
  // db.collection('delivery_men').doc(""+id).delete();

  admin.auth().deleteUser(id)
  .then(function() {
    console.log('Successfully deleted user');
  })
  .catch(function(error) {
    console.log('Error deleting user:', error);
  });

    //Delete row 
    $("."+rowClass).remove();
}

/********* ADD DELIVERY MAN  ********/
function addLivreur(){

    // Get inputs Values
    var new_name= $('#livreurName').val();
    var new_phone= $('#livreurPhone').val();
    var new_email= $('#livreurEmail').val();
    var new_address= $('#livreurAddress').val();
    var new_city= $('#livreurCity').val();
    var new_password= $('#livreurPassword').val();

    // Insert new Firebase User
    firebase.auth().createUserWithEmailAndPassword(new_email, new_password).then(function(data){
    var userId = data.user.uid;
  
    // Insert new data in database
    let livreurRef = db.collection('delivery_men');
    livreurRef.doc(""+userId).set({
        name: new_name,
        phone: new_phone,
        email : new_email,
        address : new_address,
        city : new_city
     });
   
  // Close Modal and reset the inputs
    $('#addModal').modal('hide'); 
    $('#livreurName').val("");
    $('#livreurPhone').val("");
    $('#livreurPassword').val("");
    $('#livreurEmail').val("");
    $('#livreurAddress').val("");
    $('#livreurCity').val("");

    // Append the new row
    var mrow = "<tr><td>" + new_name + "</td><td>" + new_phone + "</td><td>" + new_email + "</td><td>" +
    new_address + "</td><td>" + new_city +
    "</td><td> <button class='btn-info btn' data-toggle='modal' data-target='#exampleModal' data-book-id="+userId+">Modifier</button> "+
    " <button class='btn-danger btn' data-book-id="+userId+" onclick='delete_livreur('"+userId+"')'>Suprimer</button></td></tr>";

    $("#all_livreur").append(mrow)
   
});
}
function Annuler() {
    $('#addModal').modal('hide');
}

