// -----------------firebase config ----------------------
var firebaseConfig = {
  apiKey: "AIzaSyBjlIck1EiCwwSmPmRM_599jio6saG92q4",
  authDomain: "omdb-1d204.firebaseapp.com",
  projectId: "omdb-1d204",
  databaseURL: "https://omdb-1d204-default-rtdb.firebaseio.com",
  storageBucket: "omdb-1d204.appspot.com",
  messagingSenderId: "647555120749",
  appId: "1:647555120749:web:b69906b9ed3dc61db14964",
  measurementId: "G-MH6LKVC44P",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();
// array to store ids of nominees
var nomineesList = [];

let closeModal = document.getElementsByClassName("close")[0];

// onload fetch nomineesList & append resaults, show loading gif
window.onload = function () {
  toggleLoadingComponent("add", "nominee", "nomineeList");
  database.ref("/movies").once("value", (snap) => {
    let res = snap.val();
    if (res) {
      let array = Object.keys(res);

      array.forEach((element) => {
        let id = res[element].id;
        let imgUrl = res[element].imgUrl;
        let title = res[element].title;
        let year = res[element].year;
        nomineesList.push(id);
        document
          .getElementById("nomineeList")
          .append(addNomineeCard(id, title, year, imgUrl));
      });
    }
    toggleLoadingComponent("rm");
  });
};
// search click empty div, fetch data from OMDB & append response , show loading gif,
document.getElementById("search").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById(
    "searchResaults"
  ).innerHTML = `<div class="searchResItem" id="searchResaultstitle">
  <h1 class="sectionTitle" id="searchresTitleText">search resaults</h1>
    </div>`;
  let keyword = document.getElementById("input").value;

  fetch(`https://www.omdbapi.com/?s=${keyword}&apikey=8905552a`)
    .then((res) => {
      toggleLoadingComponent("add", "searchResItem", "searchResaults");

      return res.json();
    })
    .then((data) => {
    if(data.Search){
        setTimeout(() => {
            toggleLoadingComponent("rm");
            addSearchTitle(keyword);
            let resArray = data.Search;
            resArray.forEach((element) => {
              let btnState = nomineesList.includes(element.imdbID);
              let searchResItem = addSearchResaultItem(
                element.imdbID,
                element.Title,
                element.Year,
                element.Poster,
                btnState
              );
              document.getElementById("searchResaults").append(searchResItem);
            });
          }, 1000)
    }else{
        toggleLoadingComponent("rm");
        showModal(`No resaults for "${keyword}"`)
    }
      
    });
});
// click nominate: check if the nominees are less than 5 else show modal, append to nominnes list, push id to nominee array, add nominee to database
document.getElementById("searchResaults").addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.className == "nominate") {
   
    if (nomineesList.length < 5) {
        e.target.disabled = true;
      let id = e.target.dataset.id;
      let card = document.getElementById(id);
      let imgUrl = card.querySelector("img").getAttribute("src");
      let title = card.querySelector(".title").innerText;
      let year = card.querySelector("p").innerText;
      nomineesList.push(id);
      document
        .getElementById("nomineeList")
        .append(addNomineeCard(id, title, year, imgUrl));
      saveNominee(id, title, year, imgUrl);
    } else {
      showModal("You can't nominate more than 5 movies");
    }
  }
});
// click delete : remove from nominnes list, remove id to nominee array, remove nominee from database
document.getElementById("nomineeList").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.className == "delete") {
    let id = e.target.dataset.id;

    let array = document.getElementsByClassName("nominee");
    for (i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        database.ref("/movies/" + id).remove();
        nomineesList = nomineesList.filter((word) => word != array[i].id);
        array[i].remove();
      }
    }
    let btnsOfSearchItems = document.getElementsByClassName("nominate");
    for (j = 0; j < btnsOfSearchItems.length; j++) {
      if (btnsOfSearchItems[j].dataset.id == id) {
        btnsOfSearchItems[j].disabled = false;
      }
    }
  }
});
// close modal click close button
closeModal.onclick = function () {
  let modal = document.getElementById("myModal");
  modal.style.display = "none";
};
// close modal with click on window
window.onclick = function (event) {
  let modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
// function that returns a nominee card
function addNomineeCard(id, title, year, imgUrl) {
  let nomineeCard = document.createElement("div");
  nomineeCard.setAttribute("class", "nominee");
  nomineeCard.setAttribute("id", id);
  nomineeCard.innerHTML = `<div class="cardPoster">
    <img src="${imgUrl}" alt="poster" class="poster">
    </div>
    <div class="cardTitle"><h1 class="title">${title}</h1></div>
    <div class="cardDescription"><p class="descreption">${year}</p></div>
    <div class="cardButton"><button type="submit" class="delete" data-id=${id}>Delete</button></div>`;

  return nomineeCard;
}
// function that returns a search resault item card with the state of the button disabeled or not
function addSearchResaultItem(id, title, year, imgUrl, state) {
  let searchResItem = document.createElement("div");
  searchResItem.setAttribute("class", "searchResItem");
  searchResItem.setAttribute("id", id);
  searchResItem.innerHTML = ` <div class="cardPoster">
    <img src="${
      imgUrl != "N/A" ? imgUrl : "./noimg.jpg"
    }" alt="poster" class="poster">
    </div>
    <div class="cardTitle"><h1 class="title">${
      title ? title : "title unavailable"
    }</h1></div>
    <div class="cardDescription"><p class="descreption">${
      year ? year : "year unavailable"
    }</p></div>
    <div class="cardButton"><button type="submit" class="nominate" data-id=${id} ${
    state ? "disabled" : ""
  }>Nominate</button></div>`;

  return searchResItem;
}
// function that adds the search keyword to search resault title
function addSearchTitle(keyword) {
  document.getElementById(
    "searchresTitleText"
  ).innerText = `search resaults for "${keyword}"`;
}
// function that shows the loading gif
function toggleLoadingComponent(toggle, divClass, apSide) {
  if (toggle == "add") {
    let loadingComponent = document.createElement("div");
    loadingComponent.setAttribute("id", "loadingdiv");
    loadingComponent.setAttribute("class", divClass);
    loadingComponent.innerHTML = `<img src="./loading.gif" alt="loading" id="loading">`;

    document.getElementById(apSide).append(loadingComponent);
  } else {
    document.getElementById("loadingdiv").remove();
  }
}
// function that shows the modal
function showModal(message) {
  let modal = document.getElementById("myModal");
  let alert = document.getElementById("alert");
  modal.style.display = "block";
  alert.innerText = message;
}
// function that saves a nominee to the firebase database
function saveNominee(id, title, year, imgUrl) {
  database.ref("/movies/" + id).set({
    id: id,
    title: title,
    year: year,
    imgUrl: imgUrl,
  });
}
