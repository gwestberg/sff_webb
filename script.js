console.log("Hello World")

const localHost = "https://localhost:44361/api/";


//--------------------------------------------------
let login = document.getElementById("login");

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
    document.getElementById("adminPanel").style.visibility ="hidden";
    document.getElementById("rentalButton").style.visibility = "hidden";
    document.getElementById("triviaButton").style.visibility = "hidden";
    document.getElementById("studioButton").style.visibility = "visible";



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
                location.reload();
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
    document.getElementById("triviaButton").style.visibility = "visible";
    document.getElementById("studioButton").style.visibility = "hidden";

    fetch(localHost + "filmstudio")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            const user = json[localStorage.getItem("userId")];
            
            //Inline kodning, lägger till en loggaut-knapp
            login.insertAdjacentHTML("beforeend", "<div class='userName'>"+user.name+"</div><button class='logoutButton' id='logoutButton'>Logga Ut</button>");
            
            if (user.name ==="Uddebo") {
                document.getElementById("adminPanel").style.visibility ="visible";
            }

            var logoutButton = document.getElementById("logoutButton");
            
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem("userId");
                showLoginPage();
                location.reload();
            });
        });
};

//----------------------------------------------------


/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
// Stulad från w3schools
function dropDownMenu() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
//-----------------------------------------------


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
movieButton.addEventListener('click', async function showMovies() {
    getDataAsync("film")
    .then(data => renderMovieList(data))
    .catch(error => { console.log(error) });
});


//Fetchar alla Rentals
let viewRentals = document.getElementById("rentalButton");
viewRentals.addEventListener('click', async function showRentals() {
    try {
        const data = await getDataAsync("RentedFilm");
        return await renderRentalList(data);
    }
    catch (error) {
        console.log(error);
    }
    
});

//Fetchar alla Rentals,filmer och studios
let rentalButton = document.getElementById("viewRentals");
rentalButton.addEventListener('click', async function showRentals() {
    let rentals= await getDataAsync("RentedFilm");
    let film= await getDataAsync("film");
    let studios= await getDataAsync("filmStudio");

    renderAllRentals(film, rentals, studios);
});


//Lägger till studio
let studioButton = document.getElementById("studioButton");
studioButton.addEventListener('click', function renderStudioform() {
    addStudio();
});

// lägger till trivia
let triviaButton = document.getElementById("triviaButton");
triviaButton.addEventListener('click', function renderTriviaForm() {
    addTrivia();
});

let userName = document.getElementById("home");
userName.addEventListener('click', function(){
    location.reload();
});

let addMovieToList = document.getElementById("addMovie");
addMovieToList.addEventListener('click', function(){
    addMovie();
});

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
    buttonDiv.className = "submitBtn";
    buttonDiv.id = id;
    buttonDiv.innerHTML = text;
    
    parentDiv.appendChild(buttonDiv);
    const button =document.getElementById(buttonDiv.id);
    var linebreak = document.createElement('br');
    parentDiv.appendChild(linebreak);

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
                // creatingButton( "filmTrivia",listOfMovies[i].id, data={ "filmId":listOfMovies[i].id, "studioId":user.id},"Add Trivia",contentDiv);
                }
                else{
                    creatingDiv(print, contentDiv);
                };

                for (let j = 0; j < listOfTrivias.length; j++) {
                    
                    if (listOfMovies[i].id == listOfTrivias[j].filmId) {
                        creatingDiv("- "+listOfTrivias[j].trivia, contentDiv);
                    }
                }
                var line = document.createElement('hr'); // Giving Horizontal Row After Heading
                contentDiv.appendChild(line);
                var line = document.createElement('br');
                contentDiv.appendChild(line);
            };
        })
}

//Bygger listan med filmer studion har hyrt
function renderRentalList(listOfRentals){
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
                            renderImage();
                            creatingButton("RentedFilm",rental.id,null, "return", creatingDiv(movie.name, contentDiv));
                        }
                    });

                });
            }
        });
    });
}


function renderAllRentals(listofmovies, listofrentals, listofstudios){
    let contentDiv = document.getElementById("rendered-content");

        console.log(listofmovies,listofrentals,listofstudios);
}

//Visar ett "formulär" för att lägga till en Studio
function addStudio(){
let contentDiv = document.getElementById("rendered-content") 
//Töm sidan
contentDiv.innerHTML = "";

var heading = document.createElement('h2'); // Heading of Form
heading.innerHTML = "Create Account";
contentDiv.appendChild(heading);
var line = document.createElement('hr'); // Giving Horizontal Row After Heading
contentDiv.appendChild(line);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

var movieInputLabel = document.createElement('label'); // Create Label for Name Field
movieInputLabel.innerHTML = "Studio Name: "; // Set Field Labels
contentDiv.appendChild(movieInputLabel);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);
var studioInput = document.createElement('input'); // Create Input Field for Name
studioInput.className = "studioName";
studioInput.id = "studioName"
contentDiv.appendChild(studioInput);

var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

var movieInputLabel = document.createElement('label'); // Create Label for Name Field
movieInputLabel.innerHTML = "Password: "; // Set Field Labels
contentDiv.appendChild(movieInputLabel);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);
var studioPasswInput = document.createElement('input'); // Create Input Field for Name
studioPasswInput.type = "password";
studioPasswInput.className = "studioPass";
studioPasswInput.id = "studioPass"
contentDiv.appendChild(studioPasswInput);

var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

