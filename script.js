let selectedClass = null;
let selectedName = "";
let nameSubmitted = false;
let stage = 0;
let inventory = [];
let maxHp = 10;
let currentFight = 0;
let enemyHp = 0;

const baseStats = {
    hp: 10, atk: 10, mag: 10, def: 10, gold: 0
};

const classModifiers = {
    mage: { hp: 0, atk: 1, mag: 5, def: 0, gold: 5, img: 'mage.png' },
    healer: { hp: 0, atk: 0, mag: 7, def: 0, gold: 12, img: 'healer.png' },
    fighter: { hp: 5, atk: 5, mag: 0, def: 3, gold: 5, img: 'fighter.png' }
};

const fights = [
    {
        name: "Minion",
        img: "minion.png",
        hp: 20,
        minDmg: 5,
        maxDmg: 8
    },
    {
        name: "Guard",
        img: "guard.png",
        hp: 50,
        minDmg: 3,
        maxDmg: 5
    },
    {
        name: "Ghost",
        img: "ghost.png",
        hp: 1,
        isGhost: true
    },
    {
        name: "Crow",
        img: "crow.png",
        hp: 1,
        isCrow: true
    },

    {
        name: "Morde",
        img: "morde.png",
        hp: 3000,
        minDmg: 200,
        maxDmg: 200,
        isMorde: true
      }
      
];

function selectClass(className) {
    selectedClass = className;
    const mods = classModifiers[className];
    maxHp = baseStats.hp + mods.hp;
    document.getElementById("stat-hp").textContent = maxHp;
    document.getElementById("stat-atk").textContent = baseStats.atk + mods.atk;
    document.getElementById("stat-mag").textContent = baseStats.mag + mods.mag;
    document.getElementById("stat-def").textContent = baseStats.def + mods.def;
    document.getElementById("stat-gold").textContent = baseStats.gold + mods.gold;
    document.getElementById("class-img").src = mods.img;
    document.getElementById("class-selection").style.display = "none";
    document.getElementById("name-entry").style.display = "block";

    const music = document.getElementById("bg-music");
    const icon = document.getElementById("music-icon");
    if (music && music.paused) {
        music.play().then(() => {
            if (icon) icon.src = "music_on.png";
        }).catch((e) => {
            console.log("Autoplay blocked:", e);
        });
    }
}

function submitName() {
    if (nameSubmitted) return;
    selectedName = document.getElementById("player-name").value.trim();
    if (!selectedName) return;
    const statList = document.getElementById("stat-list");
    const nameItem = document.createElement("li");
    nameItem.innerHTML = `Name: <span>${selectedName}</span>`;
    const levelItem = document.createElement("li");
    levelItem.innerHTML = `Level: <span id="stat-level">1</span>`;
    statList.insertBefore(levelItem, statList.firstChild);
    statList.insertBefore(nameItem, statList.firstChild);
    document.getElementById("name-entry").style.display = "none";
    document.getElementById("intro-message").textContent =
        `Wake up adventurer, you have to stop the Iron Revenant from conquering the world or else we shall all be doomed. For you are ${selectedName}, the legendary ${selectedClass}!`;
    document.getElementById("intro-message").style.display = "block";
    nameSubmitted = true;
    stage = 1;
}

function handleClick() {
    if (stage === 1 && nameSubmitted) {
        document.getElementById("intro-message").style.display = "none";
        document.getElementById("shop-stage").style.display = "block";
        document.getElementById("shop-text").textContent =
            "Well hello there, you must be the savior of our land. Please feast your eyes on our wares.";
        stage = 2;
    } else if (stage === 2) {
        document.getElementById("shop-text").style.display = "none";
        document.getElementById("shop-items").style.display = "block";
        renderShopItems();
        stage = 3;
    }
}
document.body.addEventListener("click", handleClick);

