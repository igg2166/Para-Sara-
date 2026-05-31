// ─────────────────────────────────────────────
// ❤️ CORAZONES CAYENDO (Canvas)
// ─────────────────────────────────────────────
const canvas = document.getElementById("heartsCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function drawHeart(x, y, size, opacity, color) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

const heartColors = ["#ff77c8","#ff4da6","#ff99d6","#c77dff","#ff6b9d","#ffb3d9"];
const hearts = Array.from({ length: 30 }, () => createHeart(true));

function createHeart(randomY = false) {
    const size = Math.random() * 18 + 8;
    return {
        x: Math.random() * window.innerWidth,
        y: randomY ? Math.random() * -window.innerHeight : -size * 2,
        size,
        speed: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.45 + 0.1,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        drift: (Math.random() - 0.5) * 0.5,
        driftAngle: Math.random() * Math.PI * 2,
        wobble: Math.random() * 0.02 + 0.005,
    };
}

function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach((h, i) => {
        h.driftAngle += h.wobble;
        h.x += Math.sin(h.driftAngle) * h.drift;
        h.y += h.speed;
        drawHeart(h.x, h.y, h.size, h.opacity, h.color);
        if (h.y > canvas.height + h.size * 2) {
            hearts[i] = createHeart(false);
            hearts[i].x = Math.random() * canvas.width;
        }
    });
    requestAnimationFrame(animateHearts);
}
animateHearts();

// ─────────────────────────────────────────────
// 🎵 REPRODUCTOR GLOBAL
// ─────────────────────────────────────────────
const player = {
    audio: new Audio(),
    current: null,       // índice de la canción activa (null = cancion de bienvenida)
    isWelcome: false,    // ¿está sonando la canción de bienvenida?
    playing: false,

    // Detiene todo y limpia estado
    stopAll() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this.current = null;
        this.isWelcome = false;
        updatePlayerUI(null, false);
    },

    // Reproduce la canción de bienvenida
    playWelcome() {
        this.audio.pause();
        this.audio.src = "musica/amor_completo.mp3";
        this.audio.loop = true;
        this.audio.volume = 0;
        this.current = null;
        this.isWelcome = true;
        this.playing = true;

        this.audio.play().catch(() => {});

        // Fade in suave
        let vol = 0;
        const iv = setInterval(() => {
            if (vol < 0.5) {
                vol = Math.min(vol + 0.02, 0.5);
                this.audio.volume = vol;
            } else clearInterval(iv);
        }, 150);

        updatePlayerUI({
            title: "Amor Completo",
            artist: "Mon Laferte",
            image: "img/amor_completo.jpg"
        }, true);
    },

    // Reproduce una canción del array songs por índice
    playSong(index) {
        const song = songs[index];
        this.audio.pause();
        this.audio.src = `musica/${song.file}`;
        this.audio.loop = false;
        this.audio.volume = 0.8;
        this.current = index;
        this.isWelcome = false;
        this.playing = true;

        this.audio.play().catch(() => {});
        updatePlayerUI(song, true);

        // Al terminar, limpiar UI
        this.audio.onended = () => {
            this.playing = false;
            updatePlayerUI(song, false);
        };
    },

    togglePause() {
        if (this.playing) {
            this.audio.pause();
            this.playing = false;
        } else {
            this.audio.play().catch(() => {});
            this.playing = true;
        }
        const btn = document.getElementById("playerPlayBtn");
        if (btn) btn.textContent = this.playing ? "⏸" : "▶";
    }
};

// ─────────────────────────────────────────────
// 🖥 UI DEL REPRODUCTOR (barra inferior)
// ─────────────────────────────────────────────
function updatePlayerUI(song, isPlaying) {
    const bar = document.getElementById("musicPlayer");
    const title = document.getElementById("playerTitle");
    const artist = document.getElementById("playerArtist");
    const btn = document.getElementById("playerPlayBtn");
    const img = document.getElementById("playerImg");

    if (!song) {
        bar.classList.remove("player-visible");
        return;
    }

    title.textContent = song.title;
    artist.textContent = song.artist || "";
    btn.textContent = isPlaying ? "⏸" : "▶";

    if (song.image) {
        img.src = song.image;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    bar.classList.add("player-visible");
}

// Barra de progreso en tiempo real
setInterval(() => {
    const bar = document.getElementById("progressFill");
    const timeEl = document.getElementById("playerTime");
    if (!bar || !player.audio.duration) return;

    const pct = (player.audio.currentTime / player.audio.duration) * 100;
    bar.style.width = pct + "%";

    const fmt = s => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };
    timeEl.textContent = `${fmt(player.audio.currentTime)} / ${fmt(player.audio.duration)}`;
}, 500);

// Click en la barra de progreso para saltar
document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.addEventListener("click", (e) => {
            if (!player.audio.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            player.audio.currentTime = pct * player.audio.duration;
        });
    }
});

// ─────────────────────────────────────────────
// 🎉 BOTÓN ENTRAR
// ─────────────────────────────────────────────
const boton = document.getElementById("startBtn");

boton.addEventListener("click", () => {
    player.playWelcome();

    Swal.fire({
        title: "Bienvenida Sara ❤️",
        text: "Esto es una pequeña muestra del cariño que te tengo",
        icon: "success",
        background: "#1b1b24",
        color: "#fff",
        confirmButtonColor: "#7b5cff"
    });
});

