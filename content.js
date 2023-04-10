const cache        = getRepoCache();
const starredRepos = getStarredRepos();

// fonction principale qui effectue le traitement sur les dépôts archivés.
async function applyGrayToArchivedRepos() {
  
  for (const element of starredRepos) {
    const repoName = element.querySelector("h3 a");

    if (repoName) {
      const repoUrl   = repoName.href;
      const cacheData = cache[repoUrl];

      if (cacheData && isCacheValid(cacheData)) {
        if (cacheData.archived) {
          applyGrayToRepoName(repoName);
        }

        try {
          const response = await fetch(repoUrl);
          const html     = await response.text();

          const doc       = new DOMParser().parseFromString(html, "text/html");
          const flashWarn = doc.querySelector(
            "div.flash.flash-warn.flash-full.border-top-0.text-center.text-bold.py-2"
          );

          if (flashWarn) {
            applyGrayToRepoName(repoName);
            updateRepoCache(repoUrl, true);
          } else {
            updateRepoCache(repoUrl, false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}

// fonction qui retourne le cache des dépôts.
function getRepoCache() {
  return JSON.parse(localStorage.getItem("repoCache")) || {};
}

// fonction qui retourne les éléments HTML des dépôts étoilés.
function getStarredRepos() {
  return document.querySelectorAll(
    "div.col-12.d-block.width-full.py-4.border-bottom.color-border-muted"
  );
}

// Vérifie si le dépôt est en cache et si sa date de dernière mise à jour est antérieure à 7 jours.
function isCacheValid(cacheData) {
  const cacheDate            = new Date(cacheData.lastChecked);
  const daysSinceLastChecked = (new Date() - cacheDate) / (24 * 60 * 60 * 1000);

  return daysSinceLastChecked < 7;
}

// Applique un style "gris" au nom du dépôt.
function applyGrayToRepoName(repoName) {
  repoName.style.color = "gray";
}

// fonction qui parse une chaîne HTML en un document HTML.
function parseHtml(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

// fonction qui met à jour le cache pour un dépôt donné.
function updateRepoCache(repoUrl, archived) {
  const cache = getRepoCache();
  cache[repoUrl] = {
    lastChecked: new Date().toISOString(),
    archived: archived,
  };
  localStorage.setItem("repoCache", JSON.stringify(cache));
}

let isFunctionActivated = 0;
let timerId;

// /Lorsque la fonction applyGrayToArchivedRepos () est exécutée, la variable isFunctionActivated doit s'incrémenter de 1
function checkFunctionActivation() {
  if (isFunctionActivated < 2) {
    if (window.location.search.includes("tab=stars")) {
      applyGrayToArchivedRepos();
      isFunctionActivated++;
      console.log("isFunctionActivated = ", isFunctionActivated);
    }
  } else {
    clearInterval(timerId);
  }
}

// Lorsque l'utilisateur clique, isFunctionActivated est remis à 0 et la fonction est appelée avec setInterval pour recommencer le processus.
window.addEventListener("click", () => {
  isFunctionActivated = 0;
  timerId             = setInterval(checkFunctionActivation, 2000);
});

timerId = setInterval(checkFunctionActivation, 2000);
