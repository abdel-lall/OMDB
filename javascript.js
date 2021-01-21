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

let closeModal = document.getElementsByClassName("close")[0];
document.getElementById("search").addEventListener("click", () => {
  console.log("hello");
});
window.onload = function(){
    database.ref("/movies").once("value", (snap) => {
        let res = snap.val();
        if (res) {
          let array = Object.keys(res);
      
          array.forEach((element) => {
            let id = res[element].id;
            let imgUrl = res[element].imgUrl;
            let title = res[element].title;
            let year = res[element].year;
            document
              .getElementById("nomineeList")
              .append(addNomineeCard(id, title, year, imgUrl));
          });
        }
      });
}

document.getElementById("search").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("click");
  let keyword = document.getElementById("input").value;

  fetch(`https://www.omdbapi.com/?s=${keyword}&apikey=8905552a`)
    .then((res) => {
      toggleLoadingComponent("add");

      return res.json();
    })
    .then((data) => {
      setTimeout(() => {
        toggleLoadingComponent("rm");
        addSearchTitle(keyword);
        let resArray = data.Search;
        console.log(resArray);
        resArray.forEach((element) => {
          let searchResItem = addSearchResaultItem(
            element.imdbID,
            element.Title,
            element.Year,
            element.Poster
          );
          document.getElementById("searchResaults").append(searchResItem);
        });
      }, 1000);
    });
});
document.getElementById("searchResaults").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.className == "nominate") {
    let id = e.target.dataset.id;
    let card = document.getElementById(id);
    let imgUrl = card.querySelector("img").getAttribute("src");
    let title = card.querySelector(".title").innerText;
    let year = card.querySelector("p").innerText;
    document
      .getElementById("nomineeList")
      .append(addNomineeCard(id, title, year, imgUrl));
    saveNominee(id, title, year, imgUrl);
  }
});
document.getElementById("nomineeList").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.className == "delete") {
    let id = e.target.dataset.id;

    let array = document.getElementsByClassName("nominee");
    console.log(array.length);
    for (i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        array[i].remove();
        database.ref("/movies/" + id).remove();
      }
    }
  }
});
closeModal.onclick = function () {
  let modal = document.getElementById("myModal");
  modal.style.display = "none";
};
window.onclick = function (event) {
  let modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
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
function addSearchResaultItem(id, title, year, imgUrl) {
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
    <div class="cardButton"><button type="submit" class="nominate" data-id=${id}>Nominate</button></div>`;
  return searchResItem;
}

function addSearchTitle(keyword) {
  document.getElementById(
    "searchresTitleText"
  ).innerText = `search resaults for "${keyword}"`;
}

function toggleLoadingComponent(toggle) {
  let loadingComponent = document.createElement("div");
  loadingComponent.setAttribute("id", "loadingdiv");
  loadingComponent.setAttribute("class", "searchResItem");
  loadingComponent.innerHTML = `<img src="./loading.gif" alt="loading" id="loading">`;

  if (toggle == "add") {
    document.getElementById("searchResaults").append(loadingComponent);
  } else {
    document.getElementById("loadingdiv").remove();
  }
}
function showModal(message) {
  let modal = document.getElementById("myModal");
  let alert = document.getElementById("alert");
  modal.style.display = "block";
  alert.innerText = message;
}

function saveNominee(id, title, year, imgUrl) {
  database.ref("/movies/" + id).set({
    id: id,
    title: title,
    year: year,
    imgUrl: imgUrl,
  });
}
