var db = firebase.firestore();
firebase.auth().onAuthStateChanged(user => {
    if(user) {
      window.location = 'index.html'; //After successful login, user will be redirected to home.html
    }
  
  });

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