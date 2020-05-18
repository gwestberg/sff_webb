console.log("Hello World")

const localHost = "https://localhost:44361/api/";


//--------------------------------------------------
let login = document.getElementById("login");
let displayUser = document.getElementById("userName");



if (localStorage.getItem("userId") !== null) {
    showWelcomePage();
} else {
    showLoginPage();
}
//--------------------------------------------------


//Startstidan, login
function showLoginPage() {

    //Töm sidan
    login.innerHTML = "";
    displayUser.innerHTML = "Välkommen";
    document.getElementById("rentalButton").style.visibility = "hidden";

    //Inline-kodning lägger till två inputfält och en logga-in knapp
    login.insertAdjacentHTML("afterbegin", ' Name: <input class="login" id="loginUser" type="text"> Password: <input class="login" id="password" type="password"> <button class="loginbtn" id="loginbtn">Logga In</button>');

    let loginButton = document.getElementById("loginbtn");

    //lyssnar på ett knapptryck och börjar processa informationen som angavs
    loginButton.addEventListener("click", function () {
        let getUser = document.getElementById("loginUser").value;
        let getPass = document.getElementById("password").value;

        getDataAsync("filmstudio")
            .then(function (studios) {
                //jämför de angivna värdena med de som finns lagrade i jsondokumentet
                for (let i = 0; i < studios.length; i++) {
                    if (getUser == studios[i].name && getPass == studios[i].password) {
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

//Inloggningen lyckades inte
function showErrorPage() {
    login.insertAdjacentHTML("afterbegin", "<div>Något gick fel, har du glömt av ditt lösenord?</div><br>");
}

// Inloggning har lyckats
function showWelcomePage() {
    login.innerHTML = "";
    document.getElementById("rentalButton").style.visibility = "visible";



    fetch(localHost + "filmstudio")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {

            const user = json[localStorage.getItem("userId")];
            displayUser.innerHTML = user.name;

        });

    //Inline kodning, lägger till en loggaut-knapp
    login.insertAdjacentHTML("beforeend", "<div><button class='logoutButton' id='logoutButton'>Logga Ut</button></div>");

    var logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        showLoginPage();
    });
}

//----------------------------------------------------


//Hämtning av Data
//Hämtar data beroende på vilken endpoint som skickas in.
async function getDataAsync(endpoint) {
    let response = await fetch(localHost + endpoint);
    let data = await response.json()
    return data;
}
//---------------------------------------------------

//Eventlisteners som lyssnar efter knapptryck

//Fetchar alla Filmer
let movieButton = document.getElementById("movieButton");
movieButton.addEventListener('click', function showMovies() {
    getDataAsync("film")
    .then(data => renderMovieList(data))
    .catch(error => { console.log(error) });
});


//Fetchar alla Rentals
let rentalButton = document.getElementById("rentalButton");
rentalButton.addEventListener('click', function showRentals() {
    getDataAsync("RentedFilm")
    .then(data => renderRentalList(data))
    .catch(error => { console.log(error) });
});


//Fetchar alla Studios
// let studioButton = document.getElementById("studioButton");
// studioButton.addEventListener('click', function showStudios() {
//     getDataAsync("filmstudio")
//         .then(data => console.log(data))
//         .catch(error => { console.log(error) });
// });

//Fetchar alla Trivias
// let triviaButton = document.getElementById("triviaButton");
// triviaButton.addEventListener('click', function showTrivias() {
//     getDataAsync("filmTrivia")
//         .then(data => console.log(data))
//         .catch(error => { console.log(error) });
// });


//------------------------------------------------


//Funktioner som bygger ihop datan

// renderar bilderna till filmerna
function renderImage() {
    var img = document.createElement('img');
    img.className = "movieImage";
    img.src = 'wwwroot/placeholder.png';
    document.getElementById('rendered-content').appendChild(img);
}

//skapar div:arna jag sedan fyller med data
function creatingDiv(element, parentDiv){
    let createdDiv = document.createElement("div");
    createdDiv.className = "createdDiv";
    createdDiv.id = element.id;
    createdDiv.innerHTML = element;

    parentDiv.appendChild(createdDiv);
    return createdDiv;
};

//Ta in ett objekt som innehåller filmid och studioid, samt texten på knappen och "föräldradiven"
function creatingButton(endpoint,id, data , text, parentDiv){
    let buttonDiv = document.createElement("button");
    buttonDiv.className = "buttonDiv";
    buttonDiv.id = id;
    buttonDiv.innerHTML = text;
    
    parentDiv.appendChild(buttonDiv);
    const button =document.getElementById(buttonDiv.id);

    button.addEventListener('click', function(){
        if (data != null) {
            addData(endpoint,data);
        }
        else{
            deleteData(endpoint,id);
        }
    });
};

//Bygger ihop listan på filmer
async function renderMovieList(listOfMovies){
    let contentDiv= document.getElementById("rendered-content");
    contentDiv.innerHTML ="";
    let listOfTrivias = await getDataAsync("filmTrivia");
    let print;

    getDataAsync("filmStudio")
        .then(function (userInStorage) {
           
        const user = userInStorage[localStorage.getItem("userId")];

            for (let i = 0; i < listOfMovies.length; i++) {
                renderImage();
                
                print = "Namn: " + listOfMovies[i].name + "<br>Antal kopior: " + listOfMovies[i].stock + "<hr>";
                if (user !=null) {
                //skicka in endpointen samt filmid:et och användarId:et i ett datapaket
                creatingButton( "Rentedfilm",listOfMovies[i].id, data={ "filmId":listOfMovies[i].id, "studioId":user.id},"rent",creatingDiv(print, contentDiv));
                }
                else{
                    creatingDiv(print, contentDiv);
                };

                for (let j = 0; j < listOfTrivias.length; j++) {
                    
                    if (listOfMovies[i].id == listOfTrivias[j].filmId) {
                        creatingDiv("- "+listOfTrivias[j].trivia, contentDiv);
                    }
                }
            };
        })
};

//Bygger listan med filmer studion har hyrt
async function renderRentalList(listOfRentals){
    let contentDiv= document.getElementById("rendered-content");
    contentDiv.innerHTML ="";

     getDataAsync("filmStudio")
    .then(function (userInStorage) {

        const user = userInStorage[localStorage.getItem("userId")].id;
        listOfRentals.forEach(rental => {
            //Om RentalId:et matchar userId
            if (rental.studioId == user) {
                //hämta listan filmer
                 getDataAsync("film")
                .then(function (listOfMovies) {
                    //leta i listan filmer efter en film som har samma id som rental:en
                    listOfMovies.forEach(movie => {
                        if (movie.id == rental.filmId) {
                            //skicka varje film som mathar id:et till metoden som skriver ut filmen
                            
                            creatingButton("RentedFilm",rental.id,null, "return", creatingDiv(movie.name, contentDiv));
                        }
                    });

                });
            }
        });
    });
};


//--------------------------------------

//Post and Delete Data


//ta in en endpoint och ett färdigbyggt objekt
function addData(endpoint, object){
    console.log(endpoint);
    console.log(object);

    // Gör en fetch med localhost och endpointen
    // Inkludera det objektet(skall vara färdigbyggt)
    var localhost = "https://localhost:44361/api/";
    fetch(localhost + endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(object),
    })
    .then(response => response.json())
    .then(object => {
        console.log("Success!!", object)
    })
    .catch((error) => {
        console.log(error)
    });
};

//endpoint ska innehålla endpointen och id:et
function deleteData(endpoint,id ) {
    console.log(endpoint+id)
    var localhost = "https://localhost:44361/api/";
    console.log("Radera! " + endpoint);
    fetch(localhost + endpoint+"/"+id, {
        method: "DELETE",
    })
    .then(response => response.json());
};

//------------------------

