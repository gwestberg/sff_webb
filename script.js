console.log("Hello World")
console.log(localStorage.getItem("userId"));

let localHost = "https://localhost:44361/api/";

// ----------------------------------------------------------------
var page = document.getElementById("login");
var displayUser = document.getElementById("userName");

if (localStorage.getItem("userId") !== null) {
    showWelcomePage();
} else {
    showLoginPage();
}

//Funktion som visar en specifik sida när man har lyckats logga in
function showWelcomePage() {
    page.innerHTML = "";
    document.getElementById("rentalButton").style.visibility = "visible";

    
    
    fetch(localHost+"filmstudio")
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {
        
        var userName = json[localStorage.getItem("userId", "")].name;
        displayUser.insertAdjacentHTML("afterbegin", "<div class='userName'>"+userName+"</div>");

    });
    
    //Inline kodning, lägger till en loggaut-knapp
    page.insertAdjacentHTML("beforeend", "<div><button class='logoutButton' id='logoutButton'>Logga Ut</button></div>");
    
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
    document.getElementById("rentalButton").style.visibility = "hidden";
    
    //Inline-kodning lägger till två inputfält och en logga-in knapp
    page.insertAdjacentHTML("afterbegin", ' Name: <input class="login" id="user" type="text"> Password: <input class="login" id="password" type="password"> <button id="login-btn">Logga In</button>');
    
    let loginButton = document.getElementById("login-btn");
    
    //lyssnar på ett knapptryck och börjar processa informationen som angavs
    loginButton.addEventListener("click", function () {
        
        var getUser = document.getElementById("user").value;
        var getPass = document.getElementById("password").value;
        

        getDataAsync("filmstudio")
        .then(function (json) {            
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

async function getDataAsync(endpoint){
    let response = await fetch(localHost+endpoint);
    let data = await response.json()
    return data;
}

let movieButton = document.getElementById("movieButton");
movieButton.addEventListener('click', function showMovies(){
    getDataAsync("film").then(data => buildList(data, movieButton))
                    .catch(error =>{console.log(error)}); 
});

//Fetchar alla Studios

let studioButton = document.getElementById("studioButton");
studioButton.addEventListener('click', function showStudios(){
    getDataAsync("filmstudio").then(data => buildList(data, studioButton))
    .catch(error =>{console.log(error)}); 
});


//Fetchar alla Trivias

let triviaButton = document.getElementById("triviaButton");
triviaButton.addEventListener('click', function showTrivias(){
    getDataAsync("filmTrivia").then(data => buildList(data, triviaButton))
    .catch(error =>{console.log(error)}); 
});


//Fetchar alla Rentals

let rentalButton = document.getElementById("rentalButton");
rentalButton.addEventListener('click', function showRentals(){
    let dataToProcess = getDataAsync("RentedFilm");
    let filteredData = filterData(dataToProcess);
    console.log(dataToProcess);

     buildList(filteredData, rentalButton)
    .catch(error =>{console.log(error)}); 
});

function filterData(data){
    let filteredData = data.filterData(data => data.studioId === localStorage.getItem("userId").id)
    return filteredData;
}

function renderImage(){
    var img = document.createElement('img'); 
    img.className ="movieImage";
    img.src =  'wwwroot/placeholder.png'; 
    document.getElementById('rendered-content').appendChild(img); 
}

//Bygger content
function buildList(data, button)
{
    document.getElementById("rendered-content").innerHTML="";

    data.forEach(element => {

        let newItem = document.createElement("div");
        newItem.className = "createdDiv";
        newItem.id = element.id;

        if (button == movieButton) {
            
            renderImage();
            if (localStorage.getItem("userId") !== null) {
                let print =  "Namn: "+element.name +"<br>Antal kopior: " + element.stock +"<button class='rentButton'>rent</button>"+"<hr>";
                newItem.innerHTML=print;
            } else {
                let print =  "Namn: "+element.name +"<br>Antal kopior: " + element.stock +"<hr>";
                newItem.innerHTML=print;
            }
        }
        if (button == studioButton) {
            newItem.textContent = element.name;
        }
        if (button == triviaButton) {
            newItem.textContent = element.trivia;
        }
        if (button == rentalButton) {
            newItem.textContent = element.returned;
        }

         document.getElementById("rendered-content")
            .appendChild(newItem);

        
    });
}
