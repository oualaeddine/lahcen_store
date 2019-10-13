var db = firebase.firestore();

var manId = localStorage.getItem("manId");
var statut=["date_pending","date_Annuled","date_Delivred","date_Confirmed","date_Assigned","date_NoToBuy","date_NRP1","date_NRP2","date_NRP3"];
getHistoPaiement(manId);
getHistoCommand(manId);
//GET COMMAND HISTO


function getHistoPaiement(livreurId) {
    db.collection("paiements").doc(""+livreurId).collection("paiementId").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          var row = "<tr><td>"+data.montant+"</td><td>"+data.date+"</td></tr>";
          $('#paiementList').append(row);
        });});
         
}


function getHistoCommand(livreurId) {
    var docRef = db.collection("delivery_men").doc(""+livreurId);
docRef.get().then(function(doc) {
    var data = doc.data();
    if(data.Assigned_orders != null){
        data.Assigned_orders.forEach(function(element) {
          var tbodyId=element.replace('#','');
            var box = " <div class='box info-box'><div class='box-header with-border'>"+
                    "<h3 class='box-title'>"+element+"</h3>"+
                    " </div><div class='box-body'><div class='table-responsive'><table class='table no-margin'>"+
                    "<thead <tr> <th>Dates</th></tr></thead>"+
                     "<tbody id="+tbodyId+"> </tbody></table> </div></div></div>";
          $('.orderList').append(box);
           db.collection("orders").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var orderData = doc.data();
                
                if(orderData.name == element){
                    statut.forEach(function(e){
                        if(orderData[e] != null){
                            
                            var row = "<tr><td>"+e+" : </td><td>"+orderData[e].toDate()+"</td></tr>";
                             
                        $('#'+tbodyId).append(row);
                            
                        }
                      
                });
                
           }
        });
    });
        });
}
});
}