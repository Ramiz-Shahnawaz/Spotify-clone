
let currentsong = new Audio();
let songs;
let currfolder;

function secondtominutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remaingseconds = Math.floor(seconds % 60);

    const formattedminutes = String(minutes).padStart(2, "0");
    const formattedseconds = String(remaingseconds).padStart(2, "0");

    return `${formattedminutes}:${formattedseconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img src="svgs/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ").replaceAll("%2C", ",")
                .replaceAll("%5B", "[").replaceAll("%5D", "]")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div>
                         </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "svgs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayalbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.replace(/\/$/, "").split("/").slice(-1)[0];

            let a = await fetch(`/songs/${folder}/info.json`);
            if (!a.ok) {
                continue;
            }

            let response = await a.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
             <div class="play">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                     <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                         stroke-linejoin="round" />
                 </svg>
             </div>
             <img src="/songs/${folder}/cover.jpg" alt="">
             <h2>${response.title}</h2>
             <h4>${response.artist}</h4>
         </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}




async function main() {
    await getsongs("songs/Taylorswift");
    playmusic(songs[0], true)

    displayalbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "svgs/pause.svg";
        }
        else {
            currentsong.pause()
            play.src = "svgs/play.svg";
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondtominutes(currentsong.currentTime)}/${secondtominutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    const prev = document.getElementById("previous");
    const next = document.getElementById("next");

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if (e.target.src.includes("svgs/volume.svg")) {
            e.target.src = e.target.src.replace("svgs/volume.svg", "svgs/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else {
            e.target.src = e.target.src.replace("svgs/mute.svg", "svgs/volume.svg")
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value= 10;
        }
    })

}

main()
