console.log("Hello World")
console.log(localStorage.getItem("userId"));

const localHost = "https://localhost:44361/api/";
let user;
// ----------------------------------------------------------------
let login = document.getElementById("login");
let displayUser = document.getElementById("userName");

if (localStorage.getItem("userId") !== null) {
    showWelcomePage();
} else {
    showLoginPage();
}

//Funktion som visar en specifik sida när man har lyckats logga in
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

//Funktion som visar en errorpage om man misslyckats med inloggningen
function showErrorPage() {
    login.insertAdjacentHTML("afterbegin", "<div>Något gick fel, har du glömt av ditt lösenord?</div><br>");
}

//den första sidan som visas, login.
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

// ----------------------------------------------------


//Hämtar data beroende på vilken endpoint som skickas in.
async function getDataAsync(endpoint) {
    let response = await fetch(localHost + endpoint);
    let data = await response.json()
    return data;
}

//Fetchar alla filmer
let movieButton = document.getElementById("movieButton");
movieButton.addEventListener('click', function showMovies() {
    getDataAsync("film").then(data => buildList(data, movieButton))
        .catch(error => { console.log(error) });
});

//Fetchar alla Studios
let studioButton = document.getElementById("studioButton");
studioButton.addEventListener('click', function showStudios() {
    getDataAsync("filmstudio").then(data => buildList(data, studioButton))
        .catch(error => { console.log(error) });
});

//Fetchar alla Trivias
let triviaButton = document.getElementById("triviaButton");
triviaButton.addEventListener('click', function showTrivias() {
    getDataAsync("filmTrivia").then(data => buildList(data, triviaButton))
        .catch(error => { console.log(error) });
});

//Fetchar alla Rentals
let rentalButton = document.getElementById("rentalButton");
rentalButton.addEventListener('click', function showRentals() {
    getDataAsync("RentedFilm").then(data => buildList(data, rentalButton))
        .catch(error => { console.log(error) });
});



//Bygger content
function buildList(data, button) {
    document.getElementById("rendered-content").innerHTML = "";

    data.forEach(element => {

        let createdDiv = document.createElement("div");
        createdDiv.className = "createdDiv";
        createdDiv.id = element.id;

        if (button == movieButton) {

            renderMovieList(element, createdDiv);
        }
        if (button == studioButton) {
            createdDiv.textContent = element.name;
        }
        if (button == triviaButton) {
            createdDiv.textContent = element.trivia;
        }
        if (button == rentalButton) {

            getRentalsForStudio(element, createdDiv);
        }

        document.getElementById("rendered-content")
            .appendChild(createdDiv);


    });
}

function renderImage() {
    var img = document.createElement('img');
    img.className = "movieImage";
    img.src = 'wwwroot/placeholder.png';
    document.getElementById('rendered-content').appendChild(img);
}
function renderTrivia(element, createdDiv) {
    var renderedTrivia = document.createElement('div');
    renderedTrivia.className = "renderedTrivia";
    renderedTrivia.innerHTML = "<br>- " + element.trivia + "<br>";
    createdDiv.appendChild(renderedTrivia)
}


//Funkar inte när man inte är inloggad
function renderMovieList(movie, createdDiv) {
    let print;
    renderImage();
    user = localStorage.getItem("userId").id;
    if (user != null && movie.stock != 0) {
        console.log(user);
        print = "Namn: " + movie.name + "<br>Antal kopior: " + movie.stock + "<button class='rentButton' onclick='addRental(" + movie.id + "," + user + ")'>rent</button>";
    }
    else {
        console.log(user);
        print = "Namn: " + movie.name + "<br>Antal kopior: " + movie.stock + "<hr>";
    };
    
    getDataAsync("filmTrivia")
    .then(function (json) {
        const trivias = json.filter(a => a.filmId == movie.id)
        trivias.forEach(trivia => {
        renderTrivia(trivia, createdDiv);
    });

    createdDiv.innerHTML=print;

});
};

//TODO: Fixa ReferenceError
function getRentalsForStudio(rentals, createdDiv) {
    fetch(localHost + "filmstudio")
    .then(function (response) {
        return response.json();
    })
        .then(function (user) {
            if (user[localStorage.getItem("userId")].id === rentals.studioId) {
                fetch(localHost + "film")
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (json) {
                        
                        json.forEach(movie => {
                            if (movie.id === rentals.filmId) {
                                let print = movie.name + "<br> <button class='returnButton' id='returnButton' onclick='" + rentals.returned + " = true'>return</button> <hr>";
                                if (rentals.returned == true) {
                                    deleteRental(rentals.id)
                                }
                                createdDiv.innerHTML = print;
                            }
                        });
                    });
                }
            });
        }
        
//POST/DELETE-funktioner

function addRental(element, user) {
    var data = { 
        "filmId": element, 
        "studioId": user 
    };

    var localhost = "https://localhost:44361/api/";
    fetch(localhost + "RentedFilm", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
        .then(data => {
            console.log("Success!!", data)
        })
        .catch((error) => {
            console.log(error)
        });
};

function deleteRental(id) {
    var localhost = "https://localhost:44361/api/";
    console.log("Radera! " + id);
    fetch(localhost + "RentedFilm/" + id, {
        method: "DELETE",
    })
    .then(response => response.json())

}
                            // .then(function (json) {
                            //     console.log(json);
                            //     // let user = json[localStorage.getItem("userId")].id;
                            
                            //     if (user != null && element.stock != 0) {
                            //         console.log(user);
                            //         print = "Namn: " + element.name + "<br>Antal kopior: " + element.stock + "<button class='rentButton' onclick='addRental(" + element.id + "," + user + ")'>rent</button>";
                            //     }
                            //     else {
                            //         print = "Namn: " + element.name + "<br>Antal kopior: " + element.stock + "<hr>";
                            //     }
                            //     fetch(localHost + "Filmtrivia")
                            //         .then(function (response) {
                            //             return response.json();
                            //         })
                            //         .then(function (json) {
                            //             const trivias = json.filter(a => a.filmId == element.id)
                            //             trivias.forEach(trivia => {
                            //                 renderTrivia(trivia, newItem);
                            //             });
                            //         });