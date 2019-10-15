var db = firebase.firestore();

var manId = localStorage.getItem("manId");
getHistoPaiement(manId);
getHistoCommand(manId);
getManInfo(manId);
//$('#totalDiff').html(parseFloat($('#totalOrders').html())-parseFloat($('#totalPayment').html()));
function getManInfo(manId){
    db.collection("delivery_men").doc(""+manId).get().then(function(doc){
    
            var data = doc.data();
            $('#manInfo').html(data.name+" | "+data.city);
            var buttons = "<button class='btn btn-primary  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+manId+" ><i class='fa fa-edit'></i> Edit</button>"+
            " <button class='btn btn-success btn-sm' data-book-id='"+manId+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i> Add payment</button>";
            $('.manActions').append(buttons);
        }); 
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
        });});
         
}


function getHistoCommand(livreurId) {
    var somme = 0;
    var docRef = db.collection("delivery_men").doc(""+livreurId);
docRef.get().then(function(doc) {
    var data = doc.data();
    if(data.Assigned_orders != null){
        data.Assigned_orders.forEach(function(element) {
           db.collection("orders").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var orderData = doc.data();
                
                if(orderData.name == element){
                    var date = new Date(Date.parse(orderData.date_ordered.toDate()));
                   var row = "<tr><td>"+element+"</td><td>"+orderData.total_price+"</td><td>"+date.toUTCString()+"</td></tr>";
                  somme += parseFloat(orderData.total_price);
                   $('#orderList').append(row);
                   
                 
                
           }
           $('#totalOrders').html(somme+" DZD");
        });
    });
        });
}
});

}