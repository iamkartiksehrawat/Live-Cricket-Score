'use Strict';

//query selectors

const livelist = document.getElementById('m-list-live');
const recentlist = document.getElementById('m-list-recently-played');
const upcominglist = document.getElementById('m-list-upcoming');
const transbg = document.querySelector('.trans-bg');
const errorbox = document.querySelector('.err-box');
const errorstate = document.querySelector('.err-state');
const filter = document.querySelector('.filters');

//function for handling error
const errorhandler = function (msg) {
  errorstate.textContent = `Sorry,${msg}`;
  errorbox.classList.remove('hidden');
  transbg.classList.remove('hidden');
};

//function for inserting our data inside the html

const showcasedata = function (val, list_name) {
  const info = val.teamInfo;
  let team1 = val.teams[0];
  let team2 = val.teams[1];
  if (info.length >= 2) {
    team1 = info[0].shortname ?? info[0].name;
    team2 = info[1].shortname ?? info[1].name;
  }

  let scorecard1 = ``;
  let scorecard2 = ``;

  const scorecards = val.score;

  //if batting of either team has begun
  if (scorecards.length > 0) {
    const { r: s1, w: w1, o: o1, inning: i1 } = scorecards[0];
    scorecard1 = `${s1}-${w1}(${o1})`;

    //if second team batting has started
    if (scorecards[1]) {
      const { r: s2, w: w2, o: o2 } = scorecards[1];
      scorecard2 = `${s2}-${w2}(${o2})`;
    }

    //the first element maybe of second team
    if (!i1.includes(info[0].name)) {
      [scorecard1, scorecard2] = [scorecard2, scorecard1];
    }
  }

  list_name.innerHTML += `
  <li>
    <div class="card">
      <!-- MATCH SHORT DESCRIPTION -->
      <div class="m-desc">
        <span>${val.name}</span>
      </div>

      <!-- MATCH SCORECARD -->
      <div class="scorecard">
        <div class="teams">
          <span>${team1}</span>
          <span class="scores">${scorecard1}</span>
        </div>
        <div class="teams">
          <span>${team2}</span>
          <span class="scores">${scorecard2}</span>
        </div>
      </div>

      <!-- MATCH STATUS -->
      <div class="m-status">
        <span>${val.status}</span>
      </div>

      <!-- EXTRA DETAILS -->
      <div class="m-details">
        <div class="m-venue">
          <span>Venue: </span>
          <span>${val.venue}</span>
        </div>

        <div class="m-date">
          <span>Date: </span>
          <span>${val.date}</span>
        </div>
       
      </div>
    </div>
  </li>`;
};

//fetching the data from user
const fetchdata = async function () {
  try {
    const data = await fetch(
      'https://api.cricapi.com/v1/currentMatches?apikey=f0338dc9-8f62-4506-b7ec-a78c0d9b42df&offset=0'
    );
    const response = await data.json();
    if (response.status != 'success') {
      throw new Error('failed to fetch data');
    }

    const matcheslist = response.data;

    let livematches = [];
    let upcomingmatches = [];
    let recentmatches = [];

    matcheslist.forEach(function (val) {
      if (val.matchEnded == true || val.status.includes('No result')) {
        recentmatches.push(val);
      } else if (val.matchStarted == true) {
        livematches.push(val);
      } else {
        upcomingmatches.push(val);
      }
    });

    //sorting all 3 arrays if they are not empty
    if (recentmatches.length != 0) {
      recentmatches.sort(function (a, b) {
        const temp = new Date(a.date) - new Date(b.date);
        if (temp < 0) {
          return 1;
        }

        if (temp > 0) {
          return -1;
        }

        return 0;
      });

      //pushing the sorted data inside our HTML
      recentmatches.forEach((val) => showcasedata(val, recentlist));
    } else {
      //if there a no matches for a particular category than show no match is available
      recentlist.innerHTML += `<li class="no-matchval">No matches available</li>`;
    }

    if (livematches.length != 0) {
      livematches.sort(function (a, b) {
        const temp = new Date(a.date) - new Date(b.date);
        if (temp < 0) {
          return 1;
        }

        if (temp > 0) {
          return -1;
        }

        return 0;
      });

      livematches.forEach((val) => showcasedata(val, livelist));
    } else {
      livelist.innerHTML += `<li class="no-matchval">No matches available</li>`;
    }

    if (upcomingmatches.length != 0) {
      upcomingmatches.sort(function (a, b) {
        const temp = new Date(a.date) - new Date(b.date);
        if (temp < 0) {
          return 1;
        }

        if (temp > 0) {
          return -1;
        }

        return 0;
      });

      upcomingmatches.forEach((val) => showcasedata(val, upcominglist));
    } else {
      upcominglist.innerHTML += `<li class="no-matchval">No matches available</li>`;
    }
  } catch (e) {
    errorhandler(e.message);
  }
};

fetchdata();

///////////////////////////////////////////

//IMPLEMENTING SMOOTH SCROLL
filter.addEventListener('click', function () {
  const el = event.target.closest('.m-filter');
  event.preventDefault();
  const temp = el.getAttribute('href');
  document.querySelector(`${temp}`).scrollIntoView({ behavior: 'smooth' });
});
