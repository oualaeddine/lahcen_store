var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        $('#userName').html(user.email);
    }
     else window.location = 'login.html'; 
  });
var statut=["date_pending","date_Delivered","date_Confirmed","date_Assigned","date_NoToBuy","date_NRP1","date_NRP2","date_NRP3","date_Canceled"];

var idOrder = localStorage.getItem("orderId");
getOrderStatu(idOrder);
getDeliveryMenList();
$('#assignButton').attr('onClick', 'assignDeliveryMan("'+idOrder+'");');
$('#productList').attr('class', "productList"+idOrder);
getProductList(idOrder);
getTotalPrice(idOrder);
getOrderDates(idOrder);




function getTotalPrice(idOrder){
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        $('.total').append(data.total_price);
    });
}
function signOut() {
    firebase.auth().signOut();
} 
function getProductList(idOrder) {
    var docRef = db.collection("orders").doc(""+idOrder);
    docRef.get().then(function(doc) {
        var data = doc.data();
        //Get product id
        var prod = data.products
        prod.forEach(function(element) {
            var productId = element.product_id.replace('products/', '');
            
            //Get product name/quantity/price by id
            
            db.collection("products").doc(""+productId+"").get().then(function(doc) {
                var productData = doc.data();

                var row = "<tr><td>"+productData.name+"</td><td>"+element.quantity+"</td><td>"+productData.price+"</td><tr>";
                $('#productList').append(row);
            });
         });
    });
}
function enableBox() {
    $('#assignementBox').attr("disabled",false);
}
function getOrderStatu(idOrder) {
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        //Test status classes
        var statusClass = data.status;
        if(statusClass == "No want to buy") {
            statusClass = "NoToBuy";
        }
        if( (statusClass == "Ne repond pas 1 fois") || (statusClass == "Ne repond pas 2 fois") || (statusClass == "Ne repond pas 3 fois")) {
            statusClass = "Npr";
        }
        var rowS =  "<button  class='btn orderStateButton btn-"+statusClass+"'>"+data.status+"</button>";
        if(data.status == "No want to buy"){
            var row = "No want to buy on : <br> "+data.date_NoToBuy.toDate().toLocaleString().split(',')[0]+" at "+data.date_NoToBuy.toDate().toLocaleTimeString('en-US');
               }
        if(data.status == "Confirmed"  ) {
            var row = " Confirmed on : <br>"+data.date_Confirmed.toDate().toLocaleString().split(',')[0]+" at "+data.date_Confirmed.toDate().toLocaleTimeString('en-US');

        }
        if(data.status == "Canceled"  ) {
            var row = "Canceled on : <br>"+data.date_Canceled.toDate().toLocaleString().split(',')[0]+" at "+data.date_Canceled.toDate().toLocaleTimeString('en-US');
            
        }
        
       if(data.status == "Assigned") {
           var row = "Assigned on : <br>"+data.date_Assigned.toDate().toLocaleString().split(',')[0]+" at "+data.date_Assigned.toDate().toLocaleTimeString('en-US');
                      var manId= data.Assigned_to;
        db.collection("delivery_men").doc(""+manId).get().then(function(doc) {
            var manData = doc.data();
             name = manData.name;
             city = manData.city;
             var rowText = "Assigned to : "+manData.name+" | "+manData.city;
             $('.orderMan').append(rowText);
        });
           
       }
       if(data.status == "Delivered") {
           var row ="Delivered on : <br>"+data.date_Delivered.toDate().toLocaleString().split(',')[0]+" at "+data.date_Delivered.toDate().toLocaleTimeString('en-US');

       }
    


        $('.orderStatut').append(rowS);
        $('.orderDate').append(row);
        $('.orderName').append(data.name);
        $('.clientName').append(data.client);
        $('.clientAddress').append(data.address);
        
    });
}