function renderShopItems() {
    const items = [
        {
            label: "Barbarian's helmet and axe", cost: 5, icon: "helm.png", effect: () => {
                modifyStat("stat-atk", 3);
                modifyStat("stat-def", 3);
            }
        },
        {
            label: "Mage's spell book", cost: 5, icon: "book.png", effect: () => {
                modifyStat("stat-hp", 3);
                modifyStat("stat-mag", 3);
            }
        },
        {
            label: "Potion", cost: 5, icon: "pot.png"
        },
        {
            label: "Healer's staff", cost: 12, icon: "staff.png", effect: () => {
                modifyStat("stat-hp", 5);
                modifyStat("stat-mag", 5);
                modifyStat("stat-level", 1);
            }
        },
        {
            label: "Legendary stick", cost: 200, icon: "stick.png", effect: () => {
                modifyStat("stat-hp", 900);
                modifyStat("stat-atk", 900);
                modifyStat("stat-mag", 900);
                modifyStat("stat-def", 900);
                modifyStat("stat-gold", 900);
            }
        },
        { label: "Skip", cost: 0, skip: true }
    ];

    const container = document.getElementById("shop-items");
    container.innerHTML = "";

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "shop-item";
        div.textContent = `${item.label} — ${item.skip ? "Skip" : item.cost + " gold"}`;
        div.onclick = () => {
            const gold = parseInt(document.getElementById("stat-gold").textContent);
            const warning = document.getElementById("shop-warning");

            if (item.skip) {
                container.innerHTML = "";
                document.getElementById("shop-stage").style.display = "none";
                warning.textContent = "";
                stage = 4;
                startFight();
                return;
            }

            if (gold < item.cost) {
                warning.textContent = "You do not have enough gold for that item.";
            } else {
                document.getElementById("stat-gold").textContent = gold - item.cost;
                warning.textContent = "";
                alert(`You bought ${item.label}!`);
                addItemToInventory(item.icon);
                if (item.effect) item.effect();
                container.innerHTML = "";
                document.getElementById("shop-stage").style.display = "none";
                stage = 4;
                startFight();
            }
        };
        container.appendChild(div);
    });
}

function modifyStat(id, amount) {
    const span = document.getElementById(id);
    if (!span) return;
    const current = parseInt(span.textContent);
    span.textContent = current + amount;
    if (id === "stat-hp") {
        maxHp = current + amount;
    }
}

function addItemToInventory(icon) {
    const img = document.createElement("img");
    img.src = icon;
    img.alt = icon;
    document.getElementById("inventory-items").appendChild(img);
}


function startFight() {
    showFight();
}

function showFight() {
    const fight = fights[currentFight];
    enemyHp = fight.hp;
    document.getElementById("enemy-img").src = fight.img;
    document.getElementById("fight-dialogue").textContent = `${fight.name} appears!`;
    document.getElementById("fight-stage").style.display = "block";
    updateFightButtons(true);

    if (fight.isGhost) {
        document.getElementById("enemy-img").src = fight.img;
        document.getElementById("fight-dialogue").textContent = `${fight.name} appears...`;
        document.getElementById("fight-stage").style.display = "block";
        updateFightButtons(false);
        document.getElementById("fight-stage").onclick = function (e) {
            e.stopPropagation();
            alert("Ghost was depressed and decided to kill himself.");
            document.getElementById("fight-stage").style.display = "none";
            document.getElementById("fight-stage").onclick = null;
            currentFight++;
            if (currentFight < fights.length) {
                showFight();
            }
        };
        return;
    } else {
        document.getElementById("fight-stage").onclick = null;
    }

    if (fight.isCrow) {
        document.getElementById("enemy-img").src = fight.img;
        document.getElementById("fight-stage").style.display = "block";
        document.getElementById("fight-dialogue").textContent =
            "Well that was something, now get ready to meet the final boss";
        updateFightButtons(false);
        document.getElementById("fight-stage").onclick = function (e) {
            e.stopPropagation();
            document.getElementById("fight-stage").onclick = null;
            currentFight++;
            showFight();
        };
        return;
    }

    if (fight.isMorde) {
        document.getElementById("enemy-img").src = fight.img;
        document.getElementById("fight-stage").style.display = "block";
        document.getElementById("fight-dialogue").textContent = "Run while you can, you can never win";
        
        document.getElementById("stat-hp").textContent = 1;
        document.getElementById("stat-atk").textContent = 1;
        document.getElementById("stat-mag").textContent = 1;
        maxHp = 1;
        updateCharacterImage(1);
      
        updateFightButtons(false);
      
        document.getElementById("fight-stage").onclick = function(e) {
          e.stopPropagation();
          document.getElementById("fight-stage").onclick = null;
      
          alert("cheats activated have the stick");
      
          addItemToInventory("stick.png");
          modifyStat("stat-hp", 900);
          modifyStat("stat-atk", 900);
          modifyStat("stat-mag", 900);
          modifyStat("stat-def", 900);
      
          document.getElementById("fight-dialogue").textContent = "You found the Legendary Stick!";
          updateFightButtons(true);
      
          setTimeout(() => {
            document.getElementById("fight-dialogue").textContent = `${fight.name} appears!`;
          }, 1200);
        };
        return;
      }
      
    enemyHp = fight.hp;
    document.getElementById("enemy-img").src = fight.img;
    document.getElementById("fight-dialogue").textContent = `${fight.name} appears!`;
    document.getElementById("fight-stage").style.display = "block";
    updateFightButtons(true);
}