// ─────────────────────────────────────────────
// ✍️ CARTA ANIMADA (Typed.js)
// ─────────────────────────────────────────────
var typed = new Typed('#typed-text', {
    strings: [
        `Me pongo a pensar y nunca debimos conocernos. O sea, ponte a pensar en las probabilidades: tomando en cuenta la distancia y los medios para socializar, era casi imposible que esto sucediera. Que esto haya pasado y siga funcionando es un milagro del que debemos estar orgullosos.

Continuando, me hace tan feliz que estés en mi vida. Iluminas mis días. Me encanta cuando me hablas de tus sueños y ambiciones, de cómo te va en tus turnos en el veterinario, cómo te va cuando sales con tus amigos o cuando cuidas a Liam. También cuando me enseñas nueva música o hacemos videollamada mientras estoy comiendo y tú te maquillas.

Incluso el simple hecho de ver tu linda cara, que me digas lo mucho que te gusto y que yo te diga lo mucho que me gustas… Te has vuelto una de las mejores cosas de mi vida. Te adoro.

No sabes cuánto deseo visitarte, besarte, abrazarte, dormir contigo, salir contigo y hablar contigo frente a frente. Estoy muy enamorado de ti. Me hechizaste; estoy completamente rendido a tus pies. La verdad, creo que estas palabras se quedan cortas para expresar todo lo que me haces sentir.

Para finalizar, gracias por existir, gracias por ser mi prenovia y gracias por aceptarme tal como soy. A cambio, yo te acepto y amo tal como eres. No necesito que cambies por mí; eres perfecta así como estás.
`
    ],
    typeSpeed: 40,
    backSpeed: 0,
    showCursor: true
});

// ─────────────────────────────────────────────
// 🎵 CANCIONES — agrega el campo "file" con el nombre exacto del mp3
// ─────────────────────────────────────────────
const songs = [
    {
        title: "La Distancia",
        artist: "Laura Itandehui",
        image: "img/ladistancia.jpg",
        file: "La Distancia.mp3",
        message: "Recuerdo que dijiste que cuando escuchas esta cancion piensas en mi. Me pasa, mas porque siento esta cancion resume muy bien nuestra relacion. Podemos estar muy lejos uno del otro pero eso no significa que el cariño y la paciencia nos haga llegar lejos.",
    },
    {
        title: "Labios Rotos",
        artist: "Zoe",
        image: "img/labiosrotos.jpg",
        file: "Labios Rotos.mp3",
        message: "Tu me dedicaste esta, la verdad obviamente ya la habia escuchado antes pero no le habia dado el valor que tu me hiciste ternele, literalmente ahora no la puedo escuchar sin pensar en nuestra relacion y eso me llena.",
    },
    {
        title: "Fantasy",
        artist: "Charly Garcia",
        image: "img/fantasy.jpg",
        file: "Fantasy.mp3",
        message: "Aqui no se que tanto me voy a extender, simplente creo que esta cancion es una manifestacion de lo que siento de lo nuestro, se siente como una hermosa fantasia, pero que es tangible y real; es un sentimiento nuevo para mi y me encanta.",
    },
    {
        title: "Como un Burro Amarrado",
        artist: "EL Ultimo de la Fila",
        image: "img/burro.jpg",
        file: "Como un Burro Amarrado.mp3",
        message: "Esta cancion creo yo que lo inicio todo, lo recuerdo, yo la monte a mi estado, tu reaccionaste a ella y ahi empezamos a hablar de musica, la musica para mi es lo que mas nos une y con este tema empezo.",
    },
    {
        title: "Termonuclear",
        artist: "Perfecto Miserable",
        image: "img/termonuclear.jpg",
        file: "Termonuclar.mp3",
        message: "Con esta cancion no sabes lo muy querido que me senti y me puso a pensar, que haria por ti, lo que haria por verte, por abrazarte, besarte y me di cuenta que lo daria todo en mis capacidades, porque eres alguien demasiado especial, no sabes como deseo que esto funcione y pueda seguir dandolo todo por ti.",
    },
    {
        title: "Yo no Necesito de Mucho",
        artist: "Laura Itandehui",
        image: "img/yononecesitodemucho.jpg",
        file: "Yo no Necesito de Mucho.mp3",
        message: "Esta cancion, con esta cancion me abriste a un mundo nuevo, no solia escuchar mucho este tipo de musica y me encanto descubrirla gracias a ti, me encanta que justamente gracias a eso conectamos tanto y nos creo algo que compartimos que siento que es muy bello.",
    },
];

// ─────────────────────────────────────────────
// 🃏 TARJETAS DE CANCIONES
// ─────────────────────────────────────────────
const container = document.querySelector(".songs-container");

songs.forEach((song, index) => {
    container.innerHTML += `
    <div class="song-card" onclick="openSong(${index})">
        <img src="${song.image}">
        <div class="song-info">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        </div>
    </div>
    `;
});

function openSong(index) {
    const song = songs[index];

    Swal.fire({
        title: song.title,
        text: song.message,
        background: "#1b1b24",
        color: "white",
        confirmButtonColor: "#7b5cff",
        confirmButtonText: "▶ Escuchar",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
        cancelButtonColor: "#444"
    }).then((result) => {
        if (result.isConfirmed) {
            player.playSong(index);
        }
    });
}