function getDeliveryMenList() {

      //Get delivery men List
   db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var delivery_men = doc.data();
        if(delivery_men.isDeleted != 1){
        var row= "<option value='"+doc.id+"'>"+delivery_men.name+ "  |  " + delivery_men.city + "</option>";
        $('#assignementBox').append(row);
        }
    });
});
}
function assignDeliveryMan(idOrder){
    var menAssigned = document.getElementById("assignementBox").value;
    
    // Update Order 
   document = db.collection('orders').doc(""+idOrder).update({
        Assigned_to: menAssigned,
        date_Assigned: firebase.firestore.Timestamp.now().toDate(),
        status: "Assigned"
        });
        db.collection("orders").doc(""+idOrder).get().then(function(doc) {
            
            var data = doc.data();
            var assigned_orders = new Array();
            //test if Man has already assigned orders
            db.collection("delivery_men").doc(""+menAssigned).get().then(function(doc) {
                var manData = doc.data();
            if(manData.Assigned_orders != null) {
                assigned_orders= manData.Assigned_orders;
                assigned_orders.push(data.name);
            } else assigned_orders.push(data.name);

            //Update Delivery Man Doc
            db.collection('delivery_men').doc(""+menAssigned).update({
                Assigned_orders: assigned_orders
                });
        });
    });
        $('.orderStateButton').attr('class','btn orderStateButton btn-Assigned');
        $('.orderStateButton').html('Assigned');
        $('.orderDate').html(firebase.firestore.Timestamp.now().toDate());
        db.collection("delivery_men").doc(""+menAssigned).get().then(function(doc) {
            var data = doc.data();
            $('.orderMan').html(data.name+" | "+data.city);
        });
}

function getOrderDates(idOrder){
   
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        var row=null;
        var dates = [];
        statut.forEach(function(e){
            if(data[e] != null){
                dates.push({"status":e,"date":data[e].toDate()});
              //console.log(dates);
             datesSorted = dates.sort(function(a,b){
                var c = new Date(a.date);
                var d = new Date(b.date);
                return d-c;
                });
            }
        });
        datesSorted.forEach(function(e){
        
               switch (e.status) {
                    case "date_Delivered":
                    row = "<li><i class='fa fa-shopping-cart bg-green'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>La commande a été délivrée </h3>"+                                                         
                    "</div</li>";
                    break;
                    case "date_Confirmed":
                        row = "<li><i class='fa fa-shopping-cart bg-purple'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>La commande a été confirmée </h3>"+                                                         
                        "</div</li>";
                        break;
                        case "date_Canceled":
                            row = "<li><i class='fa fa-shopping-cart bg-yellow'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>La commande a été annulée</h3>"+                                                         
                            "</div</li>";
                            break;
                            case "date_NRP1":
                                row = "<li><i class='fa fa-user bg-blue'></i><div class='timeline-item'><span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span>  <h3 class='timeline-header'>Le client n\'as pas repondu 1 fois </h3>"+                                                         
                                "</div</li>";
                                break;
                                case "date_NRP2":
                                    row = "<li><i class='fa fa-user bg-blue'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>Le client n\'as pas repondu 2 fois </h3>"+                                                         
                                    "</div</li>";
                                    break;
                                    case "date_NRP3":
                                        row = "<li><i class='fa fa-user bg-blue'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>Le client n\'as pas repondu 3 fois </h3>"+                                                         
                                        "</div</li>";
                                        break;
                                        case "date_Assigned":
                                                var manId= data.Assigned_to;
                                                console.log(manId);
                                                db.collection("delivery_men").doc(""+manId).get().then(function(doc) {
                                                    var manData = doc.data();
                                                     name = manData.name;
                                                });
                                            row = "<li><i class='fa fa-shopping-cart bg-blue'></i><div class='timeline-item'> <span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span> <h3 class='timeline-header'>La commande a été assignée à <span style='font-weight:bold;'>"+name+"</span></h3>"+                                                         
                                            "</div></li>";
                                               
                                            break;
                                            case "date_NoToBuy":
                                                row =  "<li><i class='fa fa-user bg-red'></i><div class='timeline-item'><span class='time'><i class='fa fa-clock-o'></i> "+e.date.toLocaleString().split(',')[0]+" "+e.date.toLocaleTimeString('en-US')+ "</span>  <h3 class='timeline-header'>Le client ne veut plus acheter </h3>"+                                                         
                                                "</div></li>";
                                                break;
                }
              
                 
            $('#orderTimeLine').append(row);
            });     
        
   
    });

}