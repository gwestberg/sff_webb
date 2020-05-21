console.log("Hello World")

const localHost = "https://localhost:44361/api/";
const adminPanel = document.getElementById("adminPanel");


//--------------------------------------------------
let login = document.getElementById("login");

if (localStorage.getItem("userId") !== null) {
    showWelcomePage();
} else {
    showLoginPage();
}
//--------------------------------------------------

//start, loginpage
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

//login failed
function showErrorPage() {
    login.insertAdjacentHTML("afterbegin", "<div>Något gick fel, har du glömt av ditt lösenord?</div><br>");
}

// login succeeded
function showWelcomePage() {
    login.innerHTML = "";
    document.getElementById("rentalButton").style.visibility = "visible";
    document.getElementById("triviaButton").style.visibility = "visible";
    document.getElementById("studioButton").style.visibility = "hidden";
    document.getElementById("adminPanel").style.visibility ="hidden";


    fetch(localHost + "filmstudio")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            const user = json[localStorage.getItem("userId")];
            if (user.verified === true) {
                document.getElementById("adminPanel").style.visibility ="visible";
            }
            
            //Inline kodning, lägger till en loggaut-knapp
            login.insertAdjacentHTML("beforeend", "<div class='userName'>"+user.name+"</div><button class='logoutButton' id='logoutButton'>Logga Ut</button>");
            

            var logoutButton = document.getElementById("logoutButton");
            
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem("userId");
                showLoginPage();
                location.reload();
            });
        })
        .then(function(user){
            
        })
};

//----------------------------------------------------


/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
// Stolen from w3schools
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


//fetching data depending on the endpoint.
async function getDataAsync(endpoint) {
    let response = await fetch(localHost + endpoint);
    let data = await response.json()
    return data;
}
//---------------------------------------------------

//Buttons

//Fetch all movies
let movieButton = document.getElementById("movieButton");
movieButton.addEventListener('click', async function showMovies() {
    getDataAsync("film")
    .then(data => renderMovieList(data))
    .catch(error => { console.log(error) });
});

//Fetch all Rentals
let rentalsButton = document.getElementById("rentalButton");
rentalsButton.addEventListener('click', async function showRentals() {
    try {
        const data = await getDataAsync("RentedFilm");
        return await renderRentalList(data);
    }
    catch (error) {
        console.log(error);
    }
    
});

//Admin - view all rentals
let rentalButton = document.getElementById("viewRentals");
rentalButton.addEventListener('click', async function showRentals() {
    let rentals= await getDataAsync("RentedFilm");
    let film= await getDataAsync("film");
    let studios= await getDataAsync("filmStudio");

    renderAllRentals(film, rentals, studios);
});

//add studio
let addStudioButton = document.getElementById("studioButton");
addStudioButton.addEventListener('click', function renderStudioform() {
    addStudio();
});

// add trivia
let addTriviaButton = document.getElementById("triviaButton");
addTriviaButton.addEventListener('click', function renderTriviaForm() {
    addTrivia();
});

//Admin - add Movie
let addMovieButton = document.getElementById("addMovie");
addMovieButton.addEventListener('click', function(){
    addMovie();
});

//Admin - view studios that needs approval
let viewApprovalsBtn = document.getElementById("viewApprovals");
viewApprovalsBtn.addEventListener('click', async function(){
    await getDataAsync("filmStudio")
    .then(response => response.filter(studio => studio.verified == 0))
    .then(studio => approveStudio(studio))
    
    
});

//HomeButton
let startButton = document.getElementById("home");
startButton.addEventListener('click', function(){
    location.reload();
});



//------------------------------------------------


//Functions that builds the data displayed

// images
function renderImage() {
    var img = document.createElement('img');
    img.className = "movieImage";
    img.src = 'wwwroot/placeholder.png';
    document.getElementById('rendered-content').appendChild(img);
}

//creating divs
function creatingDiv(element, parentDiv){
    let createdDiv = document.createElement("div");
    createdDiv.className = "createdDiv";
    // createdDiv.id = element.id;
    createdDiv.innerHTML = element;

    parentDiv.appendChild(createdDiv);
    return createdDiv;
};

//creating labels and inputFields
function createLabelandInput(contentDiv,labelText,elementtype,elementId) {
    var InputLabel = document.createElement('label'); // Create Label for Name Field
    InputLabel.innerHTML = labelText; // Set Field Labels
    contentDiv.appendChild(InputLabel);
    var linebreak = document.createElement('br');
    contentDiv.appendChild(linebreak);
    var inputField = document.createElement(elementtype); // Create Input Field for Name
    inputField.className = elementId;
    inputField.id = elementId;
    contentDiv.appendChild(inputField);
    return inputField;
};

