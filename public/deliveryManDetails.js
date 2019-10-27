var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.email);
    }
     else window.location = 'login.html'; 
  });
var manId = localStorage.getItem("manId");
getHistoPaiement(manId);
getHistoCommand(manId);
getManInfo(manId);

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
function getManInfo(manId){
    db.collection("delivery_men").doc(""+manId).get().then(function(doc){
    
            var data = doc.data();
            $('#manInfo').html(data.name+" | "+data.city);
            var buttons = "<button class='btn btn-primary  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+manId+" ><i class='fa fa-edit'></i> Edit</button>"+
            " <button class='btn btn-success btn-sm' data-book-id='"+manId+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i> Add payment</button>";
            $('.manActions').append(buttons);
            var unpaid = parseFloat(data.totalOrders)-parseFloat(data.totalPaiement);
            $('#totalDiff').html(unpaid+" DZD");
            db.collection("delivery_men").doc(""+manId).update({
                totalUnpaid: unpaid
            }); 
        }); 
}
function signOut() {
    firebase.auth().signOut();
} 
function getHistoPaiement(livreurId) {
    var somme = 0;
    db.collection("paiements").doc(""+livreurId).collection("paiementId").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          somme += parseFloat(data.montant);
          var row = "<tr><td>"+data.montant+"</td><td>"+data.date+"</td></tr>";
          $('#paiementList').append(row);
          $('#totalPayment').html(somme+" DZD");
          db.collection("delivery_men").doc(""+livreurId).update({
            totalPaiement: somme
        });  
        });});
   
}


function getHistoCommand(livreurId) {
    var somme = 0;
    var docRef = db.collection("delivery_men").doc(""+livreurId);
docRef.get().then(function(doc) {
    var data = doc.data();
    if(data.Assigned_orders != null){
        data.Assigned_orders.forEach(function(element) {
           db.collection("orders").where("name","==",element).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var orderData = doc.data();
                
                
                    var date = new Date(Date.parse(orderData.date_ordered.toDate()));
                   var row = "<tr><td>"+element+"</td><td>"+orderData.total_price+"</td><td>"+date.toLocaleString()+"</td></tr>";
                  somme += parseFloat(orderData.total_price);
                   $('#orderList').append(row);
                   
                 
                
           
           $('#totalOrders').html(somme+" DZD");
          
        });
        docRef.update({
            totalOrders: somme
        });  
    });
        });
}
        
});

}