var submitStudioBtn = document.createElement('button'); // Append Submit Button
submitStudioBtn.className ="submitBtn";
submitStudioBtn.id ="submitBtn"
submitStudioBtn.innerText ="Submit";
contentDiv.appendChild(submitStudioBtn);

let submitButton = document.getElementById("submitBtn");
//lyssnar på ett knapptryck och börjar processa informationen som angavs
submitButton.addEventListener("click", function () {
    let getUser = document.getElementById("studioName");
    let getPass = document.getElementById("studioPass");

     if (getUser !==null || getPass !== null) {
         data={ "name": getUser.value, "password": getPass.value, "verified": true}
         addData("filmStudio", data);
     }
});

}

//Ett "formulär" för att lägga in en trivia
function addTrivia(){
let contentDiv = document.getElementById("rendered-content") 
//Töm sidan
contentDiv.innerHTML = "";

var heading = document.createElement('h2'); // Heading of Form
heading.innerHTML = "Add a Trivia";
contentDiv.appendChild(heading);
var line = document.createElement('hr'); // Giving Horizontal Row After Heading
contentDiv.appendChild(line);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

var movieInputLabel = document.createElement('label'); // Create Label for Name Field
movieInputLabel.innerHTML = "MovieId: "; // Set Field Labels
contentDiv.appendChild(movieInputLabel);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);
var movieDiv = document.createElement('input'); // Create Input Field for Name
movieDiv.className = "inputField";
movieDiv.id = "movieInput"
contentDiv.appendChild(movieDiv);

var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

var triviaLabel = document.createElement('label'); // Append Textarea
triviaLabel.innerHTML = "Trivia: ";
contentDiv.appendChild(triviaLabel);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);
var triviaDiv = document.createElement('textarea');
triviaDiv.className ="input";
triviaDiv.id ="triviaInput"
contentDiv.appendChild(triviaDiv);

var messagebreak = document.createElement('br');
contentDiv.appendChild(messagebreak);

var submitTriviaBtn = document.createElement('button'); // Append Submit Button
submitTriviaBtn.className ="submitBtn";
submitTriviaBtn.id ="submitBtn"
submitTriviaBtn.innerText ="Submit";
contentDiv.appendChild(submitTriviaBtn);



let submit = document.getElementById("submitBtn");
submit.addEventListener("click", function () {
    let getMovie = document.getElementById("movieInput").value;
    let getTrivia = document.getElementById("triviaInput").value;
    let getMovieId = parseInt(getMovie);

    data={ "filmId": getMovieId, "trivia": getTrivia}
    addData("filmTrivia", data);
});
}

function addMovie(){
    let contentDiv = document.getElementById("rendered-content") 
    //Töm sidan
    contentDiv.innerHTML = "";
    
    var heading = document.createElement('h2'); // Heading of Form
    heading.innerHTML = "Add a Movie";
    contentDiv.appendChild(heading);
    var line = document.createElement('hr'); // Giving Horizontal Row After Heading
    contentDiv.appendChild(line);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    
    var movieInputLabel = document.createElement('label'); // Create Label for Name Field
    movieInputLabel.innerHTML = "Movie Name: "; // Set Field Labels
    contentDiv.appendChild(movieInputLabel);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    var studioInput = document.createElement('input'); // Create Input Field for Name
    studioInput.className = "movieName";
    studioInput.id = "movieName"
    contentDiv.appendChild(studioInput);
    
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    
    var movieInputLabel = document.createElement('label'); // Create Label for Name Field
    movieInputLabel.innerHTML = "Number in stock: "; // Set Field Labels
    contentDiv.appendChild(movieInputLabel);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    var studioPasswInput = document.createElement('input'); // Create Input Field for Name
    studioPasswInput.type = "text";
    studioPasswInput.id = "stock"
    contentDiv.appendChild(studioPasswInput);
    
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    
    var submitStudioBtn = document.createElement('button'); // Append Submit Button
    submitStudioBtn.className ="submitBtn";
    submitStudioBtn.id ="submitBtn"
    submitStudioBtn.innerText ="Submit";
    contentDiv.appendChild(submitStudioBtn);
    
    let submitButton = document.getElementById("submitBtn");
    //lyssnar på ett knapptryck och börjar processa informationen som angavs
    submitButton.addEventListener("click", function () {
        let getMovie = document.getElementById("movieName");
        let getStock = document.getElementById("stock");

        let parsedStock = parseInt(getStock.value);
    
         if (getMovie !==null || getStock !== null) {
             data={ "name": getMovie.value, "stock": parsedStock}
             addData("film", data);
         }
    });
    
}
    

//--------------------------------------

//Post and Delete Data


//ta in en endpoint och ett färdigbyggt objekt
function addData(endpoint, object, ){

    // Gör en fetch med localhost och endpointen
    // Inkludera det objektet(skall vara färdigbyggt)
    const localhost = "https://localhost:44361/api/";
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
    const localhost = "https://localhost:44361/api/";
    fetch(localhost + endpoint+"/"+id, {
        method: "DELETE",
    })
    .then(response => response.json());
    location.reload();
};


function updateData(endpoint, id){
    const localhost = "https://localhost:44361/api/";
    fetch(localhost + endpoint+ "/" + id, {
        method: 'PUT',
        body: JSON.stringify({
         data
        })
      }).then((response) => {
        response.json().then((response) => {
          console.log(response);
        })
      }).catch(err => {
        console.error(err)
      })
}
//------------------------