//creating a button with some functionality. Needs alot of refactoring :/
function creatingButton(typeOfAction, endpoint, id, data, text, parentDiv){
    let buttonDiv = document.createElement("button");
    buttonDiv.className = "submitBtn";
    buttonDiv.id = id;
    buttonDiv.innerHTML = text;
    
    parentDiv.appendChild(buttonDiv);
    const button =document.getElementById(buttonDiv.id);
    var linebreak = document.createElement('br');
    parentDiv.appendChild(linebreak);

    button.addEventListener('click', function(){
        if (typeOfAction==="add") {
            addData(endpoint, data);
        }

        if(typeOfAction==="update"){
            updateData(endpoint, id, data);
        }

        if(typeOfAction==="delete"){
            deleteData(endpoint, id);
        }
    });
};

// TODO: Needs refactoring, stage 1
//Builds the list of movies to display
async function renderMovieList(listOfMovies){
    let contentDiv= document.getElementById("rendered-content");
    contentDiv.innerHTML ="";
    let listOfTrivias = await getDataAsync("filmTrivia")
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
                var line = document.createElement('hr'); // Giving Horizontal Row After Heading
                contentDiv.appendChild(line);
                var line = document.createElement('br');
                contentDiv.appendChild(line);
            };
        })
}

// TODO: Needs refactoring, stage 1
//Builds the list of rentals for the logged in studio
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
                            creatingButton("add","RentedFilm",rental.id,null, "return", creatingDiv(movie.name, contentDiv));
                        }
                    });

                });
            }
        });
    });
}

//Builds the list that show all the rentals for all the studios
function renderAllRentals(listofmovies, listofrentals, listofstudios){
    let contentDiv = document.getElementById("rendered-content");
    contentDiv.innerHTML="";

    listofstudios.forEach(studio => {
        let print= studio.name;
        let studioDiv= creatingDiv(print, contentDiv);
        studioDiv.className= "studioDiv";

        for (let i = 0; i < listofrentals.length; i++) {

            if (listofrentals[i].studioId === studio.id) {
                listofmovies.forEach(movie => {

                    if (movie.id === listofrentals[i].filmId) {
                        creatingDiv(movie.name, contentDiv);
                    }
                });
            }            
        }
        var line = document.createElement('hr'); // Giving Horizontal Row After Heading
        contentDiv.appendChild(line);
    });
}

// TODO: Needs refactoring, stage 2
//Adding a studio
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

createLabelandInput(contentDiv, "Studio Name: ",'input' ,"studioName");

var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);


var studioPasswInput= createLabelandInput(contentDiv, "Password: ", 'input',"studioPw");
studioPasswInput.type="password"

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
         data={ "name": getUser.value, "password": getPass.value, "verified": false}
         addData("filmStudio", data);
     }
});

}

// TODO: Needs refactoring, stage 1
//Adding a Trivia 
function addTrivia(){
let contentDiv = document.getElementById("rendered-content") 
//Töm sidan
contentDiv.innerHTML = "";

var heading = document.createElement('h2');
heading.innerHTML = "Add a Trivia";
contentDiv.appendChild(heading);
var line = document.createElement('hr');
contentDiv.appendChild(line);
var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

createLabelandInput(contentDiv, "MovieId: ", 'input', "movieInput");


var linebreak = document.createElement('br');
contentDiv.appendChild(linebreak);

createLabelandInput(contentDiv, "Trivia: ", 'textarea', "triviaInput");

var submitTriviaBtn = document.createElement('button');
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

// TODO: Needs refactoring, stage 1
//Adding a Movie
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


//Approve Studios
function approveStudio(studiosToApprove){
    let contentDiv = document.getElementById("rendered-content");
    contentDiv.innerHTML="";
    
    studiosToApprove.forEach(studio => {
        let print= studio.name;
        let studioDiv= creatingDiv(print, contentDiv);
        studioDiv.className= "studioDiv";

        let data = {
            "id": studio.id,
            "name": studio.name,
            "password": studio.password,
            "verified": true
        }

        creatingButton("update", "Filmstudio",studio.id, data , "approveStudio", studioDiv)
    })
}

//--------------------------------------

//Post and Delete Data


//Take and enpoint and an object and adding it
function addData(endpoint, object, ){

    // Gör en fetch med localhost och endpointen
    // Inkludera det objektet(skall vara färdigbyggt)
    fetch(localHost + endpoint, {
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

//Take an endpoint and an id.
function deleteData(endpoint,id ) {
    fetch(localHost + endpoint+"/"+id, {
        method: "DELETE",
    })
    .then(response => response.json());
    location.reload();
};


function updateData(endpoint,id, data){
    console.log(data)
    fetch(localHost + endpoint+ "/" + id, {
        method: 'PUT',
        body: JSON.stringify(data),
        })
        .then((response) => {response.json()
        .then((response) => {console.log(response)
        })
      }).catch(err => {
        console.error(err)
      })
}
//------------------------

