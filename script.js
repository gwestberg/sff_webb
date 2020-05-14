console.log("Hello World")
console.log(localStorage.getItem("userId"));

let localHost = "https://localhost:44361/api/";

// ----------------------------------------------------------------
var page = document.getElementById("login");

if (localStorage.getItem("userId") !== null) {
    showWelcomePage();
} else {
    showLoginPage();
}

//Funktion som visar en specifik sida när man har lyckats logga in
function showWelcomePage() {
    page.innerHTML = "";
    document.getElementById("rentalButton").style.visibility = "visible";
    
    var print = "Hej och Välkommen "
    
    getStudiosAsync()
    .then(function (json) {
        
        print = print + json[localStorage.getItem("userId", "")].name;
        page.insertAdjacentHTML("afterbegin", print);
    });
    
    //Inline kodning, lägger till en loggaut-knapp
    page.insertAdjacentHTML("beforeend", "<div><button id='logoutButton'>Logga Ut</button></div>");
    
    var logoutButton = document.getElementById("logoutButton");
    
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        showLoginPage();
    });    
}

//Funktion som visar en errorpage om man misslyckats med inloggningen
function showErrorPage() {
    page.insertAdjacentHTML("afterbegin", "<div>Något gick fel, har du glömt av ditt lösenord?</div><br>");
}

//den första sidan som visas, login.
function showLoginPage() {
    
    //Töm sidan
    page.innerHTML = "";
    
    //Inline-kodning lägger till två inputfält och en logga-in knapp
    page.insertAdjacentHTML("afterbegin", ' name: <input id="user" type="text"> password: <input id="password" type="password"> <button id="login-btn">Logga In</button>');
    
    let loginButton = document.getElementById("login-btn");
    //document.getElementById("rentalButton").style.visibility = "hidden";
    
    //lyssnar på ett knapptryck och börjar processa informationen som angavs
    loginButton.addEventListener("click", function () {
        
        var getUser = document.getElementById("user").value;
        var getPass = document.getElementById("password").value;
        
        getStudiosAsync()
        .then(function (json) {
            console.log(json);
            
            // jämför de angivna värdena med de som finns lagrade i jsondokumentet
            for (let i = 0; i < json.length; i++) {
                if (getUser == json[i].name && getPass == json[i].password) {
                    console.log("Login Success!!")
                    
                    //sparar id:et (i det här fallet indexplatsen) i vårat localstorage
                    localStorage.setItem("userId", i)
                }
            }
            
            //om inloggningen lyckades så visas välkomstsidan annars errorsidan
            if (localStorage.getItem("userId") !== null) {
                showWelcomePage();
                
            } else {
                showErrorPage();
            }
            
        });
        
        
        
        
    });
}

// ----------------------------------------------------


//Fetchar alla filmer och console.log:ar dom


let movieButton = document.getElementById("movieButton");
movieButton.addEventListener('click', function showMovies(){
    getMoviesAsync()
    .then(data => console.log(data))
    .then(data => buildList(data))
                    .catch(error =>{console.log(error)}); 
});

async function getMoviesAsync() 
{
  let response = await fetch(localHost+"film");
  let data = await response.json()
  return data;
}

//Fetchar alla Studios

let studioButton = document.getElementById("studioButton");
studioButton.addEventListener('click', function showStudios(){
    getStudiosAsync().then(data => buildList(data, studioButton))
                    .catch(error =>{console.log(error)}); 
});

async function getStudiosAsync() 
{
  let response = await fetch(localHost+"filmstudio");
  let data = await response.json()
  return data;
}

//Fetchar alla Trivias

let triviaButton = document.getElementById("triviaButton");
triviaButton.addEventListener('click', function showTrivias(){
    getTriviasAsync().then(data => buildList(data, triviaButton))
                    .catch(error =>{console.log(error)}); 
});

async function getTriviasAsync() 
{
  let response = await fetch(localHost+"filmTrivia");
  let data = await response.json()
  return data;
}

//Fetchar alla Rentals

let rentalButton = document.getElementById("rentalButton");
rentalButton.addEventListener('click', function showRentals(){
    getRentalsAsync()
    .then(data => buildList(data, rentalButton))
                    .catch(error =>{console.log(error)}); 
});

async function getRentalsAsync() 
{
  let response = await fetch(localHost+"RentedFilm");
  let data = await response.json()
  return data;
}


//Bygger listan med objekt, beroende på vilken knapp som tryckts på byggs datan på olika sätt.
 function buildList(data)
{
    document.getElementById("content").innerHTML="";
    if (data == undefined) {
        console.log(data)
    }

     data.forEach(element => {

        let newItem = document.createElement("div");
        newItem.className = "createdDiv";
        newItem.id = element.id;
        newItem.textContent = element.name;
        
        // switch (button) {
        //     case movieButton:
        //         newItem.textContent = element.name +" "+ element.stock;
        //         break;
        
        //     default:
        //         break;
        // }
        // if (button == movieButton) {
        // }
        // if (button == studioButton) {
        //     newItem.textContent = element.name;
        // }
        // if (button == triviaButton) {
        //     newItem.textContent = element.trivia;
        // }
        // if (button == rentalButton) {
        //     newItem.textContent = element.returned;
        // }

        let insiderDiv = document.getElementById("content");
        insiderDiv.appendChild(newItem);
        
    });
}