function fightEnemy() {
    const fight = fights[currentFight];
    let atk = parseInt(document.getElementById("stat-atk").textContent);
    let mag = parseInt(document.getElementById("stat-mag").textContent);
    let totalDmg = atk + mag;

    enemyHp -= totalDmg;

    if (enemyHp <= 0) {
        document.getElementById("fight-dialogue").textContent = `${fight.name} defeated!`;
        updateFightButtons(false);
        setTimeout(() => {
            document.getElementById("fight-stage").style.display = "none";
            currentFight++;
            if (currentFight < fights.length) {
                showFight();
            } else {
                window.location.href = "gamewon.html";

            }
        }, 1200);
        return;
    }

    const playerHpElem = document.getElementById("stat-hp");
    let playerHp = parseInt(playerHpElem.textContent);
    let dmg = randomInt(fight.minDmg, fight.maxDmg);
    playerHp = Math.max(0, playerHp - dmg);
    playerHpElem.textContent = playerHp;
    document.getElementById("fight-dialogue").textContent =
        `${fight.name} HP: ${enemyHp} | Enemy attacks for ${dmg} damage!`;

    updateCharacterImage(playerHp);

    if (playerHp <= 0) {
        document.getElementById("fight-dialogue").textContent = "You died!";
        updateFightButtons(false);
        setTimeout(() => window.location.reload(), 1500);
    }
}

function runFromEnemy() {
    const playerHpElem = document.getElementById("stat-hp");
    let playerHp = parseInt(playerHpElem.textContent) + 4;
    playerHp = Math.min(maxHp, playerHp);
    playerHpElem.textContent = playerHp;
    updateCharacterImage(playerHp);

    document.getElementById("fight-dialogue").textContent = "You ran from the fight and gained 4 HP!";
    updateFightButtons(false);

    setTimeout(() => {
        document.getElementById("fight-stage").style.display = "none";
        currentFight++;
        if (currentFight < fights.length) {
            showFight();
        } else {
            alert("Congratulations! You have run past all enemies so far.");
        }
    }, 1200);
}

function updateFightButtons(enabled) {
    document.getElementById("fight-btn").disabled = !enabled;
    document.getElementById("run-btn").disabled = !enabled;
}

function updateCharacterImage(currentHp) {
    const imgElem = document.getElementById("class-img");
    if (currentHp < maxHp / 2) {
        imgElem.src = selectedClass + "_damaged.png";
    } else {
        imgElem.src = classModifiers[selectedClass].img;
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleMusic(event) {
    event.stopPropagation();
    const music = document.getElementById("bg-music");
    const icon = document.getElementById("music-icon");
    if (!music || !icon) return;
    if (music.paused) {
        music.play().then(() => {
            icon.src = "music_on.png";
        }).catch(err => {
            console.log("Error playing audio:", err);
        });
    } else {
        music.pause();
        icon.src = "music_off.png";
    }
}

function howToPlay() {
  alert(
    "Steps to play:\n" +
    "1- Pick a class\n" +
    "2- Give your hero a name\n" +
    "3- Buy your hero a starter item\n" +
    "4- Fighting deals damage = to your magic power and attack power to the enemy\n" +
    "6- Fight enemies and save the world"
  );
}
