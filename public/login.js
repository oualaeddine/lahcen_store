var db = firebase.firestore();
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if(user) {
      window.location = 'index.html'; //After successful login, user will be redirected to home.html
    }
  //  else window.location = 'login.html';
  });
  
function addUser(){

    // Get inputs Values
    var UserName= $('#userName').val();
    var email= $('#userEmail').val();
    var password1= $('#userPassword1').val();
    var password2= $('#userPassword2').val();
  
    if(password2 == password1){
        // Insert new Firebase User
       firebase.auth().createUserWithEmailAndPassword(email, password1).then(function(user)
        {
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName:""+UserName
         });
       
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            if (errorCode == 'auth/weak-password') {
              alert('The password is too weak.');
            } else {
              alert(errorMessage);
            }
            console.log(error);
            // [END_EXCLUDE]
           
           
          });
        
        $('#successModal').modal('show');
        }
    
    else alert("Re tapez le mot de passe svp");

    name= $('#userName').val("");
    email= $('#userEmail').val("");
    password1= $('#userPassword1').val("");
    password2= $('#userPassword2').val("");
}
function signIn(){

    var email = $('#userEmail').val();
    var password = $('#userPassword').val();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    console.log(error);
    if(error == null){
        console.log('error is null', error);
    }
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
   
    // [END_EXCLUDE]
  });
}

